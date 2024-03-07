import { Auth } from "two-step-auth";

async function login(mobileNumber) {
  try {
    const res = await Auth(mobileNumber);
    console.log(res.phone); // User's mobile number
    console.log(res.OTP); // Generated OTP
    console.log(res.success); // Operation success status
  } catch (error) {
    console.error("Error during login:", error.message);
  }
}

login("+919087095331"); // Replace with the actual mobile number
