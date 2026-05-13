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
      range: 'Suivi de cotisation!A1:Z100',
    });
    
    if (!res.data.values) {
        console.log('No values found');
        return;
    }

    const headers = res.data.values[0];
    res.data.values.forEach((row, i) => {
        if (row[0] === 'A062' || row[0] === 'A050' || row[0] === 'A037') {
            console.log(`Row ${i+1} (ID: ${row[0]}):`);
            row.forEach((cell, j) => {
                if (cell && cell !== '0' && cell !== '0,00 €' && cell !== row[0]) {
                    console.log(`  ${headers[j]}: ${cell}`);
                }
            });
        }
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
