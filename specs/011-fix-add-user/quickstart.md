# Quickstart: Fix Add User Functionality

## Prerequisites

- Backend running: `cd apps/backend && php artisan serve`
- Frontend running: `cd apps/frontend && npm run dev`
- Database migrated and seeded: `cd apps/backend && php artisan migrate --seed`

## Validation Scenarios

### Scenario 1: Successful User Creation

1. Log in as admin (admin@afp.mil.ph / admin123)
2. Navigate to User Management page
3. Click "Add User"
4. Fill in: name, email, password, role, department
5. Click Save
6. Verify: success notification, user list refreshes, new user appears

### Scenario 2: Meaningful Error Messages

1. Log in and open Add User dialog
2. Leave email blank, submit
3. Verify: "Validation failed" or "The email field is required" is shown (not "Invalid username or password")
4. Enter a duplicate email address, submit
5. Verify: "The email has already been taken" is shown

### Scenario 3: 401 Unauthorized

1. Clear localStorage or use an expired token
2. Try to create a user
3. Verify: "Unauthenticated." error is shown (not "Invalid username or password")

## Running Tests

```bash
# Backend tests
cd apps/backend && php artisan test

# Frontend tests
cd apps/frontend && npm test
```

## Expected Test Outcomes

All existing tests should continue to pass. No new tests required unless testing the error message display behavior.
