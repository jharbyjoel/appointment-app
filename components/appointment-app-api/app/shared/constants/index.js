const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED'
};

const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Invalid email format',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  APPOINTMENT_NOT_FOUND: 'Appointment not found',
  PAST_DATE: 'Cannot create appointment in the past',
  APPOINTMENT_CONFLICT: 'Time slot is already booked',
  UNAUTHORIZED: 'Email does not match appointment owner'
};

const EMAIL_SUBJECTS = {
  CONFIRMATION: 'Appointment Confirmation',
  CANCELLATION: 'Appointment Cancelled',
  UPDATE: 'Appointment Updated'
};

const TABLE_NAME = process.env.APPOINTMENTS_TABLE_NAME;
const EMAIL_INDEX_NAME = 'EmailIndex';
const DATE_INDEX_NAME = 'DateIndex';
const SES_SENDER_EMAIL = process.env.SES_SENDER_EMAIL;

const ERROR_MESSAGES_TENANT = {
  MISSING_TENANT_ID: 'Missing tenantId',
};

module.exports = {
  APPOINTMENT_STATUS,
  ERROR_MESSAGES: { ...ERROR_MESSAGES, ...ERROR_MESSAGES_TENANT },
  EMAIL_SUBJECTS,
  TABLE_NAME,
  EMAIL_INDEX_NAME,
  DATE_INDEX_NAME,
  SES_SENDER_EMAIL
};