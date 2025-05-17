import { Role } from './role.enum';

export interface User {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: Role;
  phoneNumber?: string;
  address?: string;
  photoUrl?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}