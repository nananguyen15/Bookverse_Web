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

export interface CategoryCreateRequest {

export interface CategoryWithSubs extends SupCategory {
  subCategories?: SubCategory[];
}
