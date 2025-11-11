package com.swp391.bookverse.controller;


import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.ReviewCreationRequest;
import com.swp391.bookverse.dto.request.ReviewDeletionRequest;
import com.swp391.bookverse.dto.request.ReviewUpdateRequest;
import com.swp391.bookverse.dto.response.ReviewOfBookResponse;
import com.swp391.bookverse.dto.response.ReviewResponse;
import com.swp391.bookverse.entity.Book;
import com.swp391.bookverse.entity.Review;
import com.swp391.bookverse.service.ReviewService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author huangdat
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ReviewController {
    ReviewService reviewService;

    @PostMapping("/create")
    public APIResponse<ReviewResponse> createReview(@RequestBody ReviewCreationRequest request) {
        APIResponse<ReviewResponse> response;
        response = new APIResponse<>();
        response.setResult(reviewService.createReview(request));
        return response;
    }

    @PutMapping("/update")
    public APIResponse<ReviewResponse> updateReview(@RequestBody ReviewUpdateRequest request) {
        APIResponse<ReviewResponse> response = new APIResponse<>();
        response.setResult(reviewService.updateReview(request));
        return response;
    }

    @GetMapping
    public APIResponse<List<ReviewOfBookResponse>> getAllReviews() {
        APIResponse<List<ReviewOfBookResponse>> response = new APIResponse<>();
        response.setResult(reviewService.getAllReviews());
        return response;
    }

    @GetMapping("/{bookId}")
    public APIResponse<List<ReviewResponse>> getReviewByBookId(@PathVariable Long bookId) {
        APIResponse<List<ReviewResponse>> response = new APIResponse<>();
        response.setResult(reviewService.getReviewsByBookId(bookId));
        return response;
    }

    @DeleteMapping("/myReview/{bookId}")
    public APIResponse<Boolean> deleteReview(@PathVariable Long bookId) {
        APIResponse<Boolean> response = new APIResponse<>();
        response.setResult(reviewService.deleteReview(bookId));
        return response;
    }

    @DeleteMapping("/deleteByAdminStaff/{bookId}")
    public APIResponse<Boolean> deleteReviewByAdminStaff(@RequestBody ReviewDeletionRequest request, @PathVariable Long bookId) {
        APIResponse<Boolean> response = new APIResponse<>();
        response.setResult(reviewService.deleteReviewByAdminStaff(request, bookId));
        return response;
    }



}
