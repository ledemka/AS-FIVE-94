const { google } = require('googleapis');
require('dotenv').config({ path: '../.env' });

const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let privateKey = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8');

async function testAuth() {
  console.log('Testing with email:', clientEmail);
  console.log('Key starts with:', privateKey.substring(0, 30));
  
  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.get({
      spreadsheetId: '1vCwwCK0TrayHygdcovQx-_uuTfrqBCRkpB9BzfA6exY',
    });
    console.log('SUCCESS! Title:', res.data.properties.title);
  } catch (err) {
    console.error('FAILED:', err.message);
  }
}

testAuth();
