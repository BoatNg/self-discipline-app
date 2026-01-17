<!-- DEBUGGING.md -->
# 调试指南（Debugging Guide）

## 开发环境状态
- 本地开发服务器已启动：`http://localhost:13348`
- MCP 服务可用：`http://localhost:13348/__mcp/sse`
- 浏览器中已打开应用页面（确保 DevTools Hook 已注入）

## 调试流程
1. **确认组件是否存在**  
   使用 `vue-dev-mcp/get-component-tree` 工具查看当前渲染的组件树。

2. **检查 Pinia 状态**  
   使用 `vue-dev-mcp/get-pinia-state` 查询指定 store（如 `userStore`）的数据。

3. **实时修改状态测试**  
   可通过 `vue-dev-mcp/edit-component-state` 临时修改组件 data 进行验证。

4. **高亮定位组件**  
   使用 `vue-dev-mcp/highlight-component` 在页面上高亮目标组件，便于视觉确认。

## 注意事项
- 所有 MCP 操作仅在开发模式下有效；
- 修改状态不会持久化，刷新页面即重置；
- 若 MCP 无响应，请检查浏览器是否加载了 Vue 应用。