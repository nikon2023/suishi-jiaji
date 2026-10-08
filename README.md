# 岁时家记 · Suishi Family Chronicles

以真实生活为本，以经典文言为法，以诵读迁移为用。

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