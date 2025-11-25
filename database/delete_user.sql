-- Define the user ID to be deleted
SET @userId = 'YOUR_USER_ID_HERE';

-- 1. Delete Cart Items (depend on Cart)
DELETE FROM cart_item 
WHERE cart_id IN (SELECT id FROM cart WHERE user_id = @userId);

-- 2. Delete Cart (depends on User)
DELETE FROM cart 
WHERE user_id = @userId;

-- 3. Delete Order Items (depend on Order)
DELETE FROM order_item 
WHERE order_id IN (SELECT id FROM `order` WHERE user_id = @userId);

-- 4. Delete Payments (depend on Order)
DELETE FROM payment 
WHERE order_id IN (SELECT id FROM `order` WHERE user_id = @userId);

-- 5. Delete Orders (depends on User)
DELETE FROM `order` 
WHERE user_id = @userId;

-- 6. Delete Notifications (depends on User)
DELETE FROM notification 
WHERE user_id = @userId;

-- 7. Delete Reviews (depends on User)
DELETE FROM review 
WHERE user_id = @userId;

-- 8. Delete User Roles (depends on User)
DELETE FROM user_role 
WHERE user_id = @userId;

-- 9. Finally, Delete the User
DELETE FROM user 
WHERE id = @userId;
