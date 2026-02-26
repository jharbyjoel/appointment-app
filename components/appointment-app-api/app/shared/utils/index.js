class BadRequestError extends Error {
  constructor(msg) {
    super(msg);
    this.statusCode = 400;
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

// Builds the composite key used as the DateIndex partition key.
// Scopes date queries to a specific tenant.
function buildTenantDateKey(tenantId, appointmentDate) {
  return `TENANT#${tenantId}#DATE#${appointmentDate}`;
}

module.exports = { BadRequestError, CORS_HEADERS, buildTenantDateKey };