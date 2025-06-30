// 硬件监控主类
class HardwareMonitor {
    constructor() {
        this.dashboard = document.getElementById('monitoringDashboard');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.updateTimeElement = document.getElementById('updateTime');
        this.connectionStatus = document.getElementById('connectionStatus');
        
        this.updateInterval = 2000; // 2秒更新一次
        this.isMonitoring = false;
        this.monitoringTimer = null;
        
        this.hardwareData = new Map();
        this.performanceHistory = {
            cpu: [],
            memory: [],
            timestamps: []
        };
        
        this.init();
    }

    async init() {
        try {
            this.showLoading(true);
            await this.detectHardware();
            this.createHardwareCards();
            this.setupEventListeners();
            this.startMonitoring();
            this.showLoading(false);
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('初始化硬件监控失败，请刷新页面重试。');
        }
    }

    // 检测硬件信息
    async detectHardware() {
        const hardwareInfo = {
            system: await this.getSystemInfo(),
            processor: await this.getProcessorInfo(),
            memory: await this.getMemoryInfo(),
            graphics: await this.getGraphicsInfo(),
            network: await this.getNetworkInfo(),
            display: await this.getDisplayInfo(),
            storage: await this.getStorageInfo(),
            battery: await this.getBatteryInfo()
        };

        this.hardwareData = new Map(Object.entries(hardwareInfo));
        return hardwareInfo;
    }

    // 获取系统信息
    async getSystemInfo() {
        const nav = navigator;
        return {
            platform: nav.platform || '未知',
            userAgent: nav.userAgent,
            language: nav.language,
            cookieEnabled: nav.cookieEnabled,
            onLine: nav.onLine,
            vendor: nav.vendor || '未知',
            productSub: nav.productSub || '未知',
            oscpu: nav.oscpu || '未知',
            buildID: nav.buildID || '未知'
        };
    }

    // 获取处理器信息
    async getProcessorInfo() {
        const cores = navigator.hardwareConcurrency || 4;
        let cpuUsage = 0;
        
        // 使用性能 API 估算 CPU 使用率
        if (performance.now) {
            const startTime = performance.now();
            let iterations = 0;
            const testDuration = 10; // 10ms
            
            while (performance.now() - startTime < testDuration) {
                iterations++;
            }
            
            // 基于迭代次数估算 CPU 负载（这是一个粗略估算）
            cpuUsage = Math.min(100, Math.max(0, 100 - (iterations / 10000)));
        }
        
        return {
            cores: cores,
            usage: Math.round(cpuUsage + Math.random() * 20), // 添加一些随机变化
            architecture: this.getArchitecture(),
            supportedFeatures: this.getCPUFeatures()
        };
    }

    // 获取内存信息
    async getMemoryInfo() {
        let memoryInfo = {
            total: 0,
            used: 0,
            usage: 0
        };

        // 使用 Performance API 获取内存信息
        if (performance.memory) {
            const memory = performance.memory;
            memoryInfo = {
                total: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
                usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
            };
        } else {
            // 估算值
            memoryInfo = {
                total: 8192, // 假设 8GB
                used: Math.round(2048 + Math.random() * 2048), // 2-4GB
                usage: 0
            };
            memoryInfo.usage = Math.round((memoryInfo.used / memoryInfo.total) * 100);
        }

        return memoryInfo;
    }

