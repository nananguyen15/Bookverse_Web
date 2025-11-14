# Image Upload Implementation Guide

## ✅ Đã hoàn thành:

### 1. User Management (Customer & Staff)
- ✅ Frontend: Upload file + Enter URL
- ✅ Backend: Accept multipart + URL string
- ✅ Database: Lưu `/img/avatar/123-file.jpg`
- ✅ File storage: `front-end/public/img/avatar/`

### 2. UI Improvements
- ✅ Đổi cột ID → No. (STT tự tăng)
- ✅ STT giữ nguyên khi sort/search/pagination

---

## ⏳ Cần implement:

### 3. Book Management - Image Upload

#### Frontend Changes:

**File:** `front-end/src/components/Admin/BookManagement.tsx`

```typescript
// 1. Thêm state (ĐÃ THÊM)
const [imageFile, setImageFile] = useState<File | null>(null);

// 2. Sửa handleCreate
const handleCreate = async () => {
  try {
    const createData: any = {
      ...formData,
      active: true,
    };

    // Handle image
    if (imageFile) {
      createData.imageFile = imageFile;
    } else if (formData.image && formData.image.trim()) {
      createData.image = formData.image.trim();
    }

    await booksApi.create(createData);
    // ...
  }
};

// 3. Sửa handleUpdate
const handleUpdate = async () => {
  if (!selectedBook) return;
  try {
    const updateData: any = { ...formData };

    // Handle image
    if (imageFile) {
      updateData.imageFile = imageFile;
    } else if (formData.image && formData.image.trim()) {
      updateData.image = formData.image.trim();
    }

    await booksApi.update(selectedBook.id, updateData);
    // ...
  }
};

// 4. Thêm vào resetForm
const resetForm = () => {
  setFormData({
    title: "",
    description: "",
    price: 0,
    // ...
    image: "",
  });
  setImageFile(null); // THÊM DÒNG NÀY
  setSelectedBook(null);
};

// 5. Thêm onImageUpload prop vào BookForm components
<BookForm
  formData={formData}
  onUpdate={setFormData}
  onImageUpload={setImageFile} // THÊM DÒNG NÀY
  // ...
/>
```

**File:** `front-end/src/api/endpoints/books.api.ts`

```typescript
// Sửa create method
create: async (data: BookCreateRequest & { imageFile?: File }): Promise<Book> => {
  const formData = new FormData();
  
  // Add all fields
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.price !== undefined) formData.append('price', String(data.price));
  if (data.authorId) formData.append('authorId', String(data.authorId));
  if (data.publisherId) formData.append('publisherId', String(data.publisherId));
  if (data.categoryId) formData.append('categoryId', String(data.categoryId));
  if (data.stockQuantity !== undefined) formData.append('stockQuantity', String(data.stockQuantity));
  if (data.publishedDate) formData.append('publishedDate', data.publishedDate);
  if (data.active !== undefined) formData.append('active', String(data.active));
  
  // Handle image
  if (data.imageFile) {
    formData.append('image', data.imageFile);
  } else if (data.image) {
    formData.append('imageUrl', data.image);
  }

  const response = await apiClient.post<ApiResponse<Book>>(
    `${BOOKS_ENDPOINT}/create`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.result;
},

// Sửa update method tương tự
update: async (id: number, data: BookUpdateRequest & { imageFile?: File }): Promise<Book> => {
  const formData = new FormData();
  
  // Add fields (only if provided)
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.price !== undefined) formData.append('price', String(data.price));
  if (data.authorId) formData.append('authorId', String(data.authorId));
  if (data.publisherId) formData.append('publisherId', String(data.publisherId));
  if (data.categoryId) formData.append('categoryId', String(data.categoryId));
  if (data.stockQuantity !== undefined) formData.append('stockQuantity', String(data.stockQuantity));
  if (data.publishedDate) formData.append('publishedDate', data.publishedDate);
  
  // Handle image
  if (data.imageFile) {
    formData.append('image', data.imageFile);
  } else if (data.image) {
    formData.append('imageUrl', data.image);
  }

  const response = await apiClient.put<ApiResponse<Book>>(
    `${BOOKS_ENDPOINT}/update/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.result;
},
```

#### Backend Changes:

**File:** `BookController.java`

```java
@PostMapping(value = "/create", consumes = {"multipart/form-data"})
public APIResponse<Book> createBook(
        @RequestParam("title") String title,
        @RequestParam(value = "description", required = false) String description,
        @RequestParam("price") double price,
        @RequestParam("authorId") Long authorId,
        @RequestParam("publisherId") Long publisherId,
        @RequestParam("categoryId") Long categoryId,
        @RequestParam(value = "stockQuantity", defaultValue = "0") int stockQuantity,
        @RequestParam(value = "publishedDate", required = false) String publishedDate,
        @RequestParam(value = "image", required = false) MultipartFile imageFile,
        @RequestParam(value = "imageUrl", required = false) String imageUrl,
        @RequestParam(value = "active", defaultValue = "true") boolean active) {
    
    APIResponse<Book> response = new APIResponse<>();
    response.setResult(bookService.createBook(title, description, price, authorId, publisherId, 
                                               categoryId, stockQuantity, publishedDate, imageFile, imageUrl, active));
    return response;
}

