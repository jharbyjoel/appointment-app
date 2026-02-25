# Appointment App API - Development Instructions

## Core Principles

### 1. Simplicity Over Cleverness
- Write code that is easy to read and understand
- Avoid complex one-liners or "clever" solutions
- If you need comments to explain what code does, consider refactoring it to be more readable
- Future you (or your teammates) should understand the code at a glance

### 2. Code Cleanliness
- Use clear, descriptive variable and function names
- Keep functions small and focused on one task
- Consistent formatting and indentation
- Remove commented-out code and console.logs before committing
- No unused imports or variables

### 3. DRY (Don't Repeat Yourself)
- If you copy-paste code, stop and refactor it into a shared function
- Create utility functions for repeated logic
- Use shared constants instead of magic numbers or strings
- Extract common patterns into reusable modules

## Project Structure

```
app/
├── lambdas/              # Individual Lambda functions
│   ├── create-appointment/
│   ├── delete-appointment/
│   └── edit-appointment/
├── shared/               # Shared utilities and helpers (create as needed)
│   ├── utils/           # Helper functions
│   ├── validators/      # Input validation
│   └── constants/       # Shared constants
├── template.yaml        # SAM template
└── package.json         # Dependencies
```

## Lambda Function Guidelines

### Keep Lambdas Thin
Each Lambda handler should:
1. Validate input
2. Call business logic functions
3. Format and return response

Extract business logic into separate, testable functions.

**Bad Example:**
```javascript
exports.handler = async (event) => {
    // 100 lines of business logic here
};
```

**Good Example:**
```javascript
const { validateAppointment } = require('../shared/validators');
const { createAppointment } = require('./create-appointment-service');

exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    
    const validation = validateAppointment(data);
    if (!validation.isValid) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: validation.error })
        };
    }
    
    const result = await createAppointment(data);
    
    return {
        statusCode: 200,
        body: JSON.stringify(result)
    };
};
```

## Naming Conventions

- **Functions**: `camelCase` and verb-based (`createAppointment`, `validateInput`)
- **Constants**: `UPPER_SNAKE_CASE` (`MAX_APPOINTMENTS`, `ERROR_MESSAGES`)
- **Variables**: `camelCase` and descriptive (`appointmentData`, `userId`)
- **Files**: `kebab-case` (`create-appointment.js`, `appointment-validator.js`)

## Error Handling

Always handle errors gracefully:

```javascript
try {
    const result = await someAsyncOperation();
    return successResponse(result);
} catch (error) {
    console.error('Error in create-appointment:', error);
    return errorResponse('Failed to create appointment', 500);
}
```

Create helper functions for common response patterns to stay DRY.

## Testing Locally

### Start API locally:
```bash
cd app/
sam local start-api
```

### Test endpoint:
```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{"patientId": "123", "date": "2026-02-10"}'
```

## Before Committing

- [ ] Remove all `console.log` statements (except intentional logging)
- [ ] Remove commented-out code
- [ ] Check for any repeated code that should be extracted
- [ ] Verify function and variable names are clear and descriptive
- [ ] Test the function locally
- [ ] Keep functions under 50 lines when possible

## Common Patterns to Avoid

### ❌ Magic Numbers/Strings
```javascript
if (appointments.length > 10) { /* ... */ }
```

### ✅ Named Constants
```javascript
const MAX_APPOINTMENTS_PER_DAY = 10;
if (appointments.length > MAX_APPOINTMENTS_PER_DAY) { /* ... */ }
```

---

### ❌ Nested Callbacks
```javascript
getData((data) => {
    processData(data, (result) => {
        saveResult(result, () => { /* ... */ });
    });
});
```

### ✅ Async/Await
```javascript
const data = await getData();
const result = await processData(data);
await saveResult(result);
```

---

### ❌ Complex Conditionals
```javascript
if (user && user.appointments && user.appointments.length > 0 && user.appointments[0].status === 'active') { }
```

### ✅ Clear Variables
```javascript
const hasAppointments = user?.appointments?.length > 0;
const firstAppointmentIsActive = user?.appointments?.[0]?.status === 'active';
if (hasAppointments && firstAppointmentIsActive) { }
```

## Remember

**Simple code that works is better than complex code that's "elegant".**

When in doubt, ask yourself: "Will I understand this in 6 months?"
