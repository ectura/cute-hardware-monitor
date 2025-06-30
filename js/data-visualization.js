// 数据可视化管理器
class DataVisualization {
    constructor() {
        this.charts = new Map();
        this.performanceData = {
            labels: [],
            datasets: [{
                label: 'CPU 使用率',
                data: [],
                borderColor: '#ff9fdc',
                backgroundColor: 'rgba(255, 159, 220, 0.1)',
                tension: 0.4
            }, {
                label: '内存使用率',
                data: [],
                borderColor: '#d4a4ff',
                backgroundColor: 'rgba(212, 164, 255, 0.1)',
                tension: 0.4
            }]
        };
        
        this.init();
    }

    init() {
        this.createPerformanceChart();
    }

    // 创建性能时间线图表
    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        this.charts.set('performance', new Chart(ctx, {
            type: 'line',
            data: this.performanceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: 'Inter, sans-serif'
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'second',
                            displayFormats: {
                                second: 'HH:mm:ss'
                            }
                        },
                        ticks: {
                            color: '#ffffff',
                            maxTicksLimit: 10
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 2,
                        hoverRadius: 4
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        }));
    }

    // 更新性能图表数据
    updatePerformanceChart(cpuUsage, memoryUsage) {
        const chart = this.charts.get('performance');
        if (!chart) return;

        const now = new Date();
        
        // 添加新数据点
        this.performanceData.labels.push(now);
        this.performanceData.datasets[0].data.push(cpuUsage);
        this.performanceData.datasets[1].data.push(memoryUsage);
        
        // 保持最近50个数据点
        if (this.performanceData.labels.length > 50) {
            this.performanceData.labels.shift();
            this.performanceData.datasets[0].data.shift();
            this.performanceData.datasets[1].data.shift();
        }
        
        chart.update('none');
    }

    // 创建圆形进度条
    createCircularProgress(container, value, max = 100, color = '#ff9fdc') {
        const size = 80;
        const strokeWidth = 6;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const progress = (value / max) * 100;
        const offset = circumference - (progress / 100) * circumference;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);

        // 背景圆
        const trackCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        trackCircle.setAttribute('cx', size / 2);
        trackCircle.setAttribute('cy', size / 2);
        trackCircle.setAttribute('r', radius);
        trackCircle.setAttribute('class', 'track');

        // 进度圆
        const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('cx', size / 2);
        progressCircle.setAttribute('cy', size / 2);
        progressCircle.setAttribute('r', radius);
        progressCircle.setAttribute('class', 'fill');
        progressCircle.style.stroke = color;
        progressCircle.style.strokeDasharray = circumference;
        progressCircle.style.strokeDashoffset = offset;

        svg.appendChild(trackCircle);
        svg.appendChild(progressCircle);

        // 文本
        const text = document.createElement('div');
        text.className = 'circular-progress-text';
        text.textContent = Math.round(progress) + '%';

        // 容器
        const wrapper = document.createElement('div');
        wrapper.className = 'circular-progress';
        wrapper.appendChild(svg);
        wrapper.appendChild(text);

        container.appendChild(wrapper);
        
        return wrapper;
    }

    // 创建线性进度条
    createLinearProgress(container, value, max = 100, color = '#ff9fdc') {
        const progress = Math.min((value / max) * 100, 100);
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = progress + '%';
        progressFill.style.background = `linear-gradient(90deg, ${color}, ${this.lightenColor(color, 20)})`;
        
        progressBar.appendChild(progressFill);
        container.appendChild(progressBar);
        
        return progressBar;
    }

    // 创建温度计
    createThermometer(container, temperature, maxTemp = 100) {
        const thermometer = document.createElement('div');
        thermometer.className = 'thermometer';
        thermometer.innerHTML = `
            <div class="thermometer-container">
                <div class="thermometer-scale">
                    <div class="thermometer-mercury" style="height: ${(temperature / maxTemp) * 100}%"></div>
                </div>
                <div class="thermometer-bulb"></div>
                <div class="thermometer-text">${temperature}°C</div>
            </div>
        `;
        
        container.appendChild(thermometer);
        return thermometer;
    }

    // 创建仪表盘
    createGauge(container, value, max = 100, label = '', unit = '%') {
        const angle = (value / max) * 180 - 90;
        
        const gauge = document.createElement('div');
        gauge.className = 'gauge';
        gauge.innerHTML = `
            <div class="gauge-container">
                <svg class="gauge-svg" viewBox="0 0 200 100">
                    <path class="gauge-track" d="M 20 80 A 80 80 0 0 1 180 80" 
                          fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                    <path class="gauge-progress" d="M 20 80 A 80 80 0 0 1 180 80" 
                          fill="none" stroke="#ff9fdc" stroke-width="8" 
                          stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (value / max) * 251.2}"/>
                    <circle class="gauge-center" cx="100" cy="80" r="5" fill="#ffffff"/>
                    <line class="gauge-needle" x1="100" y1="80" x2="100" y2="30" 
                          stroke="#ffffff" stroke-width="2" 
                          transform="rotate(${angle} 100 80)"/>
                </svg>
                <div class="gauge-value">${value}${unit}</div>
                <div class="gauge-label">${label}</div>
            </div>
        `;
        
        container.appendChild(gauge);
        return gauge;
    }

    // 创建实时波形图
    createWaveform(container, data = []) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 60;
        canvas.className = 'waveform-canvas';
        
        const ctx = canvas.getContext('2d');
        this.drawWaveform(ctx, data, canvas.width, canvas.height);
        
        container.appendChild(canvas);
        return canvas;
    }

    // 绘制波形
    drawWaveform(ctx, data, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        if (data.length < 2) return;
        
        ctx.strokeStyle = '#ff9fdc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const stepX = width / (data.length - 1);
        
        data.forEach((value, index) => {
            const x = index * stepX;
            const y = height - (value / 100) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // 添加渐变填充
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 159, 220, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 159, 220, 0.0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // 更新波形数据
    updateWaveform(canvas, newData) {
        const ctx = canvas.getContext('2d');
        this.drawWaveform(ctx, newData, canvas.width, canvas.height);
    }

    // 工具函数：颜色变亮
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // 获取状态颜色
    getStatusColor(value, thresholds = [50, 75, 90]) {
        if (value < thresholds[0]) return '#10b981'; // 绿色
        if (value < thresholds[1]) return '#f59e0b'; // 黄色
        if (value < thresholds[2]) return '#fb923c'; // 橙色
        return '#ef4444'; // 红色
    }

    // 销毁图表
    destroyChart(chartName) {
        const chart = this.charts.get(chartName);
        if (chart) {
            chart.destroy();
            this.charts.delete(chartName);
        }
    }

    // 销毁所有图表
    destroyAllCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}

// 全局实例
window.dataVisualization = new DataVisualization();
