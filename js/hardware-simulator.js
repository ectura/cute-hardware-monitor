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
        
        // 核心频率
        let coreClock = gpu.coreClock;
        if (usage > 50) {
            coreClock += this.generateComplexFluctuation(0, 0.1) * coreClock;
        }
        coreClock = Math.max(gpu.coreClock * 0.7, Math.min(gpu.coreClock * 1.15, coreClock));
        
        // 更新历史
        this.updateHistory('gpu', 'temps', temp);
        this.updateHistory('gpu', 'usage', usage);
        
        // 功耗估算
        const power = 100 + (usage / 100) * 150; // 基础100W + 负载功耗
        
        return {
            name: gpu.name,
            icon: gpu.icon,
            usage: Math.round(usage * 10) / 10,
            temperature: Math.round(temp * 10) / 10,
            memory: gpu.memory,
            memoryUsed: Math.round(memoryUsed * 10) / 10,
            memoryUsage: Math.round((memoryUsed / gpu.memory) * 100),
            coreClock: Math.round(coreClock),
            memoryClock: gpu.memoryClock,
            power: Math.round(power),
            fanSpeed: Math.round(this.generateComplexFluctuation(1800, 0.3))
        };
    }

    /**
     * 获取内存数据
     */
    getMemoryData() {
        const memory = this.components.memory;
        
        // 内存使用量（随系统负载变化）
        let used = memory.baseUsage;
        if (this.systemLoad === 'gaming') {
            used = this.generateComplexFluctuation(16, 0.2);
        } else if (this.systemLoad === 'stress') {
            used = this.generateComplexFluctuation(24, 0.15);
        } else {
            used = this.generateComplexFluctuation(used, 0.25);
        }
        used = Math.max(4, Math.min(memory.total * 0.95, used));
        
        // 可用内存
        const available = memory.total - used;
        const usage = (used / memory.total) * 100;
        
        // 内存频率（轻微波动）
        const actualSpeed = memory.speed + this.generateComplexFluctuation(0, 0.02) * memory.speed;
        
        // 更新历史
        this.updateHistory('memory', 'usage', used);
        
        return {
            name: memory.name,
            icon: memory.icon,
            total: memory.total,
            used: Math.round(used * 10) / 10,
            available: Math.round(available * 10) / 10,
            usage: Math.round(usage * 10) / 10,
            speed: Math.round(actualSpeed),
            channels: memory.channels,
            latency: memory.latency,
            type: 'DDR4'
        };
    }

    /**
     * 获取存储数据
     */
    getStorageData() {
        const storage = this.components.storage;
        
        // 存储使用量（缓慢增长）
        const timeHours = (Date.now() - this.startTime) / (1000 * 60 * 60);
        let used = storage.baseUsage + timeHours * 0.01; // 每小时增长0.01GB
        used += this.generateComplexFluctuation(0, 0.001) * storage.total; // 微小波动
        used = Math.max(storage.baseUsage, Math.min(storage.total * 0.98, used));
        
        const usage = (used / storage.total) * 100;
        const available = storage.total - used;
        
        // 存储温度
        let temp = storage.baseTemp;
        if (this.systemLoad === 'stress') {
            temp += 8; // 高负载时温度升高
        }
        temp += this.generateComplexFluctuation(0, 0.1) * 5;
        temp = Math.max(30, Math.min(70, temp));
        
        // 健康度（缓慢下降）
        const healthDecay = timeHours * 0.001; // 极慢的健康度下降
        const health = Math.max(85, storage.health - healthDecay);
        
        // 读写速度（受负载影响）
        let readSpeed = storage.readSpeed;
        let writeSpeed = storage.writeSpeed;
        
        if (this.systemLoad === 'stress') {
            readSpeed *= 0.8; // 高负载时速度下降
            writeSpeed *= 0.7;
        }
        
        readSpeed += this.generateComplexFluctuation(0, 0.1) * readSpeed;
        writeSpeed += this.generateComplexFluctuation(0, 0.1) * writeSpeed;
        
        return {
            name: storage.name,
            icon: storage.icon,
            total: storage.total,
            used: Math.round(used),
            available: Math.round(available),
            usage: Math.round(usage * 10) / 10,
            temperature: Math.round(temp),
            health: Math.round(health),
            readSpeed: Math.round(readSpeed),
            writeSpeed: Math.round(writeSpeed),
            type: 'NVMe SSD',
            interface: 'PCIe 4.0 x4'
        };
    }

    /**
     * 获取主板数据
     */
    getMotherboardData() {
        const mb = this.components.motherboard;
        
        // 主板温度（受整体系统温度影响）
        let temp = mb.baseTemp;
        if (this.systemLoad === 'gaming') {
            temp += 5;
        } else if (this.systemLoad === 'stress') {
            temp += 10;
        }
        temp += this.generateComplexFluctuation(0, 0.15) * 8;
        temp = Math.max(25, Math.min(mb.maxTemp, temp));
        
        // 电压（轻微波动）
        let voltage = mb.baseVoltage;
        voltage += this.generateComplexFluctuation(0, 0.015) * voltage;
        voltage = Math.max(11.8, Math.min(12.4, voltage));
        
        // 额外的电压监控
        const voltages = {
            '12V': Math.round(voltage * 100) / 100,
            '5V': Math.round((5.0 + this.generateComplexFluctuation(0, 0.02) * 0.2) * 100) / 100,
            '3.3V': Math.round((3.3 + this.generateComplexFluctuation(0, 0.015) * 0.1) * 100) / 100
        };
        
        return {
            name: mb.name,
            icon: mb.icon,
            temperature: Math.round(temp),
            voltage: Math.round(voltage * 100) / 100,
            voltages: voltages,
            chipset: mb.chipset,
            bios: 'UEFI 2.8',
            biosVersion: '0901',
            powerPhases: 16
        };
    }

    /**
     * 获取风扇数据
     */
    getFanData() {
        const fans = this.components.fans;
        
        // 风扇转速（根据系统温度自动调节）
        const avgTemp = (this.getCPUData().temperature + this.getGPUData().temperature) / 2;
        let rpmMultiplier = 1;
        
        if (avgTemp > 70) {
            rpmMultiplier = 1.6;
        } else if (avgTemp > 60) {
            rpmMultiplier = 1.3;
        } else if (avgTemp > 50) {
            rpmMultiplier = 1.1;
        }
        
        let rpm = fans.baseRPM * rpmMultiplier;
        rpm += this.generateComplexFluctuation(0, 0.1) * rpm;
        rpm = Math.max(800, Math.min(fans.maxRPM, rpm));
        
        // 风扇状态
        let status = '正常';
        if (rpm > 2000) {
            status = '高速运转';
        } else if (rpm < 1000) {
            status = '低速运转';
        }
        
        // 各个风扇的详细信息
        const fanDetails = fans.types.map((type, index) => {
            const variance = this.generateComplexFluctuation(0, 0.15);
            return {
                name: type,
                rpm: Math.round(rpm * (1 + variance)),
                pwm: Math.round((rpm / fans.maxRPM) * 100),
                status: rpm > 2000 ? '高速' : rpm > 1200 ? '正常' : '低速'
            };
        });
        
        return {
            name: fans.name,
            icon: fans.icon,
            count: fans.count,
            rpm: Math.round(rpm),
            status: status,
            pwm: Math.round((rpm / fans.maxRPM) * 100),
            details: fanDetails,
            mode: avgTemp > 60 ? '性能模式' : '安静模式'
        };
    }

    /**
     * 获取系统概览
     */
    getSystemOverview() {
        const cpu = this.getCPUData();
        const gpu = this.getGPUData();
        const memory = this.getMemoryData();
        const storage = this.getStorageData();
        
        // 计算系统整体状态
        const avgTemp = (cpu.temperature + gpu.temperature) / 2;
        const avgUsage = (cpu.usage + gpu.usage) / 2;
        
        let systemStatus = '正常';
        let statusColor = 'normal';
        
        if (avgTemp > 80 || avgUsage > 90) {
            systemStatus = '高负载';
            statusColor = 'critical';
        } else if (avgTemp > 70 || avgUsage > 70) {
            systemStatus = '中等负载';
            statusColor = 'warning';
        } else if (avgTemp > 60 || avgUsage > 50) {
            systemStatus = '轻度负载';
            statusColor = 'danger';
        }
        
        return {
            status: systemStatus,
            statusColor: statusColor,
            avgTemperature: Math.round(avgTemp * 10) / 10,
            avgUsage: Math.round(avgUsage * 10) / 10,
            totalPower: cpu.power + gpu.power + 50, // 加上其他组件功耗
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            loadType: this.systemLoad
        };
    }

    /**
     * 获取所有硬件数据
     */
    getAllData() {
        // 更新系统负载状态
        this.updateSystemLoad();
        
        const data = {
            cpu: this.getCPUData(),
            gpu: this.getGPUData(),
            memory: this.getMemoryData(),
            storage: this.getStorageData(),
            motherboard: this.getMotherboardData(),
            fans: this.getFanData(),
            system: this.getSystemOverview(),
            timestamp: Date.now(),
            updateInterval: Date.now() - this.lastUpdate
        };
        
        this.lastUpdate = Date.now();
        return data;
    }

    /**
     * 设置系统负载类型（用于测试）
     * @param {string} loadType - 负载类型：normal, gaming, stress
     */
    setSystemLoad(loadType) {
        if (['normal', 'gaming', 'stress'].includes(loadType)) {
            this.systemLoad = loadType;
        }
    }

    /**
     * 设置环境温度
     * @param {number} temp - 环境温度
     */
    setAmbientTemperature(temp) {
        this.ambientTemp = Math.max(15, Math.min(40, temp));
    }

    /**
     * 重置模拟器
     */
    reset() {
        this.startTime = Date.now();
        this.lastUpdate = Date.now();
        this.systemLoad = 'normal';
        this.ambientTemp = 25;
        this.initializeHistory();
    }
}

// 创建全局实例
window.hardwareSimulator = new HardwareSimulator();

// 导出类（如果在模块环境中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HardwareSimulator;
}
