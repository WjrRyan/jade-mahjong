# Jade Mahjong Mobile Vita Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Jade Mahjong 的视觉效果重构为更接近 Vita Mahjong 气质、同时更精致的移动端休闲游戏界面。

**Architecture:** 保持现有游戏逻辑不变，以 screen 结构微调和全局样式系统重写为主。重构集中在首页、对局页、结果页、牌桌容器、卡牌视觉层级与按钮区布局，不新增依赖，优先通过 React 结构调整和 CSS 完成。

**Tech Stack:** React 19、TypeScript、Vite、CSS、Vitest

---

### Task 1: 建立视觉重构基线

**Files:**
- Modify: `app/src/screens/HomeScreen.tsx`
- Modify: `app/src/screens/GameScreen.tsx`
- Modify: `app/src/screens/ResultScreen.tsx`
- Modify: `app/src/index.css`

- [ ] 记录当前页面结构中会限制移动端游戏感的区域：顶部、统计区、棋盘区、工具栏、结果页按钮区
- [ ] 为三个 screen 补足更适合游戏 UI 的语义分组和 className 钩子
- [ ] 保持现有交互事件与 props 不变，只调整结构和容器层次

### Task 2: 重写全局主题与首页大堂视觉

**Files:**
- Modify: `app/src/index.css`
- Modify: `app/src/screens/HomeScreen.tsx`

- [ ] 建立新的颜色、阴影、渐变、圆角、文字层级变量
- [ ] 将首页英雄区改造成更强的游戏开场模块
- [ ] 重做统计卡、设置卡、关卡卡视觉层级
- [ ] 强化当前可玩关卡与已完成关卡的状态区分

### Task 3: 重做对局页 HUD 与棋盘区域

**Files:**
- Modify: `app/src/screens/GameScreen.tsx`
- Modify: `app/src/index.css`

- [ ] 将顶部状态区重构为更像游戏 HUD 的信息条
- [ ] 将统计区改造成更有层级的状态胶囊 / 面板
- [ ] 重做棋盘容器背景、边框、内阴影与材质表现
- [ ] 将工具按钮区改造成更适合移动端底部点击的操作带

### Task 4: 重做卡牌视觉与结果页奖励反馈

**Files:**
- Modify: `app/src/components/TileFace.tsx`
- Modify: `app/src/screens/ResultScreen.tsx`
- Modify: `app/src/index.css`

- [ ] 提升卡牌厚度感、高光、阴影与状态反馈
- [ ] 调整选中、提示、可点击状态的视觉差异
- [ ] 重做结果页层次、主按钮和奖励感
- [ ] 增加轻量入场与状态动效

### Task 5: 清理遗留样式并验证

**Files:**
- Modify: `app/src/App.css`
- Test: `app/src/App.test.tsx`
- Test: `app/src/game/gameEngine.test.ts`

- [ ] 清理 Vite 模板残留样式，避免旧样式干扰新皮肤
- [ ] 运行现有测试确认结构调整未破坏交互
- [ ] 运行构建验证最终产物可编译
- [ ] 如有必要，补充轻量 UI 回归测试或选择器兼容调整

