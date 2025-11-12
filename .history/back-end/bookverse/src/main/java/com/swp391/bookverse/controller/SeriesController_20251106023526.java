package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.response.SeriesResponse;
import com.swp391.bookverse.service.SeriesService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author huangdat
 */
@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SeriesController {
    SeriesService seriesService;

    @GetMapping
    public APIResponse<List<SeriesResponse>> getAllSeries() {
        APIResponse<List<SeriesResponse>> response = new APIResponse<>();
        response.setResult(seriesService.getAllSeries());
        return response;
    }

    @GetMapping("/{seriesId}")
    public APIResponse<SeriesResponse> getSeriesById(@PathVariable("seriesId") Long seriesId) {
        APIResponse<SeriesResponse> response = new APIResponse<>();
        response.setResult(seriesService.getSeriesById(seriesId));
        return response;
    }

    @GetMapping("/active")
    public APIResponse<List<SeriesResponse>> getActiveSeries() {
        APIResponse<List<SeriesResponse>> response = new APIResponse<>();
        response.setResult(seriesService.getActiveSeries());
        return response;
    }

    @GetMapping("/inactive")
    public APIResponse<List<SeriesResponse>> getInactiveSeries() {
        APIResponse<List<SeriesResponse>> response = new APIResponse<>();
        response.setResult(seriesService.getInactiveSeries());
        return response;
    }
}
