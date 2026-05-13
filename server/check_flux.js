const { google } = require('googleapis');
const path = require('path');

async function check() {
  const jsonPath = path.resolve(__dirname, 'google-key.json');
  const spreadsheetId = '1vCwwCK0TrayHygdcovQx-_uuTfrqBCRkpB9BzfA6exY';
  
  const auth = new google.auth.GoogleAuth({
    keyFile: jsonPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Flux monétaires!A1:E10',
    });
    
    if (!res.data.values) {
        console.log('No values found');
        return;
    }

    console.log('Headers (Row 1):', JSON.stringify(res.data.values[0]));
    console.log('Headers (Row 2):', JSON.stringify(res.data.values[1]));
    res.data.values.slice(2).forEach((row, i) => {
      console.log(`Row ${i+3}: ${JSON.stringify(row)}`);
    });

  } catch (err) {
    console.error('Error fetching data:', err.message);
  }
}

check();
