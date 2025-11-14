// Category Types
export interface SupCategory {
  id: number;
  name: string;
  active: boolean;
}

export interface SubCategory {
  id: number;
  supCategoryId: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface SubCategoryCreateRequest {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}
export interface SubCategoryUpdateRequest {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface SupCategoryCreateRequest {
  name: string;
  active: boolean;
}
export interface SupCategoryUpdateRequest {
  id?: number;
  name: string;
  active: boolean;
}

export interface CategoryWithSubs extends SupCategory {
  subCategories?: SubCategory[];
}
