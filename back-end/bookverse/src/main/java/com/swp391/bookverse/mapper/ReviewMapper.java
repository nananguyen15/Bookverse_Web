package com.swp391.bookverse.mapper;

import com.swp391.bookverse.dto.request.ReviewCreationRequest;
import com.swp391.bookverse.dto.request.ReviewUpdateRequest;
import com.swp391.bookverse.dto.response.ReviewResponse;
import com.swp391.bookverse.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    Review toReview(ReviewCreationRequest request);
    ReviewResponse toReviewResponse(Review review);
    void updateReview(@MappingTarget Review review, ReviewUpdateRequest request);

    List<ReviewResponse> toReviewResponseList(List<Review> reviews);
}
