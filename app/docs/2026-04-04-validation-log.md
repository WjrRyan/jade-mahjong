# 2026-04-04 验证与发布记录

## 本次执行的验证命令

在 `app/` 目录下执行：

```bash
npx vitest run --maxWorkers=1 src/App.test.tsx src/game/boardViewport.test.ts src/game/gameEngine.test.ts src/game/playthrough.test.ts src/storage/progressStore.test.ts
npm run lint
npm run build
```

## 这次验证重点覆盖了什么

### 新增回归保护

#### `src/game/gameEngine.test.ts`

新增了针对开局牌型分布的回归验证，确保简单行布局下不会把所有相同牌都聚成紧挨着的邻接对。

#### `src/App.test.tsx`

新增了针对 `Hint` 的交互验证，确保在关闭 `highlightHints` 时，提示依然能形成可执行动作，而不是只产生一个内部状态。

### 现有能力复查

- board viewport 计算
- 智能恢复逻辑
- 20 关完整 playthrough
- 进度存储
- 生产构建

## 验证结果

- 全量目标测试在单 worker 模式下通过
- Lint 通过
- Build 通过

## 环境说明

当前环境里，直接运行默认 `npm test` 有概率触发 Vitest 的 fork worker 启动超时。这不代表业务测试失败，而是测试进程调度问题。

为避免把环境噪音误判成代码问题，本次发布验证统一使用：

```bash
npx vitest run --maxWorkers=1 ...
```

## 当前仍需关注的点

- 牌型分布优化目前是启发式优化，不是全局最优布局器
- `Hint` 在功能上已经恢复可用，但视觉提示还可以继续加强

