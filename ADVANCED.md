# 💾 ゲーム統計パネル追加実装ガイド

## 追加機能

### 1. ゲーム統計パネル（オプション追加）

次のコードを `index.html` の `<header>` セクション内に追加して、統計情報を表示できます:

```html
<div class="stats-overlay hidden" id="stats-overlay">
    <div class="stats-modal">
        <div class="stats-close" onclick="toggleStats()">×</div>
        <h2>📊 ゲーム統計</h2>
        
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-title">経過日数</span>
                <span class="stat-big" id="stat-days">1</span>
            </div>
            <div class="stat-card">
                <span class="stat-title">現在資産</span>
                <span class="stat-big" id="stat-total">¥1,000,000</span>
            </div>
            <div class="stat-card">
                <span class="stat-title">利益率</span>
                <span class="stat-big" id="stat-gain">0.00%</span>
            </div>
            <div class="stat-card">
                <span class="stat-title">保有銘柄</span>
                <span class="stat-big" id="stat-holdings">0</span>
            </div>
        </div>
        
        <div class="trades-list">
            <h3>取引履歴 (最新10件)</h3>
            <div id="trades-history" class="trades-scroll"></div>
        </div>
    </div>
</div>
```

### 2. CSS追加

`css/dashboard.css` に以下を追加:

```css
.stats-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.stats-overlay.hidden {
    display: none;
}

.stats-modal {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.8) 100%);
    border-radius: 1.5rem;
    border: 1px solid rgba(100, 116, 139, 0.3);
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y-auto;
    position: relative;
}

.stats-close {
    position: absolute;
    top: 1rem;
    right: 1.5rem;
    font-size: 2rem;
    cursor: pointer;
    color: #94a3b8;
    transition: color 0.3s ease;
}

.stats-close:hover {
    color: #f8fafc;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin: 1.5rem 0;
}

.stat-card {
    background: rgba(51, 65, 85, 0.5);
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(100, 116, 139, 0.3);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.stat-title {
    font-size: 0.875rem;
    color: #94a3b8;
    font-weight: 600;
}

.stat-big {
    font-size: 1.5rem;
    font-weight: 900;
    color: #60a5fa;
}

.trades-list {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(100, 116, 139, 0.3);
}

.trades-list h3 {
    margin-bottom: 1rem;
    color: #cbd5e1;
}

.trades-scroll {
    max-height: 300px;
    overflow-y-auto;
    space-y: 0.5rem;
}

.trade-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: rgba(51, 65, 85, 0.3);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}
```

### 3. JavaScript追加

`js/game.js` に以下の関数を追加:

```javascript
function toggleStats() {
    const overlay = document.getElementById('stats-overlay');
    if (overlay.classList.contains('hidden')) {
        overlay.classList.remove('hidden');
        updateStatsDisplay();
    } else {
        overlay.classList.add('hidden');
    }
}

function updateStatsDisplay() {
    const stats = getGameStats();
    
    document.getElementById('stat-days').textContent = stats.dayCount;
    document.getElementById('stat-total').textContent = formatMoney(stats.totalAsset);
    document.getElementById('stat-gain').textContent = formatPercent(stats.gainRate);
    document.getElementById('stat-holdings').textContent = stats.holdingsCount;
    
    // 取引履歴を表示
    const historyContainer = document.getElementById('trades-history');
    historyContainer.innerHTML = '';
    
    const recentTrades = player.trades.slice(-10).reverse();
    recentTrades.forEach(trade => {
        const type = trade.type === 'buy' ? '買' : '売';
        const typeClass = trade.type === 'buy' ? 'text-blue-400' : 'text-emerald-400';
        const el = document.createElement('div');
        el.className = 'trade-item';
        el.innerHTML = `
            <span>${companyMap[trade.companyId].name}</span>
            <span>${trade.qty}株 @ ¥${trade.price}</span>
            <span class="${typeClass}">${type}</span>
        `;
        historyContainer.appendChild(el);
    });
}
```

## 🎯 実装すると得られること

✅ ゲーム進捗の可視化
✅ 資産推移の確認
✅ 利益率の計算
✅ 取引履歴の追跡
✅ パフォーマンス分析

## 📌 その他の拡張アイデア

1. **セーブ機能**: localStorage を使用してゲーム状態を保存
2. **リーダーボード**: スコア記録と比較
3. **カスタマイズ**: 企業の追加、ニュースのカスタマイズ
4. **複数プレイ**: スコアランキング
5. **ダークモード/ライトモード**: UI テーマ切り替え
6. **エクスポート**: 取引履歴の CSV エクスポート

---

**注**: これらの機能は既存コードを壊さずに追加できるオプションです。
