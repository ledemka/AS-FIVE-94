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
    // ---- API & Synchronization ----
    const API_BASE = 'http://localhost:3000';

    const Api = {
        async fetch(endpoint, options = {}) {
            try {
                const response = await fetch(`${API_BASE}${endpoint}`, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                });
                if (!response.ok) throw new Error(`API Error: ${response.status}`);
                return await response.json();
            } catch (error) {
                showToast(`Erreur API: ${error.message}`, 'error');
                throw error;
            }
        },
        get: (e) => Api.fetch(e),
        post: (e, d) => Api.fetch(e, { method: 'POST', body: JSON.stringify(d) }),
        put: (e, d) => Api.fetch(e, { method: 'PUT', body: JSON.stringify(d) }),
        delete: (e) => Api.fetch(e, { method: 'DELETE' }),
    };

    const DataSync = {
        async pullAll() {
            try {
                const [members, events, finances] = await Promise.all([
                    Api.get('/members'),
                    Api.get('/events'),
                    Api.get('/finances')
                ]);
                
                // Mettre à jour les références globales
                MEMBERS.length = 0; MEMBERS.push(...members);
                EVENTS.length = 0; EVENTS.push(...events);
                TRANSACTIONS.length = 0; TRANSACTIONS.push(...finances);
                
                renderPage(currentPage);
                return true;
            } catch (e) {
                console.error('Échec de la synchronisation initiale. Utilisation des données locales/mock.', e);
                return false;
            }
        }
    };

    // Initialisation : Synchronisation avec le backend NestJS
    DataSync.pullAll();

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
        if (!MEMBERS || MEMBERS.length === 0) {
            // Afficher des valeurs par défaut si pas de membres (évite division par zéro)
            document.getElementById('stat-active-members').textContent = '0';
            document.getElementById('stat-sessions-month').textContent = '0';
            document.getElementById('stat-avg-attendance').textContent = '0%';
            document.getElementById('stat-win-rate').textContent = '0%';
            return;
        }

        const activeMembers = MEMBERS.filter(m => m.status === 'active');
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const sessionsThisMonth = EVENTS.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        
        const totalAttendance = activeMembers.reduce((s, m) => s + (m.attendance || 0), 0);
        const avgAttendance = activeMembers.length > 0 ? Math.round(totalAttendance / activeMembers.length) : 0;
        
        // Sports Stats Calculation
        const playedMatches = EVENTS.filter(e => e.type === 'match' && e.result && e.result !== 'pending');
        const wins = playedMatches.filter(e => e.result === 'win').length;
        const winRate = playedMatches.length > 0 ? Math.round((wins / playedMatches.length) * 100) : 0;

        // Scorer & Assist Rankings
        const scorersMap = {};
        const assistsMap = {};

        const processStat = (statField, map) => {
            if (!statField) return;
            if (typeof statField[0] === 'object') {
                statField.forEach(s => map[s.memberId] = (map[s.memberId] || 0) + s.count);
            } else {
                statField.forEach(id => map[id] = (map[id] || 0) + 1);
            }
        };

        EVENTS.forEach(e => {
            processStat(e.scorersGreen, scorersMap);
            processStat(e.scorersOrange, scorersMap);
            processStat(e.scorers, scorersMap); // Legacy compatibility
            
            processStat(e.assistsGreen, assistsMap);
            processStat(e.assistsOrange, assistsMap);
            processStat(e.assists, assistsMap);
        });

        const getTopRanking = (map) => {
            return Object.entries(map)
                .map(([id, count]) => ({ member: MEMBERS.find(m => m.id == id), count }))
                .filter(item => item.member)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
        };

        const topScorers = getTopRanking(scorersMap);
        const topAssists = getTopRanking(assistsMap);

        // Update Dashboard Stats
        animateCounter('stat-members-count', activeMembers.length);
        animateCounter('stat-sessions-count', sessionsThisMonth.length);
        document.getElementById('stat-attendance-rate').textContent = avgAttendance + '%';
        document.getElementById('stat-winrate-value').textContent = winRate + '%';
        document.getElementById('stat-matches-count').textContent = playedMatches.length + ' m.';

        // Render Rankings
        const renderRankList = (elId, list, label) => {
            const el = document.getElementById(elId);
            if (!list.length) {
                el.innerHTML = `<li class="ranking-empty">Aucune donnée disponible</li>`;
                return;
            }
            el.innerHTML = list.map((item, index) => `
                <li class="ranking-item">
                    <div class="ranking-pos">${index + 1}</div>
                    <div class="ranking-member">
                        <div class="member-avatar-xs" style="background:${getAvatarColor(item.member.id)}">${getInitials(item.member.firstName, item.member.lastName)}</div>
                        <span>${item.member.firstName} ${item.member.lastName}</span>
                    </div>
                    <div class="ranking-count"><strong>${item.count}</strong> ${label}</div>
                </li>
            `).join('');
        };

        renderRankList('top-scorers-list', topScorers, 'buts');
        renderRankList('top-assists-list', topAssists, 'p.');

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
                        <div class="event-title">${e.title} ${e.score ? `<span class="event-score-tag">${e.score}</span>` : ''}</div>
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
        const totalIncome = TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
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
                <div class="finance-progress-fill" style="width:0%; background:var(--gradient-emerald)" data-width="${Math.round((totalIncome / ((totalIncome + totalExpenses) || 1)) * 100)}%"></div>
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
                return matchSearch && matchStatus;
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
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const memberData = {
                firstName: document.getElementById('mf-first').value,
                lastName: document.getElementById('mf-last').value,
                email: document.getElementById('mf-email').value,
                status: document.getElementById('mf-status').value,
            };

            try {
                if (memberId) {
                    await Api.put(`/members/${memberId}`, memberData);
                    showToast('Membre mis à jour', 'success');
                } else {
                    await Api.post('/members', memberData);
                    showToast('Membre ajouté avec succès', 'success');
                }
                closeModal();
                await DataSync.pullAll();
            } catch (err) {
                console.error(err);
            }
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
                if (e.type === 'match') {
                    const hasPassed = dateStr <= todayStr;
                    
                    let sg = e.scoreGreen;
                    let so = e.scoreOrange;
                    if (sg === undefined || so === undefined || sg === '' || so === '') {
                        if (e.score) {
                            const parts = e.score.split('-');
                            sg = parts[0]?.trim() || '0';
                            so = parts[1]?.trim() || '0';
                        } else {
                            sg = '0';
                            so = '0';
                        }
                    }

                    let displayScore = hasPassed ? `${sg} - ${so}` : `0 - 0`;
                    const eventText = `Vert [${displayScore}] Orange`;
                    
                    let tooltipHtml = '';
                    if (hasPassed) {
                         const getNames = (scorersArr) => {
                             if (!scorersArr || !scorersArr.length) return '';
                             
                             // Support pour tableau d'IDs (API) ou tableau d'objets (Legacy/Mock)
                             let processed = [];
                             if (typeof scorersArr[0] === 'object') {
                                 processed = scorersArr;
                             } else {
                                 // Compter les occurrences pour les IDs plats
                                 const counts = {};
                                 scorersArr.forEach(id => counts[id] = (counts[id] || 0) + 1);
                                 processed = Object.entries(counts).map(([id, count]) => ({ memberId: id, count }));
                             }

                             return processed.map(s => {
                                 const m = MEMBERS.find(x => x.id == s.memberId);
                                 const name = m ? `${m.firstName} ${m.lastName}` : `Anonyme`;
                                 return s.count > 1 ? `${name} (x${s.count})` : name;
                             }).join(', ');
                         };
                         const verts = getNames(e.scorersGreen) || 'Aucun'; 
                         const oranges = getNames(e.scorersOrange) || 'Aucun';

                         tooltipHtml = `
                             <div class="match-tooltip">
                                 <div class="tooltip-score">${displayScore}</div>
                                 <div class="tooltip-team tooltip-vert">
                                    <span class="icon">⚽</span> Verts :
                                    <span class="tooltip-team-body">${verts}</span>
                                 </div>
                                 <div class="tooltip-team tooltip-orange">
                                    <span class="icon">⚽</span> Oranges :
                                    <span class="tooltip-team-body">${oranges}</span>
                                 </div>
                             </div>
                         `;
                    }
                    
                    html += `<div class="cal-event cal-event-match ${e.result || ''}" onclick="SportFlow.editEvent(${e.id})">
                                ${eventText}
                                ${tooltipHtml}
                             </div>`;
                } else {
                    html += `<div class="cal-event ${e.type}" onclick="SportFlow.editEvent(${e.id})" title="${e.title} — ${e.time}">${e.title}</div>`;
                }
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

    function getEventFormHTML(event = null) {
        const e = event || { date: '', time: '09:30', endTime: '13:30', type: 'match', location: '', result: '', scoreGreen: '', scoreOrange: '', scorersGreen: [], assistsGreen: [], scorersOrange: [], assistsOrange: [] };
        const isMatch = e.type === 'match';

        const generateTags = (ids, category) => {
            if (!ids) return '';
            const idArray = ids.split(',').filter(id => id.trim() !== '');
            return idArray.map(id => {
                const member = MEMBERS.find(m => m.id == id);
                const name = member ? `${member.firstName} ${member.lastName}` : `ID: ${id}`;
                return `<div class="stat-badge">${name} <span class="badge-remove" onclick="SportFlow.removeStat('${category}', ${id}, this)">×</span></div>`;
            }).join('');
        };

        const generateStatSection = (label, category, data) => {
            const idsStr = data ? data.flatMap(item => Array(item.count).fill(item.memberId)).join(',') : '';
            return `
                <div class="form-group" style="margin-bottom:12px;">
                    <label style="font-size:0.75rem; display:flex; align-items:center;">
                        ${label} 
                        <span class="btn-add-stat" onclick="SportFlow.showStatPicker('${category}')">
                            <span class="material-icons-round" style="font-size:14px">add</span>
                        </span>
                    </label>
                    <div id="tags-${category}" class="stat-tags-container">
                        ${generateTags(idsStr, category)}
                    </div>
                    <input type="hidden" id="ef-${category}" value="${idsStr}">
                    <div id="picker-${category}" class="stat-picker-container" style="display:none;">
                        <select class="form-select stat-picker-select" onchange="SportFlow.addStat('${category}', this.value, this.options[this.selectedIndex].text); this.value=''; this.parentNode.style.display='none'">
                            <option value="">Sélectionner un joueur...</option>
                            ${MEMBERS.map(m => `<option value="${m.id}">${m.firstName} ${m.lastName}</option>`).join('')}
                        </select>
                    </div>
                </div>
            `;
        };

        return `
            <form id="event-form" class="modal-form">
                <style>
                    .score-input:focus { border-color: var(--accent-blue) !important; box-shadow: 0 0 0 3px var(--accent-blue-light) !important; outline: none; }
                    .score-input::-webkit-outer-spin-button, .score-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                    .score-input[type=number] { -moz-appearance: textfield; }
                    .stat-tags-container { display:flex; flex-wrap:wrap; gap:6px; min-height:36px; padding:6px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--bg-primary); margin-bottom:4px; }
                    .stat-badge { display:inline-flex; align-items:center; background:var(--bg-secondary); border:1px solid var(--border-color); padding:2px 8px; border-radius:12px; font-size:0.7rem; color:var(--text-primary); font-weight:600;}
                    .stat-badge .badge-remove { margin-left:6px; cursor:pointer; font-weight:bold; color:var(--text-secondary); display:flex; align-items:center; }
                    .stat-badge .badge-remove:hover { color:var(--accent-rose); }
                    .btn-add-stat { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:var(--accent-blue); color:white; cursor:pointer; margin-left:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .btn-add-stat:hover { opacity:0.8; }
                    .stat-picker-container { margin-top:4px; }
                    .stat-picker-select { padding:4px 8px; font-size:0.8rem; border-radius:var(--radius-sm); }
                </style>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label for="ef-date">Date</label>
                        <input type="date" id="ef-date" class="form-input" value="${e.date}" required>
                    </div>
                    <div class="form-group">
                        <label for="ef-type">Type</label>
                        <select id="ef-type" class="form-select" onchange="const s = document.getElementById('match-results-fields'); this.value==='match' ? s.style.display='block' : s.style.display='none'">
                            <option value="training" ${e.type === 'training' ? 'selected' : ''}>Entraînement</option>
                            <option value="match" ${e.type === 'match' ? 'selected' : ''}>Match</option>
                            <option value="tournament" ${e.type === 'tournament' ? 'selected' : ''}>Tournoi</option>
                        </select>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div class="form-group">
                        <label for="ef-time">Heure de début</label>
                        <input type="time" id="ef-time" class="form-input" value="${e.time || '09:30'}" required>
                    </div>
                    <div class="form-group">
                        <label for="ef-endtime">Heure de fin</label>
                        <input type="time" id="ef-endtime" class="form-input" value="${e.endTime || '13:30'}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="ef-location">Lieu</label>
                    <input type="text" id="ef-location" class="form-input" value="${e.location || ''}" placeholder="Ex: Stade AS FIVE">
                </div>
                
                <div id="match-results-fields" style="display:${isMatch ? 'block' : 'none'}; border:1px solid var(--border-color); padding:16px; border-radius:var(--radius-md); margin-top:12px; background:var(--bg-tertiary)">
                    <h4 style="font-size:0.9rem; margin-bottom:16px; color:var(--text-primary); text-align:center;">Feuille de match</h4>
                    
                    <div class="form-group">
                        <label for="ef-result">Résultat du match (AS FIVE)</label>
                        <select id="ef-result" class="form-select">
                            <option value="">Non joué</option>
                            <option value="win" ${e.result === 'win' ? 'selected' : ''}>Victoire</option>
                            <option value="draw" ${e.result === 'draw' ? 'selected' : ''}>Nul</option>
                            <option value="loss" ${e.result === 'loss' ? 'selected' : ''}>Défaite</option>
                        </select>
                    </div>

                    <div class="scoreboard-container" style="display:flex; align-items:center; justify-content:center; gap:20px; margin-bottom:24px; padding:20px; background:var(--bg-secondary); border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                            <div style="width:48px; height:48px; border-radius:50%; background:var(--accent-emerald); display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; font-weight:bold; box-shadow:0 4px 10px rgba(16,185,129,0.3);">V</div>
                            <span style="font-size:0.75rem; font-weight:700; color:var(--accent-emerald);">VERTS</span>
                        </div>
                        
                        <div style="display:flex; align-items:center; gap:12px;">
                            <input type="number" id="ef-score-green" class="form-input score-input" value="${e.scoreGreen || ''}" placeholder="0" min="0" style="width:64px; height:64px; font-size:2rem; text-align:center; font-weight:800; border:2px solid var(--border-color); border-radius:var(--radius-sm); color:var(--text-primary);">
                            <span style="font-size:1.5rem; font-weight:bold; color:var(--text-tertiary);">:</span>
                            <input type="number" id="ef-score-orange" class="form-input score-input" value="${e.scoreOrange || ''}" placeholder="0" min="0" style="width:64px; height:64px; font-size:2rem; text-align:center; font-weight:800; border:2px solid var(--border-color); border-radius:var(--radius-sm); color:var(--text-primary);">
                        </div>

                        <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                            <div style="width:48px; height:48px; border-radius:50%; background:var(--accent-amber); display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; font-weight:bold; box-shadow:0 4px 10px rgba(245,158,11,0.3);">O</div>
                            <span style="font-size:0.75rem; font-weight:700; color:var(--accent-amber);">ORANGES</span>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <!-- VERTS -->
                        <div style="padding:16px; border:1px solid rgba(16,185,129,0.2); border-radius:var(--radius-md); background:rgba(16,185,129,0.02);">
                            <h5 style="color:var(--accent-emerald); font-size:0.85rem; margin-bottom:12px; display:flex; align-items:center; gap:6px; font-weight:700;"><span class="material-icons-round" style="font-size:18px;">security</span> ÉQUIPE VERTE</h5>
                            ${generateStatSection('Buteurs', 'scorers-green', e.scorersGreen)}
                            ${generateStatSection('Passeurs', 'assists-green', e.assistsGreen)}
                        </div>

                        <!-- ORANGES -->
                        <div style="padding:16px; border:1px solid rgba(245,158,11,0.2); border-radius:var(--radius-md); background:rgba(245,158,11,0.02);">
                            <h5 style="color:var(--accent-amber); font-size:0.85rem; margin-bottom:12px; display:flex; align-items:center; gap:6px; font-weight:700;"><span class="material-icons-round" style="font-size:18px;">security</span> ÉQUIPE ORANGE</h5>
                            ${generateStatSection('Buteurs', 'scorers-orange', e.scorersOrange)}
                            ${generateStatSection('Passeurs', 'assists-orange', e.assistsOrange)}
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:16px;">
                    <span class="material-icons-round">save</span>
                    ${event ? 'Enregistrer les modifications' : 'Créer l\'événement'}
                </button>
            </form>
        `;
    }

    function setupEventForm(eventId = null) {
        const form = document.getElementById('event-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const parseStats = (str) => {
                if (!str) return [];
                const ids = str.split(',').map(s => parseInt(s.trim())).filter(id => !isNaN(id));
                const counts = {};
                ids.forEach(id => counts[id] = (counts[id] || 0) + 1);
                return Object.entries(counts).map(([id, count]) => ({ memberId: parseInt(id), count }));
            };

            const t1 = document.getElementById('ef-time').value;
            const t2 = document.getElementById('ef-endtime').value;
            let durationStr = '4h';
            if (t1 && t2) {
                const [h1, m1] = t1.split(':').map(Number);
                const [h2, m2] = t2.split(':').map(Number);
                let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
                if (diff < 0) diff += 24 * 60;
                const dh = Math.floor(diff / 60);
                const dm = diff % 60;
                durationStr = dm > 0 ? `${dh}h${dm.toString().padStart(2, '0')}` : `${dh}h`;
            }

            const type = document.getElementById('ef-type').value;
            const titleMap = {
                'match': 'Match Maintien',
                'training': 'Entraînement',
                'tournament': 'Tournoi Régional',
                'meeting': 'Réunion'
            };

            const sg = document.getElementById('ef-score-green')?.value || '';
            const so = document.getElementById('ef-score-orange')?.value || '';
            const scoreStr = (sg !== '' && so !== '') ? `${sg} - ${so}` : '';

            const scorersG = parseStats(document.getElementById('ef-scorers-green')?.value);
            const scorersO = parseStats(document.getElementById('ef-scorers-orange')?.value);
            const assistsG = parseStats(document.getElementById('ef-assists-green')?.value);
            const assistsO = parseStats(document.getElementById('ef-assists-orange')?.value);

            const mergeStats = (a1, a2) => {
                return [...a1, ...a2].reduce((acc, curr) => {
                    const existing = acc.find(x => x.memberId === curr.memberId);
                    if (existing) existing.count += curr.count;
                    else acc.push(curr);
                    return acc;
                }, []);
            };

            const eventData = {
                title: titleMap[type] || 'Événement',
                type: type,
                date: document.getElementById('ef-date').value,
                time: t1,
                location: document.getElementById('ef-location').value || 'Stade AS FIVE',
                scoreGreen: sg === '' ? 0 : parseInt(sg),
                scoreOrange: so === '' ? 0 : parseInt(so),
                scorersGreen: document.getElementById('ef-scorers-green')?.value.split(',').filter(x => x),
                scorersOrange: document.getElementById('ef-scorers-orange')?.value.split(',').filter(x => x),
                assistsGreen: document.getElementById('ef-assists-green')?.value.split(',').filter(x => x),
                assistsOrange: document.getElementById('ef-assists-orange')?.value.split(',').filter(x => x),
            };

            try {
                if (eventId) {
                    await Api.put(`/events/${eventId}`, eventData);
                    showToast('Événement mis à jour', 'success');
                } else {
                    await Api.post('/events', eventData);
                    showToast('Événement créé', 'success');
                }
                closeModal();
                await DataSync.pullAll();
            } catch (err) {
                console.error(err);
            }
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
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = document.getElementById('tf-type').value;
            const amount = parseFloat(document.getElementById('tf-amount').value);
            
            const transactionData = {
                date: document.getElementById('tf-date').value,
                description: document.getElementById('tf-desc').value,
                category: document.getElementById('tf-category').value || 'Autre',
                amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
                type: type
            };

            try {
                await Api.post('/finances', transactionData);
                closeModal();
                await DataSync.pullAll();
                showToast('Transaction ajoutée', 'success');
            } catch (err) {
                console.error(err);
            }
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
        showStatPicker(category) {
            const picker = document.getElementById(`picker-${category}`);
            if (picker) picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        },
        addStat(category, memberId, memberName) {
            if (!memberId) return;
            const hiddenInput = document.getElementById(`ef-${category}`);
            const tagsContainer = document.getElementById(`tags-${category}`);
            
            const currentVals = hiddenInput.value ? hiddenInput.value.split(',') : [];
            currentVals.push(memberId);
            hiddenInput.value = currentVals.join(',');
            
            const badge = document.createElement('div');
            badge.className = 'stat-badge';
            badge.innerHTML = `${memberName} <span class="badge-remove" onclick="SportFlow.removeStat('${category}', ${memberId}, this)">×</span>`;
            tagsContainer.appendChild(badge);
        },
        removeStat(category, memberId, el) {
            const hiddenInput = document.getElementById(`ef-${category}`);
            let currentVals = hiddenInput.value ? hiddenInput.value.split(',') : [];
            const index = currentVals.indexOf(memberId.toString());
            if (index > -1) {
                currentVals.splice(index, 1);
                hiddenInput.value = currentVals.join(',');
                el.parentElement.remove();
            }
        },
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
        },

        editEvent(id) {
            const e = EVENTS.find(ev => ev.id === id);
            if (!e) return;
            openModal(`Modifier — ${e.title}`, getEventFormHTML(e));
            setupEventForm(id);
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
