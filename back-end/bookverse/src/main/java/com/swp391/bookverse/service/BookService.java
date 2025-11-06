package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.BookCreationRequest;
import com.swp391.bookverse.dto.request.BookUpdateRequest;
import com.swp391.bookverse.dto.response.BookActiveResponse;
import com.swp391.bookverse.dto.response.BookResponse;
import com.swp391.bookverse.entity.Author;
import com.swp391.bookverse.entity.Book;
import com.swp391.bookverse.entity.Publisher;
import com.swp391.bookverse.entity.SubCategory;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.repository.AuthorRepository;
import com.swp391.bookverse.repository.BookRepository;
import com.swp391.bookverse.repository.PublisherRepository;
import com.swp391.bookverse.repository.SubCategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

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
                .authorId(book.getAuthor().getId())
                .publisherId(book.getPublisher().getId())
                .categoryId(book.getCategory().getId())
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
}
