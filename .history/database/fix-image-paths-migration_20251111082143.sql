-- ============================================
-- Migration Script: Fix Image Path Format
-- Purpose: Convert backend source paths to frontend public URLs
-- From: /src/assets/img/... 
-- To: /img/...
-- Date: November 11, 2025
-- ============================================

-- Backup tables before migration (optional but recommended)
-- CREATE TABLE book_backup AS SELECT * FROM book;
-- CREATE TABLE author_backup AS SELECT * FROM author;
-- CREATE TABLE publisher_backup AS SELECT * FROM publisher;
-- CREATE TABLE user_backup AS SELECT * FROM user;

-- ============================================
-- 1. Fix BOOK table image paths
-- ============================================
UPDATE book 
SET image = REPLACE(image, '/src/assets', '') 
WHERE image LIKE '/src/assets/%';

-- Verify book updates
SELECT 
    id, 
    title, 
    image as 'Updated Image Path'
FROM book 
WHERE image LIKE '/img/%' 
LIMIT 10;

-- ============================================
-- 2. Fix AUTHOR table image paths
-- ============================================
UPDATE author 
SET image = REPLACE(image, '/src/assets', '') 
WHERE image LIKE '/src/assets/%';

-- Verify author updates
SELECT 
    id, 
    name, 
    image as 'Updated Image Path'
FROM author 
WHERE image LIKE '/img/%' 
LIMIT 10;

-- ============================================
-- 3. Fix PUBLISHER table image paths
-- ============================================
UPDATE publisher 
SET image = REPLACE(image, '/src/assets', '') 
WHERE image LIKE '/src/assets/%';

-- Verify publisher updates
SELECT 
    id, 
    name, 
    image as 'Updated Image Path'
FROM publisher 
WHERE image LIKE '/img/%' 
LIMIT 10;

-- ============================================
-- 4. Fix USER table image paths (Customer & Staff avatars)
-- ============================================
UPDATE user 
SET image = REPLACE(image, '/src/assets', '') 
WHERE image LIKE '/src/assets/%';

-- Verify user updates
SELECT 
    id, 
    full_name, 
    role,
    image as 'Updated Image Path'
FROM user 
WHERE image LIKE '/img/%' 
LIMIT 10;

-- ============================================
-- 5. Fix SERIES table image paths (if exists)
-- ============================================
-- Uncomment if you have a series table
-- UPDATE series 
-- SET image = REPLACE(image, '/src/assets', '') 
-- WHERE image LIKE '/src/assets/%';

-- ============================================
-- Summary Report
-- ============================================
SELECT 'Migration Summary' as 'Report';

SELECT 
    'BOOK' as 'Table',
    COUNT(*) as 'Total Records',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Fixed Paths',
    SUM(CASE WHEN image LIKE '/src/assets/%' THEN 1 ELSE 0 END) as 'Old Paths Remaining',
    SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) as 'No Image'
FROM book
UNION ALL
SELECT 
    'AUTHOR' as 'Table',
    COUNT(*) as 'Total Records',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Fixed Paths',
    SUM(CASE WHEN image LIKE '/src/assets/%' THEN 1 ELSE 0 END) as 'Old Paths Remaining',
    SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) as 'No Image'
FROM author
UNION ALL
SELECT 
    'PUBLISHER' as 'Table',
    COUNT(*) as 'Total Records',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Fixed Paths',
    SUM(CASE WHEN image LIKE '/src/assets/%' THEN 1 ELSE 0 END) as 'Old Paths Remaining',
    SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) as 'No Image'
FROM publisher
UNION ALL
SELECT 
    'USER' as 'Table',
    COUNT(*) as 'Total Records',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Fixed Paths',
    SUM(CASE WHEN image LIKE '/src/assets/%' THEN 1 ELSE 0 END) as 'Old Paths Remaining',
    SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) as 'No Image'
FROM user;

-- ============================================
-- Verification Queries
-- ============================================

-- Check if any old paths remain (should return 0 rows)
SELECT 'Books with old paths' as 'Check', COUNT(*) as 'Count' FROM book WHERE image LIKE '/src/assets/%'
UNION ALL
SELECT 'Authors with old paths', COUNT(*) FROM author WHERE image LIKE '/src/assets/%'
UNION ALL
SELECT 'Publishers with old paths', COUNT(*) FROM publisher WHERE image LIKE '/src/assets/%'
UNION ALL
SELECT 'Users with old paths', COUNT(*) FROM user WHERE image LIKE '/src/assets/%';

-- Sample of fixed records
SELECT 'Sample Fixed Book Records' as 'Sample';
SELECT id, title, image FROM book WHERE image IS NOT NULL AND image != '' LIMIT 5;

SELECT 'Sample Fixed Author Records' as 'Sample';
SELECT id, name, image FROM author WHERE image IS NOT NULL AND image != '' LIMIT 5;

SELECT 'Sample Fixed Publisher Records' as 'Sample';
SELECT id, name, image FROM publisher WHERE image IS NOT NULL AND image != '' LIMIT 5;

-- ============================================
-- Rollback Instructions (if needed)
-- ============================================
-- If you created backup tables and need to rollback:
-- 
-- UPDATE book b 
-- INNER JOIN book_backup bb ON b.id = bb.id 
-- SET b.image = bb.image;
-- 
-- UPDATE author a 
-- INNER JOIN author_backup ab ON a.id = ab.id 
-- SET a.image = ab.image;
-- 
-- UPDATE publisher p 
-- INNER JOIN publisher_backup pb ON p.id = pb.id 
-- SET p.image = pb.image;
-- 
-- UPDATE user u 
-- INNER JOIN user_backup ub ON u.id = ub.id 
-- SET u.image = ub.image;
