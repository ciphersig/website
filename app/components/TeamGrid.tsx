'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
}

export function TeamGrid() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.error('Error fetching team:', error);
        } else {
          setMembers(data || []);
        }
      } catch (err) {
        console.error('Error in fetchTeam:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-red-500 font-mono tracking-widest text-sm">DECRYPTING TEAM DATA...</p>
        </div>
      </div>
    );
  }

  // If no members, show placeholders
  const displayMembers = members.length > 0 ? members : [
    {
      id: 'placeholder-1',
      name: 'Dr. Elliot Alderson',
      role: 'President / Lead Red Team',
      bio: 'Cybersecurity researcher focusing on offensive security and social engineering.',
      image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80'
    },
    {
      id: 'placeholder-2',
      name: 'Angela Moss',
      role: 'Vice President / Blue Team',
      bio: 'Specialist in network defense, intrusion detection, and incident response.',
      image_url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80'
    },
    {
      id: 'placeholder-3',
      name: 'Darlene Alderson',
      role: 'Malware Analyst',
      bio: 'Reverse engineering expert. She breaks malware to see how it ticks.',
      image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80'
    },
    {
      id: 'placeholder-4',
      name: 'Tyrell Wellick',
      role: 'CTF Captain',
      bio: 'Competitive hacker leading our Capture The Flag team to victory.',
      image_url: 'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=400&q=80'
    }
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 pb-20">
      {displayMembers.map((member) => (
        <div 
          key={member.id} 
          className="group relative flex flex-col items-center bg-black/40 border border-red-500/30 rounded-xl overflow-hidden backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:border-red-500 transition-all duration-300"
        >
          <div className="w-full aspect-[4/5] relative overflow-hidden">
            <img 
              src={member.image_url} 
              alt={member.name}
              className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
            />
            {/* Cyber overlay */}
            <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
          </div>
          
          <div className="w-full p-5 text-left border-t border-red-500/30 relative">
            <div className="absolute top-0 left-0 w-2 h-2 bg-red-500" />
            <h3 className="font-outfit font-bold text-xl text-white tracking-wide mb-1 group-hover:text-red-400 transition-colors">
              {member.name}
            </h3>
            <p className="text-red-500 font-mono text-xs uppercase tracking-widest mb-3">
              // {member.role}
            </p>
            <p className="text-white/70 font-outfit text-sm leading-relaxed line-clamp-3">
              {member.bio}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
