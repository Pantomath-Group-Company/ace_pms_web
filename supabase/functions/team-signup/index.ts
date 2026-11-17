// Supabase Edge Function: team-signup
// Lets a teammate self-register with ANY email + a shared team access code.
// The code is verified server-side (a secret), so the public can't sign up, but
// you never have to add users in the dashboard again.
//
// Deploy:  supabase functions deploy team-signup
// Secret:  supabase secrets set TEAM_SIGNUP_CODE=choose-a-strong-shared-code
//
// New accounts are created pre-confirmed with the 'admin' role (content only).
// System Admins are promoted from the Console → Access screen.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email, password, code } = await req.json();
    const expected = Deno.env.get('TEAM_SIGNUP_CODE');

    if (!expected) return json({ ok: false, error: 'Signup is not configured. Set TEAM_SIGNUP_CODE.' });
    if (!email || !password) return json({ ok: false, error: 'Email and password are required.' });
    if (String(password).length < 8) return json({ ok: false, error: 'Password must be at least 8 characters.' });
    if (code !== expected) return json({ ok: false, error: 'Invalid team access code.' });

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error } = await admin.auth.admin.createUser({
      email: String(email).trim(),
      password: String(password),
      email_confirm: true, // pre-confirmed — no email step needed
      app_metadata: { role: 'admin' },
    });

    if (error) return json({ ok: false, error: error.message });
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
});
