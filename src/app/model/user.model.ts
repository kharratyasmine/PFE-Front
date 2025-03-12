import { Role } from "./role.enum";
export interface User {
  id: number; 
  firstname: string;
  lastname: string;
  email: string;
  motDePasse: string;
  role: Role;
}
