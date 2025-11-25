package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.request.*;
import com.swp391.bookverse.dto.response.*;
import com.swp391.bookverse.entity.*;
import com.swp391.bookverse.enums.NotificationType;
import com.swp391.bookverse.enums.OrderStatus;
import com.swp391.bookverse.enums.PaymentMethod;
import com.swp391.bookverse.enums.PaymentStatus;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.OrderMapper;
import com.swp391.bookverse.mapper.UserMapper;
import com.swp391.bookverse.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    UserMapper userMapper;

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

        // send notification to all admins about new order
        NotificationBroadCastCreationRequest adminNotificationRequest = NotificationBroadCastCreationRequest.builder()
                .type(NotificationType.FOR_ADMINS)
                .content("New order placed by " + user.getUsername() + ". Order ID: " + savedOrder.getId())
                .build();
        notificationService.createBroadcastNotification(adminNotificationRequest);

        // send notification to current customer about order creation
        NotificationCreationRequest customerNotificationRequest = NotificationCreationRequest.builder()
                .targetUserId(user.getId())
                .type(NotificationType.FOR_CUSTOMERS_PERSONAL)
                .content("Your order (ID: " + savedOrder.getId() + ") has been created and is now pending for confirmation.")
                .build();
        notificationService.createPersonalNotification(customerNotificationRequest);

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
                    // send notification to customer when order is confirmed
                    if (validTransition) {
                        NotificationCreationRequest notificationRequest = NotificationCreationRequest.builder()
                                .targetUserId(order.getUser().getId())
                                .type(NotificationType.FOR_CUSTOMERS_PERSONAL)
                                .content("Your order (ID: " + order.getId() + ") has been confirmed.")
                                .build();
                        notificationService.createPersonalNotification(notificationRequest);
                    }
                    break;
                case CONFIRMED:
                    validTransition = (request.getStatus() == OrderStatus.PROCESSING);
                    // send notification to customer when order is being processed
                    if (validTransition) {
                        NotificationCreationRequest notificationRequest = NotificationCreationRequest.builder()
                                .targetUserId(order.getUser().getId())
                                .type(NotificationType.FOR_CUSTOMERS_PERSONAL)
                                .content("Your order (ID: " + order.getId() + ") is being processed.")
                                .build();
                        notificationService.createPersonalNotification(notificationRequest);
                    }
                    break;
                case PROCESSING:
                    validTransition = (request.getStatus() == OrderStatus.DELIVERING);

                    if (validTransition) {
                        // update stock quantities when order is moved to DELIVERING
                        for (OrderItem item : order.getOrderItems()) {
                            Book book = item.getBook();
                            if (book.getStockQuantity() < item.getQuantity()) {
                                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
                            }
                            book.setStockQuantity(book.getStockQuantity() - item.getQuantity());
                            bookRepository.save(book);

                            // send notification to customer when order is out for delivery
                            NotificationCreationRequest notificationRequest = NotificationCreationRequest.builder()
                                    .targetUserId(order.getUser().getId())
                                    .type(NotificationType.FOR_CUSTOMERS_PERSONAL)
                                    .content("Your order (ID: " + order.getId() + ") is out for delivery (DELIVERING) and cannot be cancelled now.")
                                    .build();
                            notificationService.createPersonalNotification(notificationRequest);
                        }
                    }
                    break;
                case DELIVERING:
                    validTransition = (request.getStatus() == OrderStatus.DELIVERED);

                    if (validTransition) {
                        // change its payment status to SUCCESS if it's a COD order when order is DELIVERED
                        Payment payment = paymentRepository.findByOrderId(order.getId());
                        if (payment != null && payment.getMethod() == PaymentMethod.COD) {
                            payment.setStatus(PaymentStatus.SUCCESS);
                            paymentRepository.save(payment);
                        }

                        // send notification to customer when order is delivered
                        NotificationCreationRequest notificationRequest = NotificationCreationRequest.builder()
                                .targetUserId(order.getUser().getId())
                                .type(NotificationType.FOR_CUSTOMERS_PERSONAL)
                                .content("Your order (ID: " + order.getId() + ") has been delivered by shipper.")
                                .build();
                        notificationService.createPersonalNotification(notificationRequest);
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
        order.setCancelReason(request.getCancelReason());

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

        // send notification to all admins about order cancellation
        NotificationBroadCastCreationRequest adminNotificationRequest = NotificationBroadCastCreationRequest.builder()
                .type(NotificationType.FOR_ADMINS)
                .content(contentNotification)
                .build();
        notificationService.createBroadcastNotification(adminNotificationRequest);

        // send notification to current customer about order cancellation
        NotificationCreationRequest customerNotificationRequest = NotificationCreationRequest.builder()
                .targetUserId(user.getId())
                .type(NotificationType.FOR_CUSTOMERS_PERSONAL)
                .content("Your order (ID: " + order.getId() + ") has been cancelled successfully.")
                .build();
        notificationService.createPersonalNotification(customerNotificationRequest);

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

        // send notification to all admins about order address change
        NotificationBroadCastCreationRequest adminNotificationRequest = NotificationBroadCastCreationRequest.builder()
                .type(NotificationType.FOR_ADMINS)
                .content("Order ID: " + order.getId() + " address has been changed by the customer " + user.getUsername())
                .build();
        notificationService.createBroadcastNotification(adminNotificationRequest);

        // send notification to current customer about order address change
        NotificationCreationRequest customerNotificationRequest = NotificationCreationRequest.builder()
                .targetUserId(user.getId())
                .type(NotificationType.FOR_CUSTOMERS_PERSONAL)
                .content("Your order (ID: " + order.getId() + ") address has been changed successfully.")
                .build();
        notificationService.createPersonalNotification(customerNotificationRequest);

        return orderMapper.toOrderResponse(updatedOrder);
    }

    // for statistic

    /**
     * Get top 5 customers who have the highest total spending on orders
     * @return List<UserResponse>
     */
    public List<StatisticUserResponse> getTop5Customers() {
        // find id of top 5 customers by total spending on orders
        List<String> topCustomerIds = orderRepository.findTop5CustomerIdsByTotalSpending();

        // fetch user details for each id
        List<UserResponse> topCustomers = new ArrayList<>();
        for (String userId : topCustomerIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            topCustomers.add(userMapper.toUserResponse(user));
        }

        // map to StatisticUserResponse with totalSpent
        List<StatisticUserResponse> statisticTopCustomers = new ArrayList<>();
        for (UserResponse userResponse : topCustomers) {
            Double totalSpent = orderRepository.findTotalSpentByUserId(userResponse.getId());
            StatisticUserResponse statisticUserResponse = StatisticUserResponse.builder()
                    .id(userResponse.getId())
                    .username(userResponse.getUsername())
                    .name(userResponse.getName())
                    .image(userResponse.getImage())
                    .totalSpent(totalSpent != null ? totalSpent : 0.0)
                    .build();
            statisticTopCustomers.add(statisticUserResponse);
        }

        // return list of top customers
        return statisticTopCustomers;
    }

    /**
     * Get top 5 best-selling books
     * @return List<StatisticBookResponse>
     */
    public List<StatisticBookResponse> getTop5Books() {
        // find id of top-selling books
        List<Long> topBookIds = orderRepository.findTopSellingBookIds();

        // fetch book details for each id
        List<StatisticBookResponse> statisticTopBooks = new ArrayList<>();
        int count = 0;
        for (Long bookId : topBookIds) {
            if (count >= 5) break; // limit to top 5
            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

            // calculate total sold for the book
            Long totalSold = 0L;
            List<Order> deliveredOrders = orderRepository.findAllActiveOrders().stream()
                    .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                    .toList();
            for (Order order : deliveredOrders) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getBook().getId().equals(bookId)) {
                        totalSold += item.getQuantity();
                    }
                }
            }

            StatisticBookResponse statisticBookResponse = StatisticBookResponse.builder()
                    .id(book.getId())
                    .title(book.getTitle())
                    .image(book.getImage())
                    .totalSold(totalSold)
                    .build();
            statisticTopBooks.add(statisticBookResponse);
            count++;
        }

        // return list of top books
        return statisticTopBooks;
    }

    /**
     * Get total number of user who have role = CUSTOMER
     * @return Long
     */
    public Long getTotalCustomers() {
        // throw exception if there are no user entity store in DB
        if (userRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_USERS_STORED);
        }

        // fetch list of users who is active = true
        List<User> activeUsers = userRepository.findAll().stream().filter(User::isActive).toList();

        // count number of users who have roles field containing CUSTOMER
        Long totalCustomers = 0L;

        for (User user: activeUsers) {
            for (String role: user.getRoles()) {
                if (role.equals("CUSTOMER")) {
                    totalCustomers++;
                    break; // no need to check other roles for this user
                }
            }
        }

        return totalCustomers;
    }

    /**
     * Get total number of orders
     * @return Long
     */
    public Long getTotalOrders() {
        return orderRepository.count();
    }

    /**
     * Get total revenue from all orders with status = DELIVERED
     * @return Double
     */
    public Double getTotalRevenue() {
        // check if there are no orders
        if (orderRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_ORDERS_STORED);
        }

        // fetch all delivered orders
        List<Order> deliveredOrders = orderRepository.findAllActiveOrders().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .toList();

        Double totalRevenue = 0.0;
        for (Order order : deliveredOrders) {
            totalRevenue += order.getTotalAmount();
        }

        return totalRevenue;
    }

    /**
     * Get sales over time (total sales each day)
     * @return
     */
    public List<StatisticSalesOverTimeResponse> getSalesOverTime() {
        // check if there are no orders
        if (orderRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_ORDERS_STORED);
        }

        // fetch all delivered orders
        List<Order> deliveredOrders = orderRepository.findAllActiveOrders().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .toList();

        // map of date string to total sales
        java.util.Map<String, Double> salesMap = new java.util.HashMap<>();

        for (Order order : deliveredOrders) {
            String dateStr = order.getCreatedAt().toLocalDate().toString();
            salesMap.put(dateStr, salesMap.getOrDefault(dateStr, 0.0) + order.getTotalAmount());
        }

        // convert map to list of StatisticSalesOverTimeResponse
        List<StatisticSalesOverTimeResponse> salesOverTimeList = new ArrayList<>();
        for (java.util.Map.Entry<String, Double> entry : salesMap.entrySet()) {
            StatisticSalesOverTimeResponse response = StatisticSalesOverTimeResponse.builder()
                    .date(LocalDate.parse(entry.getKey()))
                    .totalSales(Math.round(entry.getValue()))
                    .build();
            salesOverTimeList.add(response);
        }

        // sort list by date ascending
        salesOverTimeList.sort((a, b) -> a.getDate().compareTo(b.getDate()));

        return salesOverTimeList;
    }

    /**
     * Get orders over time (total number of orders each day)
     * @return List<StatisticSalesOverTimeResponse>
     */
    public List<StatisticSalesOverTimeResponse> getOrdersOverTime() {
        List<Order> allOrders = orderRepository.findAllActiveOrders();

        // map of date string to total orders
        java.util.Map<String, Long> ordersMap = new java.util.HashMap<>();

        for (Order order : allOrders) {
            String dateStr = order.getCreatedAt().toLocalDate().toString();
            ordersMap.put(dateStr, ordersMap.getOrDefault(dateStr, 0L) + 1);
        }

        // convert map to list of StatisticSalesOverTimeResponse
        List<StatisticSalesOverTimeResponse> ordersOverTimeList = new ArrayList<>();
        for (java.util.Map.Entry<String, Long> entry : ordersMap.entrySet()) {
            StatisticSalesOverTimeResponse response = StatisticSalesOverTimeResponse.builder()
                    .date(LocalDate.parse(entry.getKey()))
                    .totalSales(entry.getValue())
                    .build();
            ordersOverTimeList.add(response);
        }

        // sort list by date ascending
        ordersOverTimeList.sort((a, b) -> a.getDate().compareTo(b.getDate()));

        return ordersOverTimeList;
    }


    /**
     * Get total of each status
     * @return
     */
    public StatisticOrderStatusResponse getOrdersStatus() {
        List<Order> allOrders = orderRepository.findAllActiveOrders();

        Long pending = 0L;
        Long confirmed = 0L;
        Long processing = 0L;
        Long delivering = 0L;
        Long delivered = 0L;
        Long cancelled = 0L;

        for (Order order : allOrders) {
            switch (order.getStatus()) {
                case PENDING, PENDING_PAYMENT:
                    pending++;
                    break;
                case CONFIRMED:
                    confirmed++;
                    break;
                case PROCESSING:
                    processing++;
                    break;
                case DELIVERING:
                    delivering++;
                    break;
                case DELIVERED:
                    delivered++;
                    break;
                case CANCELLED:
                    cancelled++;
                    break;
                default:
                    // do nothing for other statuses
            }
        }

        return StatisticOrderStatusResponse.builder()
                .pending(pending)
                .confirmed(confirmed)
                .processing(processing)
                .delivering(delivering)
                .delivered(delivered)
                .cancelled(cancelled)
                .build();
    }
}
