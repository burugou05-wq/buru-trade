// メイン初期化 - main.js

function init() {
    // チャートを初期化
    initChart();
    
    // UIを初期化
    renderMarketList();
    updatePlayerStats();
    selectCompany(companies[0].id);
    updateMissionsDisplay();
    
    // イベントリスナーを登録
    document.getElementById('btn-play-pause').addEventListener('click', togglePlay);
    document.getElementById('btn-speed').addEventListener('click', changeSpeed);
    
    // トレード入力のエンター防止
    const tradeQtyInput = document.getElementById('trade-qty');
    if (tradeQtyInput) {
        tradeQtyInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') e.preventDefault();
        });
    }
    
    // ウィンドウリサイズ時のチャート再描画
    window.addEventListener('resize', function() {
        if (chartInstance) {
            chartInstance.resize();
        }
    });
    
    // チュートリアルを表示（初回のみ）
    setTimeout(() => {
        if (!localStorage.getItem('tutorial-shown')) {
            document.getElementById('tutorial-modal').classList.remove('hidden');
            localStorage.setItem('tutorial-shown', 'true');
        } else {
            // 難易度選択を表示
            document.getElementById('difficulty-modal').classList.remove('hidden');
        }
    }, 500);
}

// DOMContentLoaded後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
