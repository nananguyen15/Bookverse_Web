package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.request.UserChangePassWordRequest;
import com.swp391.bookverse.dto.request.UserCreationRequest;
import com.swp391.bookverse.dto.request.UserUpdateRequest;
import com.swp391.bookverse.dto.response.UserResponse;
import com.swp391.bookverse.entity.User;
import com.swp391.bookverse.enums.Role;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.UserMapper;
import com.swp391.bookverse.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

/**
 * @Author huangdat
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    /**
     * Creates a new user in the system.
     * @param request the request object containing user details
     * @return user the created user entity
     */
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public User createUser(UserCreationRequest request) {

        // make sure the username of request object is not already taken. Stop the process if it is.
        if(userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTS);
        }

        // Create a new User entity with encoded password
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode((request.getPassword())));


        // Set default role USER
        HashSet<String> roles = new HashSet<>();
        roles.add(Role.CUSTOMER.name());
        user.setRoles(roles);

        // Save the user to the repository and return the saved entity
        return userRepository.save(user);
    }

    /**
     * Fetches all users from the system.
     * @return List<User> a list of all users
     */
    @PreAuthorize("hasAuthority('SCOPE_STAFF') or hasAuthority('SCOPE_ADMIN')")
    public List<UserResponse> getUsers() {
        // throw exception if there are no user entity store in DB
        if (userRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_USERS_STORED);
        }

        // transfer list of User to list of UserResponse
        List<User> users = userRepository.findAll();
        List<UserResponse> usersResponses = new ArrayList<>(users.size());
        for (int i = 0; i < users.size(); i++) {
            usersResponses.add(userMapper.toUserResponse(users.get(i)));
        }

        // Fetch all users from the repository
        return usersResponses;
    }

    public UserResponse signupUser(UserCreationRequest request) {

        // make sure the username of request object is not already taken. Stop the process if it is.
        if(userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTS);
        }
        // check if email is already taken
        if(userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Create a new User entity with encoded password
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode((request.getPassword())));
        // Set default role USER
        HashSet<String> roles = new HashSet<>();
        roles.add(Role.CUSTOMER.name());
        user.setRoles(roles);
        user.setActive(false); // New users are inactive by default (OTP verification pending)
        // Save the user to the repository and return the saved entity
        return userMapper.toUserResponse(userRepository.save(user));
    }

    /**
     * Fetches a user by their ID. Admin and Staff only.
     * @param id the ID of the user to fetch
     * @return User the user entity with the specified ID
     */
    @PreAuthorize("hasAuthority('SCOPE_STAFF') or hasAuthority('SCOPE_ADMIN')")
    public UserResponse getUserById(String id) {
        // Fetch a user by ID from the repository
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    /**
     * Fetches the information of the currently authenticated user.
     * @return User the user entity of the currently authenticated user
     */
    public UserResponse getMyInfo() {
        // Get the username of the currently authenticated user
        var context = SecurityContextHolder.getContext();
        String contextName = context.getAuthentication().getName();
        // Fetch a user by username from the repository
        User user = userRepository.findByUsername(contextName).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateMyInfo(UserUpdateRequest request) {
        // Get the username of the currently authenticated user
        var context = SecurityContextHolder.getContext();
        String contextName = context.getAuthentication().getName();
        // Fetch a user by username from the repository
        User existingUser = userRepository.findByUsername(contextName).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateUser(request, existingUser);

//        // encoding password
//        existingUser.setPassword(passwordEncoder.encode(existingUser.getPassword()));

        return userMapper.toUserResponse(userRepository.save(existingUser));
    }

    /**
     * Updates an existing user in the system.
     * @param id the ID of the user to update
     * @param request the request object containing updated user details
     * @return user the updated user entity
     */
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public UserResponse updateUser(String id, UserUpdateRequest request) {
        // Fetch the existing user by ID
        User existingUser = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateUser(request, existingUser);

        // encoding password
        existingUser.setPassword(passwordEncoder.encode(existingUser.getPassword()));

        return userMapper.toUserResponse(userRepository.save(existingUser));
    }

    public UserResponse changeUserRole(String id) {
        // Fetch the existing user by ID
        User existingUser = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Toggle between CUSTOMER and STAFF roles
        if (existingUser.getRoles().contains(Role.CUSTOMER.name())) {
            existingUser.getRoles().remove(Role.CUSTOMER.name());
            existingUser.getRoles().add(Role.STAFF.name());
        } else if (existingUser.getRoles().contains(Role.STAFF.name())) {
            existingUser.getRoles().remove(Role.STAFF.name());
            existingUser.getRoles().add(Role.CUSTOMER.name());
        }

        return userMapper.toUserResponse(userRepository.save(existingUser));
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public List<UserResponse> getCustomers(){
        // throw exception if there are no user entity store in DB
        if (userRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_USERS_STORED);
        }
        // Fetch users with role CUSTOMER
        List<User> customers = userRepository.findByRolesContaining(Role.CUSTOMER.name());
        List<UserResponse> customerResponses = new ArrayList<>(customers.size());
        for (User customer : customers) {
            customerResponses.add(userMapper.toUserResponse(customer));
        }
        return customerResponses;
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<UserResponse> getStaffs(){
        // throw exception if there are no user entity store in DB
        if (userRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_USERS_STORED);
        }
        //  Fetch users with role STAFF
        List<User> staffs = userRepository.findByRolesContaining(Role.STAFF.name());
        List<UserResponse> staffResponses = new ArrayList<>(staffs.size());
        for (User staff : staffs) {
            staffResponses.add(userMapper.toUserResponse(staff));
        }
        return staffResponses;
    }

    public Boolean isActiveUser(String id) {
        // Fetch the existing user by ID
        User existingUser = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return existingUser.isActive();
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<UserResponse> getActiveUsers() {
        // throw exception if there are no user entity store in DB
        if (userRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_USERS_STORED);
        }

        // Fetch users who are active
        List<User> activeUsers = userRepository.findAll().stream().filter(User::isActive).toList();
        List<UserResponse> activeUserResponses = new ArrayList<>(activeUsers.size());
        for (User activeUser : activeUsers) {
            activeUserResponses.add(userMapper.toUserResponse(activeUser));
        }
        return activeUserResponses;
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<UserResponse> getInactiveUsers() {
        // throw exception if there are no user entity store in DB
        if (userRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_USERS_STORED);
        }

        // Fetch users who are inactive
        List<User> inactiveUsers = userRepository.findAll().stream().filter(user -> !user.isActive()).toList();
        List<UserResponse> inactiveUserResponses = new ArrayList<>(inactiveUsers.size());
        for (User inactiveUser : inactiveUsers) {
            inactiveUserResponses.add(userMapper.toUserResponse(inactiveUser));
        }
        return inactiveUserResponses;
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public UserResponse changeActiveUserById(boolean active, String id) {
        // Fetch the existing user by ID
        User existingUser = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        existingUser.setActive(active);

        return userMapper.toUserResponse(userRepository.save(existingUser));
    }

    public String getUserIdByEmail(String email) {
        // Fetch the existing user by email
        User existingUser = userRepository.findByEmail(email).orElse(null);

        return existingUser != null ? existingUser.getId() : null;
    }

    public UserResponse changePassword(String userId, String newPassword) {
        // Fetch the existing user by ID
        User existingUser = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Encode the new password
        existingUser.setPassword(passwordEncoder.encode(newPassword));

        return userMapper.toUserResponse(userRepository.save(existingUser));
    }

    public Boolean changeMyPassword(UserChangePassWordRequest request) {
        // Get the username of the currently authenticated user
        var context = SecurityContextHolder.getContext();
        String contextName = context.getAuthentication().getName();
        // Fetch a user by username from the repository
        User existingUser = userRepository.findByUsername(contextName).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Check if the old password matches
        if (!passwordEncoder.matches(request.getOldPassword(), existingUser.getPassword())) {
            throw new AppException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        // check if the old password is the same as the new password
        if (passwordEncoder.matches(request.getNewPassword(), existingUser.getPassword())) {
            throw new AppException(ErrorCode.SAME_OLD_NEW_PASSWORD);
        }
        // Encode the new password and update
        existingUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(existingUser);
        return true;
    }

    /**
     * Handle image upload and save to file system
     * @param imageFile the uploaded image file
     * @param folder the folder to save in (avatar, book, author, etc.)
     * @return the database path (/src/assets/img/folder/filename.jpg)
     */
    private String handleImageUpload(MultipartFile imageFile, String folder) {
        System.out.println("🔍 handleImageUpload called - imageFile: " + 
            (imageFile != null ? imageFile.getOriginalFilename() + " (" + imageFile.getSize() + " bytes)" : "null"));
        
        if (imageFile == null || imageFile.isEmpty()) {
            System.out.println("⚠️ Image file is null or empty, skipping upload");
            return null;
        }

        try {
            // Validate file type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new AppException(ErrorCode.INVALID_FILE_TYPE);
            }

            // Validate file size (max 5MB)
            if (imageFile.getSize() > 5 * 1024 * 1024) {
                throw new AppException(ErrorCode.FILE_TOO_LARGE);
            }

            // Generate unique filename
            String originalFilename = imageFile.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                throw new AppException(ErrorCode.INVALID_FILE_NAME);
            }

            String timestamp = String.valueOf(System.currentTimeMillis());
            String cleanFilename = originalFilename.toLowerCase()
                    .replaceAll("[^a-z0-9.]", "-")
                    .replaceAll("-+", "-");
            String filename = timestamp + "-" + cleanFilename;

            // Create upload directory if not exists
            // Use absolute path to avoid creating nested folders
            String projectRoot = System.getProperty("user.dir").replace("\\back-end\\bookverse", "");
            String uploadDir = projectRoot + "/front-end/public/img/" + folder;
            Path uploadPath = Paths.get(uploadDir);
            
            System.out.println("📁 Upload directory: " + uploadPath.toAbsolutePath());
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ Created directory: " + uploadPath.toAbsolutePath());
            }

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return DB path
            String dbPath = "/img/" + folder + "/" + filename;
            System.out.println("✅ Image uploaded: " + dbPath);
            return dbPath;

        } catch (IOException e) {
            System.err.println("❌ Image upload failed: " + e.getMessage());
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    /**
     * Creates a new user with image upload support
     */
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public User createUser(String username, String password, String email, 
                          String name, String phone, String address,
                          MultipartFile imageFile, String imageUrl, boolean active, List<String> roles) {
        
        // Check if username already exists
        if(userRepository.existsByUsername(username)) {
            throw new AppException(ErrorCode.USER_EXISTS);
        }

        // Check if email already exists
        if(userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Handle image
        String imagePath = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            // User uploaded a file
            imagePath = handleImageUpload(imageFile, "avatar");
            System.out.println("✅ Created with uploaded file: " + imagePath);
        } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            // User provided a URL/path
            imagePath = imageUrl.trim();
            System.out.println("✅ Created with image URL: " + imageUrl);
        }

        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setName(name);
        user.setPhone(phone);
        user.setAddress(address);
        user.setImage(imagePath);
        user.setActive(active);

        // Set roles
        HashSet<String> userRoles = new HashSet<>();
        if (roles != null && !roles.isEmpty()) {
            userRoles.addAll(roles);
        } else {
            userRoles.add(Role.CUSTOMER.name());
        }
        user.setRoles(userRoles);

        return userRepository.save(user);
    }

    /**
     * Updates an existing user with image upload support
     */
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public UserResponse updateUser(String id, String name, String phone, 
                                   String address, MultipartFile imageFile, String imageUrl) {
        // Fetch existing user
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Update fields
        if (name != null) existingUser.setName(name);
        if (phone != null) existingUser.setPhone(phone);
        if (address != null) existingUser.setAddress(address);

        // Handle image update
        if (imageFile != null && !imageFile.isEmpty()) {
            // User uploaded a file
            String imagePath = handleImageUpload(imageFile, "avatar");
            existingUser.setImage(imagePath);
            System.out.println("✅ Updated with uploaded file: " + imagePath);
        } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            // User provided a URL/path
            existingUser.setImage(imageUrl.trim());
            System.out.println("✅ Updated with image URL: " + imageUrl);
        }

        return userMapper.toUserResponse(userRepository.save(existingUser));
    }

}
