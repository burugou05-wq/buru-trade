// assets/js/app.js

/*
  THE WALL STREET – Trading Simulator
  -------------------------------------------------
  Entry point (ES Module) that wires together the modular
  components built during Phase Ⅰ.

  Responsibilities:
  • Initialise game data (companies, chart, UI bindings)
  • Maintain the main game loop (play/pause, speed control)
  • Provide a thin façade for UI event handlers that still use
    inline `onclick` attributes (e.g. buy/sell buttons).
  • Dispatch daily market updates (price + news) and refresh the
    UI accordingly.

  The heavy‑lifting (price model, GARCH/GBM, news queue, chart
  handling) lives in the dedicated modules under `assets/js/core`
  and `assets/js/utils`.  This file should stay lightweight and
  easy to read – perfect for future extensions (Phase Ⅱ, III …).
*/

// -------------------------------------------------------------------
// Imports – make sure each module exports the symbols used below.
// -------------------------------------------------------------------
import { initCompanies, renderMarketList, companies, selectCompanyById } from "./core/market.js";
import { initChart, updateChart } from "./core/chart.js";
import { showToast } from "./utils/toast.js";
import { GAME_SPEEDS, NEWS_EVENTS } from "./config/data.js";

// -------------------------------------------------------------------
// Global game state (kept simple; can be moved to a dedicated store).
// -------------------------------------------------------------------
let isRunning = false;               // Play / pause flag
let speedIdx = 0;                    // Index into GAME_SPEEDS array
let intervalId = null;               // setInterval handle
let dayCount = 0;                    // Simulation day counter
let macroEconomy = 1.0;               // 1.0 = neutral, >1 = bullish, <1 = bearish
let selectedCompany = null;          // Currently selected Company instance

// -------------------------------------------------------------------
// UI helper functions – manipulate DOM elements defined in index.html.
// -------------------------------------------------------------------
function updateDayCounter() {
  const el = document.getElementById("current-date");
  if (el) el.textContent = `Day ${dayCount}`;
}

function updateMacroIndicator() {
  const el = document.getElementById("macro-indicator");
  if (!el) return;
  const txt = macroEconomy > 1 ? "強気" : macroEconomy < 1 ? "弱気" : "安定";
  el.textContent = `マクロ経済: ${txt}`;
  el.className = macroEconomy > 1 ? "text-green-400" : macroEconomy < 1 ? "text-red-400" : "text-gray-400";
}

function renderSelectedCompanyInfo() {
  if (!selectedCompany) return;
  // Header of chart area
  const title = document.getElementById("chart-title");
  const sector = document.getElementById("chart-sector");
  const priceInfo = document.getElementById("chart-price-info");
  const price = document.getElementById("chart-price");
  const change = document.getElementById("chart-change");

  if (title) title.textContent = selectedCompany.name;
  if (sector) sector.textContent = selectedCompany.sector;
  if (priceInfo) priceInfo.classList.remove("hidden");
  if (price) price.textContent = `¥ ${selectedCompany.price.toLocaleString(undefined, {maximumFractionDigits: 2})}`;

  // Simple price change display (last vs current)
  const last = selectedCompany.history[selectedCompany.history.length - 2] ?? selectedCompany.price;
  const diff = selectedCompany.price - last;
  const pct = (diff / last) * 100;
  if (change) {
    const sign = diff >= 0 ? "+" : "-";
    change.textContent = `${sign}¥${Math.abs(diff).toLocaleString(undefined, {maximumFractionDigits: 2})} (${sign}${Math.abs(pct).toFixed(2)}%)`;
    change.className = diff >= 0 ? "text-emerald-400" : "text-rose-400";
  }
}

function togglePlayPause() {
  if (isRunning) {
    stopLoop();
  } else {
    startLoop();
  }
}

function startLoop() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(gameTick, GAME_SPEEDS[speedIdx]);
  isRunning = true;
  const btn = document.getElementById("btn-play-pause");
  if (btn) btn.innerHTML = "<i class='fa-solid fa-pause'></i>";
}
function stopLoop() {
  if (intervalId) clearInterval(intervalId);
  isRunning = false;
  const btn = document.getElementById("btn-play-pause");
  if (btn) btn.innerHTML = "<i class='fa-solid fa-play'></i>";
}
function cycleSpeed() {
  speedIdx = (speedIdx + 1) % GAME_SPEEDS.length;
  const btn = document.getElementById("btn-speed");
  if (btn) btn.textContent = `x${speedIdx + 1}`;
  // Restart interval if we are currently running
  if (isRunning) {
    clearInterval(intervalId);
    intervalId = setInterval(gameTick, GAME_SPEEDS[speedIdx]);
  }
}

