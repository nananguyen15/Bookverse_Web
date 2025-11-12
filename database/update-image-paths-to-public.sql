-- ============================================
-- Update all image paths from /src/assets/img/ to /img/
-- Run this script to migrate to new public folder structure
-- ============================================

USE book_store;

-- Show current data before update
SELECT '=== BEFORE UPDATE ===' as 'Status';

-- Preview user table
SELECT 
    id, 
    username,
    image as 'Current Image Path'
FROM user 
WHERE image LIKE '%/src/assets/img/%' OR image LIKE '%src/assets/img/%'
LIMIT 10;

-- Preview book table  
SELECT 
    id,
    title,
    image as 'Current Image Path'
FROM book
WHERE image LIKE '%/src/assets/img/%' OR image LIKE '%src/assets/img/%'
LIMIT 10;

-- Preview author table
SELECT 
    id,
    name,
    image as 'Current Image Path'
FROM author
WHERE image LIKE '%/src/assets/img/%' OR image LIKE '%src/assets/img/%'
LIMIT 10;

-- Preview publisher table
SELECT 
    id,
    name,
    image as 'Current Image Path'
FROM publisher
WHERE image LIKE '%/src/assets/img/%' OR image LIKE '%src/assets/img/%'
LIMIT 10;

-- ============================================
-- ACTUAL UPDATES
-- ============================================

-- Update user table
UPDATE user
SET image = REPLACE(image, '/src/assets/img/', '/img/')
WHERE image LIKE '%/src/assets/img/%';

UPDATE user
SET image = CONCAT('/', REPLACE(image, 'src/assets/img/', 'img/'))
WHERE image LIKE 'src/assets/img/%' AND image NOT LIKE '/%';

-- Update book table
UPDATE book
SET image = REPLACE(image, '/src/assets/img/', '/img/')
WHERE image LIKE '%/src/assets/img/%';

UPDATE book
SET image = CONCAT('/', REPLACE(image, 'src/assets/img/', 'img/'))
WHERE image LIKE 'src/assets/img/%' AND image NOT LIKE '/%';

-- Update author table
UPDATE author
SET image = REPLACE(image, '/src/assets/img/', '/img/')
WHERE image LIKE '%/src/assets/img/%';

UPDATE author
SET image = CONCAT('/', REPLACE(image, 'src/assets/img/', 'img/'))
WHERE image LIKE 'src/assets/img/%' AND image NOT LIKE '/%';

-- Update publisher table
UPDATE publisher
SET image = REPLACE(image, '/src/assets/img/', '/img/')
WHERE image LIKE '%/src/assets/img/%';

UPDATE publisher
SET image = CONCAT('/', REPLACE(image, 'src/assets/img/', 'img/'))
WHERE image LIKE 'src/assets/img/%' AND image NOT LIKE '/%';

-- Update Series table (if exists)
UPDATE series
SET image = REPLACE(image, '/src/assets/img/', '/img/')
WHERE image LIKE '%/src/assets/img/%';

UPDATE series
SET image = CONCAT('/', REPLACE(image, 'src/assets/img/', 'img/'))
WHERE image LIKE 'src/assets/img/%' AND image NOT LIKE '/%';

-- ============================================
-- Show updated data
-- ============================================

SELECT '=== AFTER UPDATE ===' as 'Status';

-- Verify user table
SELECT 
    COUNT(*) as 'Total user',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Using /img/ path',
    SUM(CASE WHEN image LIKE '%/src/assets/img/%' THEN 1 ELSE 0 END) as 'Still using old path'
FROM user
WHERE image IS NOT NULL;

-- Verify book table
SELECT 
    COUNT(*) as 'Total book',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Using /img/ path',
    SUM(CASE WHEN image LIKE '%/src/assets/img/%' THEN 1 ELSE 0 END) as 'Still using old path'
FROM book
WHERE image IS NOT NULL;

-- Verify author table
SELECT 
    COUNT(*) as 'Total author',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Using /img/ path',
    SUM(CASE WHEN image LIKE '%/src/assets/img/%' THEN 1 ELSE 0 END) as 'Still using old path'
FROM author
WHERE image IS NOT NULL;

-- Verify publisher table
SELECT 
    COUNT(*) as 'Total publisher',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Using /img/ path',
    SUM(CASE WHEN image LIKE '%/src/assets/img/%' THEN 1 ELSE 0 END) as 'Still using old path'
FROM publisher
WHERE image IS NOT NULL;

SELECT '=== MIGRATION COMPLETED ===' as 'Status';
