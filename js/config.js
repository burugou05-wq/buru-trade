// ゲーム設定 - config.js

const GAME_CONFIG = {
    // ゲーム速度 (ミリ秒)
    SPEEDS: [1000, 500, 100],
    SPEED_NAMES: ['x1', 'x2', 'x3'],
    
    // チャート設定
    HISTORY_LENGTH: 60,
    
    // 難易度設定
    DIFFICULTIES: {
        easy: {
            initialCash: 5000000,
            macroVolatility: 0.05,
            newsRate: 0.02,
            newsEffectMultiplier: 0.8
        },
        normal: {
            initialCash: 1000000,
            macroVolatility: 0.1,
            newsRate: 0.05,
            newsEffectMultiplier: 1.0
        },
        hard: {
            initialCash: 1000000,
            macroVolatility: 0.15,
            newsRate: 0.08,
            newsEffectMultiplier: 1.2
        }
    },
    
    // ミッション設定
    MISSIONS: [
        {
            id: 'wealth-1m',
            title: '資産100万円達成',
            description: '総資産を¥1,000,000に増やす',
            target: 1000000,
            reward: 1000,
            progress: (player) => {
                const totalAsset = player.cash + player.getPortfolioValue();
                return Math.min(totalAsset / 1000000, 1);
            }
        },
        {
            id: 'wealth-10m',
            title: '資産1000万円達成',
            description: '総資産を¥10,000,000に増やす',
            target: 10000000,
            reward: 5000,
            progress: (player) => {
                const totalAsset = player.cash + player.getPortfolioValue();
                return Math.min(totalAsset / 10000000, 1);
            }
        },
        {
            id: 'single-stock-gain',
            title: 'ダブルゲイン',
            description: '1つの株式で資金を2倍に',
            target: 2.0,
            reward: 2000,
            progress: (player) => {
                let maxGain = 0;
                for (const [id, holding] of Object.entries(player.portfolio)) {
                    if (holding.qty > 0) {
                        const currentValue = holding.qty * window.companyMap[id].price;
                        const costValue = holding.qty * holding.avgPrice;
                        const gainRate = costValue > 0 ? currentValue / costValue : 1;
                        maxGain = Math.max(maxGain, gainRate);
                    }
                }
                return Math.min(maxGain, 1);
            }
        }
    ],
    
    // ニュースイベント
    NEWS_EVENTS: [
        { text: "政府が大規模な金融緩和策を発表。市場全体に好感。", target: "ALL", effect: 0.08, isGood: true, sector: "政策" },
        { text: "中央銀行が予想外の利上げに踏み切る。警戒感広がる。", target: "ALL", effect: -0.06, isGood: false, sector: "政策" },
        { text: "次世代AI技術のブレイクスルー。ITセクターに買い注文殺到。", target: "TECH", effect: 0.15, isGood: true, sector: "技術" },
        { text: "Global Central Bank、過去最高の四半期利益を報告。", target: "BANK", effect: 0.10, isGood: true, sector: "決算" },
        { text: "中東での地政学リスク高まる。原油価格が急騰。", target: "ENRG", effect: 0.12, isGood: true, sector: "商品" },
        { text: "中東での地政学リスク高まる。燃料費高騰懸念で航空株下落。", target: "AIR", effect: -0.10, isGood: false, sector: "商品" },
        { text: "BioHealth社、画期的な新薬の臨床試験に成功。", target: "HEAL", effect: 0.18, isGood: true, sector: "医療" },
        { text: "AutoFuture社、大規模なリコールを発表。業績懸念。", target: "AUTO", effect: -0.15, isGood: false, sector: "リスク" },
        { text: "大規模なインフラ整備法案が可決。建設需要増の期待。", target: "BLD", effect: 0.09, isGood: true, sector: "政策" },
        { text: "異常気象による不作懸念。食品セクターのコスト増。", target: "FOOD", effect: -0.08, isGood: false, sector: "天候" },
        { text: "未知の感染症の噂。渡航制限への懸念から航空株急落。", target: "AIR", effect: -0.15, isGood: false, sector: "ヘルス" },
        { text: "未知の感染症の噂。医療・医薬セクターに資金流入。", target: "HEAL", effect: 0.12, isGood: true, sector: "ヘルス" }
    ],
    
    // 企業データ定義
    COMPANIES: [
        {
            id: "TECH",
            name: "TechNova Systems",
            sector: "IT・通信",
            initialPrice: 3200,
            volatility: 0.06,
            basePerformance: 0.2,
            pe: 25.5,
            dividend: 1.5
        },
        {
            id: "BANK",
            name: "Global Central Bank",
            sector: "金融",
            initialPrice: 1500,
            volatility: 0.02,
            basePerformance: 0.1,
            pe: 12.3,
            dividend: 3.2
        },
        {
            id: "AUTO",
            name: "AutoFuture Motors",
            sector: "自動車",
            initialPrice: 2400,
            volatility: 0.035,
            basePerformance: 0.0,
            pe: 8.7,
            dividend: 2.1
        },
        {
            id: "ENRG",
            name: "EcoEnergy Corp",
            sector: "エネルギー",
            initialPrice: 1800,
            volatility: 0.04,
            basePerformance: -0.1,
            pe: 18.2,
            dividend: 4.5
        },
        {
            id: "HEAL",
            name: "BioHealth Pharma",
            sector: "ヘルスケア",
            initialPrice: 4500,
            volatility: 0.05,
            basePerformance: 0.3,
            pe: 35.8,
            dividend: 0.8
        },
        {
            id: "AIR",
            name: "Sky Airlines",
            sector: "運輸",
            initialPrice: 1200,
            volatility: 0.045,
            basePerformance: -0.2,
            pe: 6.5,
            dividend: 1.0
        },
        {
            id: "FOOD",
            name: "Daily FoodLife",
            sector: "食品",
            initialPrice: 800,
            volatility: 0.015,
            basePerformance: 0.0,
            pe: 19.4,
            dividend: 2.8
        },
        {
            id: "BLD",
            name: "BuildPro Const.",
            sector: "建設",
            initialPrice: 2100,
            volatility: 0.025,
            basePerformance: -0.1,
            pe: 11.9,
            dividend: 3.5
        }
    ]
};

// ユーティリティ関数
const formatMoney = (num) => {
    if (num === undefined || num === null) return '¥0';
    return '¥' + Math.round(num).toLocaleString('ja-JP');
};

const formatPercent = (num) => {
    if (num === undefined || num === null) return '0.00%';
    const sign = num > 0 ? '+' : '';
    return sign + num.toFixed(2) + '%';
};

const formatPercent1 = (num) => {
    if (num === undefined || num === null) return '0.0%';
    const sign = num > 0 ? '+' : '';
    return sign + num.toFixed(1) + '%';
};
