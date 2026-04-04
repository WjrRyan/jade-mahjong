# Jade Mahjong 项目总览

这个仓库包含一个移动优先的麻将连连看 Web App，以及本次交付相关的中文说明文档与维护记录。

## 仓库结构

- `app/`
  - 前端应用源码
  - 构建、测试、样式与资源文件
- `app/docs/`
  - 交付总结
  - 本轮修复记录
  - 决策与验证文档

## 主要文档

- 产品说明：`app/README.md`
- 交付总结：`app/docs/submission-summary.md`
- 2026-04-04 核心工作记录：`app/docs/2026-04-04-core-work.md`
- 2026-04-04 决策与思考：`app/docs/2026-04-04-decision-log.md`
- 2026-04-04 验证与发布记录：`app/docs/2026-04-04-validation-log.md`

## 本地使用

```bash
cd app
npm install
npm run dev
npm test
npm run lint
npm run build
```

## 当前内容概览

当前仓库已经包含：

- Jade Mahjong 的完整前端工程
- 20 个可游玩的关卡
- 游戏引擎、提示、洗牌、撤回、进度存储等核心逻辑
- 本轮关于开局牌型与 `Hint` 行为修复的中文文档

如果要继续接手这个项目，建议先阅读 `app/README.md`，再看 `app/docs/2026-04-04-core-work.md`。

