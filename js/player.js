// Player クラス - player.js

class Player {
    constructor(initialCash = 1000000) {
        this.cash = initialCash;
        this.portfolio = {}; // { companyId: { qty, avgPrice } }
        this.totalAsset = initialCash;
        this.maxAsset = initialCash; // 最大資産を記録
        this.trades = []; // 取引履歴
    }

    getPortfolioValue() {
        let value = 0;
        for (const [id, holding] of Object.entries(this.portfolio)) {
            if (holding.qty > 0) {
                value += holding.qty * companyMap[id].price;
            }
        }
        return value;
    }

    getTotalAsset() {
        return this.cash + this.getPortfolioValue();
    }

    updateTotalAsset() {
        this.totalAsset = this.getTotalAsset();
        this.maxAsset = Math.max(this.maxAsset, this.totalAsset);
    }

    buyStock(companyId, qty, price) {
        const cost = qty * price;
        if (this.cash < cost) {
            return { success: false, message: "現金残高が不足しています。" };
        }

        this.cash -= cost;

        if (!this.portfolio[companyId]) {
            this.portfolio[companyId] = { qty: 0, avgPrice: 0 };
        }

        const holding = this.portfolio[companyId];
        const totalCost = (holding.qty * holding.avgPrice) + cost;
        holding.qty += qty;
        holding.avgPrice = totalCost / holding.qty;

        // 取引履歴に記録
        this.trades.push({
            type: 'buy',
            companyId,
            qty,
            price,
            date: new Date()
        });

        this.updateTotalAsset();

        return {
            success: true,
            message: `${companyMap[companyId].name} を ${qty}株 購入しました。`,
            cost
        };
    }

    sellStock(companyId, qty, price) {
        const holding = this.portfolio[companyId];

        if (!holding || holding.qty < qty) {
            return { success: false, message: "保有株式数が不足しています。" };
        }

        const revenue = qty * price;
        this.cash += revenue;

        const costValue = holding.avgPrice * qty;
        const profit = revenue - costValue;

        holding.qty -= qty;

        // 取引履歴に記録
        this.trades.push({
            type: 'sell',
            companyId,
            qty,
            price,
            profit,
            date: new Date()
        });

        this.updateTotalAsset();

        return {
            success: true,
            message: `${companyMap[companyId].name} を ${qty}株 売却しました。`,
            profit,
            revenue
        };
    }

    getHoldingInfo(companyId) {
        const holding = this.portfolio[companyId];
        if (!holding || holding.qty <= 0) {
            return {
                qty: 0,
                avgPrice: 0,
                currentValue: 0,
                profit: 0,
                profitPercent: 0
            };
        }

        const currentPrice = companyMap[companyId].price;
        const currentValue = holding.qty * currentPrice;
        const costValue = holding.qty * holding.avgPrice;
        const profit = currentValue - costValue;
        const profitPercent = (profit / costValue) * 100;

        return {
            qty: holding.qty,
            avgPrice: holding.avgPrice,
            currentValue: currentValue,
            profit: profit,
            profitPercent: profitPercent
        };
    }

    getPortfolioBreakdown() {
        const breakdown = [];
        let totalValue = 0;

        for (const [id, holding] of Object.entries(this.portfolio)) {
            if (holding.qty > 0) {
                const company = companyMap[id];
                const value = holding.qty * company.price;
                totalValue += value;
                breakdown.push({
                    id,
                    name: company.name,
                    qty: holding.qty,
                    value: value,
                    percent: 0 // 後で計算
                });
            }
        }

        // パーセンテージを計算
        breakdown.forEach(item => {
            item.percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
        });

        return breakdown.sort((a, b) => b.value - a.value);
    }

    reset(initialCash) {
        this.cash = initialCash;
        this.portfolio = {};
        this.totalAsset = initialCash;
        this.maxAsset = initialCash;
        this.trades = [];
    }
}

// グローバルなプレイヤーインスタンス
let player = new Player(1000000);
