package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.BookCreationRequest;
import com.swp391.bookverse.dto.request.BookUpdateRequest;
import com.swp391.bookverse.dto.response.BookActiveResponse;
import com.swp391.bookverse.dto.response.BookResponse;
import com.swp391.bookverse.entity.Book;
import com.swp391.bookverse.service.BookService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * @Author huangdat
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class BookController {
    BookService bookService;

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public APIResponse<Book> createBook(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "authorId", required = false) Long authorId,
            @RequestParam(value = "publisherId", required = false) Long publisherId,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "stockQuantity", required = false) Integer stockQuantity,
            @RequestParam(value = "publishedDate", required = false) String publishedDate,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "active", defaultValue = "true") boolean active) {
        
        System.out.println("📥 Create book request received");
        System.out.println("   Title: " + title);
        System.out.println("   Image file: " + (imageFile != null ? imageFile.getOriginalFilename() : "null"));
        System.out.println("   Image URL: " + imageUrl);
        
        APIResponse<Book> response;
        response = bookService.createBook(title, description, price, authorId, publisherId, 
                                         categoryId, stockQuantity, publishedDate, imageFile, imageUrl, active);
        return response;
    }

    @GetMapping
    public APIResponse<List<BookResponse>> getBooks(){
        APIResponse<List<BookResponse>> response;
        response = bookService.getBooks();
        return response;
    }

    @GetMapping("/active/sort-by-newest")
    public APIResponse<List<BookResponse>> getActiveBooksSortedByNewest() {
        APIResponse<List<BookResponse>> response;
        response = bookService.getActiveBooksSortedByNewest();
        return response;
    }

    @GetMapping("/active/sort-by-oldest")
    public APIResponse<List<BookResponse>> getActiveBooksSortedByOldest() {
        APIResponse<List<BookResponse>> response;
        response = bookService.getActiveBooksSortedByOldest();
        return response;
    }

    @GetMapping("/active/sort-by-price-asc")
    public APIResponse<List<BookResponse>> getActiveBooksSortedByPriceAsc() {
        APIResponse<List<BookResponse>> response;
        response = bookService.getActiveBooksSortedByPriceAsc();
        return response;
    }

    @GetMapping("/active/sort-by-price-desc")
    public APIResponse<List<BookResponse>> getActiveBooksSortedByPriceDesc() {
        APIResponse<List<BookResponse>> response;
        response = bookService.getActiveBooksSortedByPriceDesc();
        return response;
    }

    @GetMapping("/active/sort-by-title")
    public APIResponse<List<BookResponse>> getActiveBooksSortedByTitleAsc() {
        APIResponse<List<BookResponse>> response;
        response = bookService.getActiveBooksSortedByTitleAsc();
        return response;
    }

    @GetMapping("/{bookId}")
    public BookResponse getBook(@PathVariable("bookId") String bookId) {
        return bookService.getBookById(bookId);
    }

    @GetMapping("/active")
    public APIResponse<List<BookResponse>> getActiveBooks(){
        APIResponse<List<BookResponse>> response;
        response = bookService.getActiveBooks();
        return response;
    }

    @GetMapping("/inactive")
    public APIResponse<List<BookResponse>> getInactiveBooks() {
        APIResponse<List<BookResponse>> response;
        response = bookService.getInactiveBooks();
        return response;
    }

    @PutMapping(value = "/update/{bookId}", consumes = {"multipart/form-data"})
    public BookResponse updateBook(
            @PathVariable("bookId") Long bookId,
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
        
        System.out.println("📥 Update book request received for ID: " + bookId);
        System.out.println("   Title: " + title);
        System.out.println("   Image file: " + (imageFile != null ? imageFile.getOriginalFilename() : "null"));
        System.out.println("   Image URL: " + imageUrl);
        
        return bookService.updateBook(bookId, title, description, price, authorId, publisherId,
                                     categoryId, stockQuantity, publishedDate, imageFile, imageUrl);
    }

    @PutMapping("/active/{bookId}")
    public APIResponse<BookActiveResponse> restoreBook(@PathVariable("bookId") Long bookId) {
        return bookService.changeActiveBookById(true, bookId);
    }

    @PutMapping("/inactive/{bookId}")
    public APIResponse<BookActiveResponse> deleteBook(@PathVariable("bookId") Long bookId) {
        return bookService.changeActiveBookById(false, bookId);
    }

    @GetMapping("/active/random")
    public APIResponse<List<BookResponse>> getRandomActiveBooks() {
        APIResponse<List<BookResponse>> response;
        response = bookService.getRandomActiveBooks();
        return response;
    }

    @GetMapping("/active/search/{title}")
    public APIResponse<List<BookResponse>> searchActiveBooksByTitle(@PathVariable("title") String title) {
        APIResponse<List<BookResponse>> response;
        response = bookService.searchActiveBooksByTitle(title);
        return response;
    }

//    @GetMapping("/active/top-selling")
//    public APIResponse<List<BookResponse>> getTopSellingActiveBooks() {
//        APIResponse<List<BookResponse>> response;
//        response = bookService.getTopSellingActiveBooks();
//        return response;
//    }

}