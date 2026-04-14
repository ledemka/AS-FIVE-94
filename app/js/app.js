/* ============================================
   SportFlow — Main Application Logic
   SPA navigation, rendering, interactions
   ============================================ */

(function () {
    'use strict';

    // ---- DOM References ----
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageTitle = document.getElementById('page-title');
    const themeToggle = document.getElementById('theme-toggle');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    const toastContainer = document.getElementById('toast-container');

    const PAGE_TITLES = {
        dashboard: 'Tableau de bord',
        members: 'Membres',
        schedule: 'Planning',
        finances: 'Finances',
        communications: 'Communications'
    };

    // ---- State ----
    let currentPage = 'dashboard';
    let currentCalMonth = new Date().getMonth();
    let currentCalYear = new Date().getFullYear();

    // ============================================
    // NAVIGATION
    // ============================================

    function navigateTo(page) {
        // Update nav
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Update pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById(`page-${page}`);
        if (target) {
            target.classList.add('active');
            // Re-trigger animation
            target.style.animation = 'none';
            target.offsetHeight; // reflow
            target.style.animation = '';
        }

        // Update title
        pageTitle.textContent = PAGE_TITLES[page] || page;
        currentPage = page;

        // Close mobile sidebar
        sidebar.classList.remove('open');

        // Render page content
        renderPage(page);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    // Card actions that navigate
    document.querySelectorAll('.card-action[data-page]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(a.dataset.page);
        });
    });

    // Mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar on overlay click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target !== mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // ============================================
    // THEME TOGGLE
    // ============================================

    function setTheme(dark) {
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        themeToggle.querySelector('.material-icons-round').textContent = dark ? 'light_mode' : 'dark_mode';
        localStorage.setItem('sportflow-theme', dark ? 'dark' : 'light');
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        setTheme(!isDark);
    });

    // Init theme from localStorage or system preference
    const savedTheme = localStorage.getItem('sportflow-theme');
    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else {
        setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    // ============================================
    // MODAL
    // ============================================

    function openModal(title, bodyHTML) {
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHTML;
        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ============================================
    // TOAST
    // ============================================

    function showToast(message, type = 'info') {
        const icons = { success: 'check_circle', error: 'error', info: 'info' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="material-icons-round">${icons[type]}</span>${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // ============================================
    // PAGE RENDERERS
    // ============================================

    function renderPage(page) {
        switch (page) {
            case 'dashboard': renderDashboard(); break;
            case 'members': renderMembers(); break;
            case 'schedule': renderSchedule(); break;
            case 'finances': renderFinances(); break;
            case 'communications': renderCommunications(); break;
        }
    }

    // ---- Dashboard ----
    function renderDashboard() {
        const activeMembers = MEMBERS.filter(m => m.status === 'active');
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const sessionsThisMonth = EVENTS.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        const avgAttendance = Math.round(activeMembers.reduce((s, m) => s + m.attendance, 0) / activeMembers.length);
        const totalIncome = TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

        // Animate stats counters
        animateCounter('stat-members-count', activeMembers.length);
        animateCounter('stat-sessions-count', sessionsThisMonth.length);
        document.getElementById('stat-attendance-rate').textContent = avgAttendance + '%';
        document.getElementById('stat-revenue-total').textContent = formatCurrency(totalIncome);

        // Attendance chart
        Charts.renderAttendanceChart('attendance-chart', WEEKLY_ATTENDANCE);

        // Upcoming events
        const upcomingList = document.getElementById('upcoming-events-list');
        const today = new Date().toISOString().slice(0, 10);
        const upcoming = EVENTS.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
        upcomingList.innerHTML = upcoming.map(e => {
            const d = new Date(e.date);
            return `
                <li class="event-item" data-event-id="${e.id}">
                    <div class="event-date-badge ${e.type}">
                        <span class="day">${d.getDate()}</span>
                        <span class="month">${MONTHS_FR[d.getMonth()].slice(0, 3)}</span>
                    </div>
                    <div class="event-info">
                        <div class="event-title">${e.title}</div>
                        <div class="event-meta">
                            <span class="material-icons-round">schedule</span>${e.time} · ${e.duration}
                            <span class="material-icons-round" style="margin-left:6px">place</span>${e.location}
                        </div>
                    </div>
                </li>
            `;
        }).join('');

        // Recent members
        const recentList = document.getElementById('recent-members-list');
        const recent = [...MEMBERS].sort((a, b) => b.joinDate.localeCompare(a.joinDate)).slice(0, 5);
        recentList.innerHTML = recent.map(m => `
            <li class="member-mini" data-member-id="${m.id}">
                <div class="member-avatar" style="background:${getAvatarColor(m.id)}">${getInitials(m.firstName, m.lastName)}</div>
                <div class="member-mini-info">
                    <div class="member-mini-name">${m.firstName} ${m.lastName}</div>
                    <div class="member-mini-date">Inscrit le ${formatDateFR(m.joinDate)}</div>
                </div>
                <span class="status-badge ${m.status}">${getStatusLabel(m.status)}</span>
            </li>
        `).join('');

        // Finance summary
        const finSummary = document.getElementById('finance-summary');
        const totalExpenses = Math.abs(TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
        const pendingDues = MEMBERS.filter(m => m.dues === 'unpaid' || m.dues === 'partial').length * 250;
        const balance = totalIncome - totalExpenses;

        finSummary.innerHTML = `
            <div class="finance-row">
                <span class="finance-row-label"><span class="finance-dot income"></span>Recettes</span>
                <span class="finance-row-value" style="color:var(--accent-emerald)">${formatCurrency(totalIncome)}</span>
            </div>
            <div class="finance-row">
                <span class="finance-row-label"><span class="finance-dot expense"></span>Dépenses</span>
                <span class="finance-row-value" style="color:var(--accent-rose)">${formatCurrency(totalExpenses)}</span>
            </div>
            <div class="finance-row">
                <span class="finance-row-label"><span class="finance-dot pending"></span>Cotisations en attente</span>
                <span class="finance-row-value" style="color:var(--accent-amber)">${formatCurrency(pendingDues)}</span>
            </div>
            <div class="finance-progress-bar">
                <div class="finance-progress-fill" style="width:0%; background:var(--gradient-emerald)" data-width="${Math.round((totalIncome / (totalIncome + totalExpenses)) * 100)}%"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-tertiary)">
                <span>Solde: <strong style="color:${balance >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}">${formatCurrency(balance)}</strong></span>
                <span>Budget utilisé: ${Math.round((totalExpenses / (totalIncome || 1)) * 100)}%</span>
            </div>
        `;

        // Animate progress bar
        requestAnimationFrame(() => {
            setTimeout(() => {
                finSummary.querySelectorAll('.finance-progress-fill').forEach(bar => {
                    bar.style.width = bar.dataset.width;
                });
            }, 300);
        });
    }

    // ---- Animated counter ----
    function animateCounter(elementId, target) {
        const el = document.getElementById(elementId);
        if (!el) return;
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 30));
        const interval = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            el.textContent = current;
        }, 30);
    }

    // ---- Members ----
    function renderMembers() {
        const searchInput = document.getElementById('member-search');
        const statusFilter = document.getElementById('member-status-filter');
        const categoryFilter = document.getElementById('member-category-filter');

        function render() {
            const query = searchInput.value.toLowerCase();
            const status = statusFilter.value;
            const category = categoryFilter.value;

            let filtered = MEMBERS.filter(m => {
                const matchSearch = !query || `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(query);
                const matchStatus = status === 'all' || m.status === status;
                const matchCategory = category === 'all' || m.category === category;
                return matchSearch && matchStatus && matchCategory;
            });

            const tbody = document.getElementById('members-table-body');
            tbody.innerHTML = filtered.map(m => {
                const attClass = m.attendance >= 80 ? 'high' : m.attendance >= 50 ? 'medium' : 'low';
                return `
                    <tr>
                        <td>
                            <div class="table-member">
                                <div class="table-member-avatar" style="background:${getAvatarColor(m.id)}">${getInitials(m.firstName, m.lastName)}</div>
                                <div class="table-member-info">
                                    <span class="table-member-name">${m.firstName} ${m.lastName}</span>
                                    <span class="table-member-email">${m.email}</span>
                                </div>
                            </div>
                        </td>
                        <td>${getCategoryLabel(m.category)}</td>
                        <td><span class="status-badge ${m.status}">${getStatusLabel(m.status)}</span></td>
                        <td><span class="status-badge ${m.dues}">${getDuesLabel(m.dues)}</span></td>
                        <td>
                            <div class="attendance-bar">
                                <div class="attendance-track"><div class="attendance-fill ${attClass}" style="width:${m.attendance}%"></div></div>
                                <span class="attendance-value">${m.attendance}%</span>
                            </div>
                        </td>
                        <td>${formatDateFR(m.joinDate)}</td>
                        <td>
                            <div class="table-actions">
                                <button class="table-action-btn" title="Voir" onclick="SportFlow.viewMember(${m.id})"><span class="material-icons-round">visibility</span></button>
                                <button class="table-action-btn" title="Modifier" onclick="SportFlow.editMember(${m.id})"><span class="material-icons-round">edit</span></button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            document.getElementById('members-count-info').textContent = `${filtered.length} membre${filtered.length > 1 ? 's' : ''}`;
        }

        searchInput.addEventListener('input', render);
        statusFilter.addEventListener('change', render);
        categoryFilter.addEventListener('change', render);

        render();

        // Add member button
        document.getElementById('add-member-btn').onclick = () => {
            openModal('Ajouter un membre', getMemberFormHTML());
            setupMemberForm();
        };
    }

    function getMemberFormHTML(member = null) {
        const m = member || { firstName: '', lastName: '', email: '', category: 'senior', status: 'active', dues: 'unpaid' };
        return `
            <form id="member-form" class="modal-form">
                <div class="form-group">
                    <label for="mf-first">Prénom</label>
                    <input type="text" id="mf-first" class="form-input" value="${m.firstName}" required>
                </div>
                <div class="form-group">
                    <label for="mf-last">Nom</label>
                    <input type="text" id="mf-last" class="form-input" value="${m.lastName}" required>
                </div>
                <div class="form-group">
                    <label for="mf-email">Email</label>
                    <input type="email" id="mf-email" class="form-input" value="${m.email}" required>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label for="mf-category">Catégorie</label>
                        <select id="mf-category" class="form-select">
                            <option value="senior" ${m.category === 'senior' ? 'selected' : ''}>Senior</option>
                            <option value="junior" ${m.category === 'junior' ? 'selected' : ''}>Junior</option>
                            <option value="veteran" ${m.category === 'veteran' ? 'selected' : ''}>Vétéran</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="mf-status">Statut</label>
                        <select id="mf-status" class="form-select">
                            <option value="active" ${m.status === 'active' ? 'selected' : ''}>Actif</option>
                            <option value="inactive" ${m.status === 'inactive' ? 'selected' : ''}>Inactif</option>
                            <option value="pending" ${m.status === 'pending' ? 'selected' : ''}>En attente</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px;">
                    <span class="material-icons-round">save</span>
                    ${member ? 'Enregistrer' : 'Ajouter'}
                </button>
            </form>
        `;
    }

    function setupMemberForm(memberId = null) {
        const form = document.getElementById('member-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (memberId) {
                const member = MEMBERS.find(m => m.id === memberId);
                if (member) {
                    member.firstName = document.getElementById('mf-first').value;
                    member.lastName = document.getElementById('mf-last').value;
                    member.email = document.getElementById('mf-email').value;
                    member.category = document.getElementById('mf-category').value;
                    member.status = document.getElementById('mf-status').value;
                    showToast('Membre mis à jour avec succès', 'success');
                }
            } else {
                MEMBERS.push({
                    id: MEMBERS.length + 1,
                    firstName: document.getElementById('mf-first').value,
                    lastName: document.getElementById('mf-last').value,
                    email: document.getElementById('mf-email').value,
                    category: document.getElementById('mf-category').value,
                    status: document.getElementById('mf-status').value,
                    dues: 'unpaid',
                    attendance: 0,
                    joinDate: new Date().toISOString().slice(0, 10)
                });
                showToast('Membre ajouté avec succès', 'success');
            }
            closeModal();
            renderMembers();
        });
    }

    // ---- Schedule / Calendar ----
    function renderSchedule() {
        renderCalendar();

        document.getElementById('cal-prev').onclick = () => {
            currentCalMonth--;
            if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; }
            renderCalendar();
        };

        document.getElementById('cal-next').onclick = () => {
            currentCalMonth++;
            if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
            renderCalendar();
        };

        document.getElementById('add-event-btn').onclick = () => {
            openModal('Nouvel événement', getEventFormHTML());
            setupEventForm();
        };
    }

    function renderCalendar() {
        document.getElementById('calendar-title').textContent = `${MONTHS_FR[currentCalMonth]} ${currentCalYear}`;

        const firstDay = new Date(currentCalYear, currentCalMonth, 1);
        const lastDay = new Date(currentCalYear, currentCalMonth + 1, 0);

        // Monday-based week: getDay() returns 0=Sun, so adjust
        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;

        const totalDays = lastDay.getDate();
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);

        const body = document.getElementById('calendar-body');
        let html = '';

        // Previous month fill
        const prevMonthLast = new Date(currentCalYear, currentCalMonth, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
            html += `<div class="cal-day other-month"><span class="cal-day-number">${prevMonthLast - i}</span></div>`;
        }

        // Current month
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${currentCalYear}-${String(currentCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const dayEvents = EVENTS.filter(e => e.date === dateStr);

            html += `<div class="cal-day ${isToday ? 'today' : ''}">`;
            html += `<span class="cal-day-number">${d}</span>`;
            dayEvents.forEach(e => {
                html += `<div class="cal-event ${e.type}" title="${e.title} — ${e.time}">${e.time} ${e.title}</div>`;
            });
            html += '</div>';
        }

        // Next month fill
        const totalCells = startOffset + totalDays;
        const remaining = (7 - (totalCells % 7)) % 7;
        for (let i = 1; i <= remaining; i++) {
            html += `<div class="cal-day other-month"><span class="cal-day-number">${i}</span></div>`;
        }

        body.innerHTML = html;
    }

    function getEventFormHTML() {
        return `
            <form id="event-form" class="modal-form">
                <div class="form-group">
                    <label for="ef-title">Titre</label>
                    <input type="text" id="ef-title" class="form-input" placeholder="Ex: Entraînement collectif" required>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label for="ef-date">Date</label>
                        <input type="date" id="ef-date" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label for="ef-time">Heure</label>
                        <input type="time" id="ef-time" class="form-input" required>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label for="ef-type">Type</label>
                        <select id="ef-type" class="form-select">
                            <option value="training">Entraînement</option>
                            <option value="match">Match</option>
                            <option value="tournament">Tournoi</option>
                            <option value="meeting">Réunion</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="ef-duration">Durée</label>
                        <input type="text" id="ef-duration" class="form-input" placeholder="Ex: 1h30">
                    </div>
                </div>
                <div class="form-group">
                    <label for="ef-location">Lieu</label>
                    <input type="text" id="ef-location" class="form-input" placeholder="Ex: Gymnase A">
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px;">
                    <span class="material-icons-round">add</span>
                    Créer l'événement
                </button>
            </form>
        `;
    }

    function setupEventForm() {
        const form = document.getElementById('event-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            EVENTS.push({
                id: EVENTS.length + 1,
                title: document.getElementById('ef-title').value,
                type: document.getElementById('ef-type').value,
                date: document.getElementById('ef-date').value,
                time: document.getElementById('ef-time').value,
                duration: document.getElementById('ef-duration').value || '1h',
                location: document.getElementById('ef-location').value || 'À définir'
            });
            closeModal();
            renderCalendar();
            showToast('Événement créé avec succès', 'success');
        });
    }

    // ---- Finances ----
    function renderFinances() {
        const income = TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = Math.abs(TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
        const balance = income - expenses;
        const pendingDues = MEMBERS.filter(m => m.dues !== 'paid').length * 250;

        document.getElementById('fin-income-value').textContent = formatCurrency(income);
        document.getElementById('fin-expenses-value').textContent = formatCurrency(expenses);
        document.getElementById('fin-balance-value').textContent = formatCurrency(balance);
        document.getElementById('fin-pending-value').textContent = formatCurrency(pendingDues);

        // Charts
        Charts.renderFinanceChart('finance-chart', MONTHLY_FINANCES);
        Charts.renderExpenseBreakdown('expense-breakdown', EXPENSE_BREAKDOWN);

        // Transactions table
        const tbody = document.getElementById('transactions-table-body');
        tbody.innerHTML = TRANSACTIONS.sort((a, b) => b.date.localeCompare(a.date)).map(t => `
            <tr>
                <td>${formatDateFR(t.date)}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td class="transaction-amount ${t.amount >= 0 ? 'positive' : 'negative'}">
                    ${t.amount >= 0 ? '+' : ''}${formatCurrency(t.amount)}
                </td>
                <td>
                    <span class="transaction-type ${t.type}">
                        <span class="material-icons-round" style="font-size:16px">${t.type === 'income' ? 'arrow_downward' : 'arrow_upward'}</span>
                        ${t.type === 'income' ? 'Recette' : 'Dépense'}
                    </span>
                </td>
            </tr>
        `).join('');

        // Add transaction button
        document.getElementById('add-transaction-btn').onclick = () => {
            openModal('Nouvelle transaction', getTransactionFormHTML());
            setupTransactionForm();
        };
    }

    function getTransactionFormHTML() {
        return `
            <form id="transaction-form" class="modal-form">
                <div class="form-group">
                    <label for="tf-desc">Description</label>
                    <input type="text" id="tf-desc" class="form-input" placeholder="Ex: Cotisation — Nom Prénom" required>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label for="tf-amount">Montant (€)</label>
                        <input type="number" id="tf-amount" class="form-input" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="tf-type">Type</label>
                        <select id="tf-type" class="form-select">
                            <option value="income">Recette</option>
                            <option value="expense">Dépense</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label for="tf-category">Catégorie</label>
                        <input type="text" id="tf-category" class="form-input" placeholder="Ex: Cotisation">
                    </div>
                    <div class="form-group">
                        <label for="tf-date">Date</label>
                        <input type="date" id="tf-date" class="form-input" value="${new Date().toISOString().slice(0, 10)}" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:8px;">
                    <span class="material-icons-round">add</span>
                    Ajouter
                </button>
            </form>
        `;
    }

    function setupTransactionForm() {
        const form = document.getElementById('transaction-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = document.getElementById('tf-type').value;
            const amount = parseFloat(document.getElementById('tf-amount').value);
            TRANSACTIONS.push({
                id: TRANSACTIONS.length + 1,
                date: document.getElementById('tf-date').value,
                description: document.getElementById('tf-desc').value,
                category: document.getElementById('tf-category').value || 'Autre',
                amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
                type: type
            });
            closeModal();
            renderFinances();
            showToast('Transaction ajoutée', 'success');
        });
    }

    // ---- Communications ----
    function renderCommunications() {
        const list = document.getElementById('announcements-list');
        list.innerHTML = ANNOUNCEMENTS.map(a => `
            <div class="announcement-item ${a.type}">
                <div class="announcement-title">${a.title}</div>
                <div class="announcement-body">${a.body}</div>
                <div class="announcement-meta">
                    <span class="material-icons-round">person</span>${a.author}
                    <span style="margin:0 6px">·</span>
                    <span class="material-icons-round">schedule</span>${formatDateFR(a.date)}
                </div>
            </div>
        `).join('');

        // Quick message form
        const form = document.getElementById('quick-message-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const subject = document.getElementById('msg-subject').value;
            const body = document.getElementById('msg-body').value;
            const recipients = document.getElementById('msg-recipients').value;

            if (!subject || !body) {
                showToast('Veuillez remplir tous les champs', 'error');
                return;
            }

            // Add as announcement
            ANNOUNCEMENTS.unshift({
                id: ANNOUNCEMENTS.length + 1,
                title: subject,
                body: body,
                type: 'info',
                date: new Date().toISOString().slice(0, 10),
                author: 'Roger K.'
            });

            form.reset();
            renderCommunications();
            showToast(`Message envoyé à : ${recipients === 'all' ? 'tous les membres' : recipients}`, 'success');
        };

        // New announcement button
        document.getElementById('new-announcement-btn').onclick = () => {
            document.getElementById('msg-subject').focus();
        };
    }

    // ============================================
    // GLOBAL API (for inline onclick handlers)
    // ============================================

    window.SportFlow = {
        viewMember(id) {
            const m = MEMBERS.find(m => m.id === id);
            if (!m) return;
            const attClass = m.attendance >= 80 ? 'high' : m.attendance >= 50 ? 'medium' : 'low';
            openModal(`${m.firstName} ${m.lastName}`, `
                <div style="text-align:center; margin-bottom:20px;">
                    <div class="member-avatar" style="background:${getAvatarColor(m.id)}; width:64px; height:64px; font-size:1.3rem; margin:0 auto 12px;">${getInitials(m.firstName, m.lastName)}</div>
                    <h3 style="font-size:1.1rem; font-weight:700;">${m.firstName} ${m.lastName}</h3>
                    <p style="color:var(--text-secondary); font-size:0.85rem;">${m.email}</p>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                    <div style="text-align:center; padding:12px; background:var(--bg-tertiary); border-radius:var(--radius-md);">
                        <div style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:4px;">Catégorie</div>
                        <div style="font-weight:700;">${getCategoryLabel(m.category)}</div>
                    </div>
                    <div style="text-align:center; padding:12px; background:var(--bg-tertiary); border-radius:var(--radius-md);">
                        <div style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:4px;">Statut</div>
                        <div><span class="status-badge ${m.status}">${getStatusLabel(m.status)}</span></div>
                    </div>
                    <div style="text-align:center; padding:12px; background:var(--bg-tertiary); border-radius:var(--radius-md);">
                        <div style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:4px;">Cotisation</div>
                        <div><span class="status-badge ${m.dues}">${getDuesLabel(m.dues)}</span></div>
                    </div>
                    <div style="text-align:center; padding:12px; background:var(--bg-tertiary); border-radius:var(--radius-md);">
                        <div style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:4px;">Présence</div>
                        <div style="font-weight:700; color:var(--accent-${attClass === 'high' ? 'emerald' : attClass === 'medium' ? 'amber' : 'rose'})">${m.attendance}%</div>
                    </div>
                </div>
                <div style="margin-top:16px; text-align:center; font-size:0.8rem; color:var(--text-tertiary);">
                    Inscrit le ${formatDateFR(m.joinDate)}
                </div>
            `);
        },

        editMember(id) {
            const m = MEMBERS.find(m => m.id === id);
            if (!m) return;
            openModal(`Modifier — ${m.firstName} ${m.lastName}`, getMemberFormHTML(m));
            setupMemberForm(id);
        }
    };

    // ============================================
    // NOTIFICATIONS
    // ============================================

    document.getElementById('notification-btn').addEventListener('click', () => {
        const pendingMembers = MEMBERS.filter(m => m.status === 'pending');
        const unpaidMembers = MEMBERS.filter(m => m.dues === 'unpaid');
        const upcomingEvents = EVENTS.filter(e => {
            const d = new Date(e.date);
            const today = new Date();
            const diff = (d - today) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= 3;
        });

        let html = '<div style="display:flex; flex-direction:column; gap:12px;">';

        if (pendingMembers.length) {
            html += `
                <div class="announcement-item urgent" style="padding:12px;">
                    <div class="announcement-title" style="font-size:0.85rem;">${pendingMembers.length} inscription(s) en attente</div>
                    <div class="announcement-body" style="font-size:0.78rem;">${pendingMembers.map(m => m.firstName + ' ' + m.lastName).join(', ')}</div>
                </div>
            `;
        }

        if (unpaidMembers.length) {
            html += `
                <div class="announcement-item info" style="padding:12px; border-left-color:var(--accent-amber);">
                    <div class="announcement-title" style="font-size:0.85rem;">${unpaidMembers.length} cotisation(s) impayée(s)</div>
                    <div class="announcement-body" style="font-size:0.78rem;">${unpaidMembers.map(m => m.firstName + ' ' + m.lastName).join(', ')}</div>
                </div>
            `;
        }

        upcomingEvents.forEach(e => {
            html += `
                <div class="announcement-item success" style="padding:12px;">
                    <div class="announcement-title" style="font-size:0.85rem;">${e.title}</div>
                    <div class="announcement-body" style="font-size:0.78rem;">${formatDateFR(e.date)} à ${e.time} — ${e.location}</div>
                </div>
            `;
        });

        if (!pendingMembers.length && !unpaidMembers.length && !upcomingEvents.length) {
            html += '<p style="text-align:center; color:var(--text-tertiary); padding:20px;">Aucune notification</p>';
        }

        html += '</div>';
        openModal('Notifications', html);
    });

    // ============================================
    // INIT
    // ============================================

    renderDashboard();

})();
