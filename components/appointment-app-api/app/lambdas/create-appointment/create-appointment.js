const { ERROR_MESSAGES, TABLE_NAME } = require("../../shared/constants");
const { BadRequestError, CORS_HEADERS, buildTenantDateKey } = require("../../shared/utils/index");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async (event, context) => {
    console.log("## EVENT RECEIVED ##");
    console.log(JSON.stringify(event, null, 2));
    try {
        const tenantId = event.pathParameters?.tenantId;
        if (!tenantId) throw new BadRequestError(ERROR_MESSAGES.MISSING_TENANT_ID);
        const createAppointmentResponse = await CreateAppointment(event, tenantId);
        console.log("CreateAppointment succeeded", createAppointmentResponse);
        return {
            statusCode: 201,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            body: JSON.stringify({
                message: "Appointment created",
                data: createAppointmentResponse,
            }),
        };
    } catch (err) {
        console.error("CreateAppointment failed", err);
        return {
            statusCode: err.statusCode ?? 500,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            body: JSON.stringify({ message: err.message }),
        };
    }
};

const CreateAppointment = async (event, tenantId) => {
    const appointmentDetails = JSON.parse(event.body);
    // run validation - will throw a BadRequestError if something's wrong
    ValidateData(appointmentDetails);
    // if validation passes, persist and return whatever DynamoDB returns
    return await StoreAppointment(appointmentDetails, tenantId);
};

const ValidateData = (appointmentDetails) => {
    const { customerEmail, customerName, phone, startTime, endTime, status, notes, location } = appointmentDetails;
    if (!customerEmail || !customerName || !phone || !startTime || !endTime || !status || !notes) {
        throw new BadRequestError(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }
}

const StoreAppointment = async (appointmentDetails, tenantId) => {
    const { customerEmail, customerName, phone, startTime, endTime, status, notes, location } = appointmentDetails;
    const appointmentDate = startTime.substr(0, 10);
    const item = {
        PK: `TENANT#${tenantId}#CUSTOMER#${customerEmail}`,
        SK: `APPOINTMENT#${startTime}`,
        tenantId,
        customerEmail,
        customerName,
        phone,
        startTime,
        appointmentDate,
        tenantDateKey: buildTenantDateKey(tenantId, appointmentDate),
        endTime,
        status,
        notes,
        location,
    };
    let client;
    if (process.env.NODE_ENV === "local") {
        client = new DynamoDBClient({
            region: "us-east-1",
            endpoint: "http://dynamo-local:8000", 
        });
    } else {
        client = new DynamoDBClient({});
    }
    const ddb = DynamoDBDocumentClient.from(client);
    const result = await ddb.send(new PutCommand({
        TableName: `${TABLE_NAME}`,
        Item: item,
    }));
    return result;
}
 