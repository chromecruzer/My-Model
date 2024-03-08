import OpenAI from "openai";
import twilio from 'twilio';
import { createInterface } from 'readline';
import dotenv from 'dotenv'
import chalk from "chalk";
import util from 'util'
import  Express, { json }  from "express";
const dump = (obj, depth = null) => util.inspect(obj, { depth, colors: true })
//import { CorsOptions } from "cors";
dotenv.config()
const port = 2400

// express setup 
const app = Express()
app.set('view engine', 'pug');
app.use(Express.json());
app.use(Express.static('public'));

// Homepage route
app.get('/', (req, res) => {
    function getCurrentDate() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear());
        return `${day}${month}${year}`;
    }
    const currentDate = getCurrentDate();
    res.render('index', { currentDate });
});

// otp

// Route to handle OTP submission

// app.post('/verify-otp', (req, res) => {
//     const otpCode = req.body.otpCode;

//     // Pass the OTP code to the command line for Twilio verification
//     passOTPToCommandLine(otpCode)
//         .then(status => {
//             res.json({ message: `OTP verification status: ${status}` });
//         })
//         .catch(error => {
//             console.error('Error verifying OTP:', error);
//             res.status(500).json({ message: "An error occurred while verifying OTP." });
//         });
// });

// Function to pass OTP to command line for Twilio verification
// Import required modules using ES6 syntax
// import { exec } from 'child_process';

// // Function to pass OTP to command line for Twilio verification
// export function passOTPToCommandLine(otpCode) {
//     triggerOTP()
//     return new Promise((resolve, reject) => {
//         const command = `echo ${otpCode} | node openai-test.js`;
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error('Error executing command:', error);
//                 reject(error);
//             } else {
//                 console.log('Command executed successfully:', stdout);
//                 resolve(stdout);
//             }
//         });
//     });
// }





// Mongo db History Nigga 

import { MongoClient } from 'mongodb';

// Connection URL
const url = process.env.MONGO_URI;

// Database Name
const dbName = 'test';

async function connectToMongoDB() {
    // Create a new MongoClient
    const client = new MongoClient(url);

    try {
        // Connect the client to the server
        await client.connect();

        console.log('Connected to MongoDB server');

        // Get the database
        const db = client.db(dbName);

        // Return the database object
        return { db, client };
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

// Function to save chat messages to MongoDB
async function saveChatToMongoDB(chat) {
    let client;
    try {
        // Connect to MongoDB
        const { db, client: connectedClient } = await connectToMongoDB();
        client = connectedClient;

        // Get the collection
        const collection = db.collection('openai');

        // Insert the chat message into the collection
        const result = await collection.insertOne(chat);

        console.log('Chat saved to MongoDB:', result.insertedId);
    } catch (error) {
        console.error('Error saving chat to MongoDB:', error);
        throw error;
    } finally {
        // Disconnect the client
        if (client) {
            await client.close();
            console.log('MongoDB client disconnected');
        }
    }
}




const openai = new OpenAI({
    apiKey: process.env.OPENAI_key
});

async function main() {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "hoow much is ur costing ?" }],
        model: "gpt-3.5-turbo",
    });

    const chat = {
        date: new Date(),
        user: 'hoow much is ur costing ?',
        gpt: completion.choices[0].message.content
    };

    console.log(chalk.bgWhiteBright.black(dump(completion.choices[0])));


    // Save the chat to MongoDB
    await saveChatToMongoDB(chat);
}

//main();

// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
function triggerOTP() {


const accountSid = process.env.accountSid;
const authToken =  process.env.authToken;
const verifySid =  process.env.verifySid;
const client = twilio(accountSid, authToken);


client.verify.v2
    .services(verifySid)
    .verifications.create({ to: process.env.PhoneIND_91, channel: "sms" })
    .then((verification) => console.log(verification.status))
    .then(() => {

        const readline = createInterface({
            input: process.stdin,
            output: process.stdout
        });;
        readline.question("Please enter the OTP:", (otpCode) => {
            client.verify.v2
                .services(verifySid)
                .verificationChecks.create({ to: process.env.PhoneIND_91, code: otpCode })
                .then((verification_check) => console.log(verification_check.status))
                .then(() => readline.close());
        });
        
    });

}

//triggerOTP();
function triggerOTP2(otpCode) {
    const accountSid = process.env.accountSid;
const authToken =  process.env.authToken;
const verifySid =  process.env.verifySid;
const client = twilio(accountSid, authToken);

client.verify.v2
.services(verifySid)
.verifications.create({ to: process.env.PhoneIND_91, channel: "sms" })
.then((verification) => console.log(verification.status))
.then(() => {


    return client.verify.v2.services(verifySid)
        .verificationChecks.create({ to: process.env.PhoneIND_91, code: otpCode })
        .then((verification_check) => {
            console.log(verification_check.status);
            return verification_check.status;
        })
        .catch(error => {
            console.error('Error verifying OTP:', error);
            throw error;
        });
})}

export default triggerOTP2;

app.post('/submit-otp', async (req, res) => {
    const otpCode = req.body.code; // Assuming the OTP code is sent as "code" in the request body

    try {
        // Verify the OTP code using Twilio
        const verificationStatus = await triggerOTP2(otpCode);
        res.send({ status: verificationStatus });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).send({ error: 'Error verifying OTP' });
    }
});

    // server port 

    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });