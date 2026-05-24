// Company クラス - company.js

class Company {
    constructor(id, name, sector, initialPrice, volatility, basePerformance, pe, dividend) {
        this.id = id;
        this.name = name;
        this.sector = sector;
        this.price = initialPrice;
        this.prevPrice = initialPrice;
        this.volatility = volatility;
        this.performance = basePerformance;
        this.cyclePhase = Math.random() * Math.PI * 2;
        this.newsEffect = 0;
        this.pe = pe;
        this.dividend = dividend;
        
        // 過去の価格履歴
        this.history = Array(GAME_CONFIG.HISTORY_LENGTH).fill(initialPrice);
        
        // セッションデータ
        this.daysSinceOpen = 0;
        this.highPrice = initialPrice;
        this.lowPrice = initialPrice;
    }

    updatePrice(macroStatus, newsEventMultiplier = 1.0) {
        this.prevPrice = this.price;
        this.daysSinceOpen++;

        // 業績サイクル（正弦波）
        this.cyclePhase += 0.02 + (Math.random() * 0.01);
        const cycleEffect = Math.sin(this.cyclePhase) * 0.02;
        
        // ランダムウォーク
        const randomShock = (Math.random() - 0.5) * this.volatility;
        
        // ファンダメンタル要因
        const fundamentalEffect = (macroStatus * 0.01) + (this.performance * 0.015);
        
        // 総変動率
        let changeRate = randomShock + cycleEffect + fundamentalEffect + (this.newsEffect * newsEventMultiplier);
        
        // ストップ高・ストップ安
        changeRate = Math.max(-0.15, Math.min(0.15, changeRate));

        // 価格を更新
        this.price = Math.round(this.price * (1 + changeRate));
        if (this.price < 10) this.price = 10;

        // 高値・安値を記録
        this.highPrice = Math.max(this.highPrice, this.price);
        this.lowPrice = Math.min(this.lowPrice, this.price);

        // ニュース効果を減衰
        this.newsEffect *= 0.8;

        // 履歴を更新
        this.history.shift();
        this.history.push(this.price);
    }

    getChangePercent() {
        if (this.prevPrice === 0) return 0;
        return ((this.price - this.prevPrice) / this.prevPrice) * 100;
    }

    getSessionChangePercent() {
        if (this.history[0] === 0) return 0;
        return ((this.price - this.history[0]) / this.history[0]) * 100;
    }

    getPriceDifference() {
        return this.price - this.prevPrice;
    }
}

// 企業インスタンスを作成
let companies = [];
let companyMap = {};

function initializeCompanies() {
    companies = [];
    companyMap = {};
    
    GAME_CONFIG.COMPANIES.forEach(config => {
        const company = new Company(
            config.id,
            config.name,
            config.sector,
            config.initialPrice,
            config.volatility,
            config.basePerformance,
            config.pe,
            config.dividend
        );
        companies.push(company);
        companyMap[config.id] = company;
    });
}

// 初期化
initializeCompanies();
