# Image Upload Solutions

## Problem

Backend returns 415 Unsupported Media Type when uploading images with FormData.

## Possible Solutions

### Solution 1: Backend expects JSON only (no file upload)

If backend only accepts JSON, images must be provided as URLs:

```typescript
// authors.api.ts
create: async (data: any): Promise<Author> => {
  const jsonData = {
    name: data.name,
    bio: data.bio,
    image: data.image, // URL string only
  };

  const response = await apiClient.post<ApiResponse<Author>>(
    `${AUTHORS_ENDPOINT}/create`,
    jsonData
  );
  return response.data.result;
};
```

### Solution 2: Separate endpoint for image upload

Backend has two endpoints: one for author data, one for image:

```typescript
// Step 1: Upload image first
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/upload/image", formData);
  return response.data.url; // Returns image URL
};

// Step 2: Create author with image URL
create: async (data: any): Promise<Author> => {
  let imageUrl = data.image;

  if (data.imageFile) {
    imageUrl = await uploadImage(data.imageFile);
  }

  const jsonData = {
    name: data.name,
    bio: data.bio,
    image: imageUrl,
  };

  const response = await apiClient.post(`${AUTHORS_ENDPOINT}/create`, jsonData);
  return response.data.result;
};
```

### Solution 3: Backend expects multipart with @RequestPart

If backend uses @RequestPart, format must be exact:

```java
// Backend Controller
@PostMapping("/create")
public ResponseEntity<Author> create(
    @RequestPart("author") AuthorRequest request,
    @RequestPart(value = "image", required = false) MultipartFile image
) { ... }
```

```typescript
// Frontend
create: async (data: any): Promise<Author> => {
  const formData = new FormData();

  // Send author data as JSON blob
  const authorData = {
    name: data.name,
    bio: data.bio,
  };
  formData.append(
    "author",
    new Blob([JSON.stringify(authorData)], {
      type: "application/json",
    })
  );

  // Send image file
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }

  const response = await apiClient.post(`${AUTHORS_ENDPOINT}/create`, formData);
  return response.data.result;
};
```

### Solution 4: Base64 encode image

Convert image to base64 and send as JSON:

```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

create: async (data: any): Promise<Author> => {
  const jsonData: any = {
    name: data.name,
    bio: data.bio,
  };

  if (data.imageFile) {
    jsonData.imageBase64 = await fileToBase64(data.imageFile);
  } else if (data.image) {
    jsonData.image = data.image;
  }

  const response = await apiClient.post(`${AUTHORS_ENDPOINT}/create`, jsonData);
  return response.data.result;
};
```

## How to Check Backend

Look at the backend controller:

```bash
# In backend project
cd back-end/bookverse
grep -r "@PostMapping.*create" src/main/java/
grep -r "MultipartFile" src/main/java/
```

Or check the specific controller file:

```java
// Example backend controller patterns

// Pattern 1: JSON only (no file upload)
@PostMapping("/create")
public ResponseEntity<Author> create(@RequestBody AuthorRequest request) { ... }

// Pattern 2: Multipart with @RequestParam
@PostMapping("/create")
public ResponseEntity<Author> create(
    @RequestParam("name") String name,
    @RequestParam("bio") String bio,
    @RequestParam(value = "image", required = false) MultipartFile image
) { ... }

// Pattern 3: Multipart with @RequestPart
@PostMapping("/create")
public ResponseEntity<Author> create(
    @RequestPart("author") AuthorRequest request,
    @RequestPart(value = "image", required = false) MultipartFile image
) { ... }
```

## Next Steps

1. Check backend controller code for `/authors/create` endpoint
2. Identify which pattern it uses
3. Implement corresponding frontend solution
4. Test with both image and no-image scenarios
