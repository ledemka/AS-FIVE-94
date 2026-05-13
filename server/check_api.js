const http = require('http');

http.get('http://localhost:3000/members', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const members = JSON.parse(data);
      console.log('--- API MEMBERS ---');
      members.filter(m => ['Russel', 'Christopher', 'Paterson'].some(n => m.firstName.includes(n))).forEach(m => {
        console.log(JSON.stringify(m));
      });
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw data:', data.slice(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
