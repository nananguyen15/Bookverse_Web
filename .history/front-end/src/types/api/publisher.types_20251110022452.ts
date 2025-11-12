// Publisher Types
export interface Publisher {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
}

export interface PublisherCreateRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PublisherUpdateRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}
