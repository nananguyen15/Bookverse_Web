// Category Types
export interface SupCategory {
  id: number;
  name: string;
  slug?: string;
  active: boolean;
}

export interface SubCategory {
  id: number;
  supCategoryId: number;
  name: string;
  description?: string;
  slug?: string;
  active: boolean;
}

export interface CategoryWithSubs extends SupCategory {
  subCategories?: SubCategory[];
}

// Request Types
export interface SupCategoryCreateRequest {
  name: string;
  slug?: string;
}

export interface SupCategoryUpdateRequest {
  name?: string;
  slug?: string;
}

export interface SubCategoryCreateRequest {
  name: string;
  supCategoryId: number;
  description?: string;
  slug?: string;
}

export interface SubCategoryUpdateRequest {
  name?: string;
  supCategoryId?: number;
  description?: string;
  slug?: string;
}
