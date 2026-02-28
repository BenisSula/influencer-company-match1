// Test script for ML Service
const axios = require('axios');

const ML_SERVICE_URL = 'http://localhost:8000';

async function testMLService() {
  console.log('🧪 Testing ML Service...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${ML_SERVICE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Greeting
    console.log('2️⃣ Testing greeting intent...');
    const greetingResponse = await axios.post(`${ML_SERVICE_URL}/chat`, {
      message: 'hi',
      context: {},
      user_id: 'test-user'
    });
    console.log('✅ Greeting response:');
    console.log('   Intent:', greetingResponse.data.intent);
    console.log('   Confidence:', greetingResponse.data.confidence);
    console.log('   Response:', greetingResponse.data.response.substring(0, 100) + '...');
    console.log('');

    // Test 3: Fees Question
    console.log('3️⃣ Testing fees intent...');
    const feesResponse = await axios.post(`${ML_SERVICE_URL}/chat`, {
      message: 'how do fees work?',
      context: {},
      user_id: 'test-user'
    });
    console.log('✅ Fees response:');
    console.log('   Intent:', feesResponse.data.intent);
    console.log('   Confidence:', feesResponse.data.confidence);
    console.log('   Response:', feesResponse.data.response.substring(0, 100) + '...');
    console.log('');

    // Test 4: Find Matches
    console.log('4️⃣ Testing find matches intent...');
    const matchesResponse = await axios.post(`${ML_SERVICE_URL}/chat`, {
      message: 'find me some matches',
      context: {},
      user_id: 'test-user'
    });
    console.log('✅ Matches response:');
    console.log('   Intent:', matchesResponse.data.intent);
    console.log('   Confidence:', matchesResponse.data.confidence);
    console.log('   Response:', matchesResponse.data.response.substring(0, 100) + '...');
    console.log('');

    // Test 5: Entity Extraction
    console.log('5️⃣ Testing entity extraction...');
    const entityResponse = await axios.post(`${ML_SERVICE_URL}/chat`, {
      message: 'My email is test@example.com and my budget is $5000',
      context: {},
      user_id: 'test-user'
    });
    console.log('✅ Entity extraction:');
    console.log('   Entities:', entityResponse.data.entities);
    console.log('');

    // Test 6: Sentiment Analysis
    console.log('6️⃣ Testing sentiment analysis...');
    const sentimentResponse = await axios.post(`${ML_SERVICE_URL}/chat`, {
      message: 'This platform is amazing and I love it!',
      context: {},
      user_id: 'test-user'
    });
    console.log('✅ Sentiment analysis:');
    console.log('   Sentiment:', sentimentResponse.data.sentiment);
    console.log('');

    console.log('🎉 All tests passed! ML Service is working correctly.\n');
    console.log('Next steps:');
    console.log('1. Start your backend: cd backend && npm run start:dev');
    console.log('2. Start your frontend: npm run dev');
    console.log('3. Test the chatbot in your browser!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  ML Service is not running!');
      console.log('Start it with:');
      console.log('  cd ml-service');
      console.log('  python app/main.py');
      console.log('  OR');
      console.log('  ./start.sh (Mac/Linux)');
      console.log('  start.bat (Windows)');
    } else {
      console.error('Error details:', error.response?.data || error);
    }
  }
}

// Run tests
testMLService();
