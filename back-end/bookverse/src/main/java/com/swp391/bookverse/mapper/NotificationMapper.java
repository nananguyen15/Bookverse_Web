package com.swp391.bookverse.mapper;

import com.swp391.bookverse.dto.response.NotificationResponse;
import com.swp391.bookverse.dto.response.NotificationResponseWithID;
import com.swp391.bookverse.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toNotificationResponse(Notification notification);
    NotificationResponseWithID toNotificationResponseWithID(Notification notification);
}
