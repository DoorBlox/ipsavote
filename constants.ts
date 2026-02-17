import { Candidate } from './types';

export const MALE_CANDIDATES: Candidate[] = [
  { 
    id: 'm1', 
    name: 'Zaid Al-Farabi', 
    viceName: 'Omar Syarif', 
    gender: 'male',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop'
  },
  { 
    id: 'm2', 
    name: 'Khalid Bin Walid', 
    viceName: 'Hamzah Malik', 
    gender: 'male',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop'
  },
];

export const FEMALE_CANDIDATES: Candidate[] = [
  { 
    id: 'f1', 
    name: 'Fatima Az-Zahra', 
    viceName: 'Aisha Bakr', 
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop'
  },
  { 
    id: 'f2', 
    name: 'Khadijah Kubra', 
    viceName: 'Sumayyah Khayyat', 
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&h=256&auto=format&fit=crop'
  },
];

export const ADMIN_KEY = import.meta.env.VITE_ADMIN_PASSPHRASE || 'IPSA2025';