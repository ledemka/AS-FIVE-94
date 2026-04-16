/* ============================================
   SportFlow — Mock Data
   Realistic demo data for the association app
   ============================================ */

const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const AVATAR_COLORS = [
    'linear-gradient(135deg, #6366f1, #818cf8)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #f43f5e, #fb7185)',
    'linear-gradient(135deg, #06b6d4, #22d3ee)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
    'linear-gradient(135deg, #14b8a6, #2dd4bf)',
];

// ---- Members ----
const MEMBERS = [
    { id: 1,  firstName: 'Amadou',   lastName: 'Diallo',     email: 'a.diallo@email.com',      category: 'senior',  status: 'active',   dues: 'paid',    attendance: 92, joinDate: '2024-09-15' },
    { id: 2,  firstName: 'Fatou',    lastName: 'Traoré',     email: 'f.traore@email.com',       category: 'senior',  status: 'active',   dues: 'paid',    attendance: 88, joinDate: '2024-10-02' },
    { id: 3,  firstName: 'Kévin',    lastName: 'Nguyen',     email: 'k.nguyen@email.com',       category: 'senior',  status: 'active',   dues: 'paid',    attendance: 95, joinDate: '2025-01-10' },
    { id: 4,  firstName: 'Marie',    lastName: 'Dupont',     email: 'm.dupont@email.com',        category: 'senior',  status: 'active',   dues: 'partial', attendance: 78, joinDate: '2024-09-20' },
    { id: 5,  firstName: 'Ibrahim',  lastName: 'Koné',       email: 'i.kone@email.com',          category: 'senior', status: 'active',   dues: 'paid',    attendance: 65, joinDate: '2023-09-01' },
    { id: 6,  firstName: 'Sophie',   lastName: 'Martin',     email: 's.martin@email.com',        category: 'senior',  status: 'active',   dues: 'paid',    attendance: 90, joinDate: '2024-11-05' },
    { id: 7,  firstName: 'Moussa',   lastName: 'Camara',     email: 'm.camara@email.com',        category: 'senior',  status: 'active',   dues: 'unpaid',  attendance: 72, joinDate: '2025-02-14' },
    { id: 8,  firstName: 'Léa',      lastName: 'Bernard',    email: 'l.bernard@email.com',       category: 'senior',  status: 'inactive', dues: 'unpaid',  attendance: 30, joinDate: '2024-09-18' },
    { id: 9,  firstName: 'Ousmane',  lastName: 'Sy',         email: 'o.sy@email.com',             category: 'senior',  status: 'active',   dues: 'paid',    attendance: 85, joinDate: '2024-10-30' },
    { id: 10, firstName: 'Chloé',    lastName: 'Petit',      email: 'c.petit@email.com',          category: 'senior',  status: 'active',   dues: 'paid',    attendance: 91, joinDate: '2025-03-01' },
    { id: 11, firstName: 'Abdoulaye',lastName: 'Ba',         email: 'a.ba@email.com',             category: 'senior', status: 'active',   dues: 'partial', attendance: 60, joinDate: '2023-10-12' },
    { id: 12, firstName: 'Emma',     lastName: 'Lefèvre',    email: 'e.lefevre@email.com',        category: 'senior',  status: 'pending',  dues: 'unpaid',  attendance: 0,  joinDate: '2026-04-10' },
    { id: 13, firstName: 'Youssouf', lastName: 'Touré',      email: 'y.toure@email.com',          category: 'senior',  status: 'active',   dues: 'paid',    attendance: 87, joinDate: '2024-12-01' },
    { id: 14, firstName: 'Inès',     lastName: 'Moreau',     email: 'i.moreau@email.com',         category: 'senior',  status: 'active',   dues: 'paid',    attendance: 94, joinDate: '2025-01-20' },
    { id: 15, firstName: 'Seydou',   lastName: 'Cissé',      email: 's.cisse@email.com',          category: 'senior',  status: 'active',   dues: 'paid',    attendance: 82, joinDate: '2024-11-15' },
    { id: 16, firstName: 'Camille',  lastName: 'Roux',       email: 'c.roux@email.com',           category: 'senior', status: 'active',   dues: 'paid',    attendance: 70, joinDate: '2023-09-05' },
    { id: 17, firstName: 'Bakary',   lastName: 'Diarra',     email: 'b.diarra@email.com',         category: 'senior',  status: 'active',   dues: 'partial', attendance: 76, joinDate: '2025-02-28' },
    { id: 18, firstName: 'Lucas',    lastName: 'Girard',     email: 'l.girard@email.com',         category: 'senior',  status: 'inactive', dues: 'unpaid',  attendance: 15, joinDate: '2024-10-05' },
    { id: 19, firstName: 'Aïssata',  lastName: 'Coulibaly',  email: 'a.coulibaly@email.com',      category: 'senior',  status: 'active',   dues: 'paid',    attendance: 89, joinDate: '2024-09-25' },
    { id: 20, firstName: 'Thomas',   lastName: 'Lambert',    email: 't.lambert@email.com',        category: 'senior',  status: 'active',   dues: 'paid',    attendance: 83, joinDate: '2025-01-05' },
    { id: 21, firstName: 'Mariama',  lastName: 'Sow',        email: 'm.sow@email.com',            category: 'senior',  status: 'active',   dues: 'paid',    attendance: 96, joinDate: '2025-03-12' },
    { id: 22, firstName: 'Hugo',     lastName: 'Leroy',      email: 'h.leroy@email.com',          category: 'senior',  status: 'pending',  dues: 'unpaid',  attendance: 0,  joinDate: '2026-04-12' },
    { id: 23, firstName: 'Awa',      lastName: 'Ndiaye',     email: 'a.ndiaye@email.com',         category: 'senior', status: 'active',   dues: 'paid',    attendance: 68, joinDate: '2023-11-20' },
    { id: 24, firstName: 'Nathan',   lastName: 'Fournier',   email: 'n.fournier@email.com',       category: 'senior',  status: 'active',   dues: 'paid',    attendance: 80, joinDate: '2024-12-20' },
];

