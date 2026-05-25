// BURU_TRADE - Web version (JavaScript)
// Simple stock trading simulation playable in the browser.

class Company {
    constructor(name, basePrice) {
        this.name = name;
        this.basePrice = basePrice;
        this.price = basePrice;
    }
    fluctuate() {
        const change = (Math.random() * 0.2) - 0.1; // -10% .. +10%
        this.price = Math.max(1, Math.round(this.price * (1 + change) * 100) / 100);
    }
}

class Investor {
    constructor(cash = 1000) {
        this.cash = cash;
        this.holdings = {}; // name -> shares
    }
    buy(company, shares) {
        const cost = company.price * shares;
        if (cost > this.cash) return false;
        this.cash -= cost;
        this.holdings[company.name] = (this.holdings[company.name] || 0) + shares;
        return true;
    }
    sell(company, shares) {
        const owned = this.holdings[company.name] || 0;
        if (shares > owned) return false;
        const revenue = company.price * shares;
        this.cash += revenue;
        const remaining = owned - shares;
        if (remaining === 0) delete this.holdings[company.name];
        else this.holdings[company.name] = remaining;
        return true;
    }
    netWorth(companies) {
        let total = this.cash;
        for (const comp of companies) {
            const shares = this.holdings[comp.name] || 0;
            total += shares * comp.price;
        }
        return Math.round(total * 100) / 100;
    }
}

// ---------- Game Setup ----------
const companyNames = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"];
let companies = companyNames.map(n => new Company(n, Math.floor(Math.random() * 91) + 10));
let investor = new Investor();
let day = 1;

// ---------- DOM Elements ----------
const dayEl = document.getElementById('day');
const cashEl = document.getElementById('cash');
const netWorthEl = document.getElementById('netWorth');
const holdingsList = document.getElementById('holdingsList');
const marketTableBody = document.querySelector('#marketTable tbody');
const actionSelect = document.getElementById('actionSelect');
const tradeForm = document.getElementById('tradeForm');
const companySelect = document.getElementById('companySelect');
const shareInput = document.getElementById('shareInput');
const confirmBtn = document.getElementById('confirmBtn');
const quitBtn = document.getElementById('quitBtn');
const messageBox = document.getElementById('message');

function showMessage(text, type = 'success') {
    messageBox.textContent = text;
    messageBox.className = 'message ' + (type === 'error' ? 'error' : 'success');
    setTimeout(() => { messageBox.textContent = ''; messageBox.className = 'message'; }, 3000);
}

function updateUI() {
    dayEl.textContent = day;
    cashEl.textContent = investor.cash.toFixed(2);
    netWorthEl.textContent = investor.netWorth(companies).toFixed(2);

    // holdings
    holdingsList.innerHTML = '';
    const entries = Object.entries(investor.holdings);
    if (entries.length === 0) {
        holdingsList.innerHTML = '<li>(none)</li>';
    } else {
        for (const [name, shares] of entries) {
            const li = document.createElement('li');
            li.textContent = `${name}: ${shares} shares`;
            holdingsList.appendChild(li);
        }
    }

    // market table
    marketTableBody.innerHTML = '';
    for (const comp of companies) {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        tdName.textContent = comp.name;
        const tdPrice = document.createElement('td');
        tdPrice.textContent = `$${comp.price.toFixed(2)}`;
        tr.appendChild(tdName);
        tr.appendChild(tdPrice);
        marketTableBody.appendChild(tr);
    }

    // populate company dropdown for trade actions
    companySelect.innerHTML = '';
    for (const comp of companies) {
        const opt = document.createElement('option');
        opt.value = comp.name;
        opt.textContent = `${comp.name} ($${comp.price.toFixed(2)})`;
        companySelect.appendChild(opt);
    }
}

function nextDay() {
    // fluctuate prices
    for (const comp of companies) {
        comp.fluctuate();
    }
    day += 1;
    updateUI();
}

// ---------- Event Handlers ----------
actionSelect.addEventListener('change', () => {
    const action = actionSelect.value;
    if (action === 'buy' || action === 'sell') {
        tradeForm.classList.remove('hidden');
    } else {
        tradeForm.classList.add('hidden');
        if (action === 'skip') nextDay();
    }
});

confirmBtn.addEventListener('click', () => {
    const action = actionSelect.value;
    const companyName = companySelect.value;
    const shares = parseInt(shareInput.value, 10);
    if (!shares || shares <= 0) {
        showMessage('Invalid number of shares.', 'error');
        return;
    }
    const comp = companies.find(c => c.name === companyName);
    if (!comp) {
        showMessage('Company not found.', 'error');
        return;
    }
    let ok = false;
    if (action === 'buy') {
        ok = investor.buy(comp, shares);
        if (ok) showMessage(`Bought ${shares} of ${companyName}.`);
        else showMessage('Not enough cash.', 'error');
    } else if (action === 'sell') {
        ok = investor.sell(comp, shares);
        if (ok) showMessage(`Sold ${shares} of ${companyName}.`);
        else showMessage("You don't own that many shares.", 'error');
    }
    if (ok) nextDay();
});

quitBtn.addEventListener('click', () => {
    alert(`Final net worth: $${investor.netWorth(companies).toFixed(2)}`);
});

// Initial render
updateUI();
