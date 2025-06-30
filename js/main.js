/**
 * 🌸 可爱硬件监控 - 主应用逻辑
 * 负责界面管理、数据更新、动画效果和用户交互
 */

class HardwareMonitor {
    constructor() {
        // DOM 元素引用
        this.container = document.getElementById('hardwareContainer');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.updateTimeElement = document.getElementById('updateTime');
        this.updateCountElement = document.getElementById('updateCount');
        this.uptimeElement = document.getElementById('uptime');
        
        // 配置参数
        this.UPDATE_INTERVAL = 2000; // 默认2秒更新一次
        this.ANIMATION_SPEED = 'normal'; // 动画速度
        this.SHOW_STARS = true; // 是否显示星星
        
        // 状态变量
        this.cards = new Map();
        this.positions = new Set();
        this.isInitialized = false;
        this.updateCount = 0;
        this.startTime = Date.now();
        
        // 初始化应用
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('🌸 初始化可爱硬件监控...');
            
            // 显示加载状态
            this.updateStatusIndicator('初始化中...', 'loading');
            
            // 创建背景效果
            this.createStars();
            
            // 等待一小段时间让用户看到加载动画
            await this.delay(1000);
            
            // 创建硬件卡片
            await this.createHardwareCards();
            
            // 隐藏加载动画
            this.hideLoadingSpinner();
            
            // 开始监控
            this.startMonitoring();
            
            // 设置事件监听器
            this.setupEventListeners();
            
            // 启动运行时间计时器
            this.startUptimeCounter();
            
            // 标记为已初始化
            this.isInitialized = true;
            
            console.log('✅ 硬件监控初始化完成！');
            
        } catch (error) {
            console.error('❌ 初始化失败:', error);
            this.updateStatusIndicator('初始化失败', 'error');
        }
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 创建星星背景
     */
    createStars() {
        if (!this.SHOW_STARS) return;
        
        const starsContainer = document.getElementById('starsContainer');
        const starCount = Math.min(80, Math.max(30, Math.floor(window.innerWidth / 25)));
        
        // 清除现有星星
        starsContainer.innerHTML = '';
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // 随机位置
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // 随机动画延迟和持续时间
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (2 + Math.random() * 3) + 's';
            
            // 随机大小
            const size = 2 + Math.random() * 4;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            
            starsContainer.appendChild(star);
        }
        
