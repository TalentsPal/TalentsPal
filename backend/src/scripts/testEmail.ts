import dotenv from 'dotenv';
import { testEmailConnection, sendVerificationEmail } from '../utils/email';

// Load environment variables
dotenv.config();

/**
 * Test Email Configuration
 */
async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');

  // Test 1: Check email server connection
  console.log('📧 Test 1: Checking email server connection...');
  const isConnected = await testEmailConnection();

  if (isConnected) {
    console.log('✅ Email server connection successful!\n');
  } else {
    console.log('❌ Email server connection failed!\n');
    return;
  }

  // Test 2: Send a test verification email
  console.log('📧 Test 2: Sending test verification email...');
  const testEmail = process.env.TEST_EMAIL || 'cefadihamad2004@gmail.com';
  const testToken = 'test-token-123456789';

  try {
    await sendVerificationEmail(testEmail, 'Test User', testToken);
    console.log(`✅ Test email sent successfully to ${testEmail}!\n`);
    console.log('📬 Please check your inbox for the verification email.\n');
  } catch (error) {
    console.log('❌ Failed to send test email:', error);
  }

  console.log('✨ Email configuration test completed!\n');
}

// Run the test
testEmail().catch(console.error);
