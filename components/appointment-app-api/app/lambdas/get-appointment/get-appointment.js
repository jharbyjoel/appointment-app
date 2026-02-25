const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { ERROR_MESSAGES, TABLE_NAME, DATE_INDEX_NAME } = require("../../shared/constants");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb")

exports.handler = async (event, context) => {
    console.log("## EVENT RECEIVED ##");
    console.log(JSON.stringify(event, null, 2));
    try {
        const date = event.pathParameters?.date;
        const appointments = await GetAppointments(date);
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Successfully retrieved appointment detais",
                data: appointments
            }),
        };
    } catch (err) {
        console.error("Retrieving appointment details failed", err);
        return {
            statusCode: err.statusCode,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: err.message}),
        };
    }
};

const GetAppointments = async (date) => {
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
        KeyConditionExpression: "appointmentDate = :d",
        ExpressionAttributeValues: {
            ":d": `${date}`,
        },
    }));
    return result;
};
