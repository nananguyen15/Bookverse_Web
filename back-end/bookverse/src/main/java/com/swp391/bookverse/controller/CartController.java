package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.AddToCartRequest;
import com.swp391.bookverse.dto.request.CartItemUpdateRequest;
import com.swp391.bookverse.dto.response.CartResponse;
import com.swp391.bookverse.service.CartService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author huangdat
 */
@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class CartController {
    CartService cartService;

    @GetMapping
    public APIResponse<List<CartResponse>> getCarts() {
        APIResponse<List<CartResponse>> response = new APIResponse<>();
        List<CartResponse> cartResponses = cartService.getCarts();
        response.setResult(cartResponses);
        return response;
    }

    @GetMapping("/{userId}")
    public APIResponse<CartResponse> getCartByUserId(@PathVariable("userId") String userId) {
        APIResponse<CartResponse> response = new APIResponse<>();
        CartResponse cartResponse = cartService.getCartByUserId(userId);
        response.setResult(cartResponse);
        return response;
    }

    @GetMapping("/myCart")
    public APIResponse<CartResponse> getMyCart() {
        APIResponse<CartResponse> response = new APIResponse<>();
        response.setResult(cartService.getMyCart());
        return response;
    }

    @PostMapping("/myCart/add-1-to-cart")
    public APIResponse<CartResponse> addToCart(@RequestBody AddToCartRequest request) {
        APIResponse<CartResponse> response = new APIResponse<>();
        CartResponse cartResponse = cartService.addOneToCart(request);
        response.setResult(cartResponse);
        return response;
    }

    @PostMapping("/myCart/add-multiple-to-cart")
    public APIResponse<CartResponse> addMultipleToCart(@RequestBody CartItemUpdateRequest request) {
        APIResponse<CartResponse> response = new APIResponse<>();
        CartResponse cartResponse = cartService.addMultipleToCart(request);
        response.setResult(cartResponse);
        return response;
    }

    @PostMapping("/myCart/remove-1-from-cart")
    public APIResponse<CartResponse> removeFromCart(@RequestBody AddToCartRequest request) {
        APIResponse<CartResponse> response = new APIResponse<>();
        CartResponse cartResponse = cartService.removeOneFromCart(request);
        response.setResult(cartResponse);
        return response;
    }

    @PostMapping("/myCart/clear-an-item")
    public APIResponse<CartResponse> clearAnItem(@RequestBody AddToCartRequest request) {
        APIResponse<CartResponse> response = new APIResponse<>();
        CartResponse cartResponse = cartService.clearAnItem(request);
        response.setResult(cartResponse);
        return response;
    }

    @PutMapping("myCart/update-item-quantity")
    public APIResponse<CartResponse> updateItemQuantity(@RequestBody CartItemUpdateRequest request) {
        APIResponse<CartResponse> response = new APIResponse<>();
        CartResponse cartResponse = cartService.updateItemQuantity(request);
        response.setResult(cartResponse);
        return response;
    }

}