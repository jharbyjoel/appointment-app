const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { ERROR_MESSAGES, TABLE_NAME, DATE_INDEX_NAME } = require("../../shared/constants");
const { CORS_HEADERS, buildTenantDateKey, BadRequestError } = require("../../shared/utils/index");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

exports.handler = async (event, context) => {
    console.log("## EVENT RECEIVED ##");
    console.log(JSON.stringify(event, null, 2));
    try {
        const tenantId = event.pathParameters?.tenantId;
        const date = event.pathParameters?.date;
        if (!tenantId) throw new BadRequestError(ERROR_MESSAGES.MISSING_TENANT_ID);
        const appointments = await GetAppointments(tenantId, date);
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            body: JSON.stringify({
                message: "Successfully retrieved appointment details",
                data: appointments
            }),
        };
    } catch (err) {
        console.error("Retrieving appointment details failed", err);
        return {
            statusCode: err.statusCode ?? 500,
            headers: { "Content-Type": "application/json", ...CORS_HEADERS },
            body: JSON.stringify({ message: err.message }),
        };
    }
};

const GetAppointments = async (tenantId, date) => {
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
    const result = await ddb.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: DATE_INDEX_NAME,
        KeyConditionExpression: "tenantDateKey = :tdk",
        ExpressionAttributeValues: {
            ":tdk": buildTenantDateKey(tenantId, date),
        },
    }));
    return result;
};
