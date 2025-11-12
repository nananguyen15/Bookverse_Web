package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.PublisherCreationRequest;
import com.swp391.bookverse.dto.request.PublisherUpdateRequest;
import com.swp391.bookverse.dto.response.PublisherResponse;
import com.swp391.bookverse.dto.response.PublisherActiveResponse;
import com.swp391.bookverse.entity.Publisher;
import com.swp391.bookverse.service.PublisherService;
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
@RequestMapping("/api/publishers")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class PublisherController {
    PublisherService publisherService;

    @PostMapping("/create")
    public APIResponse<Publisher> createPublisher(@RequestBody @Valid PublisherCreationRequest request) {
        APIResponse<Publisher> response = new APIResponse<>();
        response.setResult(publisherService.createPublisher(request));
        return response;
    }

    @GetMapping
    public APIResponse<List<PublisherResponse>> getPublishers(){
        APIResponse<List<PublisherResponse>> response = new APIResponse<>();
        response.setResult(publisherService.getPublishers());
        return response;
    }

    @GetMapping("/{PublisherId}")
    public PublisherResponse getPublisher(@PathVariable("PublisherId") String PublisherId) {
        return publisherService.getPublisherById(PublisherId);
    }

    @PutMapping("/update/{PublisherId}")
    public PublisherResponse updatePublisher(@PathVariable("PublisherId") Long publisherId, @RequestBody @Valid PublisherUpdateRequest request) {
        return publisherService.updatePublisher(publisherId, request);
    }

    @PutMapping("/active/{publisherId}")
    public PublisherActiveResponse restorePublisher(@PathVariable("publisherId") Long publisherId) {
        return publisherService.changeActivePublisherById(true, publisherId);
    }

    @PutMapping("/inactive/{publisherId}")
    public PublisherActiveResponse deactivatePublisher(@PathVariable("publisherId") Long publisherId) {
        return publisherService.changeActivePublisherById(false, publisherId);
    }

    @GetMapping("/active")
    public APIResponse<List<PublisherResponse>> getActivePublishers(){
        APIResponse<List<PublisherResponse>> response = new APIResponse<>();
        response.setResult(publisherService.getActivePublishers());
        return response;
    }

    @GetMapping("/inactive")
    public APIResponse<List<PublisherResponse>> getInactivePublishers() {
        APIResponse<List<PublisherResponse>> response = new APIResponse<>();
        response.setResult(publisherService.getInactivePublishers());
        return response;
    }
}
