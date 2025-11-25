package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.BookCreationRequest;
import com.swp391.bookverse.dto.request.BookUpdateRequest;
import com.swp391.bookverse.dto.request.NotificationBroadCastCreationRequest;
import com.swp391.bookverse.dto.response.BookActiveResponse;
import com.swp391.bookverse.dto.response.BookResponse;
import com.swp391.bookverse.entity.*;
import com.swp391.bookverse.enums.NotificationType;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookService {
    AuthorRepository authorRepository;
    PublisherRepository publisherRepository;
    SubCategoryRepository subCategoryRepository;
    BookRepository bookRepository;
    OrderRepository orderRepository;
    SupCategoryRepository supCategoryRepository;
    NotificationService notificationService;

    /**
     * Create a new book based on the provided request.
     * @param request
     * @return APIResponse containing the created book
     */
    public APIResponse<Book> createBook(BookCreationRequest request) {
        if (bookRepository.existsByTitleIgnoreCase(request.getTitle())) {
            throw new AppException(ErrorCode.BOOK_EXISTS);
        }

        APIResponse<Book> response = new APIResponse<>();
        Book book = mapToBookEntity(request);

        bookRepository.save(book);
        response.setResult(book);
        return response;
    }

    /**
     * Create a new book with multipart image upload support
     */
    public APIResponse<Book> createBook(String title, String description, Double price, 
                                       Long authorId, Long publisherId, Long categoryId,
                                       Integer stockQuantity, String publishedDate,
                                       MultipartFile imageFile, String imageUrl, boolean active) {
        if (bookRepository.existsByTitleIgnoreCase(title)) {
            throw new AppException(ErrorCode.BOOK_EXISTS);
        }

        // Handle image upload
        String imagePath = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imagePath = handleImageUpload(imageFile, "book");
            System.out.println("✅ Created book with uploaded file: " + imagePath);
        } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            imagePath = imageUrl.trim();
            System.out.println("✅ Created book with image URL: " + imageUrl);
        }

        // Create book entity
        Book book = new Book();
        book.setTitle(title);
        book.setDescription(description);
        book.setPrice(price);
        book.setStockQuantity(stockQuantity);
        if (publishedDate != null && !publishedDate.trim().isEmpty()) {
            book.setPublishedDate(LocalDate.parse(publishedDate));
        }
        book.setImage(imagePath);
        book.setActive(active);

        // Set relationships
        if (authorId != null) {
            Author author = authorRepository.findById(authorId)
                    .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));
            book.setAuthor(author);
        }
        if (publisherId != null) {
            Publisher publisher = publisherRepository.findById(publisherId)
                    .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));
            book.setPublisher(publisher);
        }
        if (categoryId != null) {
            SubCategory subCategory = subCategoryRepository.findById(categoryId)
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            book.setCategory(subCategory);
        }

        bookRepository.save(book);
        
        APIResponse<Book> response = new APIResponse<>();
        response.setResult(book);

        // Send notification about new book for customers
        NotificationBroadCastCreationRequest notificationRequest = NotificationBroadCastCreationRequest.builder()
            .type(NotificationType.FOR_CUSTOMERS)
            .content("New book added: " + book.getTitle())
            .build();
        notificationService.createBroadcastNotification(notificationRequest);

        // Send notification about new book for staffs
        notificationRequest = NotificationBroadCastCreationRequest.builder()
            .type(NotificationType.FOR_STAFFS)
            .content("New book added: " + book.getTitle())
            .build();
        notificationService.createBroadcastNotification(notificationRequest);

        return response;
    }

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


    /**
     * Get all books stored in the system.
     * @return APIResponse containing a list of BookResponse objects
     */
    public APIResponse<List<BookResponse>> getBooks() {
        if (bookRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        List<Book> books = bookRepository.findAll();
        List<BookResponse> bookResponses = new ArrayList<>(books.size());
        for (Book book : books) {
            BookResponse bookResponse = mapToBookResponse(book);
            bookResponses.add(bookResponse);
        }

        response.setResult(bookResponses);
        return response;
    }

    /**
     * Get all books with active status true.
     * @return APIResponse containing a list of BookResponse objects
     */
    public APIResponse<List<BookResponse>> getActiveBooks() {
        if (bookRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        List<Book> books = bookRepository.findAll();
        List<BookResponse> bookResponses = new ArrayList<>();
        for (Book book : books) {
            if (book.getActive()) {
                BookResponse bookResponse = mapToBookResponse(book);
                bookResponses.add(bookResponse);
            }
        }

        // filtering: get only book that has sub-category active = true and sup-category active = true
        bookResponses = bookResponses.stream()
            .filter(bookResponse -> {
                Book book = bookRepository.findById(bookResponse.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
                SubCategory subCategory = book.getCategory();
                if (subCategory == null) {
                    return false; // Skip books without a category
                }
                SupCategory supCategory = subCategory.getSupCategory();
                if (supCategory == null) {
                    return false; // Skip books whose subcategory has no parent category
                }
                return subCategory.getActive() && supCategory.getActive();
            })
            .collect(Collectors.toList());

        response.setResult(bookResponses);
        return response;
    }

    /**
     * Get all books with active status false.
     * @return APIResponse containing a list of BookResponse objects
     */
    public APIResponse<List<BookResponse>> getInactiveBooks() {
        if (bookRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        List<Book> books = bookRepository.findAll();
        List<BookResponse> bookResponses = new ArrayList<>();
        for (Book book : books) {
            if (!book.getActive()) {
                BookResponse bookResponse = mapToBookResponse(book);
                bookResponses.add(bookResponse);
            }
        }

        response.setResult(bookResponses);
        return response;
    }

    /**
     * Get a book by its ID.
     * @param bookId
     * @return BookResponse containing the book details
     */
    public BookResponse getBookById(String bookId) {
        Book book = bookRepository.findById(Long.parseLong(bookId))
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        return mapToBookResponse(book);
    }

    /**
     * Update an existing book's details.
     * @param bookId
     * @param request
     * @return BookResponse containing the updated book details
     */
    public BookResponse updateBook(Long bookId, BookUpdateRequest request) {
        Book existingBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Update fields
        existingBook.setTitle(request.getTitle());
        existingBook.setDescription(request.getDescription());
        existingBook.setPrice(request.getPrice());
        existingBook.setStockQuantity(request.getStockQuantity());
        existingBook.setPublishedDate(request.getPublishedDate());
        existingBook.setImage(request.getImage());
        existingBook.setActive(request.getActive());

        // Save updated book
        Book updatedBook = bookRepository.save(existingBook);
        return mapToBookResponse(updatedBook);
    }

    /**
     * Update book with multipart image upload support
     */
    public BookResponse updateBook(Long bookId, String title, String description, Double price,
                                   Long authorId, Long publisherId, Long categoryId,
                                   Integer stockQuantity, String publishedDate,
                                   MultipartFile imageFile, String imageUrl) {
        Book existingBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Update fields (only if provided)
        if (title != null) existingBook.setTitle(title);
        if (description != null) existingBook.setDescription(description);
        if (price != null) existingBook.setPrice(price);
        if (stockQuantity != null) existingBook.setStockQuantity(stockQuantity);
        if (publishedDate != null) existingBook.setPublishedDate(LocalDate.parse(publishedDate));

        // Handle image update
        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = handleImageUpload(imageFile, "book");
            existingBook.setImage(imagePath);
            System.out.println("✅ Updated book with uploaded file: " + imagePath);
        } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            existingBook.setImage(imageUrl.trim());
            System.out.println("✅ Updated book with image URL: " + imageUrl);
        }

        // Update relationships
        if (authorId != null) {
            Author author = authorRepository.findById(authorId)
                    .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));
            existingBook.setAuthor(author);
        }
        if (publisherId != null) {
            Publisher publisher = publisherRepository.findById(publisherId)
                    .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));
            existingBook.setPublisher(publisher);
        }
        if (categoryId != null) {
            SubCategory subCategory = subCategoryRepository.findById(categoryId)
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            existingBook.setCategory(subCategory);
        }

        Book updatedBook = bookRepository.save(existingBook);

        // Send notification about book update for staffs
        NotificationBroadCastCreationRequest notificationRequest = NotificationBroadCastCreationRequest.builder()
            .type(NotificationType.FOR_STAFFS)
            .content("Book updated: " + existingBook.getTitle())
            .build();
        notificationService.createBroadcastNotification(notificationRequest);

        return mapToBookResponse(updatedBook);
    }


    /**
     * Change the active status of a book by its ID.
     * @param isActive new active status
     * @param bookId ID the book to be updated
     * @return APIResponse containing the updated BookActiveResponse
     */
    public APIResponse<BookActiveResponse> changeActiveBookById(Boolean isActive, Long bookId) {
        Book existingBook = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        existingBook.setActive(isActive);
        bookRepository.save(existingBook);

        APIResponse<BookActiveResponse> response = new APIResponse<>();
        response.setResult(mapToBookActiveResponse(existingBook));

        // Send notification about book status change for staffs
        String status = isActive ? "restored" : "deactivated";
        NotificationBroadCastCreationRequest notificationRequest = NotificationBroadCastCreationRequest.builder()
            .type(NotificationType.FOR_STAFFS)
            .content("Book " + status + ": " + existingBook.getTitle())
            .build();
        notificationService.createBroadcastNotification(notificationRequest);

        return response;
    }

    /**
     * Get a list of random active books.
     * @return APIResponse containing a list of BookResponse objects
     */
    public APIResponse<List<BookResponse>> getRandomActiveBooks() {
        // Filter active books
        List<Book> activeBooks = bookRepository.findAll().stream()
                .filter(Book::getActive)
                .toList();
        // Check if there are any active books
        if (activeBooks.isEmpty()) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }
        // Select up to 10 random active books
        else {
            APIResponse<List<BookResponse>> response = new APIResponse<>();
            List<BookResponse> bookResponses = new ArrayList<>();
            int count = Math.min(10, activeBooks.size());
            for (int i = 0; i < count; i++) {
                Book book = activeBooks.get((int) (Math.random() * activeBooks.size()));
                BookResponse bookResponse = mapToBookResponse(book);
                bookResponses.add(bookResponse);
            }
            response.setResult(bookResponses);
            return response;
        }
    }

    /**
     *  Get a list of active books sorted by newest published date.
     * @return APIResponse containing a list of BookResponse objects
     */
    public APIResponse<List<BookResponse>> getActiveBooksSortedByNewest() {
        // Create a MUTABLE list
        List<Book> activeBooks = new ArrayList<>(
            bookRepository.findAll().stream()
                .filter(Book::getActive)
                .toList()
        );

        if (activeBooks.isEmpty()) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        activeBooks.sort((b1, b2) -> b2.getPublishedDate().compareTo(b1.getPublishedDate()));

        // filtering: get only book that has sub-category active = true and sup-category active = true
            activeBooks = activeBooks.stream()
            .filter(book -> {
                SubCategory subCategory = book.getCategory();
                SupCategory supCategory = subCategory.getSupCategory();
                return subCategory.getActive() && supCategory.getActive();
            })
            .collect(Collectors.toList());

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        List<BookResponse> bookResponses = activeBooks.stream()
            .map(this::mapToBookResponse)
            .collect(Collectors.toList());

        response.setResult(bookResponses);
        return response;
    }

    public APIResponse<List<BookResponse>> getActiveBooksSortedByOldest() {
        List<BookResponse> bookResponses = bookRepository.findAll().stream()
            .filter(Book::getActive)
            .sorted(Comparator.comparing(Book::getPublishedDate))
            .map(this::mapToBookResponse)
            .collect(Collectors.toList());

        if (bookResponses.isEmpty()) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        // filtering: get only book that has sub-category active = true and sup-category active = true
        bookResponses = bookResponses.stream()
            .filter(bookResponse -> {
                Book book = bookRepository.findById(bookResponse.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
                SubCategory subCategory = book.getCategory();
                SupCategory supCategory = subCategory.getSupCategory();
                return subCategory.getActive() && supCategory.getActive();
            })
            .collect(Collectors.toList());

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        response.setResult(bookResponses);
        return response;
    }

    public APIResponse<List<BookResponse>> getActiveBooksSortedByPriceAsc() {
        List<BookResponse> bookResponses = bookRepository.findAll().stream()
            .filter(Book::getActive)
            .sorted(Comparator.comparing(Book::getPrice))
            .map(this::mapToBookResponse)
            .collect(Collectors.toList());

        if (bookResponses.isEmpty()) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        // filtering: get only book that has sub-category active = true and sup-category active = true
        bookResponses = bookResponses.stream()
            .filter(bookResponse -> {
                Book book = bookRepository.findById(bookResponse.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
                SubCategory subCategory = book.getCategory();
                SupCategory supCategory = subCategory.getSupCategory();
                return subCategory.getActive() && supCategory.getActive();
            })
            .collect(Collectors.toList());

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        response.setResult(bookResponses);
        return response;
    }

    public APIResponse<List<BookResponse>> getActiveBooksSortedByPriceDesc() {
        List<BookResponse> bookResponses = bookRepository.findAll().stream()
            .filter(Book::getActive)
            .sorted((b1, b2) -> b2.getPrice().compareTo(b1.getPrice()))
            .map(this::mapToBookResponse)
            .collect(Collectors.toList());

        if (bookResponses.isEmpty()) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        // filtering: get only book that has sub-category active = true and sup-category active = true
        bookResponses = bookResponses.stream()
            .filter(bookResponse -> {
                Book book = bookRepository.findById(bookResponse.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
                SubCategory subCategory = book.getCategory();
                SupCategory supCategory = subCategory.getSupCategory();
                return subCategory.getActive() && supCategory.getActive();
            })
            .collect(Collectors.toList());

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        response.setResult(bookResponses);
        return response;
    }

    public APIResponse<List<BookResponse>> getActiveBooksSortedByTitleAsc() {
        List<BookResponse> bookResponses = bookRepository.findAll().stream()
            .filter(Book::getActive)
            .sorted(Comparator.comparing(Book::getTitle))
            .map(this::mapToBookResponse)
            .collect(Collectors.toList());

        if (bookResponses.isEmpty()) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        // filtering: get only book that has sub-category active = true and sup-category active = true
        bookResponses = bookResponses.stream()
            .filter(bookResponse -> {
                Book book = bookRepository.findById(bookResponse.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
                SubCategory subCategory = book.getCategory();
                SupCategory supCategory = subCategory.getSupCategory();
                return subCategory.getActive() && supCategory.getActive();
            })
            .collect(Collectors.toList());

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        response.setResult(bookResponses);
        return response;
    }

    /**
     *  Map the Book entity to a BookActiveResponse.
     * @param book the book entity
     * @return the mapped BookActiveResponse
     */
    private BookActiveResponse mapToBookActiveResponse(Book book) {
        return BookActiveResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .active(book.getActive())
                .build();
    }

    /**
     * Map the BookCreationRequest to a Book entity.
     * @param request the book creation request
     * @return the mapped Book entity
     */
    private Book mapToBookEntity(BookCreationRequest request) {
        Author author = authorRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        Publisher publisher = publisherRepository.findById(request.getPublisherId())
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        SubCategory category = subCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        return Book.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .author(author)
                .publisher(publisher)
                .category(category)
                .stockQuantity(request.getStockQuantity())
                .publishedDate(request.getPublishedDate())
                .image(request.getImage())
                .active(request.getActive())
                .build();
    }

    /**
     * Map the Book entity to a BookResponse.
     * @param book the book entity
     * @return the mapped BookResponse
     */
    private BookResponse mapToBookResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .description(book.getDescription())
                .price(book.getPrice())
                .authorId(book.getAuthor() != null ? book.getAuthor().getId() : null)
                .publisherId(book.getPublisher() != null ? book.getPublisher().getId() : null)
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .stockQuantity(book.getStockQuantity())
                .publishedDate(book.getPublishedDate())
                .image(book.getImage())
                .active(book.getActive())
                .build();
    }


    public APIResponse<List<BookResponse>> searchActiveBooksByTitle(String title) {
        List<BookResponse> bookResponses = bookRepository.findAll().stream()
            .filter(book -> book.getActive() && book.getTitle().toLowerCase().contains(title.toLowerCase()))
            .map(this::mapToBookResponse)
            .collect(Collectors.toList());

        if (bookResponses.isEmpty()) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        response.setResult(bookResponses);
        return response;
    }

    /**
     * Get a list of top-selling active books.
     * @return
     */
    public APIResponse<List<BookResponse>> getTopSellingActiveBooks() {
        // Get a list of book IDs sorted by total sold quantity in descending order
        List<Long> topSellingBookIds = orderRepository.findTopSellingBookIds();

        // Fetch the corresponding Book entities and filter by active status
        List<BookResponse> topSellingBooks = topSellingBookIds.stream()
            .map(bookId -> bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND)))
            .filter(Book::getActive)
            .map(this::mapToBookResponse)
            .collect(Collectors.toList());

        if (topSellingBooks.isEmpty()) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        APIResponse<List<BookResponse>> response = new APIResponse<>();
        response.setResult(topSellingBooks);
        return response;
    }
}
