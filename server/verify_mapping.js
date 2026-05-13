const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString(),
  ['https://www.googleapis.com/auth/spreadsheets.readonly'],
);

const sheets = google.sheets({ version: 'v4', auth });

async function check() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  console.log('Spreadsheet ID:', spreadsheetId);
  
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Suivi adhesion!A1:I20',
    });
    
    console.log('Headers:', JSON.stringify(res.data.values[0]));
    console.log('First few rows:');
    res.data.values.slice(1).forEach((row, i) => {
      console.log(`Row ${i+2}: ${JSON.stringify(row)}`);
    });
    
    const namesToCheck = ['Russel', 'Christopher', 'Paterson'];
    res.data.values.forEach((row, i) => {
      if (row.some(cell => namesToCheck.some(name => cell?.toString().includes(name)))) {
        console.log(`Found match in Row ${i+1}: ${JSON.stringify(row)}`);
      }
    });

  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

check();
