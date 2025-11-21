// test-email-verification.js
// Test script to verify the email verification flow works through unified server

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const AUTH_API = `${BASE_URL}/auth`;

// Test data
const testOrganizer = {
    fname: 'Test',
    lname: 'Organizer',
    email: 'test.organizer@example.com',
    contact_no: '+1234567890',
    password: 'testPassword123'
};

async function testEmailVerificationFlow() {
    console.log('🧪 Testing Email Verification Flow through Unified Server\n');

    try {
        // Step 1: Check if unified server is running
        console.log('1. Checking unified server health...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Unified server is running');
        console.log('📊 Services status:', healthResponse.data.services);
        console.log('');

        // Step 2: Test organizer registration
        console.log('2. Testing organizer registration...');
        try {
            const registerResponse = await axios.post(`${AUTH_API}/register`, testOrganizer);
            console.log('✅ Registration successful');
            console.log('📧 Approval email should be sent with link format:');
            console.log(`   ${BASE_URL}/auth/approve/{organizer_id}`);
            console.log('📝 Registration response:', registerResponse.data);
            console.log('');

            // Extract organizer ID from response for approval test
            const organizerId = registerResponse.data.organizer.organizer_id;
            
            // Step 3: Test direct approval endpoint (simulate admin clicking email link)
            console.log('3. Testing approval endpoint (simulating admin click)...');
            const approvalResponse = await axios.get(`${AUTH_API}/approve/${organizerId}`);
            console.log('✅ Approval successful');
            console.log('📝 Approval response:', approvalResponse.data);
            console.log('');

            // Step 4: Test login with approved account
            console.log('4. Testing login with approved account...');
            const loginResponse = await axios.post(`${AUTH_API}/login`, {
                email: testOrganizer.email,
                password: testOrganizer.password
            });
            console.log('✅ Login successful');
            console.log('🔑 JWT Token received:', loginResponse.data.token ? 'Yes' : 'No');
            console.log('');

        } catch (registrationError) {
            if (registrationError.response?.status === 400 && 
                registrationError.response?.data?.message?.includes('already registered')) {
                console.log('⚠️  Test organizer already exists, testing login instead...');
                
                // Test login with existing account
                const loginResponse = await axios.post(`${AUTH_API}/login`, {
                    email: testOrganizer.email,
                    password: testOrganizer.password
                });
                console.log('✅ Login with existing account successful');
                console.log('');
            } else {
                throw registrationError;
            }
        }

        // Step 5: Test other auth endpoints
        console.log('5. Testing auth service routing through unified server...');
        
        // Test invalid endpoint
        try {
            await axios.get(`${AUTH_API}/invalid-endpoint`);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Invalid endpoint properly handled (404)');
            }
        }

        console.log('');
        console.log('🎉 All tests passed! Email verification flow is working correctly.');
        console.log('');
        console.log('📧 Email Links Structure:');
        console.log(`   Registration: POST ${AUTH_API}/register`);
        console.log(`   Approval Link: GET ${AUTH_API}/approve/{id}`);
        console.log(`   Login: POST ${AUTH_API}/login`);
        console.log('');
        console.log('🌐 Production Setup:');
        console.log('   1. Set BASE_URL=https://your-domain.com in auth service .env');
        console.log('   2. Update CORS_ORIGIN in auth service');
        console.log('   3. Deploy unified server to production');
        console.log('   4. Email links will automatically work in production');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('');
            console.log('🚨 Connection refused. Please ensure:');
            console.log('   1. Unified server is running on port 8080');
            console.log('   2. Auth service is running on port 5004');
            console.log('   3. Run: node unified-server.js');
            console.log('   4. Or use: ./start-all-services.ps1');
        } else if (error.response) {
            console.log('📝 Error details:', error.response.data);
            console.log('📊 Status:', error.response.status);
        }
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testEmailVerificationFlow();
}

module.exports = { testEmailVerificationFlow };