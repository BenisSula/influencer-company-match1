/**
 * Initialize System Settings
 * Calls the backend API to initialize default settings
 */

const axios = require('axios');

async function initializeSettings() {
  try {
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/admin/auth/login', {
      email: 'admin@example.com',
      password: 'Admin123!',
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful\n');
    
    console.log('📝 Initializing default system settings...');
    const response = await axios.post('http://localhost:3000/api/admin/system-settings/initialize', {}, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    console.log('✅ Settings initialized:', response.data.message);
    
    // Verify settings were created
    const settingsResponse = await axios.get('http://localhost:3000/api/admin/system-settings', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    console.log('\n📊 Settings categories:');
    Object.keys(settingsResponse.data).forEach(category => {
      console.log(`   - ${category}: ${settingsResponse.data[category].length} settings`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

initializeSettings();
