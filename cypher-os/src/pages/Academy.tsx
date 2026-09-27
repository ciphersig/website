import React, { useState } from 'react';
import { Terminal, CheckCircle2, Lock } from 'lucide-react';
import { EndlessBadge, EndlessButton, EndlessCard, EndlessPageHeader } from '@/components/ui/endless-ui';

const MODULES = [
  {
    id: 'mod-01',
    title: 'Web Exploitation 101 — SQL Injection & Auth Bypass',
    level: 'Beginner',
    category: 'Web Security',
    flag: 'CYPHER{sql_injection_mastered_2026}',
  },
  {
    id: 'mod-02',
    title: 'Reverse Engineering — x86_64 Binary Analysis',
    level: 'Intermediate',
    category: 'Reverse Eng',
    flag: 'CYPHER{ghidra_assembly_pwned}',
  },
  {
    id: 'mod-03',
    title: 'Cryptography — RSA & Elliptic Curve Protocols',
    level: 'Advanced',
    category: 'Crypto',
    flag: 'CYPHER{ecc_math_unlocked}',
  },
];

export const Academy: React.FC = () => {
  const [flagInput, setFlagInput] = useState('');
  const [solvedModules, setSolvedModules] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmitFlag = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = MODULES.find((m) => m.flag.trim() === flagInput.trim());

    if (matched) {
      if (!solvedModules.includes(matched.id)) {
        setSolvedModules([...solvedModules, matched.id]);
      }
      setStatusMessage(`Flag accepted for ${matched.category}. Module unlocked.`);
      setFlagInput('');
    } else {
      setStatusMessage('Invalid flag submitted. Re-audit mission target.');
    }
  };

  return (
    <div className="space-y-8">
      <EndlessPageHeader
        title="Self-learning and practical missions"
        description="Master offensive and defensive cybersecurity through structured practical modules and CTF flag submission."
      />

      <EndlessCard>
        <form onSubmit={handleSubmitFlag} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Terminal className="size-4" />
            <span>Submit CTF flag to unlock badges</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-neutral-900 border border-white/10 rounded-xl flex items-center px-4 gap-3">
                <input
                  type="text"
                  placeholder="CYPHER{your_flag_here}"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 outline-none font-mono"
                />
                <EndlessButton type="submit" variant="ghost" className="!bg-blue-500 !text-white hover:!bg-blue-600">
                  Submit
                </EndlessButton>
              </div>
              <div className="h-12" aria-hidden />
            </div>
          </div>
          {statusMessage && (
            <div
              className={`text-sm p-3 rounded-xl border ${
                statusMessage.startsWith('Flag accepted')
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              {statusMessage}
            </div>
          )}
        </form>
      </EndlessCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {MODULES.map((module, idx) => {
          const isSolved = solvedModules.includes(module.id);
          return (
            <EndlessCard key={module.id} delay={idx * 0.1}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <EndlessBadge>{module.category}</EndlessBadge>
                  <span className="text-xs text-neutral-500">{module.level}</span>
                </div>
                <h3 className="text-sm font-medium text-neutral-100 leading-snug">{module.title}</h3>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Status: {isSolved ? <span className="text-emerald-400 font-medium">Solved</span> : 'Locked'}
                  </span>
                  {isSolved ? (
                    <CheckCircle2 className="size-5 text-emerald-400" />
                  ) : (
                    <Lock className="size-4 text-neutral-500" />
                  )}
                </div>
              </div>
            </EndlessCard>
          );
        })}
      </div>
    </div>
  );
};
