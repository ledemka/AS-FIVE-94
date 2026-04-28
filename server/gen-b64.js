const fs = require('fs');
require('dotenv').config({ path: '../.env' });
const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
if (key) {
  const b64 = Buffer.from(key).toString('base64');
  console.log('BASE64_KEY=' + b64);
}
