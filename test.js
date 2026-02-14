import africastalking from 'africastalking';
import dotenv from 'dotenv';

dotenv.config();

console.log("\n📱 --- Africa's Talking REAL SMS Test ---");

const AT_API_KEY = process.env.AT_API_KEY?.replace(/^["']|["']$/g, '').trim();
const AT_USERNAME = process.env.AT_USERNAME?.replace(/^["']|["']$/g, '').trim();
const AT_SENDER_ID = "20880"; // Force using the shortcode

console.log("Username:", AT_USERNAME);
console.log("Sender ID:", AT_SENDER_ID);
console.log("API Key:", AT_API_KEY ? `${AT_API_KEY.substring(0, 10)}...` : "NOT FOUND");

if (!AT_API_KEY || !AT_USERNAME) {
  console.error("❌ Missing credentials");
  process.exit(1);
}

// Initialize Africa's Talking
const at = africastalking({
  apiKey: AT_API_KEY,
  username: AT_USERNAME,
});

const sms = at.SMS;

// Format your phone number
function formatPhoneNumber(phone) {
  // Remove any non-digits
  let cleaned = phone.toString().replace(/\D/g, '');
  
  // If it starts with 0 (e.g., 0793472960)
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }
  
  // If it starts with 7 (e.g., 793472960)
  if (cleaned.startsWith('7')) {
    return '254' + cleaned;
  }
  
  // If it already has 254 but might be malformed
  if (cleaned.startsWith('254')) {
    return cleaned.substring(0, 12); // Ensure exactly 12 digits
  }
  
  return cleaned;
}

async function sendRealSMS() {
  try {
    // YOUR ACTUAL PHONE NUMBER
    const yourNumber = '0793472960'; // Your number in local format
    const formattedNumber = formatPhoneNumber(yourNumber);
    
    console.log(`\n📞 Your number: ${yourNumber}`);
    console.log(`📞 Formatted: ${formattedNumber}`);
    console.log(`📞 Length: ${formattedNumber.length} digits`);
    console.log(`📞 Valid format: ${formattedNumber.startsWith('254') && formattedNumber.length === 12 ? '✅' : '❌'}`);
    
    const message = `Hello! This is a test SMS from Katwanyaa High School. Time: ${new Date().toLocaleString()}`;
    
    console.log(`\n📤 Sending to: ${formattedNumber}`);
    console.log(`📝 Message: "${message}"`);
    
    const smsOptions = {
      to: [formattedNumber],
      message: message,
      from: AT_SENDER_ID // Using shortcode 20880
    };
    
    console.log('📦 Request:', JSON.stringify(smsOptions, null, 2));
    
    console.log('\n⏳ Waiting for response...');
    
    const response = await sms.send(smsOptions);
    
    console.log("\n✅ SUCCESS! SMS sent to your phone!");
    console.log("Response:", JSON.stringify(response, null, 2));
    
    // Check if you got a message ID
    if (response?.data?.SMSMessageData?.Recipients) {
      const recipient = response.data.SMSMessageData.Recipients[0];
      console.log(`\n📱 Message ID: ${recipient.messageId}`);
      console.log(`📱 Status: ${recipient.status}`);
      console.log(`📱 Cost: ${recipient.cost || 'Unknown'}`);
    }
    
  } catch (error) {
    console.error("\n❌ FAILED:", error.message);
    
    if (error.response?.data) {
      console.error("Details:", JSON.stringify(error.response.data, null, 2));
    }
    
    // Troubleshooting
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("1. Check your balance at https://account.africastalking.com/payment");
    console.log("2. Make sure you've added at least KES 20");
    console.log("3. Verify your API key is correct");
    console.log("4. Check that your account is active");
  }
}

// Check balance first (optional)
async function checkBalance() {
  try {
    // Africa's Talking doesn't have a direct balance endpoint in the SMS API
    // But we can check by making a small test
    console.log("\n💰 To check your balance, visit:");
    console.log("   https://account.africastalking.com/payment");
    return true;
  } catch (error) {
    return false;
  }
}

// Run the test
async function run() {
  await checkBalance();
  await sendRealSMS();
}

run();