const { APPOINTMENT_STATUS, ERROR_MESSAGES, TABLE_NAME } = require("../../shared/constants");
const { BadRequestError } = require("../../shared/utils/index")
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb")

exports.handler = async (event, context) => {
    console.log('## EVENT RECEIVED ##');
    console.log(JSON.stringify(event, null, 2));
    try {
        const createAppointmentResponse = await CreateAppointment(event);
        console.log('CreateAppointment succeeded', createAppointmentResponse);
        return {
            statusCode: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: 'Appointment created',
                data: createAppointmentResponse,
            }),
        };
    } catch (err) {
        console.error('CreateAppointment failed', err);
        return {
            statusCode: err.statusCode,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: err.message}),
        };
    }
};

const CreateAppointment = async (event) => {
    const appointmentDetails = JSON.parse(event.body);
    // run validation - will throw a BadRequestError if something's wrong
    ValidateData(appointmentDetails);
    // if validation passes, persist and return whatever DynamoDB returns
    return await StoreAppointment(appointmentDetails);
};

const ValidateData = (appointmentDetails) => {
    const { customerEmail, customerName, phone, startTime, endTime, status, notes, location } = appointmentDetails;
    if (!customerEmail || !customerName || !phone || !startTime || !endTime || !status || !notes) {
        throw new BadRequestError("Missing a required field!")
    }
}

const StoreAppointment = async (appointmentDetails) => {
    const { customerEmail, customerName, phone, startTime, endTime, status, notes, location } = appointmentDetails;
    const item = {
        PK: `CUSTOMER#${customerEmail}`,
        SK: `APPOINTMENT#${startTime}`,   
        customerEmail,
        customerName,
        phone,
        startTime,
        appointmentDate: startTime.substr(0,10),
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
 