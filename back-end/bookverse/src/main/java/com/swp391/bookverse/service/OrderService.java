package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.request.*;
import com.swp391.bookverse.dto.response.OrderResponse;
import com.swp391.bookverse.dto.response.PaymentResponse;
import com.swp391.bookverse.entity.*;
import com.swp391.bookverse.enums.NotificationType;
import com.swp391.bookverse.enums.OrderStatus;
import com.swp391.bookverse.enums.PaymentStatus;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.OrderMapper;
import com.swp391.bookverse.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
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
    PaymentRepository paymentRepository;
    NotificationService notificationService;

    /**
     * Create order from current user's cart
     * When order is created, the cart and its items are cleared (just like that)
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
        }

        order.setTotalAmount(totalAmount);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear current user's cart
        cart.getCartItems().clear();
        cartRepository.save(cart);

        // send notification to all staffs about new order
        NotificationBroadCastCreationRequest notificationRequest = NotificationBroadCastCreationRequest.builder()
                .type(NotificationType.FOR_STAFFS)
                .content("New order placed by " + user.getUsername() + ". Order ID: " + savedOrder.getId())
                .build();
        notificationService.createBroadcastNotification(notificationRequest);

        // Return order response DTO after saving
        return orderMapper.toOrderResponse(savedOrder);
    }

    /**
     * Get order by id
     * @param id
     * @return OrderResponse
     */
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

    /**
     * Update order status by id
     * @param id
     * @param request
     * @return updated OrderResponse
     */
    @Transactional
    public OrderResponse updateOrder(Long id, OrderUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // check if the changed status is different from the current status
        if (request.getStatus() != null && request.getStatus() == order.getStatus()) {
            throw new AppException(ErrorCode.ORDER_UPDATE_STATUS_DUPLICATE);
        }

        // handle transition under valid status changes
        // PENDING_PAYMENT/PENDING -> CONFIRMED - > PROCESSING -> DELIVERING -> DELIVERED
        if (request.getStatus() != null) {
            boolean validTransition = false; // flag to check valid status transition
            switch (order.getStatus()) {
                case PENDING_PAYMENT, PENDING:
                    validTransition = (request.getStatus() == OrderStatus.CONFIRMED);
                    break;
                case CONFIRMED:
                    validTransition = (request.getStatus() == OrderStatus.PROCESSING);
                    break;
                case PROCESSING:
                    validTransition = (request.getStatus() == OrderStatus.DELIVERING);
                    // update stock quantities when order is moved to DELIVERING
                    if (validTransition) {
                        for (OrderItem item : order.getOrderItems()) {
                            Book book = item.getBook();
                            if (book.getStockQuantity() < item.getQuantity()) {
                                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
                            }
                            book.setStockQuantity(book.getStockQuantity() - item.getQuantity());
                            bookRepository.save(book);
                        }
                    }
                    break;
                case DELIVERING:
                    validTransition = (request.getStatus() == OrderStatus.DELIVERED);
                    // change its payment status to SUCCESS if it's a COD order when order is DELIVERED
                    if (validTransition) {
                        Payment payment = paymentRepository.findByOrderId(order.getId());
                        if (payment != null && payment.getMethod() == com.swp391.bookverse.enums.PaymentMethod.COD) {
                            payment.setStatus(PaymentStatus.SUCCESS);
                            paymentRepository.save(payment);
                        }
                    }
                    break;
//                case DELIVERED:
//                    validTransition = (request.getStatus() == OrderStatus.RETURNED);
//                    break;
                default:
                    validTransition = false;
            }
            if (!validTransition) {
                throw new AppException(ErrorCode.ORDER_INVALID_STATUS_TRANSITION);
            }
        }

        // update status
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
     * Cancel current user's order.
     * Only allow updating to CANCELLED from PENDING_PAYMENT/PENDING/CONFIRMED/PROCESSING (before shipping)
     * Restore stock quantities when order is cancelled.
     * @param id
     * @return updated OrderResponse
     */
    @Transactional
    public OrderResponse cancelMyOrder(OrderCancelRequest request, Long id) {
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

        // check if the order status is in PENDING_PAYMENT/PENDING/CONFIRMED/PROCESSING
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.PROCESSING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_CANCELLED);
        }

        order.setStatus(OrderStatus.CANCELLED);

        Order updatedOrder = orderRepository.save(order);

        // chek if the order has payment status = SUCCESS
        // if so, notify staffs and admin to process refund
        // set the status of payment to REFUNDING
        Payment payment = paymentRepository.findByOrderId(order.getId());
        if (payment != null && payment.getStatus() == PaymentStatus.SUCCESS) {
            payment.setStatus(PaymentStatus.REFUNDING);
            paymentRepository.save(payment);
        }


        // send notification to all staffs about order cancellation
        // consider if the order has payment status = SUCCESS. If so, notify staffs and admins to process refund
        String contentNotification = "";
        if (payment != null && payment.getStatus() == PaymentStatus.REFUNDING) {
            contentNotification = "Order ID: " + order.getId() + " has been cancelled by the customer " + user.getUsername() +
                    ". The order had a successful payment, please process the refund.";
        } else {
            contentNotification = "Order ID: " + order.getId() + " has been cancelled by the customer " + user.getUsername() + ".";
        }

        // send notification to all staffs about order cancellation
        NotificationBroadCastCreationRequest notificationRequest = NotificationBroadCastCreationRequest.builder()
                .type(NotificationType.FOR_STAFFS)
                .content(contentNotification)
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
            throw new AppException(ErrorCode.ORDER_CANNOT_CHANGE_ADDRESS);
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
