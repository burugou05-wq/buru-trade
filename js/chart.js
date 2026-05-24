// チャート描画 - chart.js

let chartInstance = null;

function initChart() {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(GAME_CONFIG.HISTORY_LENGTH).fill(''),
            datasets: [{
                label: '株価',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointBackgroundColor: '#60a5fa',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                fill: true,
                tension: 0.3,
                spanGaps: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { 
                    display: false 
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f8fafc',
                    bodyColor: '#f8fafc',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '¥' + Math.round(context.parsed.y).toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false,
                    grid: { display: false }
                },
                y: {
                    position: 'right',
                    grid: {
                        color: 'rgba(51, 65, 85, 0.3)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return '¥' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function updateChart() {
    if (!selectedCompanyId || !chartInstance) return;
    
    const c = companyMap[selectedCompanyId];
    
    // トレンドによって色を変更
    const firstPrice = c.history[0];
    const lastPrice = c.history[c.history.length - 1];
    const isUp = lastPrice >= firstPrice;
    
    const color = isUp ? '#10b981' : '#ef4444';
    const bgColor = isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';

    chartInstance.data.datasets[0].data = [...c.history];
    chartInstance.data.datasets[0].borderColor = color;
    chartInstance.data.datasets[0].backgroundColor = bgColor;
    
    chartInstance.update('none');
}
