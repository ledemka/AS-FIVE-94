/* ============================================
   SportFlow — Lightweight Chart Engine
   Pure CSS/HTML bar charts (no external libs)
   ============================================ */

const Charts = {

    /**
     * Render attendance bar chart
     * @param {string} containerId - DOM element ID
     * @param {Array} data - [ { day, present, total } ]
     */
    renderAttendanceChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxVal = Math.max(...data.map(d => d.total));

        let html = '<div class="chart-bar-group">';
        data.forEach((d, i) => {
            const presentHeight = (d.present / maxVal) * 100;
            const totalHeight = (d.total / maxVal) * 100;
            html += `
                <div class="chart-bar-col">
                    <div style="display:flex; gap:3px; align-items:flex-end; height:100%; width:100%; justify-content:center;">
                        <div class="chart-bar blue" style="height:0%" data-height="${presentHeight}" title="Présents: ${d.present}"></div>
                        <div class="chart-bar emerald" style="height:0%" data-height="${totalHeight}" title="Total: ${d.total}"></div>
                    </div>
                    <span class="chart-bar-label">${d.day}</span>
                </div>
            `;
        });
        html += '</div>';
        html += `
            <div class="chart-legend">
                <div class="chart-legend-item"><div class="chart-legend-dot blue"></div>Présents</div>
                <div class="chart-legend-item"><div class="chart-legend-dot emerald"></div>Inscrits</div>
            </div>
        `;

        container.innerHTML = html;

        // Animate bars in
        requestAnimationFrame(() => {
            setTimeout(() => {
                container.querySelectorAll('.chart-bar').forEach(bar => {
                    bar.style.height = bar.dataset.height + '%';
                });
            }, 100);
        });
    },

    /**
     * Render finance bar chart (income vs expenses)
     * @param {string} containerId
     * @param {Array} data - [ { month, income, expenses } ]
     */
    renderFinanceChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expenses)));

        let html = '<div class="finance-bar-group">';
        data.forEach(d => {
            const incHeight = (d.income / maxVal) * 100;
            const expHeight = (d.expenses / maxVal) * 100;
            html += `
                <div class="finance-bar-col">
                    <div class="finance-bar-pair">
                        <div class="finance-bar income" style="height:0%" data-height="${incHeight}" title="Recettes: ${formatCurrency(d.income)}"></div>
                        <div class="finance-bar expense" style="height:0%" data-height="${expHeight}" title="Dépenses: ${formatCurrency(d.expenses)}"></div>
                    </div>
                    <span class="chart-bar-label">${d.month}</span>
                </div>
            `;
        });
        html += '</div>';
        html += `
            <div class="chart-legend">
                <div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--accent-emerald)"></div>Recettes</div>
                <div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--accent-rose)"></div>Dépenses</div>
            </div>
        `;

        container.innerHTML = html;

        requestAnimationFrame(() => {
            setTimeout(() => {
                container.querySelectorAll('.finance-bar').forEach(bar => {
                    bar.style.height = bar.dataset.height + '%';
                });
            }, 100);
        });
    },

    /**
     * Render expense breakdown progress bars
     * @param {string} containerId
     * @param {Array} data - [ { label, amount, percent, color } ]
     */
    renderExpenseBreakdown(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        data.forEach(d => {
            html += `
                <div class="breakdown-item">
                    <div class="breakdown-header">
                        <span class="breakdown-label">${d.label}</span>
                        <span class="breakdown-value">${formatCurrency(d.amount)}</span>
                    </div>
                    <div class="breakdown-bar">
                        <div class="breakdown-fill" style="width:0%; background:${d.color}" data-width="${d.percent}%"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        requestAnimationFrame(() => {
            setTimeout(() => {
                container.querySelectorAll('.breakdown-fill').forEach(bar => {
                    bar.style.width = bar.dataset.width;
                });
            }, 200);
        });
    },

    /**
     * Render a stacked horizontal bar for proportions
     * @param {string} containerId
     * @param {Array} data - [ { label, amount, percent, color } ]
     */
    renderStackedBar(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let barsHtml = '';
        let legendsHtml = '';

        data.forEach(d => {
            barsHtml += `<div class="stacked-bar-segment" style="width:0%; background:${d.color}" data-width="${d.percent}%" title="${d.label}: ${formatCurrency(d.amount)}"></div>`;
            legendsHtml += `
                <div class="stacked-bar-legend-item">
                    <div class="stacked-bar-dot" style="background:${d.color}"></div>
                    ${d.label} <span style="font-weight:700;">${d.percent}%</span>
                </div>
            `;
        });

        const html = `
            <div class="stacked-bar-container">
                ${barsHtml}
            </div>
            <div class="stacked-bar-legend">
                ${legendsHtml}
            </div>
        `;

        container.innerHTML = html;

        requestAnimationFrame(() => {
            setTimeout(() => {
                container.querySelectorAll('.stacked-bar-segment').forEach(bar => {
                    bar.style.width = bar.dataset.width;
                });
            }, 200);
        });
    }
};
