const { ERROR_MESSAGES, TABLE_NAME } = require("../../shared/constants");
const { BadRequestError, CORS_HEADERS } = require("../../shared/utils/index");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

exports.handler = async (event) => {
    console.log("## DELETE APPOINTMENT EVENT ##");
    console.log(JSON.stringify(event, null, 2));
    try {
        const tenantId = event.pathParameters?.tenantId;
        if (!tenantId) throw new BadRequestError(ERROR_MESSAGES.MISSING_TENANT_ID);

        const { customerEmail, startTime } = JSON.parse(event.body);
        if (!customerEmail || !startTime) throw new BadRequestError(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);

        const result = await DeleteAppointment(tenantId, customerEmail, startTime);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            body: JSON.stringify({ message: "Appointment deleted", data: result }),
        };
    } catch (err) {
        console.error("DeleteAppointment failed", err);
        return {
            statusCode: err.statusCode ?? 500,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            body: JSON.stringify({ message: err.message }),
        };
    }
};

const DeleteAppointment = async (tenantId, customerEmail, startTime) => {
    let client;
    if (process.env.NODE_ENV === "local") {
        client = new DynamoDBClient({ region: "us-east-1", endpoint: "http://dynamo-local:8000" });
    } else {
        client = new DynamoDBClient({});
    }
    const ddb = DynamoDBDocumentClient.from(client);
    return ddb.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
            PK: `TENANT#${tenantId}#CUSTOMER#${customerEmail}`,
            SK: `APPOINTMENT#${startTime}`,
        },
    }));
};