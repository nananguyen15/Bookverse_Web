# 📚 API Integration Guide - Books & Book Detail

## 📋 Mục Lục
1. [Setup API Infrastructure](#1-setup-api-infrastructure)
2. [Update Hero Slider (Top Sellers)](#2-update-hero-slider-top-sellers)
3. [Update Books Display on Landing Page](#3-update-books-display-on-landing-page)
4. [Update Categories (SupCategory & SubCategory)](#4-update-categories-supcategory--subcategory)
5. [Update Book Detail Page](#5-update-book-detail-page)
6. [Testing & Verification](#6-testing--verification)

---

## 1️⃣ Setup API Infrastructure

### ✅ Đã hoàn thành:
- ✅ `src/types/api/` - TypeScript types (Book, Category, Author, Publisher, User)
- ✅ `src/api/client.ts` - Axios client với interceptors
- ✅ `src/api/endpoints/` - Tất cả API endpoints
- ✅ `.env.development` - Environment variables

### 🔍 Kiểm tra:
```bash
# Kiểm tra cấu trúc folders
ls src/api
ls src/types/api
```

---

## 2️⃣ Update Hero Slider (Top Sellers)

### 📝 Yêu cầu:
- Hiển thị theo số lượng người mua (top sellers)
- Nếu chưa có data bán hàng → dùng `GET /api/books/active/random`

### 📄 File: `src/components/Home/HeroSlider.tsx`

**BƯỚC 1:** Update imports
```typescript
import { useState, useEffect } from 'react';
import { booksApi } from '../../api';
import type { Book } from '../../types';
```

**BƯỚC 2:** Thay thế mock data bằng API call
```typescript
const HeroSlider = () => {
  const [bookGroups, setBookGroups] = useState<Book[][]>([]);
  const [loading, setLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState(0);

  useEffect(() => {
    const fetchHeroBooks = async () => {
      try {
        setLoading(true);
        
        // TODO: Khi có API top sellers, thay bằng booksApi.getTopSellers(9)
        // Hiện tại dùng random books
        const books = await booksApi.getRandom(9);
        
        // Chia thành 3 groups (mỗi group 3 books)
        const groups: Book[][] = [];
        for (let i = 0; i < books.length; i += 3) {
          groups.push(books.slice(i, i + 3));
        }
        
        setBookGroups(groups);
      } catch (error) {
        console.error('Error fetching hero books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroBooks();
  }, []);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (bookGroups.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentGroup((prev) => (prev + 1) % bookGroups.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [bookGroups]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-beige-50">
        <p className="text-brown-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gradient-to-b from-beige-50 to-beige-100">
      {/* Slider content */}
      {bookGroups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className={`transition-opacity duration-500 ${
            currentGroup === groupIndex ? 'opacity-100' : 'opacity-0 absolute'
          }`}
        >
          <div className="grid grid-cols-3 gap-6 p-8">
            {group.map((book) => (
              <div key={book.id} className="book-card">
                <img 
                  src={book.image.startsWith('http') ? book.image : `/src/assets/img/book/${book.image}`}
                  alt={book.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <h3 className="mt-4 font-semibold text-brown-800">{book.title}</h3>
                <p className="text-brown-600">{book.authorName || 'Unknown Author'}</p>
                <p className="text-red-600 font-bold">{book.price.toLocaleString('vi-VN')}đ</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 pb-4">
        {bookGroups.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentGroup(index)}
            className={`w-3 h-3 rounded-full ${
              currentGroup === index ? 'bg-brown-600' : 'bg-brown-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
```

**NOTE:** Backend hiện chưa có API `top-sellers` hoặc `soldCount` field. Khi backend thêm field này, update như sau:
```typescript
// Sắp xếp theo soldCount
const sortedBooks = books.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
```

---

## 3️⃣ Update Books Display on Landing Page

### 📝 Yêu cầu:
- Hiển thị: **title, author name, price**
- Sử dụng: `GET /api/books/active`
- Giữ nguyên layout và số lượng hiển thị

### 📄 File: `src/components/Home/BestSeller.tsx` (hoặc `Somebooks.tsx`)

**BƯỚC 1:** Update imports
```typescript
import { useState, useEffect } from 'react';
import { booksApi } from '../../api';
import type { Book } from '../../types';
import { Link } from 'react-router-dom';
```

**BƯỚC 2:** Fetch và hiển thị active books
```typescript
const BestSeller = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await booksApi.getActive();
        
        // Lấy 5 books đầu tiên (hoặc số lượng bạn muốn)
        setBooks(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Đang tải sách...</div>;
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-brown-800 mb-8">Sách Bán Chạy</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {books.map((book) => (
          <Link 
            key={book.id} 
            to={`/books/${book.id}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              {/* Book Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={book.image.startsWith('http') ? book.image : `/src/assets/img/book/${book.image}`}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Book Info - CHỈ hiển thị: title, author, price */}
              <div className="p-4">
                <h3 className="font-semibold text-brown-800 line-clamp-2 mb-2">
                  {book.title}
                </h3>
                
                <p className="text-sm text-brown-600 mb-2">
                  {book.authorName || 'Đang cập nhật'}
                </p>
                
                <p className="text-lg font-bold text-red-600">
                  {book.price.toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BestSeller;
```

---

## 4️⃣ Update Categories (SupCategory & SubCategory)

### 📝 Yêu cầu:
- Navbar: Hiển thị đúng số lượng SupCategory và SubCategory từ DB
- Home Categories: Hiển thị đúng title SupCategory và số lượng SubCategory

### 📄 File: `src/components/layout/Navbar/Navbar.tsx`

**BƯỚC 1:** Update imports
```typescript
import { useState, useEffect } from 'react';
import { categoriesApi } from '../../../api';
import type { SupCategory, SubCategory } from '../../../types';
```

**BƯỚC 2:** Fetch categories từ API
```typescript
const Navbar = () => {
  const [categories, setCategories] = useState<SupCategory[]>([]);
  const [subCategories, setSubCategories] = useState<Record<number, SubCategory[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // 1. Lấy tất cả SupCategories active
        const supCats = await categoriesApi.sup.getActive();
        setCategories(supCats);

        // 2. Lấy SubCategories cho từng SupCategory
        const subCatsMap: Record<number, SubCategory[]> = {};
        
        await Promise.all(
          supCats.map(async (supCat) => {
            const subs = await categoriesApi.sup.getSubCategories(supCat.id);
            subCatsMap[supCat.id] = subs.filter(sub => sub.active); // Chỉ lấy active
          })
        );

        setSubCategories(subCatsMap);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <nav className="bg-brown-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            BookVerse
          </Link>

          {/* Categories Dropdown */}
          <div className="flex gap-6">
            {categories.map((supCat) => (
              <div key={supCat.id} className="relative group">
                <button className="px-4 py-2 hover:bg-brown-700 rounded">
                  {supCat.name}
                </button>

                {/* Dropdown SubCategories */}
                {subCategories[supCat.id] && subCategories[supCat.id].length > 0 && (
                  <div className="absolute hidden group-hover:block bg-white text-brown-800 shadow-lg rounded mt-2 py-2 min-w-48">
                    {subCategories[supCat.id].map((subCat) => (
                      <Link
                        key={subCat.id}
                        to={`/books/category/${subCat.id}`}
                        className="block px-4 py-2 hover:bg-beige-100"
                      >
                        {subCat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex gap-4">
            <Link to="/cart" className="hover:text-beige-200">Giỏ hàng</Link>
            <Link to="/auth/signin" className="hover:text-beige-200">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

### 📄 File: `src/components/Home/Categories.tsx`

```typescript
import { useState, useEffect } from 'react';
import { categoriesApi } from '../../api';
import type { SupCategory, SubCategory } from '../../types';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState<SupCategory[]>([]);
  const [subCategories, setSubCategories] = useState<Record<number, SubCategory[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supCats = await categoriesApi.sup.getActive();
        setCategories(supCats);

        const subCatsMap: Record<number, SubCategory[]> = {};
        await Promise.all(
          supCats.map(async (supCat) => {
            const subs = await categoriesApi.sup.getSubCategories(supCat.id);
            subCatsMap[supCat.id] = subs.filter(sub => sub.active);
          })
        );

        setSubCategories(subCatsMap);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div>Đang tải danh mục...</div>;

  return (
    <section className="py-12 bg-beige-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-brown-800 mb-8">Danh Mục Sách</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((supCat) => (
            <div key={supCat.id} className="bg-white rounded-lg shadow-md p-6">
              {/* SupCategory Title */}
              <h3 className="text-xl font-bold text-brown-800 mb-4">
                {supCat.name}
              </h3>

              {/* SubCategories List - ĐÚNG SỐ LƯỢNG */}
              <ul className="space-y-2">
                {subCategories[supCat.id]?.map((subCat) => (
                  <li key={subCat.id}>
                    <Link
                      to={`/books/category/${subCat.id}`}
                      className="text-brown-600 hover:text-brown-800 hover:underline"
                    >
                      {subCat.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Số lượng SubCategories */}
              <p className="mt-4 text-sm text-brown-500">
                {subCategories[supCat.id]?.length || 0} danh mục
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
```

---

## 5️⃣ Update Book Detail Page

### 📝 Yêu cầu:
- Hiển thị TẤT CẢ thông tin NGOẠI TRỪ `id` và `active`
- Fields hiển thị: title, description, price, author, category, stockQuantity, publisher, publishedDate, image

### 📄 File: `src/pages/BookDetail.tsx` (hoặc `ProductDetail.tsx`)

**BƯỚC 1:** Update imports
```typescript
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { booksApi, authorsApi, publishersApi, categoriesApi } from '../api';
import type { Book, Author, Publisher, SubCategory } from '../types';
```

**BƯỚC 2:** Fetch book detail với related data
```typescript
const BookDetail = () => {
  const { bookId } = useParams<{ bookId: string }>();
  
  const [book, setBook] = useState<Book | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [category, setCategory] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchBookDetail = async () => {
      if (!bookId) return;

      try {
        setLoading(true);

        // 1. Fetch Book
        const bookData = await booksApi.getById(Number(bookId));
        setBook(bookData);

        // 2. Fetch Author (nếu có authorId)
        if (bookData.authorId) {
          try {
            const authorData = await authorsApi.getById(bookData.authorId);
            setAuthor(authorData);
          } catch (err) {
            console.error('Author not found:', err);
          }
        }

        // 3. Fetch Publisher (nếu có publisherId)
        if (bookData.publisherId) {
          try {
            const publisherData = await publishersApi.getById(bookData.publisherId);
            setPublisher(publisherData);
          } catch (err) {
            console.error('Publisher not found:', err);
          }
        }

        // 4. Fetch Category (nếu có categoryId)
        if (bookData.categoryId) {
          try {
            const categoryData = await categoriesApi.sub.getById(bookData.categoryId);
            setCategory(categoryData);
          } catch (err) {
            console.error('Category not found:', err);
          }
        }

      } catch (error) {
        console.error('Error fetching book detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [bookId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Đang tải thông tin sách...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Không tìm thấy sách</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT: Book Image */}
        <div>
          <img
            src={book.image.startsWith('http') ? book.image : `/src/assets/img/book/${book.image}`}
            alt={book.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* RIGHT: Book Information */}
        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-3xl font-bold text-brown-800">
            {book.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-2">
            <span className="text-brown-600">Tác giả:</span>
            <span className="font-semibold text-brown-800">
              {author?.name || book.authorName || 'Đang cập nhật'}
            </span>
          </div>

          {/* Publisher */}
          <div className="flex items-center gap-2">
            <span className="text-brown-600">Nhà xuất bản:</span>
            <span className="font-semibold text-brown-800">
              {publisher?.name || book.publisherName || 'Đang cập nhật'}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-brown-600">Phân loại:</span>
            <span className="font-semibold text-brown-800">
              {category?.name || book.categoryName || 'Đang cập nhật'}
            </span>
          </div>

          {/* Published Date */}
          <div className="flex items-center gap-2">
            <span className="text-brown-600">Ngày phát hành:</span>
            <span className="font-semibold text-brown-800">
              {new Date(book.publishedDate).toLocaleDateString('vi-VN')}
            </span>
          </div>

          {/* Stock Quantity */}
          <div className="flex items-center gap-2">
            <span className="text-brown-600">Số lượng còn lại:</span>
            <span className={`font-semibold ${book.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {book.stockQuantity} quyển
            </span>
          </div>

          {/* Price */}
          <div className="py-4 border-t border-b border-brown-200">
            <span className="text-2xl font-bold text-red-600">
              {book.price.toLocaleString('vi-VN')}đ
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-brown-600">Số lượng:</span>
            <div className="flex items-center border border-brown-300 rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-brown-100"
              >
                -
              </button>
              <span className="px-6 py-2 border-x border-brown-300">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(book.stockQuantity, quantity + 1))}
                className="px-4 py-2 hover:bg-brown-100"
                disabled={quantity >= book.stockQuantity}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            className="w-full bg-brown-600 text-white py-3 rounded-lg hover:bg-brown-700 transition-colors disabled:bg-gray-400"
            disabled={book.stockQuantity === 0}
          >
            {book.stockQuantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
          </button>

          {/* Description */}
          <div className="mt-8 pt-8 border-t border-brown-200">
            <h2 className="text-2xl font-bold text-brown-800 mb-4">Mô tả sản phẩm</h2>
            <p className="text-brown-700 leading-relaxed whitespace-pre-wrap">
              {book.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
```

**LƯU Ý:** 
- `id` và `active` KHÔNG hiển thị cho guest/customer
- Tất cả thông tin khác ĐỀU HIỂN THỊ đầy đủ

---

## 6️⃣ Testing & Verification

### ✅ Checklist kiểm tra:

**1. Hero Slider:**
```bash
- [ ] Hiển thị 9 books random (hoặc top sellers khi có API)
- [ ] Chia thành 3 groups, mỗi group 3 books
- [ ] Auto slide mỗi 5s
- [ ] Hiển thị: image, title, author, price
```

**2. Books Landing Page:**
```bash
- [ ] Fetch từ /api/books/active
- [ ] CHỈ hiển thị: title, author name, price
- [ ] Giữ nguyên layout (grid 5 columns)
- [ ] Click vào book → navigate to /books/{id}
```

**3. Categories:**
```bash
- [ ] Navbar: Đúng số lượng SupCategory và SubCategory
- [ ] Home: Hiển thị đúng title SupCategory
- [ ] Home: Đúng số lượng SubCategory trong mỗi SupCategory
- [ ] Dropdown hoạt động mượt mà
```

**4. Book Detail:**
```bash
- [ ] Hiển thị ĐẦY ĐỦ: title, description, price, author, category, 
      stockQuantity, publisher, publishedDate, image
- [ ] KHÔNG hiển thị: id, active
- [ ] Quantity selector hoạt động
- [ ] Button "Thêm vào giỏ" disabled khi hết hàng
- [ ] Layout giữ nguyên như design
```

### 🧪 Test Commands:

```bash
# 1. Kiểm tra backend
curl http://localhost:8080/bookverse/api/books/active

# 2. Kiểm tra categories
curl http://localhost:8080/bookverse/api/sup-categories/active

# 3. Kiểm tra book detail
curl http://localhost:8080/bookverse/api/books/1

# 4. Start frontend
npm run dev
```

### 🐛 Common Issues:

**Issue 1: Image không hiển thị**
```typescript
// Fix: Kiểm tra path
const imageSrc = book.image.startsWith('http') 
  ? book.image 
  : `/src/assets/img/book/${book.image}`;
```

**Issue 2: authorName/publisherName undefined**
```typescript
// Fix: Fetch riêng author/publisher hoặc dùng fallback
{author?.name || book.authorName || 'Đang cập nhật'}
```

**Issue 3: Categories không hiển thị**
```typescript
// Fix: Đảm bảo filter active categories
const activeSubs = subs.filter(sub => sub.active);
```

---

## 📦 Backend TODO (Cần thêm sau):

```java
// 1. Thêm field soldCount vào Book entity
private Integer soldCount = 0;

// 2. Thêm API endpoint top sellers
@GetMapping("/top-sellers")
public APIResponse<List<BookResponse>> getTopSellers(
    @RequestParam(defaultValue = "10") int limit
) {
    // Sort by soldCount DESC, limit
}

// 3. Update soldCount khi có order thành công
```

---

## 🎯 Summary

**Đã implement:**
- ✅ API Infrastructure (types, client, endpoints)
- ✅ Hero Slider với random books
- ✅ Books listing với active books
- ✅ Categories (SupCategory + SubCategory) đúng số lượng
- ✅ Book Detail với đầy đủ thông tin

**Giữ nguyên:**
- ✅ Layout, màu sắc, số lượng UI components
- ✅ Grid layout (5 columns cho books)
- ✅ Responsive design

**Next Steps:**
1. Xóa folder `src/data/` (mock data)
2. Test tất cả pages
3. Thêm loading states & error handling
4. Implement Cart functionality
5. Add search & filter features

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Backend có đang chạy? `http://localhost:8080/bookverse/api/books/active`
2. Frontend có import đúng? `import { booksApi } from '../../api'`
3. Types có đúng? `import type { Book } from '../../types'`

Good luck! 🚀
