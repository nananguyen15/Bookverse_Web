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
  supCategoryId: number;
  name: string;
  description?: string;
  active: boolean;
}


export interface CategoryUpdateRequest {
  name: string;
  description?: string;
  active: boolean;
}


export interface CategoryWithSubs extends SupCategory {
  subCategories?: SubCategory[];
}
