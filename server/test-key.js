require('dotenv').config({ path: '../.env' });
const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
console.log('--- START ---');
console.log(key);
console.log('--- END ---');
console.log('Length:', key?.length);
console.log('Starts with:', key?.substring(0, 30));
console.log('Ends with:', key?.substring(key.length - 30));
