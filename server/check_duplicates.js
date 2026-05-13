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
      range: 'Suivi adhesion!A1:I200',
    });
    
    if (!res.data.values) {
        console.log('No values found');
        return;
    }

    const counts = {};
    res.data.values.forEach((row, i) => {
      const id = row[0];
      const name = `${row[1]} ${row[2]}`.trim();
      if (!name) return;
      
      counts[name] = (counts[name] || 0) + 1;
      if (counts[name] > 1) {
          console.log(`Duplicate found for "${name}": Row ${i+1}`);
      }
    });

    const targetNames = ['RUSSEL', 'CHRISTOPHER', 'PATERSON'];
    res.data.values.forEach((row, i) => {
        const rowStr = JSON.stringify(row).toUpperCase();
        if (targetNames.some(n => rowStr.includes(n))) {
            console.log(`Row ${i+1}: ${JSON.stringify(row)}`);
        }
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
