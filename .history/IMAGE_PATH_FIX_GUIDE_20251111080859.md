# Hướng dẫn Fix Đường dẫn Image

## ⚠️ Vấn đề hiện tại

Backend đang lưu đường dẫn **source code** vào DB thay vì đường dẫn **public URL**:
- ❌ DB hiện tại: `/src/assets/img/book/hp1.webp`
- ✅ DB cần có: `/img/book/hp1.webp`

## 🔍 Nguyên nhân

Khi admin/staff upload ảnh hoặc customer upload avatar:
1. File được lưu vào: `front-end/public/img/{type}/`
2. Frontend gửi path xuống backend qua API
3. **Backend lưu sai path format vào DB**

## 🛠️ Giải pháp

### Option 1: Fix Frontend (Khuyến nghị - dễ nhất)

Khi gửi request tạo/update, frontend cần gửi đúng format:

**File cần sửa: Tất cả Form components**
- `AuthorForm.tsx`
- `PublisherForm.tsx`
- `BookForm.tsx` (nếu có)

**Ví dụ khi submit form:**

```typescript
// ❌ KHÔNG làm thế này:
const formData = {
  name: "Harry Potter",
  image: "/src/assets/img/book/hp1.webp" // SAI!
};

// ✅ Làm thế này:
const formData = {
  name: "Harry Potter",
  image: "/img/book/hp1.webp" // ĐÚNG!
};
```

**Hoặc nếu có upload file:**

```typescript
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Giả sử file được lưu vào public/img/book/
    const filename = file.name;
    const publicPath = `/img/book/${filename}`;
    
    setFormData({
      ...formData,
      image: publicPath // Gửi path này xuống backend
    });
  }
};
```

### Option 2: Fix Backend (Lâu dài hơn)

**File cần check:**
- `BookService.java`
- `AuthorService.java`
- `PublisherService.java`
- `UserService.java`

**Tìm chỗ này và thêm transform:**

```java
// Trong method createBook/updateBook/createAuthor/etc...

@Service
public class BookService {
    
    public Book createBook(BookCreationRequest request) {
        Book book = new Book();
        
        // Thêm helper method để transform path
        book.setImage(transformImagePath(request.getImage()));
        
        // ... rest of code
    }
    
    // Helper method để transform path
    private String transformImagePath(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return null;
        }
        
        // Remove /src/assets prefix if exists
        if (imagePath.startsWith("/src/assets/")) {
            return imagePath.replace("/src/assets", "");
        }
        
        // If already correct format, return as is
        if (imagePath.startsWith("/img/")) {
            return imagePath;
        }
        
        return imagePath;
    }
}
```

### Option 3: Database Migration (Nếu cần fix data cũ)

**SQL Script để fix toàn bộ data cũ:**

```sql
-- Fix book table
UPDATE book 
SET image = REPLACE(image, '/src/assets', '') 
WHERE image LIKE '/src/assets/%';

-- Fix author table
UPDATE author 
SET image = REPLACE(image, '/src/assets', '') 
WHERE image LIKE '/src/assets/%';

-- Fix publisher table
UPDATE publisher 
SET image = REPLACE(image, '/src/assets', '') 
WHERE image LIKE '/src/assets/%';

-- Fix user table (customer & staff avatars)
UPDATE user 
SET image = REPLACE(image, '/src/assets', '') 
WHERE image LIKE '/src/assets/%';
```

## ✅ Giải pháp tạm thời (Đã làm)

Hiện tại frontend đã có `transformImageUrl()` helper để convert path khi hiển thị:
- `/src/assets/img/book/hp1.webp` → `/img/book/hp1.webp`

**Files đã update:**
- ✅ `BookManagement.tsx`
- ✅ `AuthorManagement.tsx`
- ✅ `PublisherManagement.tsx`
- ✅ `CustomerManagement.tsx`
- ✅ `StaffManagement.tsx`

## 📋 Checklist

- [x] Frontend transform helper (tạm thời)
- [ ] Check frontend form submission - gửi đúng format `/img/...`
- [ ] Check backend service - lưu đúng format
- [ ] Run migration script để fix data cũ
- [ ] Test upload ảnh mới
- [ ] Verify images hiển thị đúng

## 🎯 Next Steps

1. **Kiểm tra form submit:** Mở DevTools → Network tab → Xem request payload khi create/update có image field
2. **Nếu frontend gửi sai:** Fix các Form components
3. **Nếu backend lưu sai:** Fix các Service classes
4. **Fix data cũ:** Run SQL migration script
5. **Test:** Upload ảnh mới và verify trong DB có đúng format `/img/...`

## 📝 Example Test

```bash
# Test tạo book mới với image
POST /api/books/create
{
  "title": "Test Book",
  "image": "/img/book/test.webp"  // ✅ Phải là format này
}

# Check trong DB
SELECT id, title, image FROM book WHERE title = 'Test Book';
# Expected: image = "/img/book/test.webp"
```
