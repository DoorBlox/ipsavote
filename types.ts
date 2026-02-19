
export enum UserRole {
  MALE = 'male',
  FEMALE = 'female',
  TEACHER = 'teacher'
}

export interface Candidate {
  id: string;
  name: string;
  viceName: string;
  gender: 'male' | 'female';
  imageUrl: string; // Added image property
}

export interface Voter {
  id: string;
  name: string;
  role: UserRole;
  token: string;
  used: boolean;
  maleVote: string | null;
  femaleVote: string | null;
}

export interface ElectionConfig {
  maleCandidates: Candidate[];
  femaleCandidates: Candidate[];
}

export type ViewState = 'voter-portal' | 'ballot' | 'success' | 'admin-login' | 'admin-dashboard' | 'qr-sheet' | 'voter-list-sheet';
