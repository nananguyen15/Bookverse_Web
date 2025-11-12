package com.swp391.bookverse.mapper;

import com.swp391.bookverse.dto.response.SeriesResponse;
import com.swp391.bookverse.entity.Series;
import org.mapstruct.Mapper;

/**
 * @Author huangdat
 */
@Mapper(componentModel = "spring")
public interface SeriesMapper {
    SeriesResponse toSeriesResponse(Series series);
}
