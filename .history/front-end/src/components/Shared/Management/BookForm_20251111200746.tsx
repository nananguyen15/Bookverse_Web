import React from "react";
import { FormField, InputField, TextAreaField } from "./FormField";
import { SearchableSelect } from "./SearchableSelect";
import { ImageUpload } from "../ImageUpload";
import type { Author, Publisher, SubCategory } from "../../../types";

export interface BookFormData {
  title: string;
  description: string;
  price: number;
  authorId: number;
  publisherId: number;
  categoryId: number;
  stockQuantity: number;
  publishedDate: string;
  image: string;
}

interface BookFormProps {
  formData: BookFormData;
  onUpdate: (data: BookFormData) => void;
  onImageUpload?: (file: File | null) => void;
  isEdit: boolean;
  authors: Author[];
  publishers: Publisher[];
  categories: SubCategory[];
}

export function BookForm({
  formData,
  onUpdate,
  onImageUpload,
  isEdit,
  authors,
  publishers,
  categories,
}: BookFormProps) {
  const handleChange = (field: keyof BookFormData, value: string | number) => {
    onUpdate({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <FormField label="Title" required>
        <InputField
          type="text"
          value={formData.title}
          onChange={(value) => handleChange("title", value)}
          placeholder="Enter book title"
          required
        />
      </FormField>

      {/* Author and Publisher */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Author" required>
          <SearchableSelect
            value={formData.authorId}
            onChange={(value) => handleChange("authorId", value)}
            options={[
              { value: 0, label: "Select Author" },
              ...authors.map((a) => ({ value: a.id, label: a.name })),
            ]}
            placeholder="Search author..."
            required
          />
        </FormField>

        <FormField label="Publisher" required>
          <SearchableSelect
            value={formData.publisherId}
            onChange={(value) => handleChange("publisherId", value)}
            options={[
              { value: 0, label: "Select Publisher" },
              ...publishers.map((p) => ({ value: p.id, label: p.name })),
            ]}
            placeholder="Search publisher..."
            required
          />
        </FormField>
      </div>

      {/* Category */}
      <FormField label="Sub Category" required>
        <SearchableSelect
          value={formData.categoryId}
          onChange={(value) => handleChange("categoryId", value)}
          options={[
            { value: 0, label: "Select Category" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          placeholder="Search category..."
          required
        />
      </FormField>

      {/* Description */}
      <FormField label="Description">
        <TextAreaField
          value={formData.description}
          onChange={(value) => handleChange("description", value)}
          placeholder="Enter book description"
          rows={4}
        />
      </FormField>

      {/* Price and Stock */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Price ($)" required>
          <InputField
            type="number"
            value={formData.price}
            onChange={(value) => handleChange("price", Number(value))}
            min={0}
            step={0.01}
            required
          />
        </FormField>

        <FormField label="Stock Quantity" required>
          <InputField
            type="number"
            value={formData.stockQuantity}
            onChange={(value) => handleChange("stockQuantity", Number(value))}
            min={0}
            required
          />
        </FormField>
      </div>

      {/* Published Date */}
      <FormField label="Published Date">
        <InputField
          type="date"
          value={formData.publishedDate}
          onChange={(value) => handleChange("publishedDate", value)}
          max={new Date().toISOString().split('T')[0]}
          title="Published date cannot be in the future"
        />
      </FormField>
      {/* Image Upload */}
      <ImageUpload
        value={formData.image}
        onChange={(url) => handleChange("image", url)}
        onImageUpload={onImageUpload}
        label="Book Cover Image"
        type="cover"
        folder="book"
        required
      />
    </div>
  );
}
