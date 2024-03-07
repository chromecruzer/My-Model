// Import required modules
import Express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import twilio from 'twilio'
import { createInterface } from 'readline';
import bodyParser from 'body-parser';
import { spawn } from 'child_process';
//import axios from 'axios';

// Initialize Express app
const app = Express();
const port = 2400;
app.set('view engine', 'pug');
app.use(Express.json());
app.use(Express.static('public'));

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_key });




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

// Serve static files
app.use(Express.static('public'));


app.get('/', (req, res) => {
    function getCurrentDate() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear());
        return `${day}${month}${year}`;
    }

    const currentDate = getCurrentDate();
    const today = new Date(); // Get today's date

    // Check if currentDate matches today's date
    if (currentDate === `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`) {
       
        res.render('gpt'); // Render 'gpt' page
    } else {
        res.render('index', { currentDate }); // Render 'index' page
    }
});


// Handle POST request for chat messages
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        // Send user message to OpenAI for processing
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: userMessage }],
            model: "gpt-3.5-turbo",
        });

        // Extract GPT AI response from completion
        const gptResponse = completion.choices[0].message.content;

        // Send GPT AI response back to client
        res.json({ message: gptResponse });
        const chat = {
            date: new Date(),
            user: req.body.message,
            gpt: completion.choices[0].message.content
        };
        // Save the chat to MongoDB
        await saveChatToMongoDB(chat);
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'An error occurred while processing the message' });
    }
});


// Route to handle OTP verification
app.post('/verify-otp', async (req, res) => {
    try {
        const otpCode = req.body.otp; // Get OTP code from the request body

        // Verify the OTP code using the phone number from environment variables
        const client = twilio(process.env.accountSid, process.env.authToken);
        const verificationResult = await client.verify.v2.services(process.env.verifySid)
            .verificationChecks
            .create({ to: process.env.PhoneIND_91, code: otpCode });

        // If verification is successful, send a success message
        if (verificationResult.status === 'approved') {
            // Send success response
           // res.json({ success: true, message: 'OTP verified successfully.' });
            res.render('gpt')
        } else if (verificationResult.status === 'pending') {
            // Send message to retry
            res.status(400).send('Please try again.');
        } else {
            // Send failure response
            res.status(400).json({ success: false, message: 'Invalid OTP code.' });
        }

        // Simulate entering OTP value in the PowerShell terminal
        const child = spawn('powershell', ['-Command', '-']);
        child.stdin.setEncoding('utf-8');
        child.stdout.pipe(process.stdout);

        // Send OTP value to the child process
        child.stdin.write(`Write-Host "${verificationResult.status}"\n`);
        child.stdin.end();
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'An error occurred while verifying OTP.' });
    }
});


app.get('/xotpx',(req,res)=>{
    triggerOTP()
})

// otp trigger nigga 
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
    

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
