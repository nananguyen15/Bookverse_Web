// Author Types
export interface Author {
  id: number;
  name: string;
  biography?: string;
  image?: string;
  active: boolean;
}

export interface AuthorCreateRequest {
  name: string;
  biography?: string;
  image?: string;
}

export interface AuthorUpdateRequest {
  name?: string;
  biography?: string;
  image?: string;
}
