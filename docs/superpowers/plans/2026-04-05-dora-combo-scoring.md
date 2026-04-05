# Dora Combo Scoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Jade Mahjong 增加每局随机宝牌、即时得分、连击倍率和结果页结算信息。

**Architecture:** 计分、连击和宝牌状态全部收敛到 `gameEngine` 与 `GameState` 中管理。UI 只负责显示当前分数、连击、倍率、宝牌和最近一次得分事件，避免把规则拆散在组件层。

**Tech Stack:** React 19、TypeScript、Vitest、CSS

---

### Task 1: 扩展类型与测试基线

**Files:**
- Modify: `app/src/types/game.ts`
- Test: `app/src/game/gameEngine.test.ts`

- [ ] 为 `GameState`、`GameSnapshot`、`LevelResult` 增加宝牌、分数、连击字段
- [ ] 为宝牌生成、基础分、宝牌分、三连击、五连击、连击中断补失败测试

### Task 2: 实现引擎内计分与宝牌逻辑

**Files:**
- Modify: `app/src/game/gameEngine.ts`
- Test: `app/src/game/playthrough.test.ts`

- [ ] 在开局时随机选择 1 个宝牌牌型
- [ ] 在成功消除时结算本次分数、倍率和宝牌奖励
- [ ] 在 `Hint / Shuffle / Smart Shuffle / Undo / 失误匹配` 时正确处理连击中断或回退
- [ ] 保证现有关卡流程测试仍然成立

### Task 3: 接入结果页与进度模型

**Files:**
- Modify: `app/src/App.tsx`
- Modify: `app/src/storage/progressStore.ts`

- [ ] 让通关结算返回 `score / bestCombo / doraMatches`
- [ ] 确保进度记录可以保存新字段且不破坏原有星级逻辑

### Task 4: 更新对局页与结果页展示

**Files:**
- Modify: `app/src/screens/GameScreen.tsx`
- Modify: `app/src/screens/ResultScreen.tsx`
- Modify: `app/src/index.css`

- [ ] 在对局页显示当前总分、连击、倍率、宝牌
- [ ] 在对局页显示最近一次得分事件
- [ ] 在结果页新增分数、最高连击、宝牌消除次数
- [ ] 保持当前移动端游戏化视觉风格不被削弱

### Task 5: 回归验证

**Files:**
- Test: `app/src/App.test.tsx`
- Test: `app/src/game/gameEngine.test.ts`
- Test: `app/src/game/playthrough.test.ts`

- [ ] 跑关键交互测试
- [ ] 跑计分与流程测试
- [ ] 跑 lint 与 build

