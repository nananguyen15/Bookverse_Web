package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.response.CartResponse;
import com.swp391.bookverse.entity.Cart;
import com.swp391.bookverse.entity.CartItem;
import com.swp391.bookverse.entity.User;
import com.swp391.bookverse.entity.Book;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.repository.BookRepository;
import com.swp391.bookverse.repository.CartRepository;
import com.swp391.bookverse.mapper.CartMapper;
import com.swp391.bookverse.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.swp391.bookverse.dto.request.AddToCartRequest;


import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService {
    CartRepository cartRepository;
    CartMapper cartMapper;
    UserRepository userRepository;
    BookRepository bookRepository;

    /**
     * Get all carts (admin only)
     * @return
     */
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    @Transactional(readOnly = true)
    public List<CartResponse> getCarts() {
        return cartRepository.findAll().stream()
                .map(cartMapper::toCartResponse)
                .toList();
    }

    public CartResponse getCartByUserId(String userId) {
        List<CartResponse> carts = cartRepository.findAll().stream()
                .map(cartMapper::toCartResponse)
                .toList();
        for (CartResponse cart : carts) {
            if (cart.getUserId().equals(userId)) {
                return cart;
            }
        }
        return null;
    }

    /**
     * Get current user's cart
     * @return CartResponse
     */
    public CartResponse getMyCart() {
        String currentUserId = "current-user-id"; // Placeholder for current user ID

        // find current user id base on jwt token
        var context = SecurityContextHolder.getContext();
        String contextName = context.getAuthentication().getName();

        User user = userRepository.findByUsername(contextName)
                .orElseThrow(() -> new RuntimeException("User not found: " + contextName));
        currentUserId = user.getId().toString();

        Cart cart = cartRepository.findByUserIdAndActive(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));


        return cartMapper.toCartResponse(cart);
    }

    /**
     * Add one quantity of a book to current user's cart
     * @param request
     * @return CartResponse
     */
    @Transactional
    public CartResponse addOneToCart(AddToCartRequest request) {
        // Get current user from security context
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Find or create active cart for user
        Cart cart = cartRepository.findByUserIdAndActive(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .active(true)
                            .build();
                    return cartRepository.save(newCart);
                });

        // Check if book already exists in cart
        CartItem existingItem = cart.getCartItems().stream()
                .filter(item -> item.getBook().getId().equals(request.getBookId()))
                .findFirst()
                .orElse(null);

        // check if total of existing quantity and new quantity exceed book stock
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        int existingQty = existingItem != null ? existingItem.getQuantity() : 0;
        int desiredTotal = existingQty + 1; // since we are adding 1 to cart

        if (book.getStockQuantity() < desiredTotal) {
            throw new AppException(ErrorCode.EXCEED_STOCK);
        }

        if (existingItem != null) {
            // Update quantity if book already in cart
            existingItem.setQuantity(desiredTotal);
        } else {
            // Add new cart item
            CartItem newItem = CartItem.builder()
                    .book(book)
                    .quantity(1)
                    .build();

            cart.addCartItem(newItem);
        }


        Cart savedCart = cartRepository.save(cart);
        return cartMapper.toCartResponse(savedCart);
    }

    /**
     * Remove one quantity of a book from current user's cart
     * @param request
     * @return CartResponse
     */
    @Transactional
    public CartResponse removeOneFromCart(AddToCartRequest request) {
        // Get current user from security context
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Find active cart for user
        Cart cart = cartRepository.findByUserIdAndActive(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        // Find the cart item
        CartItem existingItem = cart.getCartItems().stream()
                .filter(item -> item.getBook().getId().equals(request.getBookId()))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        // Decrease quantity or remove item
        if (existingItem.getQuantity() > 1) {
            existingItem.setQuantity(existingItem.getQuantity() - 1);
        } else {
            cart.removeCartItem(existingItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return cartMapper.toCartResponse(savedCart);
    }


}
