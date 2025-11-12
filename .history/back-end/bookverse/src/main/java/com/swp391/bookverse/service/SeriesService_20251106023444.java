package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.response.SeriesResponse;
import com.swp391.bookverse.entity.Series;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.SeriesMapper;
import com.swp391.bookverse.repository.SeriesRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @Author huangdat
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeriesService {
    SeriesRepository seriesRepository;
    SeriesMapper seriesMapper;

    /**
     * Get all series from the database
     * @return List of SeriesResponse
     */
    public List<SeriesResponse> getAllSeries() {
        List<Series> series = seriesRepository.findAll();
        if (series.isEmpty()) {
            throw new AppException(ErrorCode.NO_SERIES_STORED);
        }
        return series.stream()
                .map(seriesMapper::toSeriesResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all active series
     * @return List of active SeriesResponse
     */
    public List<SeriesResponse> getActiveSeries() {
        List<Series> series = seriesRepository.findAll().stream()
                .filter(Series::getActive)
                .collect(Collectors.toList());
        
        if (series.isEmpty()) {
            throw new AppException(ErrorCode.NO_SERIES_STORED);
        }
        
        return series.stream()
                .map(seriesMapper::toSeriesResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get series by ID
     * @param seriesId the ID of the series
     * @return SeriesResponse
     */
    public SeriesResponse getSeriesById(Long seriesId) {
        Series series = seriesRepository.findById(seriesId)
                .orElseThrow(() -> new AppException(ErrorCode.SERIES_NOT_FOUND));
        return seriesMapper.toSeriesResponse(series);
    }

    /**
     * Get all inactive series
     * @return List of inactive SeriesResponse
     */
    public List<SeriesResponse> getInactiveSeries() {
        List<Series> series = seriesRepository.findAll().stream()
                .filter(s -> !s.getActive())
                .collect(Collectors.toList());
        
        if (series.isEmpty()) {
            throw new AppException(ErrorCode.NO_SERIES_STORED);
        }
        
        return series.stream()
                .map(seriesMapper::toSeriesResponse)
                .collect(Collectors.toList());
    }
}
