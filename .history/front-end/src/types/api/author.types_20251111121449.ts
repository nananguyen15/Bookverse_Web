// Author Types
export interface Author {
  id: number;
  name: string;
  bio?: string;
  image?: string;
  active: boolean;
}

export interface AuthorCreateRequest {
  name: string;
  bio?: string;
  image?: string;
}

export interface AuthorUpdateRequest {
  name?: string;
  bio?: string;
  image?: string;
}
