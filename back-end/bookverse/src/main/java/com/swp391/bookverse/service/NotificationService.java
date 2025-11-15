package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.request.NotificationBroadCastCreationRequest;
import com.swp391.bookverse.dto.request.NotificationCreationRequest;
import com.swp391.bookverse.dto.response.NotificationResponse;
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

    // Public service methods for system notifications

//    @Transactional
//    public void notifyBookAdded(Long bookId, String bookTitle) {
//        List<User> customers = userRepository.findAllByRolesContaining(Role.CUSTOMER);
//        String content = String.format("New book available: %s", bookTitle);
//
//        customers.forEach(user -> createNotification(
//                user.getId(),
//                content,
//                NotificationType.FOR_CUSTOMERS
//        ));
//
//        log.info("Notified {} customers about new book: {}", customers.size(), bookTitle);
//    }

//    @Transactional
//    public void notifyCartUpdatedDueToStockChange(String userId, String bookTitle) {
//        String content = String.format(
//                "Your cart has been updated. '%s' was removed due to insufficient stock.",
//                bookTitle
//        );
//        createNotification(userId, content, NotificationType.FOR_CUSTOMERS_PERSONAL);
//        log.info("Notified user {} about cart update for book: {}", userId, bookTitle);
//    }

//    @Transactional
//    public void notifyOrderStatusChange(String userId, Long orderId, String status) {
//        String content = String.format("Your order #%d status has been updated to: %s", orderId, status);
//        createNotification(userId, content, NotificationType.FOR_CUSTOMERS_PERSONAL);
//        log.info("Notified user {} about order {} status change to {}", userId, orderId, status);
//    }

//    @Transactional
//    public void notifyLowStock(Long bookId, String bookTitle, int stockQuantity) {
//        List<User> staffAndAdmins = userRepository.findAllByRolesContainingAny(
//                List.of(Role.ADMIN, Role.STAFF)
//        );
//        String content = String.format(
//                "Low stock alert: '%s' only has %d units remaining",
//                bookTitle,
//                stockQuantity
//        );
//
//        staffAndAdmins.forEach(user -> {
//            NotificationType type = user.getRoles().contains(Role.ADMIN)
//                    ? NotificationType.FOR_ADMINS
//                    : NotificationType.FOR_STAFFS;
//            createNotification(user.getId(), content, type);
//        });
//
//        log.info("Notified {} staff/admins about low stock for: {}", staffAndAdmins.size(), bookTitle);
//    }

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

    private List<User> getUsersByNotificationType(NotificationType type) {
        return switch (type) {
            case FOR_CUSTOMERS -> userRepository.findAllByRolesContaining(Role.CUSTOMER);
            case FOR_STAFFS -> userRepository.findAllByRolesContaining(Role.STAFF);
            case FOR_ADMINS -> userRepository.findAllByRolesContaining(Role.ADMIN);
            default -> throw new AppException(ErrorCode.INVALID_REQUEST);
        };
    }

    private String getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND))
                .getId();
    }


}