// ---- Events / Schedule ----
const EVENTS = [
    { 
        id: 1,  
        title: 'AS FIVE 94 vs FC Étoiles',    
        type: 'match',   
        date: '2026-04-04', 
        time: '09:30', 
        duration: '2h', 
        location: 'Stade AS FIVE',
        result: 'win',
        score: '3 - 1',
        scorers: [
            { memberId: 1, count: 2 },
            { memberId: 3, count: 1 }
        ],
        assists: [
            { memberId: 2, count: 1 },
            { memberId: 5, count: 1 },
            { memberId: 6, count: 1 }
        ]
    },
    { 
        id: 2,  
        title: 'AS FIVE 94 vs Lions SC',    
        type: 'match',   
        date: '2026-04-11', 
        time: '09:30', 
        duration: '2h', 
        location: 'Stade AS FIVE',
        result: 'win',
        score: '2 - 0',
        scorers: [
            { memberId: 1, count: 1 },
            { memberId: 9, count: 1 }
        ],
        assists: [
            { memberId: 3, count: 2 }
        ]
    },
    { id: 3,  title: 'Match Hebdomadaire',    type: 'match',   date: '2026-04-18', time: '09:30', duration: '2h', location: 'Stade AS FIVE' },
    { id: 4,  title: 'Match Hebdomadaire',    type: 'match',   date: '2026-04-25', time: '09:30', duration: '2h', location: 'Stade AS FIVE' },
    { id: 5,  title: 'Match Hebdomadaire',    type: 'match',   date: '2026-05-02', time: '09:30', duration: '2h', location: 'Stade AS FIVE' },
    { id: 6,  title: 'Match Hebdomadaire',    type: 'match',   date: '2026-05-09', time: '09:30', duration: '2h', location: 'Stade AS FIVE' },
    { id: 7,  title: 'Match Hebdomadaire',    type: 'match',   date: '2026-05-16', time: '09:30', duration: '2h', location: 'Stade AS FIVE' },
    { id: 8,  title: 'Match Hebdomadaire',    type: 'match',   date: '2026-05-23', time: '09:30', duration: '2h', location: 'Stade AS FIVE' },
];

// ---- Weekly attendance data (for chart) ----
const WEEKLY_ATTENDANCE = [
    { day: 'Lun', present: 18, total: 24 },
    { day: 'Mar', present: 15, total: 24 },
    { day: 'Mer', present: 20, total: 24 },
    { day: 'Jeu', present: 12, total: 24 },
    { day: 'Ven', present: 22, total: 24 },
    { day: 'Sam', present: 16, total: 24 },
    { day: 'Dim', present: 8,  total: 24 },
];

