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
