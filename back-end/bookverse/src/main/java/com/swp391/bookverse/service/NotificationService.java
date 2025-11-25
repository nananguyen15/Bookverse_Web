package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.request.NotificationBroadCastCreationRequest;
import com.swp391.bookverse.dto.request.NotificationCreationRequest;
import com.swp391.bookverse.dto.request.NotificationUpdateRequest;
import com.swp391.bookverse.dto.response.NotificationResponse;
import com.swp391.bookverse.dto.response.NotificationResponseWithID;
import com.swp391.bookverse.dto.response.UserResponse;
import com.swp391.bookverse.entity.Notification;
import com.swp391.bookverse.entity.User;
import com.swp391.bookverse.enums.NotificationType;
import com.swp391.bookverse.enums.Role;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.NotificationMapper;
import com.swp391.bookverse.mapper.UserMapper;
import com.swp391.bookverse.repository.NotificationRepository;
import com.swp391.bookverse.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
public class NotificationService {

    NotificationRepository notificationRepository;
    UserRepository userRepository;
    NotificationMapper notificationMapper;
    UserMapper userMapper;

    // Admin APIs

    /**
     * Create a broadcast notification for all users of a specific role.
     * Accessible only by ADMIN role.
     * @param request
     * @return list of users who received the notification
     */
    @Transactional
    public List<UserResponse> createBroadcastNotification(NotificationBroadCastCreationRequest request) {
        Role targetRole;
        switch (request.getType()) {
            case FOR_CUSTOMERS -> {
                targetRole = Role.CUSTOMER;
            }
            case FOR_STAFFS -> {
                targetRole = Role.STAFF;
            }
            case FOR_ADMINS -> {
                targetRole = Role.ADMIN;
            }
            default -> throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        List<User> targetUsers = userRepository.findAllByRolesContaining(targetRole);

        List<NotificationCreationRequest> notifications = targetUsers.stream()
                .map(user -> NotificationCreationRequest.builder()
                        .targetUserId(user.getId())
                        .content(request.getContent())
                        .type(request.getType())
                        .build())
                .toList();

        notifications.forEach(this::createNotification);

        return targetUsers.stream()
                .map(userMapper::toUserResponse)
                .toList();

    }

    @Transactional
    public NotificationResponse createPersonalNotification(NotificationCreationRequest request) {
//        if (request.getTargetUserId() == null) {
//            throw new AppException(ErrorCode.INVALID_REQUEST);
//        }

        // find the user to make sure it exist
        User targetUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        createNotification(request);

        NotificationResponse response = NotificationResponse.builder()
                .content(request.getContent())
                .type(request.getType())
                .read(false)
                .build();

        return response;
    }

    // User

    public List<NotificationResponse> getMyNotifications() {
        String userId = getCurrentUserId();
        List<Notification> notifications = notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        return notifications.stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
    }

    public long getUnreadCount() {
        String userId = getCurrentUserId();
        return notificationRepository.countUnreadByUserId(userId);
    }

    public List<NotificationResponse> getFirst5Notifications() {
        String userId = getCurrentUserId();
        Pageable firstFive = Pageable.ofSize(5);
        Page<Notification> notificationsPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, firstFive);
        return notificationsPage.stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        String userId = getCurrentUserId();
        notificationRepository.markAsReadByIdAndUserId(notificationId, userId);
    }

    @Transactional
    public void markAllAsRead() {
        String userId = getCurrentUserId();
        notificationRepository.markAllAsReadByUserId(userId);
    }

    // Helper methods

    private void createNotification(NotificationCreationRequest request) {
        User user = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Notification notification = Notification.builder()
                .user(user)
                .content(request.getContent())
                .type(request.getType())
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    private String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND))
                .getId();
    }


    public NotificationResponse updateNotification(Long id, NotificationUpdateRequest request) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        notification.setContent(request.getContent());
        notification.setType(request.getType());

        Notification updatedNotification = notificationRepository.save(notification);

        return notificationMapper.toNotificationResponse(updatedNotification);
    }

    public void deleteMyNotification(Long id) {
        String userId = getCurrentUserId();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // Ensure the notification belongs to the current user
        if (!notification.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        notificationRepository.delete(notification);
    }

    public void adminDeleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        notificationRepository.delete(notification);
    }

    public List<NotificationResponseWithID> getAllNotifications() {
        List<Notification> notifications = notificationRepository.findAll();
        List<NotificationResponse> notificationResponses = notifications.stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
        // Map to NotificationResponseWithID including userId
        List<NotificationResponseWithID> responseWithIDs = notifications.stream()
                .map(notification -> {
                    NotificationResponseWithID responseWithID = new NotificationResponseWithID();
                    responseWithID.setId(notification.getId());
                    responseWithID.setContent(notification.getContent());
                    responseWithID.setType(notification.getType());
                    responseWithID.setRead(notification.isRead());
                    responseWithID.setCreatedAt(notification.getCreatedAt());
                    responseWithID.setUserId(notification.getUser().getId());
                    return responseWithID;
                })
                .toList();
        return responseWithIDs;

    }

    public void markOneAsRead(Long id) {
        String userId = getCurrentUserId();
        notificationRepository.markAsReadByIdAndUserId(id, userId);
    }

    /**
     * Get notifications by type.
     * FOR_STAFFS, FOR_ADMINS, FOR_CUSTOMERS, FOR_STAFFS_PERSONAL, FOR_ADMINS_PERSONAL, FOR_CUSTOMERS_PERSONAL
     * @param type
     * @return list of notifications of the specified type
     */
    public List<NotificationResponseWithID> getNotificationsByType(String type) {
        NotificationType notificationType;
        try {
            notificationType = NotificationType.valueOf(type);
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        List<Notification> notifications = notificationRepository.findAllByType(notificationType);

        List<NotificationResponseWithID> responseWithIDs = notifications.stream()
                .map(notification -> {
                    NotificationResponseWithID responseWithID = new NotificationResponseWithID();
                    responseWithID.setId(notification.getId());
                    responseWithID.setContent(notification.getContent());
                    responseWithID.setType(notification.getType());
                    responseWithID.setRead(notification.isRead());
                    responseWithID.setCreatedAt(notification.getCreatedAt());
                    responseWithID.setUserId(notification.getUser().getId());
                    return responseWithID;
                })
                .toList();
        return responseWithIDs;
    }
}
