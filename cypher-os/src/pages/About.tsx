import React, { useEffect, useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { EndlessCard, EndlessPageHeader } from '@/components/ui/endless-ui';
import { WordsReveal } from '@/components/templates/endless/lib/animations';

const SUPABASE_URL = 'https://ycqsjqhwrndwlxkcnfpv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xPH8C_LkPv8eI2Rr5IenwQ_AsA0ErAM';

export const About: React.FC = () => {
  const [teamList, setTeamList] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?select=*&order=created_at.desc`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTeamList(data);
          }
        }
      } catch (err) {
        console.error('Error fetching team in Cipher OS:', err);
      }
    }
    fetchTeam();
  }, []);

  const displayMembers = teamList.length > 0 ? teamList.map((m, idx) => ({
    name: m.name,
    role: m.role,
    image: m.image_url || '',
    id: m.id || idx
  })) : [
    { name: 'Core Lead', role: 'President / Lead Red Team', image: '', id: 1 },
    { name: 'Research Head', role: 'Vice President / Blue Team', image: '', id: 2 },
    { name: 'Academy Director', role: 'Malware Analyst', image: '', id: 3 },
  ];

  return (
    <div className="space-y-12">
      <EndlessPageHeader
        title="About CIPHER Security Club"
        description="CIPHER is a premier cyber security organization dedicated to practical vulnerability research, ethical hacking, and defense infrastructure."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <EndlessCard delay={0.1}>
          <div className="space-y-3">
            <h3 className="text-base font-medium text-neutral-100 flex items-center gap-2">
              <Shield className="size-4 text-blue-400" />
              The Cipher objective
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              We bridge the gap between theoretical computer science and real-world offensive and defensive security. Our members train in real time across active CTF environments and industry-standard security toolsets.
            </p>
          </div>
        </EndlessCard>

        <EndlessCard delay={0.2}>
          <div className="space-y-3">
            <h3 className="text-base font-medium text-neutral-100 flex items-center gap-2">
              <Users className="size-4 text-neutral-300" />
              Operative divisions
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              From Binary Exploitation and Reverse Engineering to Cloud Infrastructure Audit and Cryptographic Protocols, our divisions operate with extreme precision.
            </p>
          </div>
        </EndlessCard>
      </div>

      <div>
        <WordsReveal
          as="h3"
          className="text-sm uppercase tracking-widest text-neutral-500 mb-4"
          text="Executive nodes & Team Members"
          step={0.1}
          duration={0.5}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayMembers.map((member, idx) => (
            <EndlessCard key={member.id} delay={0.1 + idx * 0.1}>
              <div className="flex items-center gap-3">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="size-10 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs text-neutral-100 font-medium shrink-0">
                    0{idx + 1}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-neutral-100">{member.name}</div>
                  <div className="text-xs text-neutral-400">{member.role}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Status: Active Operative</div>
                </div>
              </div>
            </EndlessCard>
          ))}
        </div>
      </div>
    </div>
  );
};
