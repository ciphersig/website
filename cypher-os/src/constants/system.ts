export const SYSTEM_CONFIG = {
  name: 'CYPHER OS',
  version: 'v4.0.9',
  protocol: 'SECURE_QUANTUM_v2',
  clubName: 'CYPHER Cyber Security Club',
  tagline: 'Explore. Exploit. Defend. Repeat.',
  status: 'ONLINE // ALL NODES OPERATIONAL',
} as const;

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Events', path: '/events' },
  { name: 'Academy', path: '/academy' },
  { name: 'Dashboard', path: '/dashboard' },
] as const;

export const SYSTEM_METRICS = [
  { label: 'Active Operatives', value: '1,420', unit: 'Members', status: 'teal' },
  { label: 'Threat Level', value: 'LOW', unit: 'Level 01', status: 'violet' },
  { label: 'Encryption', value: 'AES-256-GCM', unit: 'Quantum', status: 'plasma' },
  { label: 'Uptime', value: '99.98%', unit: 'System', status: 'teal' },
] as const;
