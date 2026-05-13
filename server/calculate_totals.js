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
    // 1. Calculate Recettes (from Suivi adhesion)
    const resAdhesion = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Suivi adhesion!H2:H100',
    });
    
    let totalIncome = 0;
    resAdhesion.data.values.forEach(row => {
      const val = row[0];
      if (val) {
        const clean = val.replace(/[^\d,.-]/g, '').replace(',', '.');
        const num = parseFloat(clean);
        if (!isNaN(num)) totalIncome += num;
      }
    });

    // 2. Calculate Dépenses (from Flux monétaires)
    const resFlux = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Flux monétaires!B3:C100',
    });
    
    let totalExpenses = 0;
    resFlux.data.values.forEach(row => {
      const type = row[0];
      const val = row[1];
      if (type === 'Sortie' && val) {
        const clean = val.replace(/[^\d,.-]/g, '').replace(',', '.');
        const num = parseFloat(clean);
        if (!isNaN(num)) totalExpenses += num;
      }
    });

    console.log('--- NEW TOTALS ---');
    console.log('Total Recettes (Membres):', totalIncome.toFixed(2), '€');
    console.log('Total Dépenses (Flux):', totalExpenses.toFixed(2), '€');
    console.log('Solde:', (totalIncome - totalExpenses).toFixed(2), '€');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
