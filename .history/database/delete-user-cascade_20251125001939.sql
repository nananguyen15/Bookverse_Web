-- ========================================
-- Script to DELETE USER with all related data (CASCADE)
-- ========================================
-- Usage: Replace 'USER_ID_HERE' or 'user@email.com' with actual values
-- 
-- Example 1: Delete by user ID
--   SET @user_id = '123e4567-e89b-12d3-a456-426614174000';
-- 
-- Example 2: Delete by email
--   SET @user_id = (SELECT id FROM user WHERE email = 'user@example.com');
--
-- Then run the DELETE statements below
-- ========================================

-- Step 1: Set the user ID you want to delete
-- Option A: Direct user ID
SET @user_id = 'USER_ID_HERE';

-- Option B: Find user ID by email (uncomment and replace email)
-- SET @user_id = (SELECT id FROM user WHERE email = 'user@email.com');

-- Option C: Find user ID by username (uncomment and replace username)
-- SET @user_id = (SELECT id FROM user WHERE username = 'username_here');

-- ========================================
-- VERIFY before deleting (IMPORTANT!)
-- ========================================
SELECT 'User to be deleted:' as action;
SELECT id, username, email, name, active FROM user WHERE id = @user_id;

SELECT 'Related data count:' as info;
SELECT 
    (SELECT COUNT(*) FROM cart WHERE user_id = @user_id) as carts,
    (SELECT COUNT(*) FROM cart_item ci JOIN cart c ON ci.cart_id = c.id WHERE c.user_id = @user_id) as cart_items,
    (SELECT COUNT(*) FROM `order` WHERE user_id = @user_id) as orders,
    (SELECT COUNT(*) FROM order_item oi JOIN `order` o ON oi.order_id = o.id WHERE o.user_id = @user_id) as order_items,
    (SELECT COUNT(*) FROM review WHERE user_id = @user_id) as reviews,
    (SELECT COUNT(*) FROM notification WHERE user_id = @user_id) as notifications,
    (SELECT COUNT(*) FROM otp_token WHERE user_id = @user_id) as otp_tokens,
    (SELECT COUNT(*) FROM user_role WHERE user_id = @user_id) as user_roles;

-- ========================================
-- DELETE CASCADE (Uncomment when ready)
-- WARNING: This will permanently delete data!
-- ========================================

-- Step 1: Delete cart_items (child of cart)
-- DELETE ci FROM cart_item ci 
-- JOIN cart c ON ci.cart_id = c.id 
-- WHERE c.user_id = @user_id;

-- Step 2: Delete carts
-- DELETE FROM cart WHERE user_id = @user_id;

-- Step 3: Delete order_items (child of order)
-- DELETE oi FROM order_item oi 
-- JOIN `order` o ON oi.order_id = o.id 
-- WHERE o.user_id = @user_id;

-- Step 4: Delete orders
-- DELETE FROM `order` WHERE user_id = @user_id;

-- Step 5: Delete reviews
-- DELETE FROM review WHERE user_id = @user_id;

-- Step 6: Delete notifications
-- DELETE FROM notification WHERE user_id = @user_id;

-- Step 7: Delete otp_tokens (already has ON DELETE CASCADE, but included for completeness)
-- DELETE FROM otp_token WHERE user_id = @user_id;

-- Step 8: Delete user_roles
-- DELETE FROM user_role WHERE user_id = @user_id;

-- Step 9: Finally, delete the user
-- DELETE FROM user WHERE id = @user_id;

-- ========================================
-- Verify deletion
-- ========================================
-- SELECT 'User deleted successfully!' as result;
-- SELECT COUNT(*) as remaining_users FROM user WHERE id = @user_id;


-- ========================================
-- QUICK DELETE (All in one - USE WITH CAUTION!)
-- ========================================
-- Uncomment the block below to delete everything at once
-- Replace 'USER_EMAIL_HERE' with actual email

/*
START TRANSACTION;

SET @user_id = (SELECT id FROM user WHERE email = 'USER_EMAIL_HERE');

DELETE ci FROM cart_item ci JOIN cart c ON ci.cart_id = c.id WHERE c.user_id = @user_id;
DELETE FROM cart WHERE user_id = @user_id;
DELETE oi FROM order_item oi JOIN `order` o ON oi.order_id = o.id WHERE o.user_id = @user_id;
DELETE FROM `order` WHERE user_id = @user_id;
DELETE FROM review WHERE user_id = @user_id;
DELETE FROM notification WHERE user_id = @user_id;
DELETE FROM otp_token WHERE user_id = @user_id;
DELETE FROM user_role WHERE user_id = @user_id;
DELETE FROM user WHERE id = @user_id;

COMMIT;
-- Or ROLLBACK; if you want to undo
*/


-- ========================================
-- DELETE MULTIPLE USERS by condition
-- ========================================
-- Example: Delete all inactive users with no orders

/*
START TRANSACTION;

-- Create temporary table with user IDs to delete
CREATE TEMPORARY TABLE users_to_delete AS
SELECT id FROM user 
WHERE active = 0 
AND id NOT IN (SELECT DISTINCT user_id FROM `order`);

-- Delete related data
DELETE ci FROM cart_item ci 
JOIN cart c ON ci.cart_id = c.id 
WHERE c.user_id IN (SELECT id FROM users_to_delete);

DELETE FROM cart WHERE user_id IN (SELECT id FROM users_to_delete);
DELETE FROM review WHERE user_id IN (SELECT id FROM users_to_delete);
DELETE FROM notification WHERE user_id IN (SELECT id FROM users_to_delete);
DELETE FROM otp_token WHERE user_id IN (SELECT id FROM users_to_delete);
DELETE FROM user_role WHERE user_id IN (SELECT id FROM users_to_delete);
DELETE FROM user WHERE id IN (SELECT id FROM users_to_delete);

DROP TEMPORARY TABLE users_to_delete;

COMMIT;
-- Or ROLLBACK;
*/
