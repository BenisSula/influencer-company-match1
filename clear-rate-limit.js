// The rate limit is in-memory, so restarting the backend will clear it
// Or we can wait for it to expire (about 9 minutes from the error)

console.log('⏰ Rate limit will expire in about 9 minutes');
console.log('');
console.log('Options:');
console.log('1. Wait 9 minutes');
console.log('2. Restart the backend server to clear in-memory rate limits');
console.log('');
console.log('To restart backend:');
console.log('  1. Stop the backend process (Ctrl+C in the backend terminal)');
console.log('  2. Run: cd backend && npm run start:dev');
console.log('');
console.log('Or use the correct credentials immediately:');
console.log('  Email: mike.tech@example.com');
console.log('  Password: password123');
