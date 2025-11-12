import React from "react";
import { FormField, InputField, SelectField, TextAreaField } from "./FormField";
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
  isEdit: boolean;
  authors: Author[];
  publishers: Publisher[];
  categories: SubCategory[];
}

export function BookForm({
  formData,
  onUpdate,
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
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter book title"
          required
        />
      </FormField>

      {/* Author and Publisher */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Author" required>
          <SelectField
            value={formData.authorId}
            onChange={(e) => handleChange("authorId", Number(e.target.value))}
            options={[
              { value: 0, label: "Select Author" },
              ...authors.map((a) => ({ value: a.id, label: a.name })),
            ]}
            required
          />
        </FormField>

        <FormField label="Publisher" required>
          <SelectField
            value={formData.publisherId}
            onChange={(e) => handleChange("publisherId", Number(e.target.value))}
            options={[
              { value: 0, label: "Select Publisher" },
              ...publishers.map((p) => ({ value: p.id, label: p.name })),
            ]}
            required
          />
        </FormField>
      </div>

      {/* Category */}
      <FormField label="Sub Category" required>
        <SelectField
          value={formData.categoryId}
          onChange={(e) => handleChange("categoryId", Number(e.target.value))}
          options={[
            { value: 0, label: "Select Category" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          required
        />
      </FormField>

      {/* Description */}
      <FormField label="Description">
        <TextAreaField
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter book description"
          rows={4}
        />
      </FormField>

      {/* Price and Stock */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Price (VND)" required>
          <InputField
            type="number"
            value={formData.price}
            onChange={(e) => handleChange("price", Number(e.target.value))}
            min={0}
            step={1000}
            required
          />
        </FormField>

        <FormField label="Stock Quantity" required>
          <InputField
            type="number"
            value={formData.stockQuantity}
            onChange={(e) => handleChange("stockQuantity", Number(e.target.value))}
            min={0}
            required
          />
        </FormField>
      </div>

      {/* Published Date and Image */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Published Date">
          <InputField
            type="date"
            value={formData.publishedDate}
            onChange={(e) => handleChange("publishedDate", e.target.value)}
          />
        </FormField>

        <FormField label="Image URL">
          <InputField
            type="text"
            value={formData.image}
            onChange={(e) => handleChange("image", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </FormField>
      </div>

      {/* Image Preview */}
      {formData.image && (
        <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
          <img
            src={formData.image}
            alt="Preview"
            className="object-cover max-h-48 rounded"
            onError={(e) => {
              e.currentTarget.src = "/img/book/default-book.jpg";
            }}
          />
        </div>
      )}
    </div>
  );
}
