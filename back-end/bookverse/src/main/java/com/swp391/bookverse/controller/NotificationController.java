package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.NotificationBroadCastCreationRequest;
import com.swp391.bookverse.dto.request.NotificationCreationRequest;
import com.swp391.bookverse.dto.request.NotificationUpdateRequest;
import com.swp391.bookverse.dto.response.NotificationResponse;
import com.swp391.bookverse.dto.response.UserResponse;
import com.swp391.bookverse.service.NotificationService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author: huangdat
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class NotificationController {

    NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public APIResponse<List<NotificationResponse>> getAllNotifications() {
        return APIResponse.<List<NotificationResponse>>builder()
                .code(200)
                .result(notificationService.getAllNotifications())
                .message("Fetched all notifications successfully")
                .build();
    }

    /**
     * Create a personal notification for a specific user.
     * Accessible only by ADMIN role.
     *
     * @param request the notification request containing user ID and content
     * @return APIResponse with success message
     */
    @PostMapping("/admin-create/personal")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public APIResponse<NotificationResponse> createPersonalNotification(@Valid @RequestBody NotificationCreationRequest request) {
        return APIResponse.<NotificationResponse>builder()
                .code(200)
                .result(notificationService.createPersonalNotification(request))
                .message("Personal notification created successfully")
                .build();
    }

    @PostMapping("/admin-create/broadcast")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public APIResponse<List<UserResponse>> createBroadcastNotification(@Valid @RequestBody NotificationBroadCastCreationRequest request) {
        return APIResponse.<List<UserResponse>>builder()
                .code(200)
                .result(notificationService.createBroadcastNotification(request))
                .message("Broadcast notification created for all " + request.getType())
                .build();
    }

    @GetMapping("/myNotifications")
    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN', 'SCOPE_STAFF', 'SCOPE_CUSTOMER')")
    public APIResponse<List<NotificationResponse>> getMyNotifications() {
        return APIResponse.<List<NotificationResponse>>builder()
                .code(200)
                .result(notificationService.getMyNotifications())
                .message("Fetched my notifications successfully")
                .build();
    }

    @GetMapping("/myNotifications/unread-count")
    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN', 'SCOPE_STAFF', 'SCOPE_CUSTOMER')")
    public APIResponse<Long> getUnreadCount() {
        return APIResponse.<Long>builder()
                .code(200)
                .result(notificationService.getUnreadCount())
                .message("Fetched unread notification count successfully")
                .build();
    }

    @GetMapping("/myNotifications/first-5")
    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN', 'SCOPE_STAFF', 'SCOPE_CUSTOMER')")
    public APIResponse<List<NotificationResponse>> getFirst5Notifications() {
        return APIResponse.<List<NotificationResponse>>builder()
                .code(200)
                .result(notificationService.getFirst5Notifications())
                .message("Fetched first 5 notifications successfully")
                .build();
    }

    @PutMapping("/myNotifications/mark-all-read")
    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN', 'SCOPE_STAFF', 'SCOPE_CUSTOMER')")
    public APIResponse<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return APIResponse.<Void>builder()
                .code(200)
                .message("All notifications marked as read")
                .build();
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN')")
    public APIResponse<NotificationResponse> updateNotification(@PathVariable Long id, @RequestBody NotificationUpdateRequest request) {
        return APIResponse.<NotificationResponse>builder()
                .code(200)
                .result(notificationService.updateNotification(id, request))
                .message("Notification updated successfully")
                .build();
    }

    @DeleteMapping("/myNotifications/delete/{id}")
    @PreAuthorize("hasAnyAuthority('SCOPE_CUSTOMER', 'SCOPE_STAFF', 'SCOPE_ADMIN')")
    public APIResponse<Void> deleteMyNotification(@PathVariable Long id) {
        notificationService.deleteMyNotification(id);
        return APIResponse.<Void>builder()
                .code(200)
                .message("Notification deleted successfully")
                .build();
    }

    @DeleteMapping("/admin-delete/{id}")
    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN')")
    public APIResponse<Void> adminDeleteNotification(@PathVariable Long id) {
        notificationService.adminDeleteNotification(id);
        return APIResponse.<Void>builder()
                .code(200)
                .message("Notification deleted successfully by admin")
                .build();
    }

}
