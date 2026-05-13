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
      range: 'Suivi adhesion!A1:I20',
    });
    
    if (!res.data.values) {
        console.log('No values found');
        return;
    }

    console.log('Headers:', JSON.stringify(res.data.values[0]));
    res.data.values.slice(1, 10).forEach((row, i) => {
      console.log(`Row ${i+2}: ${JSON.stringify(row)}`);
    });
    
    const namesToCheck = ['Russel', 'Christopher', 'Paterson'];
    res.data.values.forEach((row, i) => {
      const rowStr = JSON.stringify(row);
      if (namesToCheck.some(name => rowStr.includes(name))) {
        console.log(`Found match in Row ${i+1}: ${rowStr}`);
      }
    });

  } catch (err) {
    console.error('Error fetching data:', err.message);
  }
}

check();