@PutMapping(value = "/update/{id}", consumes = {"multipart/form-data"})
public APIResponse<Book> updateBook(
        @PathVariable Long id,
        @RequestParam(value = "title", required = false) String title,
        @RequestParam(value = "description", required = false) String description,
        @RequestParam(value = "price", required = false) Double price,
        @RequestParam(value = "authorId", required = false) Long authorId,
        @RequestParam(value = "publisherId", required = false) Long publisherId,
        @RequestParam(value = "categoryId", required = false) Long categoryId,
        @RequestParam(value = "stockQuantity", required = false) Integer stockQuantity,
        @RequestParam(value = "publishedDate", required = false) String publishedDate,
        @RequestParam(value = "image", required = false) MultipartFile imageFile,
        @RequestParam(value = "imageUrl", required = false) String imageUrl) {
    
    APIResponse<Book> response = new APIResponse<>();
    response.setResult(bookService.updateBook(id, title, description, price, authorId, publisherId,
                                               categoryId, stockQuantity, publishedDate, imageFile, imageUrl));
    return response;
}
```

**File:** `BookService.java`

```java
public Book createBook(String title, String description, double price, Long authorId, Long publisherId,
                       Long categoryId, int stockQuantity, String publishedDate, 
                       MultipartFile imageFile, String imageUrl, boolean active) {
    
    // Handle image
    String imagePath = null;
    if (imageFile != null && !imageFile.isEmpty()) {
        imagePath = handleImageUpload(imageFile, "book");
        System.out.println("✅ Created with uploaded file: " + imagePath);
    } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
        imagePath = imageUrl.trim();
        System.out.println("✅ Created with image URL: " + imageUrl);
    }

    // Create book entity
    Book book = new Book();
    book.setTitle(title);
    book.setDescription(description);
    book.setPrice(price);
    book.setAuthorId(authorId);
    book.setPublisherId(publisherId);
    book.setCategoryId(categoryId);
    book.setStockQuantity(stockQuantity);
    book.setPublishedDate(publishedDate);
    book.setImage(imagePath);
    book.setActive(active);

    return bookRepository.save(book);
}

public Book updateBook(Long id, String title, String description, Double price, Long authorId, Long publisherId,
                       Long categoryId, Integer stockQuantity, String publishedDate,
                       MultipartFile imageFile, String imageUrl) {
    
    Book existingBook = bookRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

    // Update fields
    if (title != null) existingBook.setTitle(title);
    if (description != null) existingBook.setDescription(description);
    if (price != null) existingBook.setPrice(price);
    if (authorId != null) existingBook.setAuthorId(authorId);
    if (publisherId != null) existingBook.setPublisherId(publisherId);
    if (categoryId != null) existingBook.setCategoryId(categoryId);
    if (stockQuantity != null) existingBook.setStockQuantity(stockQuantity);
    if (publishedDate != null) existingBook.setPublishedDate(publishedDate);

    // Handle image
    if (imageFile != null && !imageFile.isEmpty()) {
        String imagePath = handleImageUpload(imageFile, "book");
        existingBook.setImage(imagePath);
        System.out.println("✅ Updated with uploaded file: " + imagePath);
    } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
        existingBook.setImage(imageUrl.trim());
        System.out.println("✅ Updated with image URL: " + imageUrl);
    }

    return bookRepository.save(existingBook);
}

