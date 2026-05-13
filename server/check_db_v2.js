const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'sportflow.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, firstName, lastName FROM members WHERE firstName LIKE '%Russel%' OR firstName LIKE '%Christopher%' OR firstName LIKE '%Paterson%'", (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('--- MEMBERS IN DB ---');
  rows.forEach(row => {
    console.log(JSON.stringify(row));
  });
  db.close();
});
