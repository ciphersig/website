import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { EndlessBadge, EndlessCard } from '@/components/ui/endless-ui';
import { WordsReveal } from '@/components/templates/endless/lib/animations';

const SUPABASE_URL = 'https://ycqsjqhwrndwlxkcnfpv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xPH8C_LkPv8eI2Rr5IenwQ_AsA0ErAM';

export const Dashboard: React.FC = () => {
  const [activeEvents, setActiveEvents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardEvents() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/events?select=*&order=created_at.desc`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setActiveEvents(data);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard events:', err);
      }
    }
    fetchDashboardEvents();
  }, []);

  const displayEvents = activeEvents.length > 0 ? activeEvents.map((e: any) => ({
    title: e.title,
    date: e.created_at ? new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Active',
    badge: e.is_past ? 'Past Event' : 'Active'
  })) : [
    { title: 'CIPHER CTF Spring 2026 Qualifiers', date: 'Aug 28, 18:00 UTC', badge: 'Confirmed' },
    { title: 'Practical Web Security & Deep Audit', date: 'Sep 04, 15:00 UTC', badge: 'Confirmed' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <WordsReveal
              as="h1"
              className="text-2xl font-medium text-neutral-100"
              text="Operative command dashboard"
              step={0.08}
              duration={0.5}
            />
            <p className="text-xs text-neutral-500 mt-1">Operative ID: #0X99F4 · Clearance: Level 01 (Recruit)</p>
          </div>
          <EndlessBadge className="!text-emerald-400 !bg-emerald-500/10">Status: Online</EndlessBadge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Club rank', value: '#14' },
            { label: 'Total events', value: displayEvents.length.toString().padStart(2, '0') },
            { label: 'Flags captured', value: '08' },
            { label: 'Total score', value: '2,450 XP' },
          ].map((stat, idx) => (
            <EndlessCard key={stat.label} delay={idx * 0.05}>
              <div className="text-xs text-neutral-500">{stat.label}</div>
              <div className="text-2xl font-medium text-neutral-100 mt-1">{stat.value}</div>
            </EndlessCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <EndlessCard>
              <h2 className="text-sm font-medium text-neutral-100 mb-1">Active missions and notices</h2>
              <p className="text-xs text-neutral-500 mb-4">Current club events & labs</p>
              <div className="space-y-3">
                {displayEvents.map((item: any) => (
                  <div key={item.title} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-neutral-100">{item.title}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">Date: {item.date}</div>
                    </div>
                    <EndlessBadge className={item.badge === 'Past Event' ? '!text-amber-400 !bg-amber-500/10' : undefined}>
                      {item.badge}
                    </EndlessBadge>
                  </div>
                ))}
              </div>
            </EndlessCard>
          </div>

          <EndlessCard delay={0.2}>
            <h2 className="text-sm font-medium text-neutral-100 mb-1">Activity log</h2>
            <p className="text-xs text-neutral-500 mb-4">System events</p>
            <div className="space-y-3 text-xs text-neutral-500 font-mono">
              <div>[14:22:01] Auth token refreshed</div>
              <div>[12:04:45] Flag submitted: CIPHER{'{sql_injection_mastered}'}</div>
              <div>[09:15:20] Node synchronized with database</div>
            </div>
          </EndlessCard>
        </div>
      </div>
    </DashboardLayout>
  );
};
