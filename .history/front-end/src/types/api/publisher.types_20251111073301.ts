// Publisher Types
export interface Publisher {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
  active: boolean;
}

export interface PublisherCreateRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
}

export interface PublisherUpdateRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
}
