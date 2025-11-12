package com.swp391.bookverse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Image Upload Controller
 * Handles file uploads for books, authors, publishers, and user avatars
 * 
 * @Author: Generated for SWP391_SU25_G5
 * @Date: November 11, 2025
 */
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class ImageUploadController {

    // Base directory for images (relative to project root)
    // In production, this should be configured via application.properties
    private static final String UPLOAD_DIR = "front-end/public/img/";

    /**
     * Upload an image file
     * 
     * @param file   The image file to upload
     * @param folder The destination folder (book, author, publisher, avatar, series)
     * @return The public URL path of the uploaded image
     */
    @PostMapping("/image")
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "book") String folder) {

        try {
            // 1. Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("File must be an image");
            }

            // Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size must be less than 5MB");
            }

            // 2. Validate folder name
            if (!isValidFolder(folder)) {
                return ResponseEntity.badRequest().body("Invalid folder name");
            }

            // 3. Generate clean filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid filename");
            }

            // Clean filename: remove special characters, convert to lowercase
            String cleanFilename = originalFilename
                    .toLowerCase()
                    .replaceAll("[^a-z0-9.]", "-")
                    .replaceAll("-+", "-");

            // Add timestamp to ensure uniqueness
            String timestamp = String.valueOf(System.currentTimeMillis());
            String filename = timestamp + "-" + cleanFilename;

            // 4. Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR + folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 5. Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 6. Generate public URL (this is what gets saved to database)
            String publicUrl = "/img/" + folder + "/" + filename;

            // Log successful upload
            System.out.println("✅ Image uploaded successfully: " + publicUrl);

            // 7. Return the public URL
            return ResponseEntity.ok(publicUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Delete an image file
     * 
     * @param imagePath The public URL path of the image (e.g., /img/book/12345-image.jpg)
     * @return Success message
     */
    @DeleteMapping("/image")
    public ResponseEntity<String> deleteImage(@RequestParam("path") String imagePath) {
        try {
            // Remove leading slash if present
            if (imagePath.startsWith("/")) {
                imagePath = imagePath.substring(1);
            }

            // Convert public URL to file path
            // /img/book/image.jpg -> front-end/public/img/book/image.jpg
            Path filePath = Paths.get("front-end/public/" + imagePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                System.out.println("✅ Image deleted successfully: " + imagePath);
                return ResponseEntity.ok("Image deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Image not found: " + imagePath);
            }

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * Validate folder name (security check)
     */
    private boolean isValidFolder(String folder) {
        return folder.equals("book") ||
                folder.equals("author") ||
                folder.equals("publisher") ||
                folder.equals("avatar") ||
                folder.equals("series");
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Image Upload Service is running");
    }
}
