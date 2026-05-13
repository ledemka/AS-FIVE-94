const parseCurrency = (val) => {
  if (!val) return 0;
  const clean = val.replace(/[^\d,.-]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

const rowPaterson = ["A037","","Paterson","","OUI","septembre 2025","Mensuel","40,00 €","HelloAsso"];
const duesStatusRaw = rowPaterson[7];
const totalPaid = parseCurrency(duesStatusRaw);

console.log('duesStatusRaw:', duesStatusRaw);
console.log('Parsed totalPaid:', totalPaid);

const memberData = {
  totalPaid: totalPaid,
  duesStatus: totalPaid >= 120 ? 'paid' : 'pending',
};

console.log('memberData:', JSON.stringify(memberData));
