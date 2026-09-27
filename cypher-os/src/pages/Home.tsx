import React from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Hero } from '@/components/templates/endless/sections/hero';
import { Features } from '@/components/templates/endless/sections/features';
import { Stats } from '@/components/templates/endless/sections/stats';
import { Pills } from '@/components/templates/endless/sections/pills';
import { MadForDesigner } from '@/components/templates/endless/sections/mad-for-designer';
import { Updates } from '@/components/templates/endless/sections/updates';

export const Home: React.FC = () => {
  return (
    <MainLayout fullBleed>
      <Hero />
      <Features />
      <Stats />
      <Pills />
      <MadForDesigner />
      <Updates />
    </MainLayout>
  );
};
