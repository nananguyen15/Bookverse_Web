# ✅ Image Path Fix - Complete Implementation

## 📋 Tóm tắt những gì đã làm

### 1. ✅ Tạo ImageUpload Component (`/src/components/Shared/ImageUpload.tsx`)
**Chức năng:**
- ✅ Upload file từ máy tính (drag & drop hoặc click)
- ✅ Nhập URL trực tiếp (http:// hoặc /img/...)
- ✅ Preview ảnh real-time
- ✅ Validation: file type (image/*), file size (max 5MB)
- ✅ Tự động generate đúng format path: `/img/{folder}/{filename}`
- ✅ Hỗ trợ 3 kiểu hiển thị: avatar (round), square, cover (book)
- ✅ Hỗ trợ 5 folders: book, author, publisher, avatar, series

**Format path tự động:**
```typescript
// Khi upload file "harry-potter.jpg" cho book
// Component tự động tạo: "/img/book/1699999999999-harry-potter.jpg"
// Đây chính là format được lưu vào DB ✅
```

### 2. ✅ Cập nhật tất cả Form Components

**BookForm.tsx:**
```tsx
<ImageUpload
  value={formData.image}
  onChange={(url) => handleChange("image", url)}
  label="Book Cover Image"
  type="cover"
  folder="book"  // ← Tự động lưu vào /img/book/
  required
/>
```

**AuthorForm.tsx:**
```tsx
<ImageUpload
  value={formData.image}
  onChange={(url) => onUpdate({ ...formData, image: url })}
  label="Author Image"
  type="avatar"  // ← Avatar tròn
  folder="author"  // ← Tự động lưu vào /img/author/
  required
/>
```

**PublisherForm.tsx:**
```tsx
<ImageUpload
  value={formData.image}
  onChange={(url) => onUpdate({ ...formData, image: url })}
  label="Publisher Image"
  type="square"  // ← Vuông
  folder="publisher"  // ← Tự động lưu vào /img/publisher/
  required
/>
```

### 3. ✅ SQL Migration Script (`/database/fix-image-paths-migration.sql`)

**Chức năng:**
- Fix toàn bộ records cũ trong DB
- Convert `/src/assets/img/...` → `/img/...`
- Update 4 tables: book, author, publisher, user
- Có verification queries để check kết quả
- Có backup & rollback instructions

**Cách chạy:**
```sql
-- 1. Connect vào MySQL
mysql -u root -p bookverse

-- 2. Run migration script
source D:/SWP391_SU25_G5/database/fix-image-paths-migration.sql

-- 3. Check kết quả
SELECT id, title, image FROM book WHERE image LIKE '/img/%' LIMIT 10;
```

### 4. ✅ Frontend Transform Helper (đã có sẵn)

**File:** `/src/utils/imageHelpers.ts`
```typescript
transformImageUrl("/src/assets/img/book/hp1.webp")
// Returns: "/img/book/hp1.webp"
```

**Đã áp dụng vào:**
- ✅ BookManagement.tsx
- ✅ AuthorManagement.tsx
- ✅ PublisherManagement.tsx
- ✅ CustomerManagement.tsx
- ✅ StaffManagement.tsx

## 🎯 Workflow mới khi Upload Image

### Scenario 1: Admin/Staff tạo Book mới
```
1. Click "Create Book"
2. Fill form fields
3. Click "Upload File" trong Image section
4. Chọn file từ máy: "harry-potter-cover.jpg"
5. Component tự động:
   - Validate file
   - Generate filename: "1699999999999-harry-potter-cover.jpg"
   - Tạo path: "/img/book/1699999999999-harry-potter-cover.jpg"
   - Set vào form state
6. Submit form
7. Backend nhận: image = "/img/book/1699999999999-harry-potter-cover.jpg"
8. Backend lưu CHÍNH XÁC path này vào DB ✅
```

### Scenario 2: Customer change avatar
```
1. Go to Profile
2. Click "Change Avatar"
3. Upload ảnh mới
4. Component generate: "/img/avatar/1699999999999-my-photo.jpg"
5. Backend lưu path này vào user.image
```

### Scenario 3: Nhập URL trực tiếp
```
1. Toggle sang "Enter URL" mode
2. Nhập: "https://example.com/book-cover.jpg"
   HOẶC: "/img/book/existing-image.webp"
3. Component accept cả 2 formats
4. Lưu vào DB exactly như đã nhập
```

## 🔧 Backend Requirements

**QUAN TRỌNG:** Backend cần xử lý file upload thật:

```java
@PostMapping("/api/upload/image")
public ResponseEntity<String> uploadImage(
    @RequestParam("file") MultipartFile file,
    @RequestParam("folder") String folder // book, author, publisher, avatar
) {
    try {
        // 1. Validate file
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Not an image file");
        }
        
        // 2. Generate filename
        String timestamp = String.valueOf(System.currentTimeMillis());
        String originalFilename = file.getOriginalFilename();
        String cleanName = originalFilename
            .toLowerCase()
            .replaceAll("[^a-z0-9.]", "-");
        String filename = timestamp + "-" + cleanName;
        
        // 3. Save to public/img/{folder}/
        Path uploadPath = Paths.get("public/img/" + folder);
        Files.createDirectories(uploadPath);
        
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        // 4. Return ĐÚNG FORMAT này
        String publicUrl = "/img/" + folder + "/" + filename;
        return ResponseEntity.ok(publicUrl);
        
    } catch (IOException e) {
        return ResponseEntity.status(500).body("Upload failed");
    }
}
```

**Frontend sẽ gọi:**
```typescript
// Khi user upload file
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'book'); // or 'author', 'publisher', 'avatar'

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
});

const publicUrl = await response.text();
// publicUrl = "/img/book/1699999999999-harry-potter.jpg"

// Set vào form
onChange(publicUrl);
```

## ✅ Checklist

### Frontend (✅ DONE)
- [x] ImageUpload component
- [x] BookForm integration
- [x] AuthorForm integration
- [x] PublisherForm integration
- [x] transformImageUrl helper
- [x] Applied to all Management tables

### Database (⏳ TODO - Cần chạy migration)
- [ ] Backup tables
- [ ] Run migration script
- [ ] Verify old paths removed
- [ ] Test image display

### Backend (⏳ TODO - Cần implement)
- [ ] Create /api/upload/image endpoint
- [ ] Handle file upload
- [ ] Save to public/img/{folder}/
- [ ] Return correct format: /img/{folder}/{filename}
- [ ] Update Book/Author/Publisher services to use returned path

### Testing (⏳ TODO)
- [ ] Test upload new book with image
- [ ] Test update author image
- [ ] Test customer avatar change
- [ ] Test URL input mode
- [ ] Verify DB has correct /img/ paths
- [ ] Verify images display correctly

## 📝 Next Steps

### Step 1: Run Database Migration (NGAY BÂY GIỜ)
```bash
# Connect to MySQL
mysql -u root -p

# Use database
use bookverse;

# Run migration
source D:/SWP391_SU25_G5/database/fix-image-paths-migration.sql

# Verify
SELECT COUNT(*) FROM book WHERE image LIKE '/src/assets/%';
# Should return 0
```

### Step 2: Implement Backend Upload Endpoint
1. Tạo `ImageUploadController.java`
2. Implement file upload logic
3. Test với Postman
4. Integrate vào frontend

### Step 3: Update Frontend để gọi Backend
```typescript
// Trong ImageUpload.tsx, thay vì mock:
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData
  });
  
  const publicUrl = await response.text();
  onChange(publicUrl); // "/img/book/12345-image.jpg"
};
```

### Step 4: Test End-to-End
1. Upload ảnh mới
2. Check trong DB xem path có đúng `/img/...`
3. Refresh page
4. Verify ảnh hiển thị đúng

## 🎉 Kết quả mong đợi

**Trước:**
```sql
SELECT image FROM book LIMIT 3;
-- /src/assets/img/book/hp1.webp ❌
-- /src/assets/img/book/hp2.webp ❌
-- /src/assets/img/book/got1.webp ❌
```

**Sau khi chạy migration:**
```sql
SELECT image FROM book LIMIT 3;
-- /img/book/hp1.webp ✅
-- /img/book/hp2.webp ✅
-- /img/book/got1.webp ✅
```

**Upload mới:**
```sql
-- Khi admin upload "new-book-cover.jpg"
INSERT INTO book (title, image, ...) VALUES 
('New Book', '/img/book/1699999999999-new-book-cover.jpg', ...);
-- ✅ ĐÚNG FORMAT từ đầu!
```

## 🚀 Production Considerations

1. **Cloud Storage:** Trong production, nên upload lên AWS S3, Cloudinary thay vì local
2. **CDN:** Dùng CDN để serve images nhanh hơn
3. **Image Optimization:** Resize/compress ảnh trước khi lưu
4. **Security:** Validate file type, scan malware
5. **Backup:** Backup folder public/img/ thường xuyên

## 📞 Support

Nếu gặp vấn đề:
1. Check console.log trong ImageUpload component
2. Check Network tab xem request có đúng
3. Check DB xem path có format `/img/...`
4. Check browser console có error load image