// -------------------------------------------------------------------
// News handling – simple random generator for now (Phase Ⅱ will replace).
// -------------------------------------------------------------------
function maybeSpawnNews() {
  // 10% chance each day to emit a news item
  if (Math.random() < 0.1) {
    const news = NEWS_EVENTS[Math.floor(Math.random() * NEWS_EVENTS.length)];
    // Choose a random target company (or all)
    if (news.target === "ALL") {
      companies.forEach(c => c.addNews({
        size: news.effect,
        durationDays: 3,           // default duration – will be tuned later
        decayRate: 0.5            // exponential decay per day
      }));
    } else {
      const target = companies.find(c => c.id === news.target);
      if (target) {
        target.addNews({
          size: news.effect,
          durationDays: 3,
          decayRate: 0.5
        });
      }
    }
    showToast(news.text, news.isGood ? "success" : "error");
  }
}

// -------------------------------------------------------------------
// Core game tick – executed once per simulation day.
// -------------------------------------------------------------------
function gameTick() {
  dayCount++;
  // ① Update macro economy – for demo we random‑walk a bit
  const macroShock = (Math.random() - 0.5) * 0.02; // ±2 % per day
  macroEconomy = Math.max(0.7, Math.min(1.3, macroEconomy + macroShock));

  // ② Update every company’s price (price model lives inside Company)
  //    `marketUpdateAll` will take care of correlation & news internally.
  //    If the function does not exist yet we fallback to a simple loop.
  if (window.marketUpdateAll) {
    window.marketUpdateAll(macroEconomy);
  } else {
    // Basic fallback – iterate over companies directly
    companies.forEach(c => c.updatePrice(macroEconomy));
  }

  // ③ Potentially emit a news event
  maybeSpawnNews();

  // ④ Refresh UI
  renderMarketList(selectedCompany?.id);
  if (selectedCompany) {
    renderSelectedCompanyInfo();
    updateChart(); // chart.js helper – redraw with new history
  }
  updateDayCounter();
  updateMacroIndicator();
}

// -------------------------------------------------------------------
// UI binding – executed once after the DOM is ready.
// -------------------------------------------------------------------
function bindUI() {
  const playBtn = document.getElementById("btn-play-pause");
  if (playBtn) playBtn.addEventListener("click", togglePlayPause);

  const speedBtn = document.getElementById("btn-speed");
  if (speedBtn) speedBtn.addEventListener("click", cycleSpeed);

  // The market list items use the global `selectCompany` function.
  // We expose a thin wrapper that also updates the trade panel.
  window.selectCompany = (id) => {
    selectedCompany = companies.find(c => c.id === id) || null;
    // Update the right‑hand trade panel visibility
    const tradePanel = document.getElementById("trade-panel");
    const placeholder = document.getElementById("trade-placeholder");
    if (selectedCompany) {
      if (tradePanel) tradePanel.classList.remove("hidden");
      if (placeholder) placeholder.classList.add("hidden");
      renderSelectedCompanyInfo();
    } else {
      if (tradePanel) tradePanel.classList.add("hidden");
      if (placeholder) placeholder.classList.remove("hidden");
    }
    renderMarketList(selectedCompany?.id);
  };

  // Expose buy/sell helpers for the inline onclick attributes.
  window.buyStock = () => {
    if (!selectedCompany) return showToast("銘柄を選択してください", "error");
    const qty = Number(document.getElementById("trade-qty")?.value) || 0;
    if (qty <= 0) return showToast("数量は正の数で入力してください", "error");
    // Placeholder – actual portfolio logic lives in another module.
    // Here we simply emit a toast to confirm the action.
    showToast(`購入: ${selectedCompany.name} × ${qty} 株`, "success");
  };

  window.sellStock = () => {
    if (!selectedCompany) return showToast("銘柄を選択してください", "error");
    const qty = Number(document.getElementById("trade-qty")?.value) || 0;
    if (qty <= 0) return showToast("数量は正の数で入力してください", "error");
    showToast(`売却: ${selectedCompany.name} × ${qty} 株`, "info");
  };

  // Quantity quick‑add buttons used by the original markup.
  window.setTradeQty = (delta) => {
    const el = document.getElementById("trade-qty");
    if (!el) return;
    const cur = Number(el.value) || 0;
    el.value = cur + delta;
  };
  window.setTradeQtyMax = () => {
    // In a full implementation this would use the player's cash.
    const el = document.getElementById("trade-qty");
    if (!el) return;
    el.value = 1000; // placeholder
  };
}

// -------------------------------------------------------------------
// Initialise the whole application – called once the page loads.
// -------------------------------------------------------------------
function init() {
  // 1️⃣ Load static data and create Company objects.
  initCompanies();

  // 2️⃣ Initialise Chart.js (the empty chart will be populated when a
  //    company is selected).
  initChart();

  // 3️⃣ Bind UI events.
  bindUI();

  // 4️⃣ Render the market list for the first time (no selection yet).
  renderMarketList();

  // 5️⃣ Show initial day / macro information.
  updateDayCounter();
  updateMacroIndicator();
}

// Run when DOM is ready (defer script already ensures this, but we keep
// the guard for safety).
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
