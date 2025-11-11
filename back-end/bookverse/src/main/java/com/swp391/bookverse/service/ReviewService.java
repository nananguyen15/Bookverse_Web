package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.ReviewCreationRequest;
import com.swp391.bookverse.dto.request.ReviewDeletionRequest;
import com.swp391.bookverse.dto.request.ReviewUpdateRequest;
import com.swp391.bookverse.dto.response.ReviewOfBookResponse;
import com.swp391.bookverse.dto.response.ReviewResponse;
import com.swp391.bookverse.entity.Book;
import com.swp391.bookverse.entity.Review;
import com.swp391.bookverse.entity.User;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.ReviewMapper;
import com.swp391.bookverse.repository.BookRepository;
import com.swp391.bookverse.repository.ReviewRepository;
import com.swp391.bookverse.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @Author huangdat
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {
    ReviewMapper reviewMapper;
    ReviewRepository reviewRepository;
    BookRepository bookRepository;
    UserRepository userRepository;

    /**
     * Create a new review of current user for a specific book.
     * @param request
     * @return ReviewResponse
     */
    @PreAuthorize("hasAuthority('SCOPE_CUSTOMER')")
    public ReviewResponse createReview(ReviewCreationRequest request) {
        // Get current authenticated user
        User user = userRepository.findByUsername(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the book by ID (use bookId from path parameter, not request body)
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // check if the user has already reviewed this book
        if (reviewRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // Create review entity
        Review review = Review.builder()
                .userId(user.getId())
                .bookId(request.getBookId())
                .comment(request.getComment())
                .build();

        // Save the review
        Review savedReview = reviewRepository.save(review);

        // Map and return response
        return reviewMapper.toReviewResponse(savedReview);
    }

    /**
     * Get all reviews for a specific book by book ID.
     * @param bookId
     * @return List of ReviewResponse
     */
    public List<ReviewResponse> getReviewsByBookId(Long bookId) {
        // Verify the book exists
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        // Retrieve reviews for the book
        List<Review> reviews = reviewRepository.findByBookId(bookId);

        // Map and return responses
        return reviewMapper.toReviewResponseList(reviews);
    }

    /**
     * Get all reviews in the system.
     * @return List of ReviewOfBookResponse
     */
    public List<ReviewOfBookResponse> getAllReviews() {
        List<Book> books = bookRepository.findAll();
        return books.stream().map(book -> {
            List<Review> reviews = reviewRepository.findByBookId(book.getId());
            List<ReviewResponse> reviewResponses = reviewMapper.toReviewResponseList(reviews);
            return ReviewOfBookResponse.builder()
                    .bookId(book.getId())
                    .bookTitle(book.getTitle())
                    .reviews(reviewResponses)
                    .build();
        }).toList();
    }

    public Boolean deleteReview(Long bookId) {
        // Get current authenticated user
        User user = userRepository.findByUsername(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the review by user ID and book ID
        Review review = reviewRepository.findByUserId(user.getId()).stream()
                .filter(r -> r.getBookId().equals(bookId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Delete the review
        reviewRepository.delete(review);
        return true;
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public Boolean deleteReviewByAdminStaff(ReviewDeletionRequest request, Long bookId) {
        // Find the review by user ID and book ID
        Review review = reviewRepository.findByUserId(request.getUserId()).stream()
                .filter(r -> r.getBookId().equals(bookId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Delete the review
        reviewRepository.delete(review);
        return true;
    }

    /**
     * Update an existing review of current user for a specific book.
     * @param request
     * @return ReviewResponse
     */
    public ReviewResponse updateReview(ReviewUpdateRequest request) {
        // Get current authenticated user
        User user = userRepository.findByUsername(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the review by user ID and book ID
        Review review = reviewRepository.findByUserId(user.getId()).stream()
                .filter(r -> r.getBookId().equals(request.getBookId()))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Update the review comment
        review.setComment(request.getComment());

        // Save the updated review
        Review updatedReview = reviewRepository.save(review);

        // Map and return response
        return reviewMapper.toReviewResponse(updatedReview);
    }
}
