/**
 * 🌸 可爱硬件监控 - 硬件数据模拟器
 * 模拟真实的硬件数据，包括 CPU、GPU、内存、存储、主板和风扇信息
 */

class HardwareSimulator {
    constructor() {
        // 硬件组件基础配置
        this.components = {
            cpu: {
                name: 'Intel Core i7-12700K',
                icon: '🖥️',
                baseTemp: 42,
                baseUsage: 15,
                maxTemp: 95,
                cores: 12,
                threads: 20,
                baseFreq: 3.6,
                maxFreq: 5.0
            },
            gpu: {
                name: 'NVIDIA GeForce RTX 4070',
                icon: '🎮',
                baseTemp: 35,
                baseUsage: 5,
                maxTemp: 83,
                memory: 12,
                baseMemoryUsage: 2.1,
                coreClock: 2475,
                memoryClock: 21000
            },
            memory: {
                name: 'DDR4-3200 32GB',
                icon: '🧠',
                total: 32,
                baseUsage: 8.5,
                speed: 3200,
                channels: 2,
                latency: 16
            },
            storage: {
                name: 'Samsung 980 PRO 1TB',
                icon: '💾',
                total: 1000,
                baseUsage: 650,
                health: 98,
                baseTemp: 38,
                readSpeed: 7000,
                writeSpeed: 5000
            },
            motherboard: {
                name: 'ASUS ROG Strix Z690-E',
                icon: '🔧',
                baseTemp: 32,
                maxTemp: 65,
                baseVoltage: 12.1,
                chipset: 'Z690'
            },
            fans: {
                name: '系统风扇',
                icon: '🌀',
                count: 6,
                baseRPM: 1200,
                maxRPM: 2500,
                types: ['CPU风扇', '机箱风扇', '显卡风扇']
            }
        };
        
        // 时间基准
        this.startTime = Date.now();
        this.lastUpdate = Date.now();
        
        // 系统状态
        this.systemLoad = 'normal'; // normal, gaming, stress
        this.ambientTemp = 25; // 环境温度
        
        // 性能历史记录（用于生成更真实的波动）
        this.history = {
            cpu: { temps: [], usage: [] },
            gpu: { temps: [], usage: [] },
            memory: { usage: [] }
        };
        
        this.initializeHistory();
    }

    /**
     * 初始化历史数据
     */
    initializeHistory() {
        const components = ['cpu', 'gpu'];
        components.forEach(comp => {
            // 初始化温度历史
            for (let i = 0; i < 10; i++) {
                this.history[comp].temps.push(this.components[comp].baseTemp + Math.random() * 5);
                this.history[comp].usage.push(this.components[comp].baseUsage + Math.random() * 10);
            }
        });
        
        // 初始化内存使用历史
        for (let i = 0; i < 10; i++) {
            this.history.memory.usage.push(this.components.memory.baseUsage + Math.random() * 2);
        }
    }

    /**
     * 生成复杂的数据波动
     * @param {number} base - 基础值
     * @param {number} range - 波动范围比例
     * @param {number} frequency - 波动频率
     * @returns {number} 波动后的值
     */
    generateComplexFluctuation(base, range = 0.2, frequency = 1) {
        const time = (Date.now() - this.startTime) / 1000;
        
        // 多层波形叠加
        const primaryWave = Math.sin(time * 0.5 * frequency) * range;
        const secondaryWave = Math.sin(time * 1.3 * frequency + Math.PI / 3) * range * 0.6;
        const tertiaryWave = Math.sin(time * 2.1 * frequency + Math.PI / 6) * range * 0.3;
        
        // 随机噪声
        const noise = (Math.random() - 0.5) * range * 0.4;
        
        // 系统负载影响
        const loadMultiplier = this.getLoadMultiplier();
        
        return base * (1 + (primaryWave + secondaryWave + tertiaryWave + noise) * loadMultiplier);
    }

    /**
     * 获取系统负载倍数
     */
    getLoadMultiplier() {
        switch (this.systemLoad) {
            case 'gaming': return 1.5;
            case 'stress': return 2.0;
            default: return 1.0;
        }
    }

