package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.UserChangePassWordRequest;
import com.swp391.bookverse.dto.request.UserCreationRequest;
import com.swp391.bookverse.dto.request.UserUpdateRequest;
import com.swp391.bookverse.dto.response.UserResponse;
import com.swp391.bookverse.entity.User;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * @Author huangdat
 */

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UserController {
    UserService userService;

    @PostMapping(value = "/create", consumes = {"multipart/form-data"})
    public APIResponse<User> createUser(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam("email") String email,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "active", defaultValue = "true") boolean active,
            @RequestParam(value = "roles", required = false) List<String> roles) {
        
        APIResponse<User> response = new APIResponse<>();
        response.setResult(userService.createUser(username, password, email, name, phone, address, imageFile, imageUrl, active, roles));
        return response;
    }

    @GetMapping
    public APIResponse<List<UserResponse>> getUsers(){
        APIResponse<List<UserResponse>> response = new APIResponse<>();
        response.setResult(userService.getUsers());
        return response;
    }

    @PostMapping("/signup")
    public APIResponse<UserResponse> signupUser(@RequestBody @Valid UserCreationRequest request) {
        APIResponse<UserResponse> response = new APIResponse<>();
        response.setResult(userService.signupUser(request));
        return response;
    }

    @GetMapping("/{userId}")
    public UserResponse getUser(@PathVariable("userId") String userId) {
        return userService.getUserById(userId);
    }

    /**
     * Get current logged-in user's information
     * @return APIResponse<UserResponse> containing user's information
     */
    @GetMapping("/myInfo")
    public APIResponse<UserResponse> getMyInfo() {
        APIResponse<UserResponse> response = new APIResponse<>();
        response.setResult(userService.getMyInfo());
        return response;
    }

    @PutMapping("/myInfo")
    public UserResponse updateMyInfo(@RequestBody @Valid UserUpdateRequest request) {
        return userService.updateMyInfo(request);
    }

    @PutMapping("/change-my-password")
    public APIResponse<?> changeMyPassword(@RequestBody UserChangePassWordRequest request) {
        boolean changeSucess = userService.changeMyPassword(request);
        if (changeSucess) {
            APIResponse<?> response = new APIResponse<>();
            response.setMessage("Password changed successfully.");
            return response;
        } else {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
    }

    @PutMapping(value = "/update/{userId}", consumes = {"multipart/form-data"})
    public UserResponse updateUser(
            @PathVariable("userId") String userId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl) {
        return userService.updateUser(userId, name, phone, address, imageFile, imageUrl);
    }

    @PutMapping("/change-role/{userId}")
    public UserResponse changeUserRole(@PathVariable("userId") String userId) {
        return userService.changeUserRole(userId);
    }

    @GetMapping("/customers")
    public APIResponse<List<UserResponse>> getCustomers(){
        APIResponse<List<UserResponse>> response = new APIResponse<>();
        response.setResult(userService.getCustomers());
        return response;
    }

    @GetMapping("/staffs")
    public APIResponse<List<UserResponse>> getStaffs(){
        APIResponse<List<UserResponse>> response = new APIResponse<>();
        response.setResult(userService.getStaffs());
        return response;
    }

    @GetMapping("/is-active/{userId}")
    public Boolean isActiveUser(@PathVariable("userId") String userId) {
        return userService.isActiveUser(userId);
    }

    @GetMapping("/active")
    public APIResponse<List<UserResponse>> getActiveUsers() {
        APIResponse<List<UserResponse>> response = new APIResponse<>();
        response.setResult(userService.getActiveUsers());
        return response;
    }

    @GetMapping("/inactive")
    public APIResponse<List<UserResponse>> getInactiveUsers() {
        APIResponse<List<UserResponse>> response = new APIResponse<>();
        response.setResult(userService.getInactiveUsers());
        return response;
    }

    @PutMapping("/active/{userId}")
    public UserResponse restoreUser(@PathVariable("userId") String userId) {
        return userService.changeActiveUserById(true, userId);
    }

    @PutMapping("/inactive/{userId}")
    public UserResponse deleteUser(@PathVariable("userId") String userId) {
        return userService.changeActiveUserById(false, userId);
    }

    @GetMapping("/id-by-email/{email}")
    public APIResponse<String> getUserIdByEmail(@PathVariable("email") String email) {
        APIResponse<String> response = new APIResponse<>();
        String userId = userService.getUserIdByEmail(email);
        if (userId == null) {
            response.setCode(404);
            response.setMessage("User not found.");
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        } else {
            response.setResult(userId);
        }
        return response;
    }


}
