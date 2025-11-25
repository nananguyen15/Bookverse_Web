-- Review userName Migration for book_store database
-- Copy and paste this entire script into your MySQL client
USE book_store;
-- Step 1: Add user_name column
ALTER TABLE review
    ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
-- Step 2: Populate userName from user table
UPDATE review r
    INNER JOIN user u ON r.user_id = u.id
SET r.user_name = u.username
WHERE r.user_name IS NULL OR r.user_name = '';
-- Step 3: Verify results
SELECT
    r.id,
    r.user_name,
    u.username,
    CASE
        WHEN r.user_name = u.username THEN '✓ OK'
        WHEN r.user_name IS NULL THEN '✗ NULL'
        ELSE '✗ MISMATCH'
        END AS status,
    SUBSTR(r.comment, 1, 40) AS comment_preview
FROM review r
         LEFT JOIN user u ON r.user_id = u.id
ORDER BY r.id DESC
LIMIT 15;
-- Step 4: Count summary
SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN user_name IS NOT NULL THEN 1 ELSE 0 END) AS with_username,
    SUM(CASE WHEN user_name IS NULL THEN 1 ELSE 0 END) AS missing_username
FROM review;