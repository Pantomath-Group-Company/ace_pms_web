import { useState, type FC } from 'react';
import { TEAM_GROUPS, type TeamMember } from '../data/team';

// Initials from a name, ignoring honorifics (Mr./Mrs./Dr./CA./IAS…).
function initials(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, '')
    .split(/[\s.,]+/)
    .filter((w) => w && !/^(mr|mrs|ms|dr|ca|shri|smt|ias|retd)$/i.test(w));
  return (words[0]?.[0] ?? '') + (words[1]?.[0] ?? '');
}

const Photo: FC<{ member: TeamMember }> = ({ member }) => {
  const [ok, setOk] = useState(Boolean(member.photo));
  return (
    <div className="w-28 h-32 sm:w-40 sm:h-48 shrink-0 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200/70">
      {ok && member.photo ? (
        <img
          src={encodeURI(member.photo)}
          alt={member.name}
          loading="lazy"
          onError={() => setOk(false)}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <div className="w-full h-full grid place-items-center bg-gradient-to-br from-ink-100 to-accent-50">
          <span className="text-2xl font-extrabold text-ink-700/70 tracking-wide">
            {initials(member.name)}
          </span>
        </div>
      )}
    </div>
  );
};

export const TeamSection: FC = () => (
  <section id="leadership" className="py-20 bg-white border-b border-slate-100 font-sans">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {TEAM_GROUPS.map((group) => (
        <div key={group.title}>
          <h2 className="font-extrabold tracking-tight text-slate-900 text-2xl sm:text-3xl">
            {group.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-light mt-1.5">{group.subtitle}</p>

          <div className="mt-8">
            {group.members.map((m) => (
              <div
                key={m.name}
                className="flex flex-col sm:flex-row gap-5 sm:gap-8 sm:items-start py-8 border-t border-slate-200 first:border-t-0 first:pt-0"
              >
                {/* Mobile: photo + name/role as a header row. Desktop: just the photo (left column). */}
                <div className="flex items-center gap-4 sm:block sm:shrink-0">
                  <Photo member={m} />
                  <div className="min-w-0 sm:hidden">
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900 leading-tight">
                      {m.name}
                    </h3>
                    <p className="text-[11px] font-bold text-accent-600 uppercase tracking-widest font-mono mt-1.5">
                      {m.role}
                    </p>
                  </div>
                </div>

                {/* Narrative — full width on mobile, right column on desktop */}
                <div className="min-w-0 flex-1">
                  {/* Name/role shown here on desktop only (mobile shows them beside the photo above) */}
                  <div className="hidden sm:block">
                    <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      {m.name}
                    </h3>
                    <p className="text-[11px] font-bold text-accent-600 uppercase tracking-widest font-mono mt-1.5">
                      {m.role}
                    </p>
                  </div>
                  <div className="mt-1 sm:mt-4 space-y-3 text-sm text-slate-600 font-light leading-relaxed">
                    {m.bio.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {m.timeline && m.timeline.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {m.timeline.map((step) => (
                        <span
                          key={step}
                          className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);
