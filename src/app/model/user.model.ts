import { Role } from "./role.enum";

export interface User {
  id?: number; 
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneNumber : String;
  address: string;
  role: Role;
  photoUrl?: string;
}
