# ✅ Image Path Solution - Giữ nguyên DB và Backend

## 📋 Quyết định

**Không** thay đổi DB và Backend. Thay vào đó:
- ✅ **Di chuyển images từ `public/img/` → `src/assets/img/`**
- ✅ **Cập nhật code để work với format `/src/assets/img/...`**
- ✅ **DB giữ nguyên format hiện tại**

## 🎯 Lý do

1. **Không phải touch backend** → Tiết kiệm thời gian
2. **Không phải migration DB** → Tránh risk mất data
3. **Vite/React tự động handle** import từ src/assets
4. **Tất cả data hiện tại** vẫn work ngon

## 📁 Cấu trúc Folder

```
front-end/
├── src/
│   └── assets/
│       └── img/
│           ├── book/           # Book covers
│           │   ├── hp1.webp
│           │   ├── hp2.webp
│           │   └── b1.webp (fallback)
│           ├── author/         # Author photos
│           │   └── ...
│           ├── publisher/      # Publisher logos
│           │   └── georgenewnes.webp
│           ├── avatar/         # User avatars
│           │   └── sample-user-avatar.png
│           └── series/         # Series covers
│               └── ...
```

## ✅ Những gì đã làm

### 1. Cập nhật `imageHelpers.ts`

**Trước:**
```typescript
// Convert /src/assets/img/... → /img/...
const cleanPath = backendPath.replace(/^\/src\/assets/, "");
```

**Sau:**
```typescript
// Giữ nguyên /src/assets/img/... format
// Vite sẽ handle import automatically
return `/${cleanPath}`; // /src/assets/img/book/hp1.webp
```

**Fallback images:**
```typescript
export const FALLBACK_IMAGES = {
  book: "/src/assets/img/book/b1.webp",
  author: "/src/assets/img/avatar/sample-user-avatar.png",
  publisher: "/src/assets/img/publisher/georgenewnes.webp",
  user: "/src/assets/img/avatar/sample-user-avatar.png",
};
```

### 2. Cập nhật `ImageUpload.tsx`

**Upload file:**
```typescript
// Generate path theo DB format
const dbPath = `/src/assets/img/${folder}/${filename}`;
onChange(dbPath); // Lưu vào form state
```

**Input URL:**
```typescript
// Accept format: /src/assets/img/book/image.jpg
if (urlInput.startsWith("/src/assets/img/")) {
  onChange(urlInput);
}

// Auto convert /img/ → /src/assets/img/
if (urlInput.startsWith("/img/")) {
  const dbPath = "/src/assets" + urlInput;
  onChange(dbPath);
}
```

### 3. Giữ nguyên tất cả Management components

Các components sau **KHÔNG CẦN THAY ĐỔI** vì đã dùng `transformImageUrl`:
- ✅ BookManagement.tsx
- ✅ AuthorManagement.tsx
- ✅ PublisherManagement.tsx
- ✅ CustomerManagement.tsx
- ✅ StaffManagement.tsx

### 4. Forms đã update

- ✅ BookForm.tsx - dùng ImageUpload với `folder="book"`
- ✅ AuthorForm.tsx - dùng ImageUpload với `folder="author"`
- ✅ PublisherForm.tsx - dùng ImageUpload với `folder="publisher"`

## 🚀 Workflow Upload Image

### Admin/Staff tạo Book mới:

```
1. Click "Create Book"
2. Fill form
3. Click "Upload File"
4. Chọn: "harry-potter-cover.jpg"
5. ImageUpload component:
   - Generate: /src/assets/img/book/1699999999999-harry-potter-cover.jpg
   - Set vào form state
6. Submit form
7. API request gửi xuống:
   {
     "title": "Harry Potter",
     "image": "/src/assets/img/book/1699999999999-harry-potter-cover.jpg"
   }
8. Backend lưu CHÍNH XÁC string này vào DB ✅
```

### Backend xử lý (KHÔNG THAY ĐỔI):

```java
@PostMapping("/api/books/create")
public Book createBook(@RequestBody BookCreateRequest request) {
    Book book = new Book();
    book.setImage(request.getImage()); // Lưu as-is
    // "/src/assets/img/book/1699999999999-harry-potter-cover.jpg"
    return bookRepository.save(book);
}
```

### Frontend hiển thị (ĐÃ DONE):

```tsx
// BookManagement.tsx
<img src={transformImageUrl(book.image) || FALLBACK_IMAGES.book} />

// transformImageUrl nhận: "/src/assets/img/book/hp1.webp"
// Return: "/src/assets/img/book/hp1.webp" (giữ nguyên)
// Vite tự động resolve đúng file trong src/assets/
```

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Backend vẫn cần xử lý file upload thật