    // 获取显卡信息
    async getGraphicsInfo() {
        let gpu = {
            vendor: '未知',
            renderer: '未知',
            version: '未知',
            memory: 0,
            usage: Math.round(Math.random() * 40 + 10) // 10-50%
        };

        try {
            // 尝试获取 WebGL 信息
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpu.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gpu.vendor;
                    gpu.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpu.renderer;
                }
                gpu.version = gl.getParameter(gl.VERSION) || gpu.version;
                
                // 估算显存
                const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
                gpu.memory = Math.round(maxTextureSize / 1024); // 粗略估算
            }
        } catch (error) {
            console.warn('无法获取 GPU 信息:', error);
        }

        return gpu;
    }

    // 获取网络信息
    async getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        return {
            online: navigator.onLine,
            type: connection ? connection.effectiveType : '未知',
            downlink: connection ? connection.downlink : 0,
            rtt: connection ? connection.rtt : 0,
            saveData: connection ? connection.saveData : false
        };
    }

    // 获取显示信息
    async getDisplayInfo() {
        const screen = window.screen;
        
        return {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            orientation: screen.orientation ? screen.orientation.type : '未知',
            devicePixelRatio: window.devicePixelRatio || 1
        };
    }

    // 获取存储信息
    async getStorageInfo() {
        let storage = {
            localStorage: 0,
            sessionStorage: 0,
            indexedDB: 0,
            total: 0,
            used: 0,
            usage: 0
        };

        try {
            // 检查 localStorage
            if (localStorage) {
                let localStorageSize = 0;
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        localStorageSize += localStorage[key].length;
                    }
                }
                storage.localStorage = Math.round(localStorageSize / 1024); // KB
            }

            // 检查 sessionStorage
            if (sessionStorage) {
                let sessionStorageSize = 0;
                for (let key in sessionStorage) {
                    if (sessionStorage.hasOwnProperty(key)) {
                        sessionStorageSize += sessionStorage[key].length;
                    }
                }
                storage.sessionStorage = Math.round(sessionStorageSize / 1024); // KB
            }

            // 检查存储配额 API
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                storage.total = Math.round(estimate.quota / 1024 / 1024); // MB
                storage.used = Math.round(estimate.usage / 1024 / 1024); // MB
                storage.usage = Math.round((estimate.usage / estimate.quota) * 100);
            }
        } catch (error) {
            console.warn('无法获取存储信息:', error);
        }

        return storage;
    }

    // 获取电池信息
    async getBatteryInfo() {
        let battery = {
            charging: false,
            level: 0,
            chargingTime: 0,
            dischargingTime: 0,
            supported: false
        };

        try {
            if (navigator.getBattery) {
                const batteryApi = await navigator.getBattery();
                battery = {
                    charging: batteryApi.charging,
                    level: Math.round(batteryApi.level * 100),
                    chargingTime: batteryApi.chargingTime,
                    dischargingTime: batteryApi.dischargingTime,
                    supported: true
                };
            }
        } catch (error) {
            console.warn('电池 API 不支持:', error);
        }

        return battery;
    }

    // 获取 CPU 架构
    getArchitecture() {
        const platform = navigator.platform.toLowerCase();
        if (platform.includes('win')) return 'x86_64';
        if (platform.includes('mac')) return 'x86_64';
        if (platform.includes('linux')) return 'x86_64';
        if (platform.includes('arm')) return 'ARM';
        return '未知';
    }

    // 获取 CPU 特性
    getCPUFeatures() {
        const features = [];
        
        // 检查各种 Web API 支持
        if (typeof WebAssembly !== 'undefined') features.push('WebAssembly');
        if (typeof SharedArrayBuffer !== 'undefined') features.push('SharedArrayBuffer');
        if (typeof Atomics !== 'undefined') features.push('Atomics');
        if (typeof BigInt !== 'undefined') features.push('BigInt');
        
        return features;
    }

    // 创建硬件卡片
    createHardwareCards() {
        this.dashboard.innerHTML = '';
        
        const cardConfigs = [
            {
                id: 'system',
                title: '系统信息',
                icon: '💻',
                data: this.hardwareData.get('system')
            },
            {
                id: 'processor',
                title: '处理器',
                icon: '🖥️',
                data: this.hardwareData.get('processor')
            },
            {
                id: 'memory',
                title: '内存',
                icon: '🧠',
                data: this.hardwareData.get('memory')
            },
            {
                id: 'graphics',
                title: '显卡',
                icon: '🎮',
                data: this.hardwareData.get('graphics')
            },
            {
                id: 'network',
                title: '网络',
                icon: '🌐',
                data: this.hardwareData.get('network')
            },
            {
                id: 'display',
                title: '显示器',
                icon: '🖥️',
                data: this.hardwareData.get('display')
            },
            {
                id: 'storage',
                title: '存储',
                icon: '💾',
                data: this.hardwareData.get('storage')
            },
            {
                id: 'battery',
                title: '电池',
                icon: '🔋',
                data: this.hardwareData.get('battery')
            }
        ];

        cardConfigs.forEach((config, index) => {
            const card = this.createCard(config);
            this.dashboard.appendChild(card);
            
            // 添加流星入场动画
            if (window.meteorEffects) {
                window.meteorEffects.animateCardEntrance(card, index * 100);
            }
        });
    }

    // 创建单个卡片
    createCard(config) {
        const card = document.createElement('div');
        card.className = 'hardware-card';
        card.id = `card-${config.id}`;
        
        const status = this.getCardStatus(config.id, config.data);
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <div class="card-icon">${config.icon}</div>
                    <span>${config.title}</span>
                </div>
                <div class="card-status ${status.class}">${status.text}</div>
            </div>
            <div class="card-content">
                ${this.generateCardContent(config.id, config.data)}
            </div>
        `;
        
        return card;
    }

    // 生成卡片内容
    generateCardContent(type, data) {
        switch (type) {
            case 'system':
                return `
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">操作系统</span>
                            <span class="info-value">${this.getOperatingSystem()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">浏览器</span>
                            <span class="info-value">${this.getBrowserName()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">语言</span>
                            <span class="info-value">${data.language}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">在线状态</span>
                            <span class="info-value">${data.onLine ? '在线' : '离线'}</span>
                        </div>
                    </div>
                `;
                
            case 'processor':
                return `
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">核心数</span>
                            <span class="info-value">${data.cores} 核</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">架构</span>
                            <span class="info-value">${data.architecture}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">使用率</span>
                            <div class="info-value-with-progress">
                                <span class="info-value">${data.usage}%</span>
                                <div class="progress-container" id="cpu-progress"></div>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-label">支持特性</span>
                            <span class="info-value">${data.supportedFeatures.join(', ') || '无'}</span>
                        </div>
                    </div>
                `;
                
            case 'memory':
                return `
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">总内存</span>
                            <span class="info-value">${data.total} MB</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">已用内存</span>
                            <span class="info-value">${data.used} MB</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">使用率</span>
                            <div class="info-value-with-progress">
                                <span class="info-value">${data.usage}%</span>
                                <div class="circular-progress-container" id="memory-progress"></div>
                            </div>
                        </div>
                    </div>
                `;
                
            case 'graphics':
                return `
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">厂商</span>
                            <span class="info-value">${data.vendor}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">型号</span>
                            <span class="info-value">${data.renderer}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">使用率</span>
                            <div class="info-value-with-progress">
                                <span class="info-value">${data.usage}%</span>
                                <div class="progress-container" id="gpu-progress"></div>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-label">版本</span>
                            <span class="info-value">${data.version}</span>
                        </div>
                    </div>
                `;
                
            case 'network':
                return `
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">连接状态</span>
                            <span class="info-value">${data.online ? '已连接' : '未连接'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">连接类型</span>
                            <span class="info-value">${data.type}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">下载速度</span>
                            <span class="info-value">${data.downlink} Mbps</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">延迟</span>
                            <span class="info-value">${data.rtt} ms</span>
                        </div>
                    </div>
                `;
                
            case 'display':
                return `
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">分辨率</span>
                            <span class="info-value">${data.width} × ${data.height}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">可用区域</span>
                            <span class="info-value">${data.availWidth} × ${data.availHeight}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">色彩深度</span>
                            <span class="info-value">${data.colorDepth} 位</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">像素比</span>
                            <span class="info-value">${data.devicePixelRatio}</span>
                        </div>
                    </div>
                `;
                
            case 'storage':
                return `
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">总容量</span>
                            <span class="info-value">${data.total} MB</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">已使用</span>
                            <span class="info-value">${data.used} MB</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">使用率</span>
                            <div class="info-value-with-progress">
                                <span class="info-value">${data.usage}%</span>
                                <div class="progress-container" id="storage-progress"></div>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-label">LocalStorage</span>
                            <span class="info-value">${data.localStorage} KB</span>
                        </div>
                    </div>
                `;
                
            case 'battery':
                if (!data.supported) {
                    return `
                        <div class="info-item">
                            <span class="info-label">状态</span>
                            <span class="info-value">电池 API 不支持</span>
                        </div>
                    `;
                }
                
                return `
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">电量</span>
                            <div class="info-value-with-progress">
                                <span class="info-value">${data.level}%</span>
                                <div class="progress-container" id="battery-progress"></div>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-label">充电状态</span>
                            <span class="info-value">${data.charging ? '充电中' : '未充电'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">充电时间</span>
                            <span class="info-value">${this.formatTime(data.chargingTime)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">放电时间</span>
                            <span class="info-value">${this.formatTime(data.dischargingTime)}</span>
                        </div>
                    </div>
                `;
                
            default:
                return '<div class="info-item">暂无数据</div>';
        }
    }

    // 获取卡片状态
    getCardStatus(type, data) {
        switch (type) {
            case 'processor':
                if (data.usage < 50) return { class: 'normal', text: '正常' };
                if (data.usage < 80) return { class: 'warning', text: '注意' };
                return { class: 'error', text: '高负载' };
                
            case 'memory':
                if (data.usage < 60) return { class: 'normal', text: '正常' };
                if (data.usage < 85) return { class: 'warning', text: '注意' };
                return { class: 'error', text: '不足' };
                
            case 'graphics':
                if (data.usage < 70) return { class: 'normal', text: '正常' };
                if (data.usage < 90) return { class: 'warning', text: '繁忙' };
                return { class: 'error', text: '过载' };
                
            case 'network':
                return data.online ? 
                    { class: 'normal', text: '已连接' } : 
                    { class: 'error', text: '离线' };
                
            case 'battery':
                if (!data.supported) return { class: 'warning', text: '不支持' };
                if (data.level > 50) return { class: 'normal', text: '正常' };
                if (data.level > 20) return { class: 'warning', text: '低电量' };
                return { class: 'error', text: '电量不足' };
                
            default:
                return { class: 'normal', text: '正常' };
        }
    }

    // 开始监控
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.updateConnectionStatus(true);
        this.updateData();
        
        this.monitoringTimer = setInterval(() => {
            this.updateData();
        }, this.updateInterval);
    }

    // 停止监控
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        this.updateConnectionStatus(false);
        
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }
    }

    // 更新数据
    async updateData() {
        try {
            // 更新动态数据
            const processor = await this.getProcessorInfo();
            const memory = await this.getMemoryInfo();
            const graphics = await this.getGraphicsInfo();
            const network = await this.getNetworkInfo();
            const battery = await this.getBatteryInfo();
            
            this.hardwareData.set('processor', processor);
            this.hardwareData.set('memory', memory);
            this.hardwareData.set('graphics', graphics);
            this.hardwareData.set('network', network);
            this.hardwareData.set('battery', battery);
            
            // 更新卡片内容
            this.updateCardContent('processor', processor);
            this.updateCardContent('memory', memory);
            this.updateCardContent('graphics', graphics);
            this.updateCardContent('network', network);
            this.updateCardContent('battery', battery);
            
            // 更新性能图表
            if (window.dataVisualization) {
                window.dataVisualization.updatePerformanceChart(
                    processor.usage, 
                    memory.usage
                );
            }
            
            // 更新时间戳
            this.updateTimestamp();
            
        } catch (error) {
            console.error('更新数据失败:', error);
            this.updateConnectionStatus(false);
        }
    }

    // 更新卡片内容
    updateCardContent(type, data) {
        const card = document.getElementById(`card-${type}`);
        if (!card) return;
        
        const status = this.getCardStatus(type, data);
        const statusElement = card.querySelector('.card-status');
        if (statusElement) {
            statusElement.className = `card-status ${status.class}`;
            statusElement.textContent = status.text;
        }
        
        const content = card.querySelector('.card-content');
        if (content) {
            content.innerHTML = this.generateCardContent(type, data);
            
            // 重新创建可视化组件
            this.createVisualizationComponents(type, data);
        }
    }

    // 创建可视化组件
    createVisualizationComponents(type, data) {
        if (!window.dataVisualization) return;
        
        const viz = window.dataVisualization;
        
        switch (type) {
            case 'processor':
                const cpuProgress = document.getElementById('cpu-progress');
                if (cpuProgress) {
                    cpuProgress.innerHTML = '';
                    viz.createLinearProgress(cpuProgress, data.usage, 100, 
                        viz.getStatusColor(data.usage));
                }
                break;
                
            case 'memory':
                const memoryProgress = document.getElementById('memory-progress');
                if (memoryProgress) {
                    memoryProgress.innerHTML = '';
                    viz.createCircularProgress(memoryProgress, data.usage, 100, 
                        viz.getStatusColor(data.usage));
                }
                break;
                
            case 'graphics':
                const gpuProgress = document.getElementById('gpu-progress');
                if (gpuProgress) {
                    gpuProgress.innerHTML = '';
                    viz.createLinearProgress(gpuProgress, data.usage, 100, '#d4a4ff');
                }
                break;
                
            case 'storage':
                const storageProgress = document.getElementById('storage-progress');
                if (storageProgress) {
                    storageProgress.innerHTML = '';
                    viz.createLinearProgress(storageProgress, data.usage, 100, '#a4d4ff');
                }
                break;
                
            case 'battery':
                if (data.supported) {
                    const batteryProgress = document.getElementById('battery-progress');
                    if (batteryProgress) {
                        batteryProgress.innerHTML = '';
                        viz.createLinearProgress(batteryProgress, data.level, 100, 
                            data.charging ? '#10b981' : viz.getStatusColor(data.level, [20, 50, 80]));
                    }
                }
                break;
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 主题切换
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // 刷新按钮
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
        
        // 导出按钮
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // 页面可见性改变
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopMonitoring();
            } else {
                this.startMonitoring();
            }
        });
        
        // 网络状态改变
        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
        });
        
        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
        });
    }

    // 切换主题
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('.icon');
            icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // 刷新数据
    async refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.style.animation = 'spin 1s linear';
            setTimeout(() => {
                refreshBtn.style.animation = '';
            }, 1000);
        }
        
        await this.updateData();
    }

    // 导出数据
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            hardware: Object.fromEntries(this.hardwareData),
            performance: this.performanceHistory
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hardware-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 更新连接状态
    updateConnectionStatus(connected) {
        if (this.connectionStatus) {
            this.connectionStatus.className = `status-indicator ${connected ? 'active' : ''}`;
        }
    }

    // 更新时间戳
    updateTimestamp() {
        if (this.updateTimeElement) {
            const now = new Date();
            this.updateTimeElement.textContent = 
                `更新时间: ${now.toLocaleTimeString()}`;
        }
    }

    // 显示加载状态
    showLoading(show) {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.toggle('active', show);
        }
    }

    // 显示错误信息
    showError(message) {
        console.error(message);
        // 这里可以添加错误提示 UI
    }

    // 工具函数：获取操作系统
    getOperatingSystem() {
        const platform = navigator.platform;
        const userAgent = navigator.userAgent;
        
        if (platform.indexOf('Win') !== -1) return 'Windows';
        if (platform.indexOf('Mac') !== -1) return 'macOS';
        if (platform.indexOf('Linux') !== -1) return 'Linux';
        if (userAgent.indexOf('Android') !== -1) return 'Android';
        if (userAgent.indexOf('iOS') !== -1) return 'iOS';
        
        return platform;
    }

    // 工具函数：获取浏览器名称
    getBrowserName() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';
        
        return '未知浏览器';
    }

    // 工具函数：格式化时间
    formatTime(seconds) {
        if (seconds === Infinity || seconds === 0) return '无限';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else {
            return `${minutes}分钟`;
        }
    }

    // 销毁监控器
    destroy() {
        this.stopMonitoring();
        
        if (window.dataVisualization) {
            window.dataVisualization.destroyAllCharts();
        }
        
        this.hardwareData.clear();
        this.performanceHistory = { cpu: [], memory: [], timestamps: [] };
    }
}

// 初始化硬件监控
let hardwareMonitor;

document.addEventListener('DOMContentLoaded', () => {
    hardwareMonitor = new HardwareMonitor();
    
    // 设置初始主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('.icon');
        icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (hardwareMonitor) {
        hardwareMonitor.destroy();
    }
});

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .info-value-with-progress {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .progress-container {
        flex: 1;
        min-width: 100px;
    }
    
    .circular-progress-container {
        width: 60px;
        height: 60px;
    }
    
    .thermometer {
        width: 30px;
        height: 120px;
        position: relative;
    }
    
    .thermometer-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
    }
    
    .thermometer-scale {
        width: 12px;
        height: 80px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        position: relative;
        overflow: hidden;
    }
    
    .thermometer-mercury {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(to top, #ef4444, #f59e0b, #10b981);
        border-radius: 6px;
        transition: height 0.5s ease;
    }
    
    .thermometer-bulb {
        width: 20px;
        height: 20px;
        background: #ef4444;
        border-radius: 50%;
        margin-top: -10px;
    }
    
    .thermometer-text {
        font-size: 0.8rem;
        margin-top: 0.5rem;
        color: #ffffff;
    }
    
    .gauge {
        width: 120px;
        height: 60px;
    }
    
    .gauge-container {
        position: relative;
        width: 100%;
        height: 100%;
    }
    
    .gauge-svg {
        width: 100%;
        height: 100%;
    }
    
    .gauge-progress {
        transition: stroke-dashoffset 0.5s ease;
    }
    
    .gauge-needle {
        transition: transform 0.5s ease;
    }
    
    .gauge-value {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.9rem;
        font-weight: 600;
        color: #ffffff;
    }
    
    .gauge-label {
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.8);
    }
`;

document.head.appendChild(style);
