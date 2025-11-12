# Search Query Normalization

## Cách hoạt động

Tìm kiếm giờ đã được cải thiện để tự động chuẩn hóa query:

### Các trường hợp được hỗ trợ:

1. **Loại bỏ dấu chấm:**
   - `j.k.` → `jk`
   - `J.K. Rowling` → `jk rowling`
   - `Dr.` → `dr`

2. **Loại bỏ khoảng trắng thừa:**
   - `j  k   rowling` → `j k rowling`
   - `  harry  potter  ` → `harry potter`

3. **Chuyển về chữ thường:**
   - `HARRY POTTER` → `harry potter`
   - `HaRrY` → `harry`

## Ví dụ tìm kiếm:

| Query người dùng nhập | Query chuẩn hóa | Có thể tìm thấy |
|---------------------|----------------|-----------------|
| `j.k.` | `jk` | J.K. Rowling |
| `jk` | `jk` | J.K. Rowling |
| `j k` | `j k` | J.K. Rowling |
| `J.K. Rowling` | `jk rowling` | J.K. Rowling |
| `dr. seuss` | `dr seuss` | Dr. Seuss |
| `HP` | `hp` | Harry Potter books |

## Nơi áp dụng:

- ✅ SearchSuggest component (gợi ý tìm kiếm)
- ✅ AllProducts page (trang kết quả tìm kiếm)
- ✅ Cache được chuẩn hóa để tối ưu hiệu suất

## Lợi ích:

- Người dùng không cần lo về dấu chấm, khoảng trắng
- Tìm kiếm linh hoạt hơn
- Trải nghiệm người dùng tốt hơn
