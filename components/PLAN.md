# Plan: Appointment Booking System with AWS Lambda

Building a complete appointment web app with three Lambda functions (create, edit, delete) using DynamoDB for storage and SES for email confirmations. Architecture follows simple, clean, DRY principles per [INSTRUCTIONS.md](INSTRUCTIONS.md).

**Key Design Decisions:**
- **Data Model**: Full appointment details (patient, date, time, type, duration, location, status)
- **Auth**: Simple email-based identification (no complex auth)
- **Conflict Prevention**: Check time overlaps considering duration (system-wide)
- **DynamoDB**: appointmentId as primary key + GSI on email and date for queries
- **Validation**: Only future appointments can be edited/deleted
- **Architecture**: Thin handlers → service layer → repository layer

## Steps

### 1. Define DynamoDB Table in [template.yaml](template.yaml)
- Create `AppointmentsTable` resource with appointmentId (String) as partition key
- Add GSI `EmailIndex`: partition key `patientEmail`, sort key `date`
- Add GSI `DateIndex`: partition key `date`, sort key `time` (for conflict checking)
- Grant Lambda functions read/write permissions via IAM policies
- Add environment variables: `APPOINTMENTS_TABLE_NAME`, `SES_SENDER_EMAIL`

### 2. Add delete and edit Lambda function definitions to [template.yaml](template.yaml)
- `DeleteAppointmentFunction`: DELETE /appointments/{appointmentId} endpoint
- `EditAppointmentFunction`: PUT /appointments/{appointmentId} endpoint
- Mirror permissions and environment variables from CreateAppointmentFunction

### 3. Install dependencies in [package.json](package.json)
- Add `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` for DynamoDB operations
- Add `@aws-sdk/client-ses` for email sending
- Add `uuid` for generating appointmentId

### 4. Create shared constants in `shared/constants/index.js`
- `APPOINTMENT_STATUS` object: PENDING, CONFIRMED, CANCELLED
- `ERROR_MESSAGES` object for consistent error text
- `EMAIL_SUBJECTS` for email templates
- Table name and index name constants

### 5. Create shared utilities in `shared/utils/`
- `response-helper.js`: `successResponse()`, `errorResponse()` functions
- `date-helper.js`: `isFutureDate()`, `checkTimeOverlap()` functions
- `dynamodb-client.js`: Initialize and export DynamoDB DocumentClient
- `ses-client.js`: Initialize and export SES client

### 6. Create validators in `shared/validators/appointment-validator.js`
- `validateCreateAppointment(data)`: Check required fields (patientName, patientEmail, date, time, duration)
- `validateEmail(email)`: Email format validation
- `validateDateTime(date, time)`: Date/time format and future date check
- Return `{ isValid: boolean, error: string }` for easy handling

### 7. Create DynamoDB repository in `shared/repository/appointments-repository.js`
- `createAppointment(appointment)`: PutItem operation
- `getAppointmentById(appointmentId)`: GetItem operation
- `getAppointmentsByEmail(email)`: Query using EmailIndex
- `getAppointmentsByDate(date)`: Query using DateIndex
- `updateAppointment(appointmentId, updates)`: UpdateItem operation
- `deleteAppointment(appointmentId)`: DeleteItem operation
- Keep functions focused and simple per DRY principle

### 8. Create email service in `shared/services/email-service.js`
- `sendAppointmentConfirmation(appointment)`: Plain text email with all appointment details
- `sendAppointmentCancellation(appointment)`: Cancellation notification
- `sendAppointmentUpdate(appointment, changes)`: Update notification with what changed
- Use SES `sendEmail` command

### 9. Create conflict checker in `shared/services/conflict-checker.js`
- `checkAppointmentConflict(date, time, duration, excludeId)`: 
  - Query all appointments for given date using DateIndex
  - Check each for time overlap using `checkTimeOverlap()` helper
  - Exclude appointmentId when checking for edits
  - Return `{ hasConflict: boolean, conflictingAppointment: object }`

### 10. Implement create-appointment service in `lambdas/create-appointment/create-appointment-service.js`
- `createAppointment(data)`: Business logic isolated from handler
- Generate appointmentId using uuid
- Check for conflicts using conflict-checker
- Set status to PENDING, add timestamps
- Save to DynamoDB via repository
- Send confirmation email via email-service
- Return created appointment

### 11. Update [create-appointment.js](lambdas/create-appointment/create-appointment.js) handler
- Parse request body from `event.body`
- Validate using `validateCreateAppointment()`
- Call `createAppointment()` service function
- Use response helpers for success/error
- Wrap in try-catch with error logging
- Keep handler under 30 lines

### 12. Create delete-appointment Lambda in `lambdas/delete-appointment/`
- Create `delete-appointment-service.js`: 
  - `deleteAppointment(appointmentId, email)`: Get appointment, verify email matches (auth), check is future, delete, send cancellation email
- Create `delete-appointment.js` handler:
  - Extract appointmentId from path parameters
  - Extract email from query string or body
  - Call service function
  - Return 204 on success or 404/403/400 on errors

### 13. Create edit-appointment Lambda in `lambdas/edit-appointment/`
- Create `edit-appointment-service.js`:
  - `editAppointment(appointmentId, email, updates)`: Get appointment, verify email, validate new data, check is future, check conflicts with new time if changed, update, send notification
- Create `edit-appointment.js` handler:
  - Extract appointmentId from path
  - Extract email and updates from body
  - Validate update fields
  - Call service function
  - Return updated appointment

### 14. Add comprehensive error handling across all layers
- Repository: Handle DynamoDB errors (not found, throttling)
- Service: Handle business logic errors (conflicts, validation, not found)
- Handler: Catch all errors, log, return appropriate status codes (400, 403, 404, 409, 500)
- Use consistent error response format via `errorResponse()` helper

## Verification

### 1. Start local API
```bash
cd app && sam local start-api