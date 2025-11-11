package com.swp391.bookverse.exception;

/**
 * @Author huangdat
 */

public enum ErrorCode {
    // Standard HTTP error codes
    OK(200, "OK"),
    BAD_REQUEST(400, "Bad Request"),
    UNAUTHORIZED(401, "Unauthorized error"),
    FORBIDDEN(403, "Forbidden"),
    NOT_FOUND(404, "Not Found"),
    METHOD_NOT_ALLOWED(405, "Method Not Allowed"),
    CONFLICT(409, "Conflict"),
    INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
    SERVICE_UNAVAILABLE(503, "Service Unavailable"),

    // Custom error codes for the application
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception occurred"),
    USER_EXISTS(1001, "User already exists"),
    USER_NOT_FOUND(1002, "User not found"),
    NO_USERS_STORED(1003, "No users stored in database"),
    EMAIL_ALREADY_EXISTS(1010, "Email already exists"),
    SAME_OLD_NEW_PASSWORD(1012, "New password must be different from old password"),

    // Validation error codes for user entity
    USERNAME_INVALID(1004, "Username must be at least 3 characters long"),
    PASSWORD_INVALID(1005, "Password must be 8-16 characters long, including at least one uppercase letter, one lowercase letter, and one digit"),
    NAME_INVALID(1006, "Name must be at least 3 characters long"),
    EMAIL_INVALID(1007, "Invalid email address"),
    BIRTH_DATE_INVALID(1008, "Birth date must be in the past"),
    ROLE_NOT_FOUND(1009, "Role not found"),
    INVALID_OLD_PASSWORD(1011, "Old password is incorrect"),

    // Custom error codes for author entity
    AUTHOR_EXISTS(2001, "Author already exists"),
    AUTHOR_NOT_FOUND(2002, "Author not found"),
    NO_AUTHORS_STORED(2003, "No authors stored in database"),

    // Custom error codes for book entity
    BOOK_EXISTS(3001, "Book already exists"),
    BOOK_NOT_FOUND(3002, "Book not found"),
    NO_BOOKS_STORED(3003, "No books stored in database"),

    // Custom error codes for publisher entity
    PUBLISHER_EXISTS(4001, "PublisherController already exists"),
    PUBLISHER_NOT_FOUND(4002, "PublisherController not found"),
    NO_PUBLISHERS_STORED(4003, "No publishers stored in database"),

    // Custom error codes for category entity
    CATEGORY_EXISTS(5001, "Category already exists"),
    CATEGORY_NOT_FOUND(5002, "Category not found"),
    NO_CATEGORIES_STORED(5003, "No categories stored in database"),

    // Custom error codes for sub-category entity
    SUBCATEGORY_EXISTS(6001, "Sub-category already exists"),
    SUBCATEGORY_NOT_FOUND(6002, "Sub-category not found"),
    NO_SUBCATEGORIES_STORED(6003, "No sub-categories stored in database"),

    // custom error codes for sup-category entity
    SUP_CATEGORY_EXISTS(7001, "Sup-category already exists"),
    SUP_CATEGORY_NOT_FOUND(7002, "Sup-category not found"),
    NO_SUP_CATEGORIES_STORED(7003, "No sup-categories stored in database"),

    // custom error codes for cart entity
    CART_NOT_FOUND(8001, "Cart not found"),
    CART_ITEM_NOT_FOUND(8002, "Cart item not found"),
    NO_CARTS_STORED(8003, "No carts stored in database"),
    EXCEED_STOCK(8004, "Requested quantity exceeds available stock"),
    PRODUCT_OUT_OF_STOCK(8005, "Product is out of stock"),
    QUANTITY_INVALID(8006, "Quantity must be at least 1"),

    // custom error codes for review entity
    REVIEW_ALREADY_EXISTS(9001, "Review already exists for this user and book"),
    REVIEW_NOT_FOUND(9002, "Review not found"),

    INVALID_KEY(99999, "Invalid message key provided")
    ;

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

}
