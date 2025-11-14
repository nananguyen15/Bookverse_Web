// Category Types
export interface SupCategory {
  id: number;
  name: string;
  active: boolean;
  subcategories?: SubCategory[]; // API returns lowercase
  subCategories?: SubCategory[]; // Support camelCase as well
}

export interface SubCategory {
  id: number;
  supCategoryId: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface SubCategoryCreateRequest {
  supCategoryId: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface SubCategoryUpdateRequest {
  supCategoryId: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface SupCategoryCreateRequest {
  name: string;
  active: boolean;
}

export interface SupCategoryUpdateRequest {
  name: string;
  active: boolean;
}

export interface CategoryWithSubs extends SupCategory {
  subCategories?: SubCategory[];
}
