# 🌠 流星主题硬件监控网站

一个现代化的硬件监控网站，具有流星轨迹布局效果和真实硬件数据展示。

## ✨ 特性

- 🎨 流星主题设计，使用可爱粉色背景
- 📊 图形化数据展示（Chart.js + 自定义图表）
- 🌡️ 真实硬件数据获取（基于 Web APIs）
- 💫 流星轨迹动画效果
- 📱 完全响应式设计
- 🎯 玻璃拟态 UI 设计
- 🌙 支持主题切换

## 🚀 在线预览

访问：https://ectura.github.io

## 📦 技术栈

- **前端**: HTML5, CSS3, JavaScript ES6+
- **图表库**: Chart.js
- **动画**: CSS3 Animations + JavaScript
- **API**: Navigator API, Performance API, WebGL
- **构建**: 原生 Web 技术

## 🛠️ 安装使用

1. 克隆仓库到本地
2. 在项目根目录启动本地服务器
3. 浏览器访问 `http://localhost:3000`

```bash
# 使用 Python 启动简单服务器
python -m http.server 3000

# 或使用 Node.js
npx serve .
```

## 📊 支持的硬件信息

- **系统信息**: 操作系统、浏览器版本
- **处理器**: 核心数、架构信息
- **内存**: 已用/总量、性能时间线
- **网络**: 连接类型、速度
- **显示**: 屏幕分辨率、色彩深度
- **存储**: LocalStorage 使用情况
- **电池**: 电量、充电状态（支持的设备）

## 🎨 自定义

### 更换背景图片
修改 `css/style.css` 中的背景图片路径：

```css
.background-image {
    background-image: url('path/to/your/image.png');
}
```

### 调整流星轨迹
在 `js/meteor-effects.js` 中修改轨迹参数：

```javascript
const METEOR_CONFIG = {
    trails: 6,          // 轨迹数量
    curvature: 0.3,     // 曲线弯曲度
    speed: 2000,        // 动画速度
};
```

## 📱 浏览器兼容性

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🔒 隐私说明

本应用仅使用浏览器提供的公开 API 获取系统信息，不会收集或传输任何个人数据。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
