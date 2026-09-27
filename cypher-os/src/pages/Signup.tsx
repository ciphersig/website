import React, { useState } from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { EndlessButton, EndlessInput } from '@/components/ui/endless-ui';
import { Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const INTEREST_OPTIONS = [
  'Web Exploitation',
  'Reverse Engineering',
  'Binary Pwnable',
  'Cryptography',
  'OSINT & Recon',
  'Cloud Security',
  'DFIR & Forensics',
  'AI Security',
];

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCompleteRegistration = () => {
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      title={step === 1 ? 'Create operative ID' : 'Select security interests'}
      subtitle={step === 1 ? 'Initialize club credentials' : 'Tailor your academy feed'}
    >
      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-4">
          <EndlessInput
            label="Operative handle"
            placeholder="cypher_ghost"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <EndlessInput
            label="Email address"
            type="email"
            placeholder="op@cypher.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <EndlessInput
            label="Passcode"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <EndlessButton type="submit" variant="primary" className="w-full mt-2">
            Proceed to interests →
          </EndlessButton>
          <div className="text-center pt-3 text-xs text-neutral-500">
            <span>Already registered? </span>
            <Link to="/login" className="text-white hover:underline">
              Log in
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-neutral-400 leading-relaxed">
            Select your core cybersecurity domains to register your interests in the CYPHER database:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-xl text-left text-xs transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-white/10 text-white border-white/20'
                      : 'bg-neutral-900 text-neutral-500 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{interest}</span>
                  {isSelected && <Check className="size-3.5" />}
                </button>
              );
            })}
          </div>
          <div className="pt-2 flex gap-3">
            <EndlessButton variant="secondary" onClick={() => setStep(1)} className="w-1/3">
              ← Back
            </EndlessButton>
            <EndlessButton variant="primary" onClick={handleCompleteRegistration} className="w-2/3">
              Complete registration
            </EndlessButton>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
