# Staff Management System

## Overview

The Staff Management System allows staff members to manage books, series, categories, orders, reviews, and notifications without having full admin privileges.

## Features

### 1. Staff Profile Management

- **View Profile**: See personal information
- **Edit Profile**: Update full name, phone, email, gender, birth date, and avatar
- **Change Password**: Update password with validation

### 2. Product Management

Staff members have access to the same product management tools as admins:

- **Book Management**: Add, edit, delete books
- **Series Management**: Add, edit, delete book series
- **Category Management**: Add, edit, delete categories (main and subcategories)

### 3. Operations Management

- **Order Management**: View orders, update status, cancel orders
- **Review Management**: View and moderate customer reviews
- **Notification Management**: View system notifications

## Routes

### Staff Routes Structure

```
/staff
├── /my-account
│   ├── /personal-info (default)
│   └── /change-password
├── /books
├── /series
├── /categories
├── /orders
├── /reviews
└── /notifications
```

## Default Staff Account

**Username**: `staff`  
**Email**: `staff@bookverse.com`  
**Password**: `Staff123@`  
**Role**: `staff`

## Components Architecture

### Core Components

- `StaffLayout.tsx` - Main layout wrapper with sidebar navigation
- `StaffSidenav.tsx` - Sidebar navigation menu
- `StaffAccount.tsx` - Account settings wrapper
- `StaffProfile.tsx` - Profile management form
- `StaffChangePassword.tsx` - Password change form

### Shared Components (Reusable from Admin)

All management components are imported from the `Shared` folder, which wraps the admin components:

- `BookManagement.tsx` - Wraps Admin BookManagement
- `SeriesManagement.tsx` - Wraps Admin SeriesManagement
- `CateManagement.tsx` - Wraps Admin CateManagement
- `OrderManagement.tsx` - Wraps Admin OrderManagement
- `ManageReview.tsx` - Wraps Admin ManageReview
- `NotificationManagement.tsx` - Wraps Admin NotificationManagement

This approach ensures:
✅ **No Code Duplication**: Reuses existing admin components
✅ **Consistent Behavior**: Same functionality across admin and staff
✅ **Easy Maintenance**: Update once, applies to both admin and staff
✅ **Smaller Bundle Size**: No duplicated component code

## Usage

### Login as Staff

1. Go to `/signin`
2. Enter credentials:
   - Email/Username: `staff` or `staff@bookverse.com`
   - Password: `Staff123@`
3. You will be redirected to `/staff` dashboard

### Navigation

- Click on your avatar in the navbar to see "Staff Panel" option
- Use the sidebar to navigate between different management sections
- Your profile information is displayed at the top of the sidebar

### Managing Your Profile

1. Go to `/staff/my-account`
2. Click on "Personal Information" tab
3. Update your details:
   - Upload a new avatar (max 10MB)
   - Update full name, phone, email
   - Select gender
   - Set birth date
4. Click "Save Changes"

### Changing Password

1. Go to `/staff/my-account`
2. Click on "Change Password" tab
3. Enter:
   - Current password
   - New password (min 8 chars, must include uppercase, lowercase, number, special character)
   - Confirm new password
4. Click "Update Password"

### Managing Products

Navigate to the respective section and use the same interface as admin:

- **Add**: Click "Add [Item]" button
- **Edit**: Click edit icon (pencil) in actions column
- **Delete**: Click delete icon (trash) in actions column

### Managing Orders

1. Go to `/staff/orders`
2. View all customer orders
3. Click "View Details" to see order information
4. Click "Edit Status" to update order status
5. Click "Cancel Order" to cancel with a reason

### Managing Reviews

1. Go to `/staff/reviews`
2. View all customer reviews
3. Click delete icon to remove inappropriate reviews (requires reason)

### Viewing Notifications

1. Go to `/staff/notifications`
2. See all system notifications
3. Filter by type
4. Search by title/description

## Permissions

Staff members have the same permissions as admins for:

- ✅ Managing books, series, and categories
- ✅ Managing orders and reviews
- ✅ Viewing notifications

Staff members DO NOT have access to:

- ❌ Customer Management
- ❌ Staff Management
- ❌ Promotion Management
- ❌ Statistics Dashboard
- ❌ Admin Account settings

## Data Storage

All staff profile data is stored in `localStorage` under the `users` key, with the structure:

```json
{
  "username": "staff",
  "email": "staff@bookverse.com",
  "password": "Staff123@",
  "role": "staff",
  "fullName": "Staff Member",
  "phone": "0912345678",
  "gender": "not-specified",
  "birthDate": "1995-05-15",
  "avatarUrl": "base64_encoded_image_data"
}
```

Profile updates trigger the `staffProfileUpdated` event to refresh the sidebar.

## Technical Details

### Authentication Flow

1. User logs in with staff credentials
2. `AuthContext` stores user data with role="staff"
3. `SignIn` component redirects to `/staff` for staff users
4. `UserDropdown` shows "Staff Panel" link for staff users

### Profile Updates

1. User edits profile in `StaffProfile`
2. Data is saved to `users` array in localStorage
3. `staffProfileUpdated` event is dispatched
4. `StaffSidenav` listens for event and reloads profile data

### Password Management

1. User enters current and new passwords
2. System verifies current password against stored value
3. If valid, new password replaces old password in localStorage
4. Success message displayed

## Development

### Adding New Staff Features

1. Create component in `/components/Staff/`
2. Add route to `App.tsx` under `/staff` routes
3. Add navigation link to `StaffSidenav.tsx`

### Modifying Shared Components

- Edit the original admin component in `/components/Admin/`
- Changes will automatically apply to both admin and staff views

### Testing

Test with default staff account:

- Username: `staff`
- Password: `Staff123@`

Or create new staff accounts via Admin → Staff Management.
