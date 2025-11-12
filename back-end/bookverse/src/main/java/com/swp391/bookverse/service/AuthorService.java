package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.request.AuthorCreationRequest;
import com.swp391.bookverse.dto.request.AuthorUpdateRequest;
import com.swp391.bookverse.dto.request.UserUpdateRequest;
import com.swp391.bookverse.dto.response.AuthorResponse;
import com.swp391.bookverse.dto.response.BookResponse;
import com.swp391.bookverse.dto.response.UserResponse;
import com.swp391.bookverse.dto.response.AuthorActiveResponse;
import com.swp391.bookverse.entity.Author;
import com.swp391.bookverse.entity.Book;
import com.swp391.bookverse.entity.User;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.AuthorMapper;
import com.swp391.bookverse.repository.AuthorRepository;
import com.swp391.bookverse.repository.BookRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

/**
 * @Author huangdat
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthorService {
    AuthorRepository authorRepository;
    AuthorMapper authorMapper;
    BookRepository bookRepository;

    /**
     * Create a new author based on the provided request
     * @param request the author creation request containing author details
     * @return the created Author entity
     */
    public Author createAuthor(AuthorCreationRequest request) {
        // make sure the name of author in request object is not already taken. Stop the process if it is.
        if(authorRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.AUTHOR_EXISTS);
        }
        // Create a new Author entity
        Author author = authorMapper.toAuthor(request);
        // Save the author to the repository and return the saved entity
        return authorRepository.save(author);
    }

    /**
     * Create a new author with multipart file support
     * @param name the name of the author
     * @param bio the biography of the author
     * @param imageFile the image file to upload (optional)
     * @param imageUrl the image URL if not uploading a file (optional)
     * @param active whether the author is active
     * @return the created Author entity
     */
    public Author createAuthor(String name, String bio, MultipartFile imageFile, String imageUrl, boolean active) {
        // Check if author name already exists
        if(authorRepository.existsByName(name)) {
            throw new AppException(ErrorCode.AUTHOR_EXISTS);
        }
        
        // Handle image upload or URL
        String imagePath = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imagePath = handleImageUpload(imageFile, "author");
        } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            imagePath = imageUrl.trim();
        }
        
        // Create new Author entity
        Author author = new Author();
        author.setName(name);
        author.setBio(bio);
        author.setImage(imagePath);
        author.setActive(active);
        
        return authorRepository.save(author);
    }

    /**
     * Handle image file upload
     * @param imageFile the multipart file to upload
     * @param folder the folder to save the image in (e.g., "author", "book")
     * @return the relative path to the uploaded image
     */
    private String handleImageUpload(MultipartFile imageFile, String folder) {
        try {
            // Validate file type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new AppException(ErrorCode.INVALID_FILE_TYPE);
            }
            
            // Validate file size (max 5MB)
            long maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (imageFile.getSize() > maxSize) {
                throw new AppException(ErrorCode.FILE_TOO_LARGE);
            }
            
            // Get original filename and create a unique filename
            String originalFilename = imageFile.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                throw new AppException(ErrorCode.INVALID_FILE_NAME);
            }
            
            // Extract file extension
            String fileExtension = "";
            int lastDotIndex = originalFilename.lastIndexOf('.');
            if (lastDotIndex > 0) {
                fileExtension = originalFilename.substring(lastDotIndex);
            }
            
            // Create unique filename with timestamp
            String timestamp = String.valueOf(System.currentTimeMillis());
            String cleanFilename = originalFilename.substring(0, lastDotIndex > 0 ? lastDotIndex : originalFilename.length())
                    .replaceAll("[^a-zA-Z0-9]", "-");
            String uniqueFilename = timestamp + "-" + cleanFilename + fileExtension;
            
            // Determine the upload directory
            String projectRoot = System.getProperty("user.dir");
            // Remove the back-end path if present to get the project root
            projectRoot = projectRoot.replace("\\back-end\\bookverse", "");
            String uploadDir = projectRoot + "/front-end/public/img/" + folder;
            
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Save the file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return the relative path for storing in database
            return "/img/" + folder + "/" + uniqueFilename;
            
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    /**
     * Fetches all authors from the system.
     * @return List<AuthorResponse> a list of all authors
     */
    public List<AuthorResponse> getAuthors() {
        // throw exception if there are no author entity store in DB
        if (authorRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_AUTHORS_STORED);
        }

        // transfer list of Author to list of AuthorResponse
        List<Author> authors = authorRepository.findAll();
        List<AuthorResponse> authorsResponses = new ArrayList<>(authors.size());
        for (int i = 0; i < authors.size(); i++) {
            authorsResponses.add(authorMapper.toAuthorResponse(authors.get(i)));
        }
        // Fetch all users from the repository
        return authorsResponses;
    }

    /**
     * Get author by ID
     * @param authorId the ID of the author to retrieve
     * @return AuthorResponse the response object containing author details
     */
    public AuthorResponse getAuthorById(String authorId) {
        Author author = authorRepository.findById(Long.parseLong(authorId)).orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));
        return authorMapper.toAuthorResponse(author);
    }

    public AuthorResponse updateAuthor(Long id, AuthorUpdateRequest request) {
        // fetch existing author from DB by ID. Throw exception if not found
        Author existingAuthor = authorRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));
        authorMapper.updateAuthor(request, existingAuthor);
        return authorMapper.toAuthorResponse(authorRepository.save(existingAuthor));
    }

    /**
     * Update an existing author with multipart file support
     * @param authorId the ID of the author to update
     * @param name the name of the author (optional)
     * @param bio the biography of the author (optional)
     * @param imageFile the image file to upload (optional)
     * @param imageUrl the image URL if not uploading a file (optional)
     * @param active whether the author is active (optional)
     * @return the updated AuthorResponse
     */
    public AuthorResponse updateAuthor(Long authorId, String name, String bio, MultipartFile imageFile, String imageUrl, Boolean active) {
        // Fetch existing author from DB by ID. Throw exception if not found
        Author existingAuthor = authorRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));
        
        // Update fields if provided
        if (name != null && !name.trim().isEmpty()) {
            // Check if new name already exists (and it's not the current author's name)
            if (!name.equals(existingAuthor.getName()) && authorRepository.existsByName(name)) {
                throw new AppException(ErrorCode.AUTHOR_EXISTS);
            }
            existingAuthor.setName(name.trim());
        }
        
        if (bio != null) {
            existingAuthor.setBio(bio);
        }
        
        // Handle image update
        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = handleImageUpload(imageFile, "author");
            existingAuthor.setImage(imagePath);
        } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            existingAuthor.setImage(imageUrl.trim());
        }
        
        if (active != null) {
            existingAuthor.setActive(active);
        }
        
        Author updatedAuthor = authorRepository.save(existingAuthor);
        return authorMapper.toAuthorResponse(updatedAuthor);
    }

    /**
     * Change the active status of an author by ID
     * @param isActive new active status
     * @param authorId author ID
     * @return AuthorActiveResponse with updated status
     */
    public AuthorActiveResponse changeActiveAuthorById(Boolean isActive, Long authorId) {
        Author existingAuthor = authorRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));
        
        existingAuthor.setActive(isActive);
        authorRepository.save(existingAuthor);
        
        return AuthorActiveResponse.builder()
                .id(existingAuthor.getId())
                .name(existingAuthor.getName())
                .active(existingAuthor.getActive())
                .build();
    }

    public List<AuthorResponse> getActiveAuthors() {
        // throw exception if there are no active authors stored in DB
        if (authorRepository.countByActiveTrue() == 0) {
            throw new AppException(ErrorCode.NO_AUTHORS_STORED);
        }
        // transfer list of active Author to list of AuthorResponse
        List<Author> activeAuthors = authorRepository.findByActiveTrue();
        List<AuthorResponse> activeAuthorResponses = new ArrayList<>(activeAuthors.size());
        for (int i = 0; i < activeAuthors.size(); i++) {
            activeAuthorResponses.add(authorMapper.toAuthorResponse(activeAuthors.get(i)));
        }
        return activeAuthorResponses;
    }

    public List<AuthorResponse> getInactiveAuthors() {
        // throw exception if there are no inactive authors stored in DB
        if (authorRepository.countByActiveFalse() == 0) {
            throw new AppException(ErrorCode.NO_AUTHORS_STORED);
        }
        // transfer list of inactive Author to list of AuthorResponse
        List<Author> inactiveAuthors = authorRepository.findByActiveFalse();
        List<AuthorResponse> inactiveAuthorResponses = new ArrayList<>(inactiveAuthors.size());
        for (int i = 0; i < inactiveAuthors.size(); i++) {
            inactiveAuthorResponses.add(authorMapper.toAuthorResponse(inactiveAuthors.get(i)));
        }
        return inactiveAuthorResponses;
    }

    public List<AuthorResponse> searchAuthors(String keyword) {
        List<Author> authors = authorRepository.findByNameContainingIgnoreCase(keyword);
        List<AuthorResponse> authorResponses = new ArrayList<>(authors.size());
        for (int i = 0; i < authors.size(); i++) {
            authorResponses.add(authorMapper.toAuthorResponse(authors.get(i)));
        }
        return authorResponses;
    }

    public List<BookResponse> getBooksByAuthorId(String authorId) {
        // ensure author exists
        Author author = authorRepository.findById(Long.parseLong(authorId))
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        // fetch books by author id
        List<Book> books = bookRepository.findByAuthorId(author.getId());

        if (books == null || books.isEmpty()) {
            throw new AppException(ErrorCode.NO_BOOKS_STORED);
        }

        List<BookResponse> bookResponses = new ArrayList<>(books.size());
        for (Book book : books) {
            BookResponse br = BookResponse.builder()
                    .id(book.getId())
                    .title(book.getTitle())
                    .description(book.getDescription())
                    .price(book.getPrice())
                    .publishedDate(book.getPublishedDate())
                    .active(book.getActive())
                    .image(book.getImage())
                    .stockQuantity(book.getStockQuantity())
                    .authorId(book.getAuthor() != null ? book.getAuthor().getId() : null)
                    .publisherId(book.getPublisher() != null ? book.getPublisher().getId() : null)
                    .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                    .build();
            bookResponses.add(br);
        }
        return bookResponses;
    }
}
