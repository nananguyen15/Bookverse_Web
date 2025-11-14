// User & Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  name?: string; // Make name optional
  phone?: string;
  address?: string;
  // birthDate?: string;
  //gender?: string;
  image?: string;
  active: boolean;
  roles: string[];
}
