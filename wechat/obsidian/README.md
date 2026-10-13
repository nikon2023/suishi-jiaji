# 「岁岁有新章」→ Obsidian → 微信公众号草稿箱

本目录存放**微信公众号排版副本**，与 Vercel 网站分离。原公众号编辑稿在 `wechat/issue-001.md`、`wechat/issue-002.md`，这里移除了非正文的“待发布/编辑说明/主标题/分享摘要”等控制标记，保留正文和文言新编。

## 导入本地 Vault（macOS 首次执行）

在 Mac 的「终端」复制以下命令。已存在同名文件时**跳过，不覆盖 Obsidian 中的编辑**：

```bash
VAULT="/Users/User/Development/chat2obsidian"
DEST="$VAULT/岁岁有新章/00_待发布"
mkdir -p "$DEST"
for n in 001 002; do
  target="$DEST/issue-$n.md"
  if [ -e "$target" ]; then
    echo "跳过（已存在）：$target"
    continue
  fi
  tmp="$(mktemp)"
  if curl --fail --location --silent --show-error \
    "https://raw.githubusercontent.com/nikon2023/suishi-jiaji/main/wechat/obsidian/issue-$n.md" \
    --output "$tmp"; then
    mv "$tmp" "$target"
    echo "已导入：$target"
  else
    rm -f "$tmp"
    echo "下载失败：issue-$n.md" >&2
    exit 1
  fi
done
```

导入完成后，在 Obsidian 的 Vault `chat2obsidian` 中打开 `岁岁有新章/00_待发布/issue-001.md`。

## 公众号草稿发布插件

可选：官方 Obsidian 社区插件 **WeChat Publisher**，官网 https://community.obsidian.md/plugins/wechat-publisher ，作者 https://github.com/RanceLee233/wechat-publisher 。

1. Obsidian「设置→第三方插件→浏览」安装启用 `WeChat Publisher`。若原来已有其他公众号插件，优先核实原插件名称与兼容性，无需重复安装。
2. 选择「赭红」或「亚麻」主题及「舒展版」排版，适配米白、朱红、古典文学的现有品牌。
3. 使用公众号管理界面配置 AppID、AppSecret（**仅保存在本机的插件配置，不得提交 GitHub/上传聊天**）。
4. 使用插件内的微信出口公网 IP 检测，将正确 IP 添加到公众号 API IP 白名单（切换网络/代理后可能变化）。
5. 添加 **900×383 px** 文章封面（插件建议尺寸）；核对标题、作者和摘要，使用手机模式预览。
6. 点击「发布草稿」，目标是**微信公众平台草稿箱**，不是正式发表或群发。
7. 到 https://mp.weixin.qq.com/ 核对稿件、预览手机显示，再由管理员人工发表。

### 个人订阅号限制与降级方案

- 个人订阅号的公众号草稿箱 API 权限需按**当前账号真实接口调用结果**判断，不仅凭账号类型猜测。若返回 `48001` 等无权限错误，不要重复重置 AppSecret。
- 即使接口不可用，WeChat Publisher 也提供「**复制排版**」，可将兼容 HTML 手动粘贴至公众号后台新图文草稿。
- 未获得微信草稿箱的稿件链接/列表证据前，不标记为已推送。正式发表需要管理员确认。

## MVP 0.5 Evidence Gate

| Gate | 结果 |
| --- | --- |
| 公众号文章 Markdown 适配并上传 GitHub | PASS |
| Mac Vault 本地导入 `/Users/User/Development/chat2obsidian` | PENDING：需在用户 Mac 执行命令 |
| Obsidian 插件名称/版本确认 | PENDING |
| AppID/AppSecret 与 IP 白名单联通（不泄密） | PENDING |
| 微信草稿箱出现两篇文章 | PENDING |
| 微信正式发布 | PENDING |

**原则：** GitHub 保存公开文章正文；私人凭证只保存在本地 Obsidian 插件与微信开发者后台。Vercel 站点、网址、GitHub 原有相册 API 不变。
