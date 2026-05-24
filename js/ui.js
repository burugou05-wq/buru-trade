// UI描画関数 - ui.js

let selectedCompanyId = null;
let activeNews = [];
let sparklineCharts = {};

// トースト通知
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    let colorClass = 'bg-blue-600';
    let icon = '<i class="fa-solid fa-circle-info mr-2"></i>';
    
    if (type === 'success') {
        colorClass = 'bg-emerald-600';
        icon = '<i class="fa-solid fa-check-circle mr-2"></i>';
    } else if (type === 'error') {
        colorClass = 'bg-rose-600';
        icon = '<i class="fa-solid fa-exclamation-circle mr-2"></i>';
    } else if (type === 'warning') {
        colorClass = 'bg-amber-600';
        icon = '<i class="fa-solid fa-exclamation-triangle mr-2"></i>';
    }
    
    toast.className = `${colorClass} text-white px-4 py-3 rounded-lg shadow-lg mb-3 opacity-0 transform translate-x-10 transition-all duration-300 flex items-center z-50 max-w-sm`;
    toast.innerHTML = `${icon}<span>${message}</span>`;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-x-10');
    });
}

function createSparkline(companyId) {
    const canvas = document.getElementById(`spark-${companyId}`);
    if (!canvas) return;

    const company = companyMap[companyId];
    if (!company) return;

    const ctx = canvas.getContext('2d');
    if (sparklineCharts[companyId]) {
        sparklineCharts[companyId].destroy();
    }

    sparklineCharts[companyId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: company.history.map((_, index) => index),
            datasets: [{
                data: [...company.history],
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.15)',
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.35,
                fill: true
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

function updateSparklineCharts() {
    Object.entries(sparklineCharts).forEach(([companyId, chart]) => {
        const company = companyMap[companyId];
        if (!company) return;
        chart.data.datasets[0].data = [...company.history];
        chart.update('none');
    });
}

// 銘柄リストの描画
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-10');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// 銘柄リストの描画
function renderMarketList() {
    const container = document.getElementById('market-list');
    container.innerHTML = '';

    companies.forEach(company => {
        const changePct = company.getChangePercent();
        const isUp = changePct >= 0;
        const colorClass = isUp ? 'text-emerald-400' : 'text-rose-400';
        const bgClass = company.id === selectedCompanyId 
            ? 'bg-blue-600/30 border-blue-500 ring-1 ring-blue-400' 
            : 'bg-slate-700/30 border-slate-600 hover:bg-slate-600/30';
        
        const el = document.createElement('div');
        el.className = `market-item p-4 rounded-lg border cursor-pointer transition ${bgClass}`;
        el.onclick = () => selectCompany(company.id);
        
        el.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="min-w-0">
                    <div class="font-bold text-white truncate">${company.name}</div>
                    <div class="text-xs text-slate-400 truncate">${company.sector}</div>
                </div>
                <div class="text-right ml-2">
                    <div class="font-bold text-white text-lg">${company.price.toLocaleString()}</div>
                    <div class="text-xs font-bold ${colorClass}">${formatPercent(changePct)}</div>
                </div>
            </div>
            <div class="market-chart mt-3">
                <canvas class="sparkline" id="spark-${company.id}" width="220" height="40"></canvas>
            </div>
            <div class="h-1 bg-slate-600 rounded-full overflow-hidden mt-2">
                <div class="h-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'} transition" style="width: ${Math.min(Math.abs(changePct) * 2, 100)}%"></div>
            </div>
        `;
        container.appendChild(el);
        createSparkline(company.id);
    });
}

// 選択企業の詳細を更新
function updateSelectedCompanyDetails() {
    const c = selectedCompanyId ? companyMap[selectedCompanyId] : null;
    
    if (!c) {
        document.getElementById('trade-placeholder').classList.remove('hidden');
        document.getElementById('trade-panel').classList.add('hidden');
        document.getElementById('trade-form').classList.add('hidden');
        document.getElementById('chart-price-info').classList.add('hidden');
        return;
    }

    // チャートタイトル情報
    document.getElementById('chart-title').textContent = c.name;
    document.getElementById('chart-sector').textContent = `${c.id} | ${c.sector}`;
    
    // 価格情報
    const priceInfo = document.getElementById('chart-price-info');
    priceInfo.classList.remove('hidden');
    
    const priceEl = document.getElementById('chart-price');
    const changeEl = document.getElementById('chart-change');
    const peEl = document.getElementById('chart-pe');
    const dividendEl = document.getElementById('chart-dividend');
    
    priceEl.textContent = formatMoney(c.price);
    
    const changePct = c.getChangePercent();
    const changeDiff = c.price - c.prevPrice;
    changeEl.textContent = `${changeDiff > 0 ? '▲' : changeDiff < 0 ? '▼' : '→'}${Math.abs(changeDiff).toLocaleString()} (${formatPercent(changePct)})`;
    changeEl.className = `text-sm font-bold ${changePct > 0 ? 'text-emerald-400' : changePct < 0 ? 'text-rose-400' : 'text-slate-400'}`;

    peEl.textContent = c.pe.toFixed(1) + 'x';
    dividendEl.textContent = c.dividend.toFixed(1) + '%';

    // アニメーション
    priceEl.parentElement.classList.remove('flash-up', 'flash-down');
    void priceEl.parentElement.offsetWidth;
    if (changeDiff > 0) priceEl.parentElement.classList.add('flash-up');
    else if (changeDiff < 0) priceEl.parentElement.classList.add('flash-down');

    // 保有情報
    const holding = player.getHoldingInfo(c.id);
    document.getElementById('holding-qty').textContent = holding.qty.toLocaleString();
    document.getElementById('holding-avg-price').textContent = formatMoney(holding.avgPrice);
    
    const profitEl = document.getElementById('holding-profit');
    const profitRateEl = document.getElementById('holding-profit-rate');
    
    profitEl.textContent = (holding.profit > 0 ? '+' : '') + formatMoney(holding.profit);
    profitEl.className = `text-2xl font-bold ${holding.profit > 0 ? 'text-emerald-400' : holding.profit < 0 ? 'text-rose-400' : 'text-slate-400'}`;
    
    profitRateEl.textContent = formatPercent(holding.profitPercent);
    profitRateEl.className = `text-2xl font-bold ${holding.profitPercent > 0 ? 'text-emerald-400' : holding.profitPercent < 0 ? 'text-rose-400' : 'text-slate-400'}`;

    // フォームを表示
    document.getElementById('trade-placeholder').classList.add('hidden');
    document.getElementById('trade-panel').classList.remove('hidden');
    document.getElementById('trade-form').classList.remove('hidden');

    // 取引金額を計算
    updateTradeTotal();
}

// 取引数量の変更
function setTradeQty(delta) {
    const input = document.getElementById('trade-qty');
    input.value = Math.max(1, parseInt(input.value || 0) + delta);
    updateTradeTotal();
}

function setTradeQtyMax() {
    if (!selectedCompanyId) return;
    const price = companyMap[selectedCompanyId].price;
    const maxQty = Math.floor(player.cash / price);
    document.getElementById('trade-qty').value = maxQty > 0 ? maxQty : 1;
    updateTradeTotal();
}

function updateTradeTotal() {
    if (!selectedCompanyId) return;
    const qty = parseInt(document.getElementById('trade-qty').value) || 0;
    const price = companyMap[selectedCompanyId].price;
    const total = qty * price;
    document.getElementById('trade-total').textContent = formatMoney(total);
}

// 株式購入
function buyStock() {
    if (!selectedCompanyId) {
        showToast("企業を選択してください", "error");
        return;
    }

    const company = companyMap[selectedCompanyId];
    const qty = parseInt(document.getElementById('trade-qty').value);

    if (isNaN(qty) || qty <= 0) {
        showToast("正しい数量を入力してください。", "error");
        return;
    }

    const result = player.buyStock(selectedCompanyId, qty, company.price);

    if (result.success) {
        showToast(result.message, "success");
        document.getElementById('trade-qty').value = '10';
        updatePlayerStats();
        updateSelectedCompanyDetails();
    } else {
        showToast(result.message, "error");
    }
}

// 株式売却
function sellStock() {
    if (!selectedCompanyId) {
        showToast("企業を選択してください", "error");
        return;
    }

    const company = companyMap[selectedCompanyId];
    const qty = parseInt(document.getElementById('trade-qty').value);

    if (isNaN(qty) || qty <= 0) {
        showToast("正しい数量を入力してください。", "error");
        return;
    }

    const result = player.sellStock(selectedCompanyId, qty, company.price);

    if (result.success) {
        const profitStr = formatMoney(Math.round(result.profit));
        const type = result.profit >= 0 ? "success" : "error";
        showToast(`${result.message} (損益: ${profitStr})`, type);
        document.getElementById('trade-qty').value = '10';
        updatePlayerStats();
        updateSelectedCompanyDetails();
    } else {
        showToast(result.message, "error");
    }
}

// プレイヤーステータス更新
function updatePlayerStats() {
    const totalAsset = player.getTotalAsset();
    const prevAsset = parseInt(document.getElementById('total-asset').dataset.value || 1000000);

    document.getElementById('total-asset').textContent = formatMoney(totalAsset);
    document.getElementById('total-asset').dataset.value = totalAsset;
    document.getElementById('cash-balance').textContent = formatMoney(player.cash);
    document.getElementById('portfolio-value').textContent = formatMoney(player.getPortfolioValue());

    // 資産の色変更
    const assetEl = document.getElementById('total-asset');
    assetEl.classList.remove('text-blue-400', 'text-emerald-400', 'text-rose-400');
    if (totalAsset > prevAsset) {
        assetEl.classList.add('text-emerald-400');
    } else if (totalAsset < prevAsset) {
        assetEl.classList.add('text-rose-400');
    } else {
        assetEl.classList.add('text-blue-400');
    }

    renderPortfolio();
    updateMissionsDisplay();
}

// ポートフォリオ描画
function renderPortfolio() {
    const container = document.getElementById('portfolio-list');
    const breakdown = player.getPortfolioBreakdown();

    container.innerHTML = '';

    if (breakdown.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-sm text-center mt-4">保有株式はありません</p>';
        document.getElementById('portfolio-count').textContent = '0';
        return;
    }

    document.getElementById('portfolio-count').textContent = breakdown.length.toString();

    breakdown.forEach(item => {
        const company = companyMap[item.id];
        const holding = player.getHoldingInfo(item.id);
        const isProfitable = holding.profit >= 0;
        const colorClass = isProfitable ? 'text-emerald-400' : 'text-rose-400';

        const el = document.createElement('div');
        el.className = `portfolio-item p-3 rounded-lg border border-slate-600 bg-slate-700/30 cursor-pointer hover:bg-slate-600/30 transition`;
        el.onclick = () => selectCompany(item.id);

        el.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <div class="font-bold text-sm text-white">${company.name}</div>
                    <div class="text-xs text-slate-400">${item.qty}株 (${item.percent.toFixed(1)}%)</div>
                </div>
                <div class="text-right">
                    <div class="font-bold text-white">${formatMoney(item.value)}</div>
                    <div class="text-xs font-bold ${colorClass}">${holding.profit > 0 ? '+' : ''}${formatMoney(holding.profit)}</div>
                </div>
            </div>
            <div class="h-1 bg-slate-600 rounded-full overflow-hidden">
                <div class="h-full ${isProfitable ? 'bg-emerald-500' : 'bg-rose-500'}" style="width: ${item.percent}%"></div>
            </div>
        `;
        container.appendChild(el);
    });
}

// ニュース追加
function addNews(newsEvent) {
    const ticker = document.getElementById('news-ticker');
    const currentText = ticker.textContent;
    ticker.textContent = `【DAY ${dayCount}】 ${newsEvent.text} --- ${currentText}`.substring(0, 200);

    // ティッカーアニメーションを再スタート
    ticker.style.animation = 'none';
    void ticker.offsetHeight;
    ticker.style.animation = '';

    activeNews.unshift({
        text: newsEvent.text,
        day: dayCount,
        isGood: newsEvent.isGood,
        sector: newsEvent.sector || 'その他'
    });

    if (activeNews.length > 10) activeNews.pop();

    // ニュース履歴は削除（簡略化）
    const icon = newsEvent.isGood ? '📈' : '📉';
    showToast(`${icon} ${newsEvent.text}`, newsEvent.isGood ? "success" : "warning");
}

// 企業選択
function selectCompany(id) {
    selectedCompanyId = id;
    renderMarketList();
    updateSelectedCompanyDetails();
    updateChart();
}

// ミッション表示
function updateMissionsDisplay() {
    const container = document.getElementById('missions-list');
    const missions = missionSystem.getActiveMissions();

    container.innerHTML = '';

    if (missions.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-sm text-center mt-4">すべてのミッションをクリアしました!</p>';
        document.getElementById('mission-progress').textContent = '3/3';
        return;
    }

    missions.forEach(mission => {
        const progressPercent = (mission.progress * 100);
        const el = document.createElement('div');
        el.className = 'mission-card p-3 rounded-lg border border-slate-600 bg-slate-700/30';

        el.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <div class="font-bold text-sm text-white">${mission.title}</div>
                    <div class="text-xs text-slate-400 mt-1">${mission.description}</div>
                </div>
                <div class="text-right text-xs">
                    <span class="font-bold text-amber-400">+${mission.reward}</span>
                </div>
            </div>
            <div class="h-2 bg-slate-600 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style="width: ${progressPercent}%"></div>
            </div>
            <div class="text-xs text-slate-400 mt-1 text-right">${Math.round(progressPercent)}%</div>
        `;
        container.appendChild(el);
    });

    const completed = missionSystem.getCompletedCount();
    const total = missionSystem.getTotalCount();
    document.getElementById('mission-progress').textContent = `${completed}/${total}`;
}

// トレード入力のリアルタイム計算
document.addEventListener('input', function(e) {
    if (e.target.id === 'trade-qty') {
        updateTradeTotal();
    }
});
