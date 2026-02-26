const { ERROR_MESSAGES, TABLE_NAME, APPOINTMENT_STATUS } = require("../../shared/constants");
const { BadRequestError, CORS_HEADERS, buildTenantDateKey } = require("../../shared/utils/index");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async (event) => {
    console.log("## EDIT APPOINTMENT EVENT ##");
    console.log(JSON.stringify(event, null, 2));
    try {
        const tenantId = event.pathParameters?.tenantId;
        if (!tenantId) throw new BadRequestError(ERROR_MESSAGES.MISSING_TENANT_ID);

        const appointmentDetails = JSON.parse(event.body);
        const result = await EditAppointment(tenantId, appointmentDetails);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            body: JSON.stringify({ message: "Appointment updated", data: result }),
        };
    } catch (err) {
        console.error("EditAppointment failed", err);
        return {
            statusCode: err.statusCode ?? 500,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            body: JSON.stringify({ message: err.message }),
        };
    }
};

const EditAppointment = async (tenantId, appointmentDetails) => {
    const { customerEmail, startTime, endTime, status, notes, location } = appointmentDetails;
    if (!customerEmail || !startTime) throw new BadRequestError(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);

    let client;
    if (process.env.NODE_ENV === "local") {
        client = new DynamoDBClient({ region: "us-east-1", endpoint: "http://dynamo-local:8000" });
    } else {
        client = new DynamoDBClient({});
    }
    const ddb = DynamoDBDocumentClient.from(client);
    return ddb.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
            PK: `TENANT#${tenantId}#CUSTOMER#${customerEmail}`,
            SK: `APPOINTMENT#${startTime}`,
        },
        UpdateExpression: "SET endTime = :et, #st = :s, notes = :n, #loc = :l",
        ExpressionAttributeNames: {
            "#st": "status",
            "#loc": "location",
        },
        ExpressionAttributeValues: {
            ":et": endTime,
            ":s": status ?? APPOINTMENT_STATUS.PENDING,
            ":n": notes,
            ":l": location,
        },
        ReturnValues: "ALL_NEW",
    }));
};