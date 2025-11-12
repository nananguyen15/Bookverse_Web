package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.AuthorCreationRequest;
import com.swp391.bookverse.dto.request.AuthorUpdateRequest;
import com.swp391.bookverse.dto.response.AuthorResponse;
import com.swp391.bookverse.dto.response.BookResponse;
import com.swp391.bookverse.dto.response.AuthorActiveResponse;
import com.swp391.bookverse.entity.Author;
import com.swp391.bookverse.service.AuthorService;
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
@RequestMapping("/api/authors")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AuthorController {
    AuthorService authorService;

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public APIResponse<Author> createAuthor(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "active", defaultValue = "true") boolean active) {
        
        System.out.println("📥 Create author request received");
        System.out.println("   Name: " + name);
        System.out.println("   Image file: " + (imageFile != null ? imageFile.getOriginalFilename() : "null"));
        System.out.println("   Image URL: " + imageUrl);
        
        APIResponse<Author> response = new APIResponse<>();
        response.setResult(authorService.createAuthor(name, bio, imageFile, imageUrl, active));
        return response;
    }

    @GetMapping
    public APIResponse<List<AuthorResponse>> getAuthors(){
        APIResponse<List<AuthorResponse>> response = new APIResponse<>();
        response.setResult(authorService.getAuthors());
        return response;
    }

    @GetMapping("/search/{keyword}")
    public APIResponse<List<AuthorResponse>> searchAuthors(@PathVariable("keyword") String keyword) {
        APIResponse<List<AuthorResponse>> response = new APIResponse<>();
        response.setResult(authorService.searchAuthors(keyword));
        return response;
    }

    @GetMapping("/{authorId}/books")
    public APIResponse<List<BookResponse>> getBooksByAuthorId(@PathVariable("authorId") String authorId) {
        APIResponse<List<BookResponse>> response = new APIResponse<>();
        response.setResult(authorService.getBooksByAuthorId(authorId));
        return response;
    }

    @GetMapping("/{authorId}")
    public AuthorResponse getAuthor(@PathVariable("authorId") String authorId) {
        return authorService.getAuthorById(authorId);
    }

    @PutMapping(value = "/update/{authorId}", consumes = {"multipart/form-data"})
    public AuthorResponse updateAuthor(
            @PathVariable("authorId") Long authorId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "active", required = false) Boolean active) {
        
        System.out.println("📥 Update author request received for ID: " + authorId);
        System.out.println("   Name: " + name);
        System.out.println("   Image file: " + (imageFile != null ? imageFile.getOriginalFilename() : "null"));
        System.out.println("   Image URL: " + imageUrl);
        
        return authorService.updateAuthor(authorId, name, bio, imageFile, imageUrl, active);
    }

    @PutMapping("/active/{authorId}")
    public AuthorActiveResponse restoreAuthor(@PathVariable("authorId") Long authorId) {
        return authorService.changeActiveAuthorById(true, authorId);
    }

    @PutMapping("/inactive/{authorId}")
    public AuthorActiveResponse deactivateAuthor(@PathVariable("authorId") Long authorId) {
        return authorService.changeActiveAuthorById(false, authorId);
    }

    @GetMapping("/active")
    public APIResponse<List<AuthorResponse>> getActiveAuthors(){
        APIResponse<List<AuthorResponse>> response = new APIResponse<>();
        response.setResult(authorService.getActiveAuthors());
        return response;
    }

    @GetMapping("/inactive")
    public APIResponse<List<AuthorResponse>> getInactiveAuthors() {
        APIResponse<List<AuthorResponse>> response = new APIResponse<>();
        response.setResult(authorService.getInactiveAuthors());
        return response;
    }

}
