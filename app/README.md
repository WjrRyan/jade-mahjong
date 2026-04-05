# Jade Mahjong App

`app/` 是 Jade Mahjong 的实际前端工程目录。

如果你是第一次进入这个仓库，建议先阅读仓库根目录的 [README.md](../README.md)，那里包含：

- 产品定位
- 功能说明
- 界面截图
- 玩法规则
- Vercel 部署说明

## 开发命令

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

## 主要源码结构

```text
src/
  components/  复用组件
  data/        牌型定义与关卡配置
  game/        核心规则引擎与测试
  screens/     首页、游戏页、结果页
  storage/     本地进度存储
  test/        测试初始化
  types/       共享类型定义
```

## 开发说明

- 默认使用 `localStorage` 保存进度
- 无后端依赖，可单独作为静态前端部署
- 关卡可解性与核心玩法由 `src/game/` 中的引擎与测试保护
