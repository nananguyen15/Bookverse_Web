// Publisher Types
export interface Publisher {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
}
