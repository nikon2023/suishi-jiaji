# 岁时家集 · MVP0.3 Evidence Gate（2026-10-08）

**Decision:** `CLOSED_WITH_EXCEPTIONS`（本轮实施工作归档；上传功能未完成生产验收，不得标为 `PASS`）。

## 本轮变更

- GitHub 源码仓库 `nikon2023/suishi-jiaji` 从 Private 改为 Public。经 GitHub 读取核对，`visibility=public`。
- 公开 GET 不再使用写入令牌；无相册清单时按空相册处理。
- 管理员的 POST/PATCH/DELETE 继续校验 `ALBUM_ADMIN_PASSWORD`，通过 Vercel 的服务端 `ALBUM_GITHUB_TOKEN` 调 GitHub 写入。
- 删除“仓库必须为 Private 才允许写入”的误配置限制。
- 前端修正上传错误被后续列表加载提示覆盖的问题，保留真实错误供下一次定位。
- 相册明确告知：GitHub Public 仓库中的照片（含历史提交）对公众开放，不适合存放私人家庭影像。

## 验证记录

| Gate | 验证内容 | 结果 | 证据 |
| --- | --- | --- | --- |
| G1 | GitHub 仓库 Public | PASS | GitHub 仓库元数据 `visibility=public` |
| G2 | 公开读取逻辑，缺失清单返回空列表 | PASS (MOCK) | 在隔离 JS 执行中模拟 GitHub 仓库 GET=200、清单 GET=404，得到 HTTP 200 与 `{"issue":"jianggao-001","items":[]}`，且请求不发送 Authorization |
| G3 | 匿名写入被拒绝 | PASS (MOCK) | 在隔离 JS 执行中模拟无效管理员口令，POST 得到 HTTP 401，未调用 GitHub |
| G4 | 正确口令通过初步身份校验 | PASS (MOCK) | 用非生产测试口令，POST 进入图片格式检查并返回 HTTP 400（伪造图片），没有验证真实 GitHub 写入 |
| G5 | Vercel 部署了 Public 相册实现 | PASS | Vercel 生产部署 `09492a9697fa098f3f31e70c592a0f4d8c8a860f` 状态 `READY` |
| G6 | 线上匿名 GET、真实管理员上传 | **NOT VERIFIED** | 当前连接无法读取线上 API；在本轮之前的 Private 仓库版本，GitHub Token 曾返回 404 |
| G7 | 上传后刷新可见、跨设备、修改及删除 | **NOT VERIFIED** | 无真实测试图片写入证据 |
| G8 | Vercel Production 环境变量可见性 | **UNRESOLVED** | 此前核对存在两个 Sensitive 变量，但最近连接查询返回空列表；需在项目 UI 中复核实际配置 |

## Gate 判定

- **工作轮次关闭：** `CLOSED_WITH_EXCEPTIONS`，不是产品验收 `ACCEPTED`。
- **不得声称：** “生产上传成功”“GitHub 写入凭据有效”“照片已跨设备同步”。
- **残余风险：** GitHub PAT 可能仍不具备 Contents: Read and write；Production 环境变量可能缺失或连接查询权限异常；GitHub 匿名读取存在速率限制。
- **下一动作：** 在 Vercel UI 确认 `ALBUM_ADMIN_PASSWORD`、`ALBUM_GITHUB_TOKEN` 均存在且适用 Production；使用非敏感测试照片执行上传→刷新→另一设备访问→修改说明→删除闭环；记录真实 API 状态和 Git commit。
- **升级规则：** 上述生产测试全部通过，才可将功能验收从 `NOT VERIFIED` 升级为 `ACCEPTED`。

## 代码版本

- 主代码提交：`09492a9697fa098f3f31e70c592a0f4d8c8a860f`
- Gate 记录：本文件所在提交。
