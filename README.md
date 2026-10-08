# 岁时家集 · Suishi Family Anthology

以真实生活为本，以经典文言为法，以诵读迁移为用。

## MVP 0.3 · Public GitHub 相册（当前）

- GitHub `nikon2023/suishi-jiaji` 仓库为 Public。读者通过 `GET /api/gallery` 匿名查看图片，不依赖 GitHub Token。
- 上传、编辑和删除必须通过 `ALBUM_ADMIN_PASSWORD` 验证；服务端使用 `ALBUM_GITHUB_TOKEN` 写入 GitHub，令牌只放在 Vercel Production 环境变量。
- GitHub Fine-grained Token 必须具有 `suishi-jiaji` 的 **Contents: Read and write**；**Public 仅开放读取，不赋予写权限**。
- 每期最多 30 张，输入 JPEG/PNG/WebP/GIF，在浏览器压缩为 WebP（上传文件 ≤1.8MB），照片存入 `albums/<issue>/photos/`，清单在 `manifest.json`。
- **隐私边界**：公开仓库及网站访客都能看到照片；删除不等于从 Git 历史彻底消除。切勿上传私人家庭照片。
- 从 MVP 0.2 本地 IndexedDB 到云端没有自动迁移，请重新上传经过审核的公开照片。

### MVP 0.3 Evidence Gate

- G1 仓库 Public：已通过（GitHub 元数据确认）。
- G2 API 公开读：待线上 GET 验证；未创建相册时返回 `{"issue":"jianggao-001","items":[]}`。
- G3 管理员写入：待实际上传验证；仅凭环境变量存在与部署 READY 不视为通过。
- G4 刷新/跨设备可见：待实际上传后验证。
- G5 编辑/删除：待实际操作验证。
- **Gate 规则：G1-G5 全部实测通过才可 CLOSED，否则 OPEN。**

## MVP 0.2 · 本期相册与维基延伸阅读

- 《项脊轩志》扩展阅读补充维基文库作品原文、归有光维基百科词条、《震川先生集》卷十七的外部参考链接。
- 本期目录新增「陆 · 影像相册」，支持多张图片上传、拖放、预览、说明编辑、单张保存、删除，图片写入浏览器 IndexedDB，按期号隔离。
- 相册为**仅当前浏览器本地存储**，无用户账户、无服务器上传、无跨设备同步；重要图片须另行备份。单张源文件限制 12MB，最多 30 张；JPEG、PNG、WebP 和 GIF 可用，JPEG/PNG/WebP 会压缩，GIF 保留原文件（大小限制）。浏览器未开放持久存储或存储空间不足时会提示失败。

## MVP 0.1

- 第一卷《江皋携女记》，点击红色词语展示注音、解释和来源。
- 字词、文言虚词、重点句式与典故卡片。
- 《项脊轩志》全文展开阅读（包括部分教材删节段落；不同古籍版本存在异文）。
- 本周背诵、浏览器朗读、字体调节、进度自动保存、A4 打印正文。
- 解说工坊：任意主题 + 听众 + 风格 + 篇幅 + 音色 → LLM 讲稿 → OpenAI TTS MP3，可播放与下载。
- 未配置 AI 服务时，不会伪装成 AI 结果：生成明确标识的本地示范稿、提供浏览器 TTS 试听。
- 全站响应式设计、减少动态效果的系统偏好支持。

## 本地打开与测试

页面是纯静态 HTML/CSS/原生 JavaScript，无构建依赖；可以通过任意静态服务器启动。

```bash
python3 -m http.server 8000
# 访问 http://localhost:8000
node --check app.js
npm run check
```

不启动函数服务时，`/api/*` 不可用，前端自动退回本地示范模式。

## 部署到 Vercel

1. 创建同名独立 GitHub 仓库 `suishi-jiaji`，推送当前目录。
2. 在 Vercel 导入该仓库；Framework Preset 选择 Other，Root Directory 为仓库根目录，Output Directory 留空。
3. 如需 AI 解说，在 **Vercel 项目服务端环境变量** 设置：
   - `OPENAI_API_KEY`：有效 API key。
   - `SITE_ACCESS_CODE`：自定义强口令，限制 AI 接口访问；前端从“进阶设置”输入。
   - `NARRATION_MODEL`：可选，默认 `gpt-4.1-mini`。
4. 重新部署并测试 `/api/narrate` 与 `/api/speech`。**不要把 API 密钥存于前端或 GitHub。**

**安全边界：** `SITE_ACCESS_CODE` 为简易站点口令，只适合少量可信用户；公开商用前建议增加独立账户鉴权、速率限制、额度控制、服务端计费监控、防滥用审计。部署时若没有配置环境变量，两个 AI 接口会返回 503，静态阅读与浏览器朗读仍可使用。

## 增加新的一期

在 `content.js` 中按照 `entry / glossary / grammar / patterns / allusions / classic` 对象扩展内容。此 MVP 目前只显示第 001 期；多期路由、编辑工作台与后台存储是下一阶段功能，**不要把原型误当作 CMS**。

## 版权与学术说明

《项脊轩志》属于公有领域古典作品；正文按通行本整理，个别标点及异体字可能与教材不同。典故注释须核对出处，避免字面相似而语义不符。AI 生成的讲稿应人工核查。合成语音需明确标注为 AI 生成。

## 文件

```text
index.html          交互页面
styles.css          页面视觉与响应式排版
content.js          第一卷与经典内容
app.js              交互、学习进度、语音与解说工坊
api/narrate.js      私有服务端讲稿生成
api/speech.js       私有服务端 TTS 合成
api/_shared.js      API 权限校验与统一请求
vercel.json         部署与安全响应头
```