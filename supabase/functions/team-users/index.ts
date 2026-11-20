// Supabase Edge Function: team-users
// Team-account management for the Console "Access" screen — System Admin only.
// Managing auth users needs the service_role key, which must stay server-side —
// hence this function. It first verifies the caller is a signed-in System Admin.
//
// Actions (POST JSON body; an empty body means "list"):
//   { action: 'list' }
//   { action: 'create', email, password, name?, role }
//   { action: 'delete', userId }
//   { action: 'setRole', userId, role }
//
// Roles live in auth app_metadata.role: 'system_admin' | 'admin' (missing = admin).
// Every create/delete/setRole is written to public.audit_logs.
//
// Deploy: supabase functions deploy team-users
// (No extra secrets needed — SUPABASE_URL / *_ANON_KEY / *_SERVICE_ROLE_KEY are
//  injected automatically.)

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

type Role = 'system_admin' | 'admin';
const ROLES: Role[] = ['system_admin', 'admin'];
const roleOf = (u: { app_metadata?: Record<string, unknown> } | null | undefined): Role =>
  u?.app_metadata?.role === 'system_admin' ? 'system_admin' : 'admin';
const roleLabel = (r: Role) => (r === 'system_admin' ? 'System Admin' : 'Admin');

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';

  // 1. Verify the caller is authenticated AND a System Admin. getUser() reads
  //    the live user record, so a role change takes effect immediately here.
  const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const {
    data: { user },
  } = await caller.auth.getUser();
  if (!user) return json({ ok: false, error: 'Unauthorized' }, 401);
  if (roleOf(user) !== 'system_admin') {
    return json({ ok: false, error: 'Only a System Admin can manage team users.' }, 403);
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) ?? {};
  } catch {
    /* empty body → list */
  }
  const action = String(body.action ?? 'list');

  const admin = createClient(url, serviceKey);
  const actorName =
    (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email;

  const audit = async (
    act: 'create' | 'update' | 'delete',
    entityId: string,
    summary: string,
    details?: Record<string, unknown>,
  ) => {
    // Service role bypasses RLS. Best-effort: never fail the action over logging.
    await admin.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email ?? '',
      actor_name: actorName,
      action: act,
      entity: 'user',
      entity_id: entityId,
      summary,
      details: details ?? null,
    });
  };

  const listAll = async () => {
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;
    return data.users;
  };

  try {
    if (action === 'list') {
      const users = (await listAll()).map((u) => ({
        id: u.id,
        email: u.email,
        name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? null,
        role: roleOf(u),
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }));
      return json({ ok: true, users });
    }

    if (action === 'create') {
      const email = String(body.email ?? '').trim().toLowerCase();
      const password = String(body.password ?? '');
      const name = String(body.name ?? '').trim();
      const role = body.role as Role;
      if (!email || !password) return json({ ok: false, error: 'Email and password are required.' });
      if (password.length < 8) return json({ ok: false, error: 'Password must be at least 8 characters.' });
      if (!ROLES.includes(role)) return json({ ok: false, error: 'Choose a valid role.' });

      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // pre-confirmed — no email step needed
        app_metadata: { role },
        user_metadata: name ? { full_name: name } : {},
      });
      if (error) return json({ ok: false, error: error.message });
      await audit('create', data.user.id, `Added user ${email} as ${roleLabel(role)}`, {
        email,
        name: name || undefined,
        role,
      });
      return json({ ok: true });
    }

    if (action === 'delete' || action === 'setRole') {
      const userId = String(body.userId ?? '');
      if (!userId) return json({ ok: false, error: 'userId is required.' });
      if (userId === user.id) {
        return json({
          ok: false,
          error:
            action === 'delete'
              ? 'You cannot remove your own account.'
              : 'You cannot change your own role.',
        });
      }

      const all = await listAll();
      const target = all.find((u) => u.id === userId);
      if (!target) return json({ ok: false, error: 'User not found.' });
      const systemAdmins = all.filter((u) => roleOf(u) === 'system_admin');

      if (action === 'delete') {
        if (roleOf(target) === 'system_admin' && systemAdmins.length <= 1) {
          return json({ ok: false, error: 'Cannot remove the last System Admin.' });
        }
        const { error } = await admin.auth.admin.deleteUser(userId);
        if (error) return json({ ok: false, error: error.message });
        await audit('delete', userId, `Removed user ${target.email}`, {
          email: target.email,
          role: roleOf(target),
        });
        return json({ ok: true });
      }

      const role = body.role as Role;
      if (!ROLES.includes(role)) return json({ ok: false, error: 'Choose a valid role.' });
      const from = roleOf(target);
      if (from === role) return json({ ok: true });
      if (from === 'system_admin' && systemAdmins.length <= 1) {
        return json({ ok: false, error: 'Cannot demote the last System Admin.' });
      }
      const { error } = await admin.auth.admin.updateUserById(userId, {
        app_metadata: { ...(target.app_metadata ?? {}), role },
      });
      if (error) return json({ ok: false, error: error.message });
      await audit(
        'update',
        userId,
        `Changed ${target.email} from ${roleLabel(from)} to ${roleLabel(role)}`,
        { email: target.email, from, to: role },
      );
      return json({ ok: true });
    }

    return json({ ok: false, error: `Unknown action: ${action}` });
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
