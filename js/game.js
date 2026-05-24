// ゲームロジック - game.js

let dayCount = 1;
let macroEconomy = 0;
let isPlaying = false;
let gameInterval = null;
let currentSpeedIndex = 0;
let currentDifficulty = 'normal';

// ゲーム進行
function gameTick() {
    dayCount++;
    document.getElementById('current-date').textContent = `Day ${dayCount}`;
    
    // マクロ経済の変動
    const diffConfig = GAME_CONFIG.DIFFICULTIES[currentDifficulty];
    macroEconomy += (Math.random() - 0.5) * diffConfig.macroVolatility;
    macroEconomy = Math.max(-1.0, Math.min(1.0, macroEconomy));
    
    // マクロ経済の状態を表示
    let macroText = "安定";
    let macroEmoji = "📊";
    if (macroEconomy > 0.6) {
        macroText = "好景気";
        macroEmoji = "📈";
    } else if (macroEconomy > 0.2) {
        macroText = "やや好景気";
        macroEmoji = "📈";
    } else if (macroEconomy < -0.6) {
        macroText = "不況";
        macroEmoji = "📉";
    } else if (macroEconomy < -0.2) {
        macroText = "やや不況";
        macroEmoji = "📉";
    }
    document.getElementById('macro-indicator').textContent = `${macroEmoji} マクロ経済: ${macroText}`;

    // ニュースイベント生成
    generateEvents();

    // 企業の株価を更新
    companies.forEach(c => {
        c.updatePrice(macroEconomy, diffConfig.newsEffectMultiplier);
    });

    // UIを更新
    renderMarketList();
    updateSelectedCompanyDetails();
    updateChart();
    updatePlayerStats();

    // ミッション進捗を確認
    missionSystem.updateProgress();

    // 日数に応じて難易度を上げる（各500日でイベント確率を少し上げる）
    if (dayCount % 500 === 0) {
        showToast(`📅 Day ${dayCount}に到達しました!`, "info");
    }
}

// ニュースイベント生成
function generateEvents() {
    const diffConfig = GAME_CONFIG.DIFFICULTIES[currentDifficulty];
    
    if (Math.random() < diffConfig.newsRate) {
        const newsEvent = GAME_CONFIG.NEWS_EVENTS[Math.floor(Math.random() * GAME_CONFIG.NEWS_EVENTS.length)];
        addNews(newsEvent);
        
        // 効果を適用
        if (newsEvent.target === "ALL") {
            companies.forEach(c => {
                c.newsEffect += newsEvent.effect;
            });
        } else {
            const c = companyMap[newsEvent.target];
            if (c) c.newsEffect += newsEvent.effect;
        }
    }
}

// 再生/一時停止
function togglePlay() {
    isPlaying = !isPlaying;
    const icon = document.getElementById('icon-play-pause');
    const btn = document.getElementById('btn-play-pause');
    
    if (isPlaying) {
        btn.classList.add('playing');
        startGameLoop();
        showToast("▶️ シミュレーションを再開しました");
    } else {
        btn.classList.remove('playing');
        stopGameLoop();
        showToast("⏸️ シミュレーションを一時停止しました");
    }
}

// ゲームループ開始
function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameTick, GAME_CONFIG.SPEEDS[currentSpeedIndex]);
}

// ゲームループ停止
function stopGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}

// 速度変更
function changeSpeed() {
    currentSpeedIndex = (currentSpeedIndex + 1) % GAME_CONFIG.SPEEDS.length;
    const btn = document.getElementById('btn-speed');
    btn.textContent = GAME_CONFIG.SPEED_NAMES[currentSpeedIndex];
    
    if (isPlaying) {
        stopGameLoop();
        startGameLoop();
    }
    
    showToast(`⏱️ 速度を ${GAME_CONFIG.SPEED_NAMES[currentSpeedIndex]} に変更しました`);
}

// 難易度設定
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    const diffConfig = GAME_CONFIG.DIFFICULTIES[difficulty];
    
    // ゲームをリセット
    dayCount = 1;
    macroEconomy = 0;
    player.reset(diffConfig.initialCash);
    companies.forEach(c => {
        c.history = Array(GAME_CONFIG.HISTORY_LENGTH).fill(c.price);
        c.daysSinceOpen = 0;
        c.newsEffect = 0;
    });
    missionSystem.reset();
    activeNews = [];
    
    // UIを初期化
    document.getElementById('current-date').textContent = 'Day 1';
    document.getElementById('macro-indicator').textContent = '📊 マクロ経済: 安定';
    document.getElementById('news-ticker').textContent = '市場がオープンしました。最新のニュースがここに表示されます...';
    
    renderMarketList();
    updatePlayerStats();
    selectCompany(companies[0].id);
    
    // モーダルを閉じる
    document.getElementById('difficulty-modal').classList.add('hidden');
    
    showToast(`🎮 難易度: ${difficulty.toUpperCase()} でゲームを開始しました (初期資金: ${formatMoney(diffConfig.initialCash)})`);
}

// 設定パネルを開く
function openSettings() {
    if (isPlaying) togglePlay();
    document.getElementById('difficulty-modal').classList.remove('hidden');
}

// チュートリアルを閉じる
function closeTutorial() {
    document.getElementById('tutorial-modal').classList.add('hidden');
}

// ゲーム統計を取得
function getGameStats() {
    const totalAsset = player.getTotalAsset();
    const initialCash = GAME_CONFIG.DIFFICULTIES[currentDifficulty].initialCash;
    const gainRate = ((totalAsset - initialCash) / initialCash) * 100;

    return {
        dayCount,
        totalAsset,
        initialCash,
        gainRate,
        holdingsCount: player.getPortfolioBreakdown().length,
        portfolioValue: player.getPortfolioValue(),
        tradeCount: player.trades.length,
        completedMissions: missionSystem.getCompletedCount()
    };
}
