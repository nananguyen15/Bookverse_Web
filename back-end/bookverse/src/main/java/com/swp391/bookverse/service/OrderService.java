package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.request.NotificationBroadCastCreationRequest;
import com.swp391.bookverse.dto.request.NotificationCreationRequest;
import com.swp391.bookverse.dto.request.OrderCreationRequest;
import com.swp391.bookverse.dto.request.OrderUpdateRequest;
import com.swp391.bookverse.dto.response.OrderResponse;
import com.swp391.bookverse.entity.*;
import com.swp391.bookverse.enums.NotificationType;
import com.swp391.bookverse.enums.OrderStatus;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.OrderMapper;
import com.swp391.bookverse.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class OrderService {

    OrderRepository orderRepository;
    UserRepository userRepository;
    BookRepository bookRepository;
    CartRepository cartRepository;
    OrderMapper orderMapper;
    NotificationService notificationService;

    /**
     * Create order from current user's cart
     * When order is created, the cart and its items are cleared (just like that)
     * Also reduce stock quantity of ordered books.
     * If other users have the same books in their carts, check and update their carts accordingly.
     *
     * @param request
     * @return OrderResponse
     */
    @Transactional
    public OrderResponse createOrder(OrderCreationRequest request) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Find active cart
        Cart cart = cartRepository.findByUserIdAndActive(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        // Check if cart is empty
        if (cart.getCartItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        // Create order
        Order order = Order.builder()
                .user(user)
                .address(request.getAddress())
                .status(OrderStatus.PENDING)
                .active(true)
                .build();

        double totalAmount = 0.0;
        List<Long> affectedBookIds = new ArrayList<>();

        // Transfer cart items to order items
        for (CartItem cartItem : cart.getCartItems()) {
            Book book = cartItem.getBook();

            // Verify stock availability
            if (book.getStockQuantity() < cartItem.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }

            // Create order item
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .book(book)
                    .quantity(cartItem.getQuantity())
                    .price(book.getPrice())
                    .build();

            order.getOrderItems().add(orderItem);
            totalAmount += book.getPrice() * cartItem.getQuantity();

            // Reduce stock quantity
            book.setStockQuantity(book.getStockQuantity() - cartItem.getQuantity());
            affectedBookIds.add(book.getId());
        }

        order.setTotalAmount(totalAmount);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear current user's cart
        cart.getCartItems().clear();
        cartRepository.save(cart);

        // Update other users' carts with affected books
        updateOtherUsersCarts(affectedBookIds, user.getId());

        // send notification to all staffs about new order
        NotificationBroadCastCreationRequest notificationRequest = NotificationBroadCastCreationRequest.builder()
                .type(NotificationType.FOR_STAFFS)
                .content("New order placed by " + user.getUsername() + ". Order ID: " + savedOrder.getId())
                .build();
        notificationService.createBroadcastNotification(notificationRequest);

        return orderMapper.toOrderResponse(savedOrder);
    }

    /**
     * Update or remove items from other users' carts if stock is insufficient
     */
    void updateOtherUsersCarts(List<Long> bookIds, String currentUserId) {
        // Find all active carts except current user
        List<Cart> otherCarts = cartRepository.findAllActiveCartsExcludingUser(currentUserId);

        for (Cart cart : otherCarts) {
            boolean cartModified = false;

            for (CartItem item : new ArrayList<>(cart.getCartItems())) {
                if (bookIds.contains(item.getBook().getId())) {
                    Book book = item.getBook();

                    // If requested quantity exceeds available stock
                    if (item.getQuantity() > book.getStockQuantity()) {
                        if (book.getStockQuantity() == 0) {
                            // Remove item if no stock
                            cart.getCartItems().remove(item);
                        } else {
                            // Adjust quantity to available stock
                            item.setQuantity(book.getStockQuantity());
                        }
                        cartModified = true;
                    }
                }
            }

            // Save cart if modified
            if (cartModified) {
                cartRepository.save(cart);
            }
        }
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return orderMapper.toOrderResponse(order);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllActiveOrders().stream()
                .map(orderMapper::toOrderResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getMyOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return orderRepository.findByUserId(user.getId()).stream()
                .map(orderMapper::toOrderResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(orderMapper::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrder(Long id, OrderUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // check if the changed status is different from the current status
        if (request.getStatus() != null && request.getStatus() == order.getStatus()) {
            throw new AppException(ErrorCode.ORDER_UPDATE_STATUS_DUPLICATE);
        }

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }

        Order updatedOrder = orderRepository.save(order);

        // send notification to current cútomer about order status update
        NotificationCreationRequest notificationRequest = NotificationCreationRequest.builder()
                .targetUserId(order.getUser().getId())
                .type(NotificationType.FOR_CUSTOMERS_PERSONAL)
                .content("Your order (ID: " + order.getId() + ") status has been updated to " + order.getStatus())
                .build();
        notificationService.createPersonalNotification(notificationRequest);

        return orderMapper.toOrderResponse(updatedOrder);
    }

    /**
     * Cancel current user's order. Only allowed if order status is PENDING.
     * Restore stock quantities when order is cancelled.
     * @param id
     * @return updated OrderResponse
     */
    @Transactional
    public OrderResponse cancelMyOrder(Long id) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Find order with items
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // check if the order belongs to the user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // check if the order status is PENDING and only allow customer to update status to CANCELLED
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_UPDATED);
        }

        // Restore stock quantities
        for (OrderItem item : order.getOrderItems()) {
            Book book = item.getBook();
            book.setStockQuantity(book.getStockQuantity() + item.getQuantity());
            bookRepository.save(book);
        }

        order.setStatus(OrderStatus.CANCELLED);

        Order updatedOrder = orderRepository.save(order);

        // send notification to all staffs about order cancellation
        NotificationBroadCastCreationRequest notificationRequest = NotificationBroadCastCreationRequest.builder()
                .type(NotificationType.FOR_STAFFS)
                .content("Order ID: " + order.getId() + " has been cancelled by the customer " + user.getUsername())
                .build();
        notificationService.createBroadcastNotification(notificationRequest);

        return orderMapper.toOrderResponse(updatedOrder);
    }


//    @Transactional
//    public void cancelOrder(Long id) {
//        Order order = orderRepository.findByIdWithItems(id)
//                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
//
//        if (order.getStatus() != OrderStatus.PENDING) {
//            throw new AppException(ErrorCode.ORDER_CANNOT_BE_CANCELLED);
//        }
//
//        // Restore stock
//        for (OrderItem item : order.getOrderItems()) {
//            Book book = item.getBook();
//            book.setStockQuantity(book.getStockQuantity() + item.getQuantity());
//        }
//
//        order.setStatus(OrderStatus.CANCELLED);
//        orderRepository.save(order);
//    }


    /**
     * Change address of current user's order. Only allowed if order status is PENDING.
     * @param id
     * @param newAddress
     * @return updated OrderResponse
     */
    public OrderResponse changeAddressMyOrder(Long id, String newAddress) {
        // Get current user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Find order
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // check if the order belongs to the user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // check if the order status is PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_UPDATED);
        }

        order.setAddress(newAddress);

        Order updatedOrder = orderRepository.save(order);

        // send notification to all staffs about order address change
        NotificationBroadCastCreationRequest notificationRequest = NotificationBroadCastCreationRequest.builder()
                .type(NotificationType.FOR_STAFFS)
                .content("Order ID: " + order.getId() + " address has been changed by the customer " + user.getUsername())
                .build();
        notificationService.createBroadcastNotification(notificationRequest);

        return orderMapper.toOrderResponse(updatedOrder);
    }
}
