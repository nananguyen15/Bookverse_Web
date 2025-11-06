package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.AuthorCreationRequest;
import com.swp391.bookverse.dto.request.AuthorUpdateRequest;
import com.swp391.bookverse.dto.response.AuthorResponse;
import com.swp391.bookverse.dto.response.BookResponse;
import com.swp391.bookverse.entity.Author;
import com.swp391.bookverse.service.AuthorService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/create")
    public APIResponse<Author> createAuthor(@RequestBody @Valid AuthorCreationRequest request) {
        APIResponse<Author> response = new APIResponse<>();
        response.setResult(authorService.createAuthor(request));
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

    @PutMapping("/update/{authorId}")
    public AuthorResponse updateAuthor(@PathVariable("authorId") Long authorId, @RequestBody @Valid AuthorUpdateRequest request) {
        return authorService.updateAuthor(authorId, request);
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
