-- ============================================
-- Update all image paths from /src/assets/img/ to /img/
-- Run this script to migrate to new public folder structure
-- ============================================

USE bookverse;

-- Show current data before update
SELECT '=== BEFORE UPDATE ===' as 'Status';

-- Preview Users table
SELECT 
    id, 
    username,
    image as 'Current Image Path'
FROM users 
WHERE image LIKE '%/src/assets/img/%' OR image LIKE '%src/assets/img/%'
LIMIT 10;

-- Preview Books table  
SELECT 
    id,
    title,
    image as 'Current Image Path'
FROM books
WHERE image LIKE '%/src/assets/img/%' OR image LIKE '%src/assets/img/%'
LIMIT 10;

-- Preview Authors table
SELECT 
    id,
    name,
    image as 'Current Image Path'
FROM authors
WHERE image LIKE '%/src/assets/img/%' OR image LIKE '%src/assets/img/%'
LIMIT 10;

-- Preview Publishers table
SELECT 
    id,
    name,
    image as 'Current Image Path'
FROM publishers
WHERE image LIKE '%/src/assets/img/%' OR image LIKE '%src/assets/img/%'
LIMIT 10;

-- ============================================
-- ACTUAL UPDATES
-- ============================================

-- Update Users table
UPDATE users
SET image = REPLACE(image, '/src/assets/img/', '/img/')
WHERE image LIKE '%/src/assets/img/%';

UPDATE users
SET image = CONCAT('/', REPLACE(image, 'src/assets/img/', 'img/'))
WHERE image LIKE 'src/assets/img/%' AND image NOT LIKE '/%';

-- Update Books table
UPDATE books
SET image = REPLACE(image, '/src/assets/img/', '/img/')
WHERE image LIKE '%/src/assets/img/%';

UPDATE books
SET image = CONCAT('/', REPLACE(image, 'src/assets/img/', 'img/'))
WHERE image LIKE 'src/assets/img/%' AND image NOT LIKE '/%';

-- Update Authors table
UPDATE authors
SET image = REPLACE(image, '/src/assets/img/', '/img/')
WHERE image LIKE '%/src/assets/img/%';

UPDATE authors
SET image = CONCAT('/', REPLACE(image, 'src/assets/img/', 'img/'))
WHERE image LIKE 'src/assets/img/%' AND image NOT LIKE '/%';

-- Update Publishers table
UPDATE publishers
SET image = REPLACE(image, '/src/assets/img/', '/img/')
WHERE image LIKE '%/src/assets/img/%';

UPDATE publishers
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

-- Verify Users table
SELECT 
    COUNT(*) as 'Total Users',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Using /img/ path',
    SUM(CASE WHEN image LIKE '%/src/assets/img/%' THEN 1 ELSE 0 END) as 'Still using old path'
FROM users
WHERE image IS NOT NULL;

-- Verify Books table
SELECT 
    COUNT(*) as 'Total Books',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Using /img/ path',
    SUM(CASE WHEN image LIKE '%/src/assets/img/%' THEN 1 ELSE 0 END) as 'Still using old path'
FROM books
WHERE image IS NOT NULL;

-- Verify Authors table
SELECT 
    COUNT(*) as 'Total Authors',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Using /img/ path',
    SUM(CASE WHEN image LIKE '%/src/assets/img/%' THEN 1 ELSE 0 END) as 'Still using old path'
FROM authors
WHERE image IS NOT NULL;

-- Verify Publishers table
SELECT 
    COUNT(*) as 'Total Publishers',
    SUM(CASE WHEN image LIKE '/img/%' THEN 1 ELSE 0 END) as 'Using /img/ path',
    SUM(CASE WHEN image LIKE '%/src/assets/img/%' THEN 1 ELSE 0 END) as 'Still using old path'
FROM publishers
WHERE image IS NOT NULL;

SELECT '=== MIGRATION COMPLETED ===' as 'Status';
