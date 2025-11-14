package com.swp391.bookverse.controller;

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
 */
@CrossOrigin
@RestController
@RequestMapping("/api/upload")
public class ImageUploadController {

    // Upload directory - save to frontend's public/img folder
    // This allows Vite to serve images directly via /img/ URL
    private static final String UPLOAD_DIR = "front-end/public/img/";

    /**
     * Upload an image file
     * 
     * @param file   The image file to upload
     * @param folder The folder to save in (book, author, publisher, avatar, series)
     * @return The public URL path of the uploaded image
     */
    @PostMapping("/image")
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder) {

        try {
            // 1. Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // 2. Validate folder
            if (!isValidFolder(folder)) {
                return ResponseEntity.badRequest().body("Invalid folder: " + folder);
            }

            // 3. Get original filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid filename");
            }

            // 4. Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("File must be an image");
            }

            // 5. Validate file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size must be less than 5MB");
            }

            // 6. Generate unique filename
            String timestamp = String.valueOf(System.currentTimeMillis());
            String cleanFilename = originalFilename.toLowerCase()
                    .replaceAll("[^a-z0-9.]", "-")
                    .replaceAll("-+", "-");
            String filename = timestamp + "-" + cleanFilename;

            // 7. Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR + folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 8. Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 9. Generate public URL for frontend display
            String publicUrl = "/img/" + folder + "/" + filename;

            // 10. Generate DB path (what backend stores in database)
            String dbPath = "/src/assets/img/" + folder + "/" + filename;

            // Log successful upload
            System.out.println("✅ Image uploaded successfully: " + publicUrl);
            System.out.println("💾 Save to DB: " + dbPath);
            System.out.println("📁 Saved to: " + filePath.toAbsolutePath());

            // Return DB path (what should be saved to database)
            return ResponseEntity.ok(dbPath);

        } catch (IOException e) {
            System.err.println("❌ Upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    /**
     * Validate folder name
     */
    private boolean isValidFolder(String folder) {
        return folder.equals("book") || 
               folder.equals("author") || 
               folder.equals("publisher") || 
               folder.equals("avatar") || 
               folder.equals("series");
    }
}
