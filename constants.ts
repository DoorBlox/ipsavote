
import { Candidate } from './types';

export const MALE_CANDIDATES: Candidate[] = [
  { 
    id: 'm1', 
    name: 'Ahmad Kafi Bimasakti', 
    viceName: 'Naufal Zidane', 
    gender: 'male',
    imageUrl: 'https://i.imgur.com/nDdLubl.png'
  },
  { 
    id: 'm2', 
    name: 'Muhammad Zaki Althaf Azizan', 
    viceName: 'Kenzo Zazuli', 
    gender: 'male',
    imageUrl: 'https://i.imgur.com/kUs9RA2.png'
  },
];

export const FEMALE_CANDIDATES: Candidate[] = [
  { 
    id: 'f1', 
    name: 'Aisya Khumaira S.', 
    viceName: 'Nayla Aulia Maulidina', 
    gender: 'female',
    imageUrl: 'https://i.imgur.com/w3GpdP1.png'

  },
  { 
    id: 'f2', 
    name: 'Nawaz Ayn Salamah', 
    viceName: 'Nitisara Nararya', 
    gender: 'female',
    imageUrl: 'https://i.imgur.com/8ZyLImE.png'
  },
];

// Change this URL to update the logo across the entire site
export const APP_LOGO = 'https://i.imgur.com/GkbAyLU.png';

export const ADMIN_KEY = import.meta.env.VITE_ADMIN_PASSPHRASE || 'IPSA2025';
