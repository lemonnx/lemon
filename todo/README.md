# TODO List 应用
基于 React + IndexedDB 的待办事项管理，实现了任务添加、删除、完成标记、提醒等功能。

## 运行方式
### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

## 技术栈
- React 18.3.1
- Dexie 4.0.7（IndexedDB 封装）
- Vite 5.4.8（构建工具）

### 安装依赖
```bash
npm install
```
### 启动开发服务器
```bash
npm run dev
```

## 项目结构
```
src/
  ├── api/          # 数据层（IndexedDB 操作）
  ├── components/   # UI 组件
  ├── hooks/        # 自定义 Hooks
  ├── utils/        # 工具函数
  ├── App.jsx       # 主应用组件
  ├── main.jsx      # 入口文件
  └── styles.css    # 样式文件
```

详细的实现说明、设计决策与拓展思路请参考 [DOC.md](./DOC.md)。