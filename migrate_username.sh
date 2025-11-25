#!/bin/bash
# Database Migration Script for Review userName
# This script adds user_name column and populates it

echo "=== Review userName Migration Script ==="
echo ""
echo "This will:"
echo "1. Add user_name column to review table"
echo "2. Populate it with usernames from user table"
echo ""
echo "Enter your MySQL password when prompted"
echo ""

# Run the migration
mysql -u root -p book_store <<EOF
-- Add userName column if it doesn't exist
ALTER TABLE review 
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);

-- Populate userName for ALL existing reviews
UPDATE review r
INNER JOIN user u ON r.user_id = u.id
SET r.user_name = u.username
WHERE r.user_name IS NULL OR r.user_name = '';

-- Show result
SELECT 
    r.id,
    r.user_name,
    u.username AS actual_username,
    CASE 
        WHEN r.user_name = u.username THEN '✓ OK'
        WHEN r.user_name IS NULL THEN '✗ NULL'
        ELSE '✗ MISMATCH'
    END AS status
FROM review r
LEFT JOIN user u ON r.user_id = u.id
ORDER BY r.id DESC
LIMIT 10;

SELECT COUNT(*) AS total_reviews, 
       SUM(CASE WHEN user_name IS NOT NULL THEN 1 ELSE 0 END) AS with_username,
       SUM(CASE WHEN user_name IS NULL THEN 1 ELSE 0 END) AS null_username
FROM review;
EOF

echo ""
echo "=== Migration Complete! ==="
echo "Please restart the backend server and refresh your browser."
