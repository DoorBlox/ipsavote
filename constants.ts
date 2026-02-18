
import { Candidate } from './types';

export const MALE_CANDIDATES: Candidate[] = [
  { 
    id: 'm1', 
    name: 'Ahmad Kafi Bimasakti', 
    viceName: 'Naufal Zidane', 
    gender: 'male',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop'
  },
  { 
    id: 'm2', 
    name: 'Muhammad Zaki Althaf Azizan', 
    viceName: 'Kenzo Zazuli', 
    gender: 'male',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop'
  },
];

export const FEMALE_CANDIDATES: Candidate[] = [
  { 
    id: 'f1', 
    name: 'Nawaz Ayn Salamah', 
    viceName: 'Nitisara Nararya', 
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop'
  },
  { 
    id: 'f2', 
    name: 'Aisya Khumaira S.', 
    viceName: 'Nayl', 
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&h=256&auto=format&fit=crop'
  },
];

// Change this URL to update the logo across the entire site
export const APP_LOGO = 'https://imgur.com/a/VQTo0x9';

export const ADMIN_KEY = import.meta.env.VITE_ADMIN_PASSPHRASE || 'IPSA2025';