// ---- Transactions ----
const TRANSACTIONS = [
    { id: 1,  date: '2026-04-12', description: 'Cotisation — Amadou Diallo',     category: 'Cotisation',        amount: 250,  type: 'income' },
    { id: 2,  date: '2026-04-11', description: 'Location gymnase — Mars',         category: 'Infrastructure',    amount: -180, type: 'expense' },
    { id: 3,  date: '2026-04-10', description: 'Cotisation — Chloé Petit',        category: 'Cotisation',        amount: 200,  type: 'income' },
    { id: 4,  date: '2026-04-09', description: 'Achat maillots équipe',            category: 'Équipement',        amount: -450, type: 'expense' },
    { id: 5,  date: '2026-04-08', description: 'Cotisation — Kévin Nguyen',       category: 'Cotisation',        amount: 200,  type: 'income' },
    { id: 6,  date: '2026-04-07', description: 'Inscription tournoi régional',     category: 'Compétition',       amount: -120, type: 'expense' },
    { id: 7,  date: '2026-04-05', description: 'Subvention mairie',                 category: 'Subvention',        amount: 1500, type: 'income' },
    { id: 8,  date: '2026-04-04', description: 'Cotisation — Sophie Martin',       category: 'Cotisation',        amount: 250,  type: 'income' },
    { id: 9,  date: '2026-04-03', description: 'Déplacement match extérieur',      category: 'Transport',         amount: -95,  type: 'expense' },
    { id: 10, date: '2026-04-02', description: 'Cotisation — Ousmane Sy',          category: 'Cotisation',        amount: 250,  type: 'income' },
    { id: 11, date: '2026-04-01', description: 'Assurance saison 2025-2026',       category: 'Assurance',         amount: -380, type: 'expense' },
    { id: 12, date: '2026-03-28', description: 'Vente buvette match',               category: 'Buvette',           amount: 320,  type: 'income' },
    { id: 13, date: '2026-03-25', description: 'Réparation filet',                  category: 'Équipement',        amount: -65,  type: 'expense' },
    { id: 14, date: '2026-03-20', description: 'Cotisation — Fatou Traoré',        category: 'Cotisation',        amount: 250,  type: 'income' },
    { id: 15, date: '2026-03-15', description: 'Frais arbitrage',                    category: 'Compétition',       amount: -85,  type: 'expense' },
];

// ---- Monthly financial data (for chart) ----
const MONTHLY_FINANCES = [
    { month: 'Nov',  income: 1800, expenses: 1200 },
    { month: 'Déc',  income: 2200, expenses: 1500 },
    { month: 'Jan',  income: 2800, expenses: 1100 },
    { month: 'Fév',  income: 1600, expenses: 1800 },
    { month: 'Mars', income: 3200, expenses: 1400 },
    { month: 'Avr',  income: 2970, expenses: 1375 },
];

// ---- Expense Breakdown ----
const EXPENSE_BREAKDOWN = [
    { label: 'Infrastructure',  amount: 2160, percent: 35, color: 'var(--accent-blue)' },
    { label: 'Équipement',      amount: 1545, percent: 25, color: 'var(--accent-purple)' },
    { label: 'Transport',        amount: 1140, percent: 18, color: 'var(--accent-amber)' },
    { label: 'Compétition',     amount: 822,  percent: 13, color: 'var(--accent-emerald)' },
    { label: 'Assurance',        amount: 555,  percent: 9,  color: 'var(--accent-rose)' },
];

// ---- Announcements ----
const ANNOUNCEMENTS = [
    {
        id: 1,
        title: 'Tournoi régional — Inscriptions ouvertes',
        body: 'Le tournoi régional aura lieu le 26 avril au Complexe sportif. Les inscriptions sont ouvertes jusqu\'au 20 avril. Merci de confirmer votre participation auprès du staff.',
        type: 'urgent',
        date: '2026-04-13',
        author: 'Roger K.'
    },
    {
        id: 2,
        title: 'Changement horaire entraînement',
        body: 'À partir du 21 avril, l\'entraînement du lundi passe de 19h00 à 19h30 suite à la nouvelle réservation du gymnase.',
        type: 'info',
        date: '2026-04-11',
        author: 'Roger K.'
    },
    {
        id: 3,
        title: 'Rappel cotisations',
        body: 'Nous rappelons aux membres n\'ayant pas encore réglé leur cotisation de le faire avant fin avril. Un paiement en 2 fois est possible.',
        type: 'info',
        date: '2026-04-08',
        author: 'Roger K.'
    },
    {
        id: 4,
        title: 'Victoire 3-1 contre FC Étoiles !',
        body: 'Bravo à toute l\'équipe pour ce beau succès ! Buteurs : A. Diallo (2), K. Nguyen (1). Prochain match le 3 mai.',
        type: 'success',
        date: '2026-04-06',
        author: 'Roger K.'
    },
];

// ---- Helper Functions ----

/**
 * Get initials from first and last name
 */
function getInitials(firstName, lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
}

/**
 * Get a deterministic color for a member based on their ID
 */
function getAvatarColor(id) {
    return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
}

/**
 * Format a date string to French locale
 */
function formatDateFR(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format currency in EUR
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount);
}

/**
 * Get French status label
 */
function getStatusLabel(status) {
    const labels = { active: 'Actif', inactive: 'Inactif', pending: 'En attente' };
    return labels[status] || status;
}

/**
 * Get French dues label
 */
function getDuesLabel(dues) {
    const labels = { paid: 'Payée', unpaid: 'Impayée', partial: 'Partielle' };
    return labels[dues] || dues;
}

/**
 * Get French category label
 */
function getCategoryLabel(cat) {
    const labels = { senior: 'Senior', junior: 'Junior', veteran: 'Vétéran' };
    return labels[cat] || cat;
}

/**
 * Get event type label in French
 */
function getEventTypeLabel(type) {
    const labels = { training: 'Entraînement', match: 'Match', tournament: 'Tournoi', meeting: 'Réunion' };
    return labels[type] || type;
}