// Reuse handleImageUpload from UserService (copy method)
private String handleImageUpload(MultipartFile imageFile, String folder) {
    System.out.println("🔍 handleImageUpload called - imageFile: " + 
        (imageFile != null ? imageFile.getOriginalFilename() + " (" + imageFile.getSize() + " bytes)" : "null"));
    
    if (imageFile == null || imageFile.isEmpty()) {
        System.out.println("⚠️ Image file is null or empty, skipping upload");
        return null;
    }

    try {
        // Validate file type
        String contentType = imageFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }

        // Validate file size (max 5MB)
        if (imageFile.getSize() > 5 * 1024 * 1024) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }

        // Generate unique filename
        String originalFilename = imageFile.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE_NAME);
        }

        String timestamp = String.valueOf(System.currentTimeMillis());
        String cleanFilename = originalFilename.toLowerCase()
                .replaceAll("[^a-z0-9.]", "-")
                .replaceAll("-+", "-");
        String filename = timestamp + "-" + cleanFilename;

        // Create upload directory if not exists
        String projectRoot = System.getProperty("user.dir").replace("\\back-end\\bookverse", "");
        String uploadDir = projectRoot + "/front-end/public/img/" + folder;
        Path uploadPath = Paths.get(uploadDir);
        
        System.out.println("📁 Upload directory: " + uploadPath.toAbsolutePath());
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            System.out.println("✅ Created directory: " + uploadPath.toAbsolutePath());
        }

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return DB path
        String dbPath = "/img/" + folder + "/" + filename;
        System.out.println("✅ Image uploaded: " + dbPath);
        return dbPath;

    } catch (IOException e) {
        System.err.println("❌ Image upload failed: " + e.getMessage());
        throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
    }
}
```

---

### 4. Author Management - Image Upload

Tương tự như Books, thay `book` → `author`:
- Frontend: Thêm `imageFile` state
- Frontend: Sửa `handleCreate/Update`
- Frontend API: Chuyển sang FormData
- Backend Controller: Accept multipart
- Backend Service: Handle image upload
- File storage: `front-end/public/img/author/`
- DB path: `/img/author/123-file.jpg`

---

### 5. Profile Pages - Connect API

#### Customer Profile

**File:** `front-end/src/components/CustomerProfile/Profile.tsx`

**Current:** Dùng localStorage
**Target:** Gọi API `/api/users/myInfo` và `/api/users/update/{userId}`

```typescript
import { usersApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

export function Profile() {
  const { user } = useAuth();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load from API
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await usersApi.getMyInfo();
      reset({
        fullName: response.name || "",
        phone: response.phone || "",
        email: response.email || "",
        // ...
      });
      if (response.image) {
        setAvatarPreview(transformImageUrl(response.image));
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const updateData: any = {
        name: data.fullName,
        phone: data.phone,
        address: data.address,
      };

      if (imageFile) {
        updateData.imageFile = imageFile;
      } else if (data.avatar) { // If URL entered
        updateData.image = data.avatar;
      }

      await usersApi.update(user!.id, updateData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    }
  };

  // Replace file input with UserForm component or add upload UI
  // ...
}
```

#### Staff Profile

**File:** `front-end/src/components/Staff/StaffProfile.tsx`

Tương tự Customer Profile, nhưng dùng role STAFF.

#### Admin Profile

**File:** `front-end/src/components/Admin/AdminAccount.tsx`

Tương tự, connect `/api/users/myInfo` và `/api/users/update/{userId}`.

---

## 📋 Checklist

### Books
- [ ] Frontend: Add `imageFile` state
- [ ] Frontend: Update `handleCreate/Update`
- [ ] Frontend: Add `onImageUpload` to BookForm
- [ ] Frontend API: Change to FormData
- [ ] Backend Controller: Accept multipart
- [ ] Backend Service: Handle image upload
- [ ] Test: Upload file
- [ ] Test: Enter URL

### Authors
- [ ] Same as Books

### Customer Profile
- [ ] Replace localStorage with API calls
- [ ] Add image upload UI
- [ ] Test profile update

### Staff Profile
- [ ] Replace localStorage with API calls
- [ ] Add image upload UI
- [ ] Test profile update

### Admin Profile
- [ ] Replace localStorage with API calls
- [ ] Add image upload UI
- [ ] Test profile update

---

## 🔧 Common Issues

### Issue 1: File không lưu đúng folder
**Solution:** Check `projectRoot` path calculation trong `handleImageUpload()`

### Issue 2: Frontend không hiển thị ảnh
**Solution:** Check `transformImageUrl()` và path format (`/img/...`)

### Issue 3: Multipart request fails
**Solution:** Check Spring Boot config `spring.servlet.multipart.max-file-size=5MB`

---

## 📝 Notes

- File storage: `front-end/public/img/{folder}/`
- DB path format: `/img/{folder}/timestamp-filename.ext`
- Max file size: 5MB
- Allowed types: image/*
- Filename format: `{timestamp}-{sanitized-name}.{ext}`