        console.log(`✨ 创建了 ${starCount} 颗星星`);
    }

    /**
     * 隐藏加载动画
     */
    hideLoadingSpinner() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.opacity = '0';
            setTimeout(() => {
                this.loadingSpinner.style.display = 'none';
            }, 500);
        }
    }

    /**
     * 生成不重叠的卡片位置
     */
    generateCardPosition() {
        if (window.innerWidth <= 768) {
            // 移动设备使用相对定位
            return null;
        }
        
        const containerRect = this.container.getBoundingClientRect();
        const cardWidth = 320;
        const cardHeight = 240;
        const margin = 30;
        const headerHeight = 200; // 预留头部空间
        
        let attempts = 0;
        let position;
        
        do {
            position = {
                x: Math.random() * (containerRect.width - cardWidth - margin * 2) + margin,
                y: Math.random() * (containerRect.height - cardHeight - margin * 2 - headerHeight) + headerHeight + margin
            };
            attempts++;
        } while (this.isPositionOverlapping(position, cardWidth, cardHeight) && attempts < 100);
        
        // 如果找不到不重叠的位置，使用网格布局
        if (attempts >= 100) {
            const cols = Math.floor((containerRect.width - margin) / (cardWidth + margin));
            const existingCards = this.positions.size;
            const col = existingCards % cols;
            const row = Math.floor(existingCards / cols);
            
            position = {
                x: col * (cardWidth + margin) + margin,
                y: row * (cardHeight + margin) + headerHeight + margin
            };
        }
        
        this.positions.add(`${Math.round(position.x)},${Math.round(position.y)}`);
        return position;
    }

    /**
     * 检查位置是否重叠
     */
    isPositionOverlapping(newPos, width, height) {
        const threshold = 50; // 重叠阈值
        
        for (let posStr of this.positions) {
            const [x, y] = posStr.split(',').map(Number);
            if (Math.abs(newPos.x - x) < width - threshold && 
                Math.abs(newPos.y - y) < height - threshold) {
                return true;
            }
        }
        return false;
    }

    /**
     * 创建硬件卡片
     */
    async createHardwareCards() {
        const data = window.hardwareSimulator.getAllData();
        const components = ['cpu', 'gpu', 'memory', 'storage', 'motherboard', 'fans'];
        
        for (const [index, componentType] of components.entries()) {
            const componentData = data[componentType];
            if (!componentData) continue;
            
            // 创建卡片
            const card = this.createCard(componentType, componentData);
            
            // 设置位置
            const position = this.generateCardPosition();
            if (position && window.innerWidth > 768) {
                card.style.left = position.x + 'px';
                card.style.top = position.y + 'px';
            }
            
            // 添加到容器
            this.container.appendChild(card);
            this.cards.set(componentType, card);
            
            // 延迟显示动画，创造交错效果
            await this.delay(200);
            card.classList.add('loaded');
        }
        
        console.log(`📊 创建了 ${components.length} 个硬件监控卡片`);
    }

    /**
     * 创建单个硬件卡片
     */
    createCard(type, data) {
        const card = document.createElement('div');
        card.className = 'hardware-card fade-in';
        card.id = `card-${type}`;
        card.setAttribute('data-type', type);
        
        // 设置卡片内容
        card.innerHTML = this.getCardHTML(type, data);
        
        // 添加悬停效果
        this.addCardInteractions(card);
        
        return card;
    }

    /**
     * 添加卡片交互效果
     */
    addCardInteractions(card) {
        // 鼠标进入效果
        card.addEventListener('mouseenter', (e) => {
            e.currentTarget.style.zIndex = '10';
        });
        
        // 鼠标离开效果
        card.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.zIndex = '5';
        });
        
        // 点击效果
        card.addEventListener('click', (e) => {
            this.onCardClick(e.currentTarget);
        });
    }

    /**
     * 卡片点击处理
     */
    onCardClick(card) {
        const type = card.getAttribute('data-type');
        console.log(`🖱️ 点击了 ${type} 卡片`);
        
        // 添加点击动画
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
        
        // 可以在这里添加更多交互功能，比如显示详细信息
    }

    /**
     * 获取卡片 HTML 内容
     */
    getCardHTML(type, data) {
        const templates = {
            cpu: () => `
                <div class="card-header">
                    <span class="card-icon">${data.icon}</span>
                    <h3 class="card-title">处理器</h3>
                </div>
                <div class="card-content">
                    <div class="info-item">
                        <span class="info-label">型号</span>
                        <span class="info-value">${data.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">使用率</span>
                        <span class="info-value">${data.usage}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">温度</span>
                        <div class="temperature-display">
                            <span class="info-value">${data.temperature}°C</span>
                            <div class="temperature-bar">
                                <div class="temperature-fill ${this.getTemperatureClass(data.temperature)}" 
                                     style="width: ${Math.min(100, (data.temperature / 100) * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">频率</span>
                        <span class="info-value">${data.frequency} GHz</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">功耗</span>
                        <span class="info-value">${data.power} W</span>
                    </div>
                </div>
            `,
            
            gpu: () => `
                <div class="card-header">
                    <span class="card-icon">${data.icon}</span>
                    <h3 class="card-title">显卡</h3>
                </div>
                <div class="card-content">
                    <div class="info-item">
                        <span class="info-label">型号</span>
                        <span class="info-value">${data.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">使用率</span>
                        <span class="info-value">${data.usage}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">温度</span>
                        <div class="temperature-display">
                            <span class="info-value">${data.temperature}°C</span>
                            <div class="temperature-bar">
                                <div class="temperature-fill ${this.getTemperatureClass(data.temperature)}" 
                                     style="width: ${Math.min(100, (data.temperature / 100) * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">显存</span>
                        <span class="info-value">${data.memoryUsed}/${data.memory} GB</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">功耗</span>
                        <span class="info-value">${data.power} W</span>
                    </div>
                </div>
            `,
            
            memory: () => `
                <div class="card-header">
                    <span class="card-icon">${data.icon}</span>
                    <h3 class="card-title">内存</h3>
                </div>
                <div class="card-content">
                    <div class="info-item">
                        <span class="info-label">型号</span>
                        <span class="info-value">${data.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">使用量</span>
                        <span class="info-value">${data.used}/${data.total} GB</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">使用率</span>
                        <span class="info-value">${data.usage}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">频率</span>
                        <span class="info-value">${data.speed} MHz</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">通道</span>
                        <span class="info-value">${data.channels} 通道</span>
                    </div>
                </div>
            `,
            
            storage: () => `
                <div class="card-header">
                    <span class="card-icon">${data.icon}</span>
                    <h3 class="card-title">存储</h3>
                </div>
                <div class="card-content">
                    <div class="info-item">
                        <span class="info-label">型号</span>
                        <span class="info-value">${data.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">使用量</span>
                        <span class="info-value">${data.used}/${data.total} GB</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">使用率</span>
                        <span class="info-value">${data.usage}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">温度</span>
                        <span class="info-value">${data.temperature}°C</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">健康度</span>
                        <span class="info-value">${data.health}%</span>
                    </div>
                </div>
            `,
            
            motherboard: () => `
                <div class="card-header">
                    <span class="card-icon">${data.icon}</span>
                    <h3 class="card-title">主板</h3>
                </div>
                <div class="card-content">
                    <div class="info-item">
                        <span class="info-label">型号</span>
                        <span class="info-value">${data.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">温度</span>
                        <div class="temperature-display">
                            <span class="info-value">${data.temperature}°C</span>
                            <div class="temperature-bar">
                                <div class="temperature-fill ${this.getTemperatureClass(data.temperature)}" 
                                     style="width: ${Math.min(100, (data.temperature / 70) * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">主电压</span>
                        <span class="info-value">${data.voltage} V</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">芯片组</span>
                        <span class="info-value">${data.chipset}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">BIOS</span>
                        <span class="info-value">${data.biosVersion}</span>
                    </div>
                </div>
            `,
            
            fans: () => `
                <div class="card-header">
                    <span class="card-icon">${data.icon}</span>
                    <h3 class="card-title">风扇</h3>
                </div>
                <div class="card-content">
                    <div class="info-item">
                        <span class="info-label">数量</span>
                        <span class="info-value">${data.count} 个</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">转速</span>
                        <span class="info-value">${data.rpm} RPM</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">PWM</span>
                        <span class="info-value">${data.pwm}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">模式</span>
                        <span class="info-value">${data.mode}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">状态</span>
                        <span class="info-value">${data.status}</span>
                    </div>
                </div>
            `
        };
        
        return templates[type] ? templates[type]() : '<div class="error">未知组件类型</div>';
    }

    /**
     * 根据温度获取样式类
     */
    getTemperatureClass(temp) {
        if (temp < 50) return 'temp-normal';
        if (temp < 70) return 'temp-warning';
        if (temp < 85) return 'temp-danger';
        return 'temp-critical';
    }

    /**
     * 更新卡片数据
     */
    updateCard(type, data) {
        const card = this.cards.get(type);
        if (!card) return;
        
        // 平滑更新卡片内容
        const newHTML = this.getCardHTML(type, data);
        if (card.innerHTML !== newHTML) {
            card.innerHTML = newHTML;
        }
        
        // 检查高温警告
        const hasHighTemp = (data.temperature && data.temperature > 80) || 
                           (data.usage && data.usage > 90);
        
        if (hasHighTemp) {
            card.classList.add('high-temp');
        } else {
            card.classList.remove('high-temp');
        }
    }

    /**
     * 开始硬件监控
     */
    startMonitoring() {
        this.updateData(); // 立即更新一次
        
        // 设置定时更新
        this.monitoringInterval = setInterval(() => {
            this.updateData();
        }, this.UPDATE_INTERVAL);
        
        console.log(`🔄 开始硬件监控，更新间隔: ${this.UPDATE_INTERVAL}ms`);
    }

    /**
     * 更新硬件数据
     */
    updateData() {
        try {
            const data = window.hardwareSimulator.getAllData();
            
            // 更新各个硬件卡片
            Object.entries(data).forEach(([key, componentData]) => {
                if (key === 'timestamp' || key === 'updateInterval' || key === 'system') return;
                this.updateCard(key, componentData);
            });
            
            // 更新状态指示器
            this.updateStatusIndicator('实时监控中...', data.system.statusColor);
            
            // 更新计数器
            this.updateCount++;
            if (this.updateCountElement) {
                this.updateCountElement.textContent = this.updateCount;
            }
            
            // 更新时间显示
            if (this.updateTimeElement) {
                const now = new Date();
                this.updateTimeElement.textContent = now.toLocaleTimeString();
            }
            
        } catch (error) {
            console.error('❌ 数据更新失败:', error);
            this.updateStatusIndicator('更新失败', 'error');
        }
    }

    /**
     * 更新状态指示器
     */
    updateStatusIndicator(message, status = 'normal') {
        if (!this.statusIndicator) return;
        
        const dot = this.statusIndicator.querySelector('.status-dot');
        const text = this.statusIndicator.querySelector('.status-text');
        
        if (text) text.textContent = message;
        
        if (dot) {
            // 根据状态设置颜色
            const colors = {
                normal: 'var(--temp-normal)',
                warning: 'var(--temp-warning)',
                danger: 'var(--temp-danger)',
                critical: 'var(--temp-critical)',
                loading: 'var(--accent-purple)',
                error: 'var(--temp-critical)'
            };
            
            dot.style.background = colors[status] || colors.normal;
        }
    }

    /**
     * 启动运行时间计时器
     */
    startUptimeCounter() {
        if (!this.uptimeElement) return;
        
        setInterval(() => {
            const uptime = Math.floor((Date.now() - this.startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            
            this.uptimeElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 窗口大小改变
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseMonitoring();
            } else {
                this.resumeMonitoring();
            }
        });
        
        // 设置按钮
        const settingsButton = document.getElementById('settingsButton');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.toggleSettingsPanel();
            });
        }
        
        // 设置面板
        this.setupSettingsPanel();
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 处理窗口大小改变
     */
    handleResize() {
        // 重新创建星星
        this.createStars();
        
        // 重新定位卡片
        if (window.innerWidth > 768) {
            this.repositionCards();
        } else {
            // 移动设备重置卡片定位
            this.cards.forEach(card => {
                card.style.position = 'relative';
                card.style.left = 'auto';
                card.style.top = 'auto';
            });
        }
    }

    /**
     * 重新定位卡片
     */
    repositionCards() {
        this.positions.clear();
        this.cards.forEach(card => {
            const position = this.generateCardPosition();
            if (position) {
                card.style.left = position.x + 'px';
                card.style.top = position.y + 'px';
            }
        });
    }

    /**
     * 暂停监控
     */
    pauseMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.updateStatusIndicator('监控已暂停', 'warning');
        console.log('⏸️ 监控已暂停');
    }

    /**
     * 恢复监控
     */
    resumeMonitoring() {
        if (!this.monitoringInterval) {
            this.startMonitoring();
        }
        console.log('▶️ 监控已恢复');
    }

    /**
     * 设置面板相关
     */
    setupSettingsPanel() {
        const settingsPanel = document.getElementById('settingsPanel');
        const settingsClose = document.getElementById('settingsClose');
        const updateInterval = document.getElementById('updateInterval');
        const animationSpeed = document.getElementById('animationSpeed');
        const showStars = document.getElementById('showStars');
        
        // 关闭按钮
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                this.hideSettingsPanel();
            });
        }
        
        // 更新间隔设置
        if (updateInterval) {
            updateInterval.addEventListener('input', (e) => {
                const value = parseInt(e.target.value) * 1000;
                this.setUpdateInterval(value);
                
                const valueDisplay = e.target.parentNode.querySelector('.setting-value');
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
            });
        }
        
        // 动画速度设置
        if (animationSpeed) {
            animationSpeed.addEventListener('change', (e) => {
                this.setAnimationSpeed(e.target.value);
            });
        }
        
        // 星星显示设置
        if (showStars) {
            showStars.addEventListener('change', (e) => {
                this.setShowStars(e.target.checked);
            });
        }
        
        // 点击外部关闭面板
        if (settingsPanel) {
            document.addEventListener('click', (e) => {
                if (!settingsPanel.contains(e.target) && 
                    !document.getElementById('settingsButton').contains(e.target)) {
                    this.hideSettingsPanel();
                }
            });
        }
    }

    /**
     * 切换设置面板显示
     */
    toggleSettingsPanel() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('show');
        }
    }

    /**
     * 隐藏设置面板
     */
    hideSettingsPanel() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.remove('show');
        }
    }

    /**
     * 设置更新间隔
     */
    setUpdateInterval(interval) {
        this.UPDATE_INTERVAL = Math.max(1000, Math.min(10000, interval));
        
        // 重新启动监控
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.startMonitoring();
        }
        
        console.log(`⏱️ 更新间隔已设置为: ${this.UPDATE_INTERVAL}ms`);
    }

    /**
     * 设置动画速度
     */
    setAnimationSpeed(speed) {
        this.ANIMATION_SPEED = speed;
        
        const speedMap = {
            slow: 0.6,
            normal: 1,
            fast: 1.5
        };
        
        const multiplier = speedMap[speed] || 1;
        document.documentElement.style.setProperty('--anim-multiplier', multiplier);
        
        console.log(`🎭 动画速度已设置为: ${speed}`);
    }

    /**
     * 设置星星显示
     */
    setShowStars(show) {
        this.SHOW_STARS = show;
        
        const starsContainer = document.getElementById('starsContainer');
        if (starsContainer) {
            starsContainer.style.display = show ? 'block' : 'none';
        }
        
        console.log(`⭐ 星星显示: ${show ? '开启' : '关闭'}`);
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + 逗号：打开设置
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            this.toggleSettingsPanel();
        }
        
        // Escape：关闭设置面板
        if (e.key === 'Escape') {
            this.hideSettingsPanel();
        }
        
        // F5：手动刷新数据
        if (e.key === 'F5') {
            e.preventDefault();
            this.updateData();
            console.log('🔄 手动刷新数据');
        }
    }

    /**
     * 停止监控
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        console.log('🛑 监控已停止');
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.stopMonitoring();
        
        // 清理事件监听器
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.pauseMonitoring);
        
        // 清理DOM
        this.cards.clear();
        this.positions.clear();
        
        console.log('🗑️ 硬件监控实例已销毁');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌸 页面加载完成，正在初始化硬件监控...');
    window.hardwareMonitor = new HardwareMonitor();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (window.hardwareMonitor) {
        window.hardwareMonitor.destroy();
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('💥 发生错误:', e.error);
});

// 未捕获的 Promise 错误
window.addEventListener('unhandledrejection', (e) => {
    console.error('💥 未处理的 Promise 错误:', e.reason);
});
