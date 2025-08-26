## 全局词汇数据流重构方案（基础版）

### 目标
- 统一数据源：单词/单元数据在全局持有，页面与组件只读上下文，统一通过服务层执行写入。
- 即时同步：任一写操作后，UI 立即反馈；返回页面无需手动刷新即可看到最新状态。
- 分层清晰：组件 → hooks/context → services → storage（LocalStorage / Firebase）。

### 设计要点（基础版落地）
- 全局 Context（WordContext）：
  - 状态：`data: StorageData | null`、`loading`、`error`。
  - 方法：`loadData`、`createUnit`、`updateUnitData`、`addWordToUnit`、`updateWordInUnit`、`toggleWordMasteredStatus`、`setWordMasteredStatusDirect`、`deleteWords`、`deleteUnits`、`batchImportData`。
  - 缓存与失效：在 Context 内部封装 `globalCacheManager`；成功写操作后立即乐观更新内存态，并同步更新缓存避免焦点触发的重载覆盖；必要时再精准失效相关键。
  - 数据服务选择：监听 `AuthContext` 的用户变化（login/logout），在切换时初始化 `DataServiceManager` 并清理缓存、重载数据。

- 乐观更新（写操作的统一策略）：
  1) 先修改内存态并刷新 UI（瞬时反馈）。
  2) 异步调用 service 写入存储（Firebase/LocalStorage）。
  3) 失败回滚并提示；成功则失效相关缓存键（如 `UNITS`、派生 `STATISTICS`）。
  4) 新增项允许临时 ID；Firebase 成功后以远端 ID 覆盖，或重拉当前单元。

- 页面与组件使用方式：
  - 页面通过 `useWordContext()` 订阅同一份 `data` 与 API，不再各自 `useWordOperations()` 生成多实例。
  - 移除页面级手动刷新/聚焦刷新（可先保留作为降级方案）。

### 分步实施清单（基础版）
1) 新增 `contexts/WordContext.tsx`：迁移并整合 `useWordOperations` 逻辑到 Context（单实例）。
2) 在 `App` 根层包裹 `<WordProvider>`，Context 内部首轮 `loadData()`。
3) 改造 `UnitDetailPage`、`SpellingReviewPage`：使用 `useWordContext()`，移除各自的独立加载与本地镜像状态。
4) 写操作改用 Context API（保持服务层不变）：添加单词、更新释义、掌握状态切换、删除、批量导入等均走同一入口。
5) 验证路径：
   - 添加单词后，Unit 列表与统计即时更新；
   - 拼写复习修改掌握状态后，返回 Unit 页面无需刷新即可看到更新；
   - 登录/登出切换后数据来源正确，缓存被清理并重载。

### 缓存与失效（基础版）
- 读取：优先读取 Context 内存态，首次或切换数据源时触发 `loadData()` 并写入缓存。
- 成功写入：先乐观更新内存态并更新缓存（防止 `focus/visibility` 导致的 `loadData()` 覆盖），后台持久化成功后保持一致。
- 失效：需要重算派生统计时，精准失效 `STATISTICS` 等键；跨源切换时清空所有缓存。
- 切源：`AuthContext` 用户变化时，清空缓存并重载，避免跨源数据串联。

### 增强（暂缓，后续再做）
- 增强 A：Firebase 实时订阅（onSnapshot）
  - 登录时为当前用户订阅 `units`/`words`（建议先按单元粒度）。
  - 远端变化通过回调推送到 Context 内存态，覆盖临时 ID，跨端实时一致。

- 增强 B：React Query 管理只读缓存
  - 用 `@tanstack/react-query` 管理“读”的生命周期与缓存；写操作仍在 Context 中（乐观更新）。
  - 写成功后通过 `invalidateQueries` 精准失效（如 `['unit', unitId]`）。

### 取舍与意义
- 基础版即可消除“返回页面需刷新”“多实例不同步”“批量导入后等待”的问题，并保持实现简单。
- 乐观更新统一封装在 Context，页面与组件无感，用户体验明显提升。
- 增强项按需演进：单人使用场景可先不上 React Query；若启用 Firebase，多端使用时再接入 onSnapshot。

### 组件/工具边界约束（已落地）
- components/ 不导入 services/；通过 hooks/（如 `usePronunciation`、`useMigration`）或 `useWordContext` 获取能力。
- utils/ 仅保留纯函数：`wordFiltering`、`wordStatistics`、`wordImportExport` 不再直接访问存储或服务。
- services/ 的本地后备仅通过 `utils/storage` 统一适配；移除重复实现（`LocalStorageManager`）。

### 风险与回滚
- 任意写操作失败时回滚内存态；
- 打开调试日志（可选）以便排查远端 ID 合并、缓存失效与数据重拉时机；
- 发现问题可暂时保留页面级 `focus/visibility` 触发的 `loadData()` 作为兜底。