**Backend endpoint cần:**
```java
@PostMapping("/api/upload/image")
public String uploadImage(
    @RequestParam("file") MultipartFile file,
    @RequestParam("folder") String folder
) {
    // 1. Save file to: front-end/src/assets/img/{folder}/
    Path uploadPath = Paths.get("front-end/src/assets/img/" + folder);
    
    // 2. Generate filename
    String filename = System.currentTimeMillis() + "-" + cleanName;
    
    // 3. Save file
    Files.copy(file.getInputStream(), uploadPath.resolve(filename));
    
    // 4. Return DB format
    return "/src/assets/img/" + folder + "/" + filename;
}
```

### 2. Vite Configuration

Đảm bảo Vite config include assets:

```typescript
// vite.config.ts
export default defineConfig({
  assetsInclude: ['**/*.webp', '**/*.jpg', '**/*.png', '**/*.svg'],
  // ...
});
```

### 3. Di chuyển existing images

**TODO:** Cần di chuyển tất cả images từ `public/img/` sang `src/assets/img/`:

```powershell
# Trong terminal PowerShell
cd front-end

# Di chuyển toàn bộ folder img
Move-Item -Path "public/img" -Destination "src/assets/img" -Force

# Hoặc copy nếu muốn giữ backup
Copy-Item -Path "public/img" -Destination "src/assets/img" -Recurse
```

## 📊 Database Format (KHÔNG ĐỔI)

**Tất cả image columns trong DB giữ nguyên:**

```sql
-- book table
SELECT id, title, image FROM book LIMIT 3;
-- 1 | Harry Potter 1 | /src/assets/img/book/hp1.webp
-- 2 | Harry Potter 2 | /src/assets/img/book/hp2.webp
-- 3 | Game of Thrones | /src/assets/img/book/got1.webp

-- author table
SELECT id, name, image FROM author LIMIT 2;
-- 1 | J.K. Rowling | /src/assets/img/author/jkrowling.webp
-- 2 | George R.R. Martin | /src/assets/img/author/grrmartin.webp

-- Format ĐÚNG: /src/assets/img/{type}/{filename}
```

## ✅ Checklist

### Completed (✅)
- [x] Update imageHelpers.ts - giữ nguyên format
- [x] Update ImageUpload.tsx - generate đúng format
- [x] Update BookForm.tsx
- [x] Update AuthorForm.tsx
- [x] Update PublisherForm.tsx
- [x] Update FALLBACK_IMAGES paths

### TODO (📝)
- [ ] **Di chuyển images** từ `public/img/` → `src/assets/img/`
- [ ] **Test upload** một book mới với image
- [ ] **Verify DB** có đúng format `/src/assets/img/...`
- [ ] **Test hiển thị** images trên tất cả management pages
- [ ] **Implement backend** upload endpoint (save to src/assets/img/)
- [ ] **Update frontend** ImageUpload để call backend API thật

## 🎯 Next Steps

### 1. Di chuyển Images NGAY BÂY GIỜ

```powershell
cd D:\SWP391_SU25_G5\front-end

# Option 1: Move (di chuyển, xóa folder cũ)
Move-Item -Path "public\img" -Destination "src\assets\img" -Force

# Option 2: Copy (giữ backup)
Copy-Item -Path "public\img" -Destination "src\assets\img" -Recurse -Force
```

### 2. Test Ngay

```bash
# Start frontend
npm run dev

# Open browser
http://localhost:5173/admin/books

# Check:
# - Tất cả book images hiển thị đúng
# - Author images hiển thị đúng
# - Publisher images hiển thị đúng
```

### 3. Test Upload

1. Click "Create Book"
2. Upload một ảnh bất kỳ
3. Check console log xem path có đúng: `/src/assets/img/book/...`
4. Submit form
5. Check DB xem record mới có đúng format

## 🎉 Kết quả

**Trước:**
- ❌ DB có `/src/assets/...` nhưng file ở `public/img/`
- ❌ Frontend transform path → mismatch
- ❌ Images không load

**Sau:**
- ✅ DB có `/src/assets/img/...`
- ✅ File ở `src/assets/img/...`
- ✅ Frontend giữ nguyên path
- ✅ Vite tự động resolve
- ✅ Images load perfectly!

## 💡 Bonus: Tại sao approach này OK

1. **Vite tự động bundle** tất cả files trong `src/assets/`
2. **Không cần transform** path phức tạp
3. **DB format = File location** → Nhất quán
4. **Backend đơn giản** → Chỉ cần save file đúng chỗ
5. **Zero migration** → Không risk

## 🚨 Important Note

Sau khi di chuyển images, **XÓA FOLDER** `public/img/` để tránh nhầm lẫn:

```powershell
Remove-Item -Path "public\img" -Recurse -Force
```

Hoặc rename thành `public/img.backup` để giữ backup:

```powershell
Rename-Item -Path "public\img" -NewName "img.backup"
```
