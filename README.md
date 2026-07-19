# 🌳 TobyHabit — 习惯森林

> 种下一颗种子，看着它长成参天大树。用游戏化的正反馈帮你真正养成好习惯。

## 核心理念

大多数习惯 App 只是冷冰冰的打卡计数器。TobyHabit 把每个习惯变成一棵会成长的树——你坚持，它就茂盛；你懈怠，它就枯萎。但**它不会死**，只要你回来，它就能恢复生机。

这正是习惯养成的真相：**一个糟糕的日子不应该抹去几个月的努力。**

## 功能

- 🌱 **种下习惯** — 定义习惯名称、图标、树种、主题色，以及「最小版本」（状态不好时也能保持连续性）
- 🌳 **6 种树 × 8 个生长阶段** — 橡树、松树、樱花、竹子、枫树、仙人掌，从种子到古树
- ✅ **双模式打卡** — 完整版打卡 + 最小版打卡，不想动的时候做一点点也算
- 🔥 **连续天数追踪** — 最长连续、冻结卡、断签复活机制
- 🏆 **里程碑庆祝** — 7 / 21 / 66 / 100 / 200 / 365 天触发全屏撒花
- 📅 **日历热力图** — GitHub 风格的可视化打卡记录
- 😊 **心情日记** — 每次打卡可选记录心情和感受
- 📱 **移动端优先** — 响应式设计，手机体验流畅

## 技术栈

| 层 | 技术 |
|---|------|
| 后端 | FastAPI (Python 3.12) + SQLAlchemy + SQLite |
| 前端 | React 18 + TypeScript + TailwindCSS + Framer Motion |
| 部署 | systemd + uvicorn，单进程 serve 一切 |

## 快速开始

```bash
# 1. 安装后端依赖
uv sync

# 2. 安装前端依赖
cd frontend && npm install

# 3. 构建前端
npx vite build

# 4. 启动
cd .. && uv run uvicorn backend.main:app --host 0.0.0.0 --port 8899
```

打开 `http://localhost:8899` 即可使用。

## 项目结构

```
TobyHabit/
├── backend/           # FastAPI 后端
│   ├── main.py        # 入口，serve 前端静态文件
│   ├── models/        # SQLAlchemy ORM 模型
│   ├── schemas/       # Pydantic 请求/响应模型
│   ├── routers/       # API 路由
│   └── services/      # 业务逻辑（streak、tree）
├── frontend/          # React 前端
│   └── src/
│       ├── pages/     # Forest, HabitDetail, Journal
│       ├── components/
│       │   ├── tree/  # TreeSVG — 核心动画组件
│       │   ├── habit/ # HabitCard, CalendarHeatmap 等
│       │   └── checkin/ # 打卡流程
│       └── store/     # Zustand 状态管理
└── data/              # SQLite 数据库（gitignore）
```
