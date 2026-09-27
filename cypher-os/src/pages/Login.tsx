import React, { useState } from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { EndlessButton, EndlessInput } from '@/components/ui/endless-ui';
import { Link, useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <AuthLayout title="Operative login" subtitle="Enter secure credentials">
      <form onSubmit={handleSubmit} className="space-y-4">
        <EndlessInput
          label="Operative email"
          type="email"
          placeholder="op@cipher.org"
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
          Authenticate
        </EndlessButton>
        <div className="text-center pt-3 text-xs text-neutral-500">
          <span>No operative ID? </span>
          <Link to="/signup" className="text-white hover:underline">
            Register account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
