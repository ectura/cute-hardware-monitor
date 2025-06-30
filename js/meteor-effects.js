// 流星效果管理器
class MeteorEffects {
    constructor() {
        this.meteorTrails = document.getElementById('meteorTrails');
        this.floatingParticles = document.getElementById('floatingParticles');
        this.config = {
            meteorCount: 6,
            particleCount: 20,
            meteorInterval: 3000,
            particleInterval: 200
        };
        
        this.init();
    }

    init() {
        this.createMeteorTrails();
        this.createFloatingParticles();
        this.startMeteorShow();
        this.startParticleGeneration();
    }

    // 创建流星轨迹
    createMeteorTrails() {
        for (let i = 1; i <= this.config.meteorCount; i++) {
            const trail = document.createElement('div');
            trail.className = `meteor-trail meteor-trail-${i}`;
            
            const meteor = document.createElement('div');
            meteor.className = 'meteor';
            
            trail.appendChild(meteor);
            this.meteorTrails.appendChild(trail);
            
            // 随机位置
            trail.style.top = Math.random() * 50 + '%';
            trail.style.left = Math.random() * -20 + '%';
        }
    }

    // 创建浮动粒子
    createFloatingParticles() {
        for (let i = 0; i < this.config.particleCount; i++) {
            this.createParticle();
        }
    }

    // 创建单个粒子
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机属性
        const size = Math.random() * 3 + 2;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 10 + 8;
        const delay = Math.random() * 5;
        
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = left + '%';
        particle.style.animationDuration = animationDuration + 's';
        particle.style.animationDelay = delay + 's';
        
        this.floatingParticles.appendChild(particle);
        
        // 粒子生命周期管理
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, (animationDuration + delay) * 1000);
    }

    // 开始流星秀
    startMeteorShow() {
        setInterval(() => {
            this.triggerRandomMeteor();
        }, this.config.meteorInterval);
    }

    // 触发随机流星
    triggerRandomMeteor() {
        const trails = this.meteorTrails.querySelectorAll('.meteor-trail');
        const randomTrail = trails[Math.floor(Math.random() * trails.length)];
        const meteor = randomTrail.querySelector('.meteor');
        
        // 重新触发动画
        meteor.style.animation = 'none';
        meteor.offsetHeight; // 触发重排
        meteor.style.animation = 'meteor-fly 3s linear';
        
        // 创建尾迹粒子
        this.createMeteorTrail(randomTrail);
    }

    // 创建流星尾迹
    createMeteorTrail(trail) {
        const rect = trail.getBoundingClientRect();
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'meteor-particle';
                
                particle.style.left = (rect.left + Math.random() * 200) + 'px';
                particle.style.top = (rect.top + Math.random() * 100) + 'px';
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 1000);
            }, i * 100);
        }
    }

    // 开始粒子生成
    startParticleGeneration() {
        setInterval(() => {
            this.createParticle();
        }, this.config.particleInterval * 10);
    }

    // 创建星座连线效果
    createConstellationLines(elements) {
        const lines = [];
        
        for (let i = 0; i < elements.length - 1; i++) {
            for (let j = i + 1; j < elements.length; j++) {
                const element1 = elements[i];
                const element2 = elements[j];
                
                const rect1 = element1.getBoundingClientRect();
                const rect2 = element2.getBoundingClientRect();
                
                const distance = Math.sqrt(
                    Math.pow(rect2.left - rect1.left, 2) + 
                    Math.pow(rect2.top - rect1.top, 2)
                );
                
                // 只连接距离适中的元素
                if (distance < 500 && distance > 200) {
                    const line = this.createLine(rect1, rect2);
                    lines.push(line);
                }
            }
        }
        
        return lines;
    }

    // 创建连线
    createLine(rect1, rect2) {
        const line = document.createElement('div');
        line.className = 'constellation-line';
        
        const angle = Math.atan2(rect2.top - rect1.top, rect2.left - rect1.left);
        const length = Math.sqrt(
            Math.pow(rect2.left - rect1.left, 2) + 
            Math.pow(rect2.top - rect1.top, 2)
        );
        
        line.style.width = length + 'px';
        line.style.left = rect1.left + rect1.width / 2 + 'px';
        line.style.top = rect1.top + rect1.height / 2 + 'px';
        line.style.transform = `rotate(${angle}rad)`;
        line.style.transformOrigin = '0 50%';
        
        document.body.appendChild(line);
        
        // 自动清理
        setTimeout(() => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        }, 5000);
        
        return line;
    }

    // 卡片出现动画
    animateCardEntrance(card, delay = 0) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.8)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.8s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, delay);
    }

    // 响应式调整
    handleResize() {
        if (window.innerWidth <= 768) {
            // 移动设备上减少效果
            this.config.meteorCount = 3;
            this.config.particleCount = 10;
        } else {
            // 桌面设备恢复完整效果
            this.config.meteorCount = 6;
            this.config.particleCount = 20;
        }
    }

    // 性能优化：暂停效果
    pauseEffects() {
        const meteors = document.querySelectorAll('.meteor');
        const particles = document.querySelectorAll('.particle');
        
        meteors.forEach(meteor => {
            meteor.style.animationPlayState = 'paused';
        });
        
        particles.forEach(particle => {
            particle.style.animationPlayState = 'paused';
        });
    }

    // 恢复效果
    resumeEffects() {
        const meteors = document.querySelectorAll('.meteor');
        const particles = document.querySelectorAll('.particle');
        
        meteors.forEach(meteor => {
            meteor.style.animationPlayState = 'running';
        });
        
        particles.forEach(particle => {
            particle.style.animationPlayState = 'running';
        });
    }
}

// 初始化流星效果
let meteorEffects;

document.addEventListener('DOMContentLoaded', () => {
    meteorEffects = new MeteorEffects();
    
    // 窗口大小改变时调整效果
    window.addEventListener('resize', () => {
        meteorEffects.handleResize();
    });
    
    // 页面可见性改变时控制效果
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            meteorEffects.pauseEffects();
        } else {
            meteorEffects.resumeEffects();
        }
    });
});