    /**
     * 模拟系统负载变化
     */
    updateSystemLoad() {
        const random = Math.random();
        const time = (Date.now() - this.startTime) / 1000;
        
        // 每30秒可能改变一次系统状态
        if (time % 30 < 1) {
            if (random < 0.05) {
                this.systemLoad = 'stress';
            } else if (random < 0.2) {
                this.systemLoad = 'gaming';
            } else {
                this.systemLoad = 'normal';
            }
        }
    }

    /**
     * 更新历史数据
     */
    updateHistory(component, type, value) {
        if (!this.history[component] || !this.history[component][type]) return;
        
        this.history[component][type].push(value);
        if (this.history[component][type].length > 20) {
            this.history[component][type].shift();
        }
    }

    /**
     * 获取历史平均值
     */
    getHistoryAverage(component, type, samples = 5) {
        if (!this.history[component] || !this.history[component][type]) return 0;
        
        const recent = this.history[component][type].slice(-samples);
        return recent.reduce((sum, val) => sum + val, 0) / recent.length;
    }

    /**
     * 获取 CPU 数据
     */
    getCPUData() {
        const cpu = this.components.cpu;
        
        // 使用率计算（受系统负载影响）
        let usage = this.generateComplexFluctuation(cpu.baseUsage, 0.8, 1.2);
        usage = Math.max(1, Math.min(100, usage));
        
        // 温度计算（与使用率相关）
        const usageHeat = (usage / 100) * 35; // 使用率产生的热量
        const ambientInfluence = this.ambientTemp - 20; // 环境温度影响
        let temp = cpu.baseTemp + usageHeat + ambientInfluence + this.generateComplexFluctuation(0, 0.15) * 8;
        temp = Math.max(25, Math.min(cpu.maxTemp, temp));
        
        // 频率计算（与负载相关）
        const loadRatio = usage / 100;
        let frequency = cpu.baseFreq + (cpu.maxFreq - cpu.baseFreq) * loadRatio * 0.8;
        frequency += this.generateComplexFluctuation(0, 0.05) * frequency;
        frequency = Math.max(cpu.baseFreq * 0.8, Math.min(cpu.maxFreq, frequency));
        
        // 更新历史
        this.updateHistory('cpu', 'temps', temp);
        this.updateHistory('cpu', 'usage', usage);
        
        // 功耗估算
        const power = 65 + (usage / 100) * 60; // 基础65W + 负载功耗
        
        return {
            name: cpu.name,
            icon: cpu.icon,
            usage: Math.round(usage * 10) / 10,
            temperature: Math.round(temp * 10) / 10,
            cores: cpu.cores,
            threads: cpu.threads,
            frequency: Math.round(frequency * 100) / 100,
            power: Math.round(power),
            load: this.systemLoad,
            avgTemp: Math.round(this.getHistoryAverage('cpu', 'temps') * 10) / 10
        };
    }

    /**
     * 获取 GPU 数据
     */
    getGPUData() {
        const gpu = this.components.gpu;
        
        // GPU 使用率（游戏负载时更高）
        let usage = this.generateComplexFluctuation(gpu.baseUsage, 1.2, 0.8);
        if (this.systemLoad === 'gaming') {
            usage = this.generateComplexFluctuation(75, 0.3, 1.5);
        } else if (this.systemLoad === 'stress') {
            usage = this.generateComplexFluctuation(95, 0.1, 2);
        }
        usage = Math.max(0, Math.min(100, usage));
        
        // GPU 温度
        const usageHeat = (usage / 100) * 40;
        let temp = gpu.baseTemp + usageHeat + this.generateComplexFluctuation(0, 0.2) * 6;
        temp = Math.max(25, Math.min(gpu.maxTemp, temp));
        
        // 显存使用
        let memoryUsed = gpu.baseMemoryUsage;
        if (this.systemLoad === 'gaming') {
            memoryUsed = this.generateComplexFluctuation(8.5, 0.2);
        } else if (this.systemLoad === 'stress') {
            memoryUsed = this.generateComplexFluctuation(10.8, 0.1);
        } else {
            memoryUsed = this.generateComplexFluctuation(memoryUsed, 0.3);
        }
        memoryUsed = Math.max(1, Math.min(gpu.memory * 0.95, memoryUsed));
        
        // 核心频
