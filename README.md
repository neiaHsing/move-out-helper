# 搬家箱物品记录

这是基于 [BoxTrack](https://github.com/netpersona/Boxtrack) 的 GitHub Pages 版本，提供箱子、物品、搜索及二维码标签。仓库源码遵循上游 `LICENSE` 中的 GPL-3.0 许可。

此版本的页面由 GitHub Pages 提供，登录验证与清单数据由独立后端提供；仓库不会存放用户的密码或物品记录。

## 使用

打开 [网页](https://neiahsing.github.io/move-out-helper/)，输入账号密码。创建房间、箱子和物品后，可按名称搜索；打开箱子即可打印二维码标签或完整清单。扫码可直接查看该箱的只读清单；搜索、编辑、新增和删除等操作仍需登录。

登录状态会在应用打开时每天自动续期；InsForge Cloud 的刷新令牌最长有效期固定为 7 天，因此浏览器连续离线超过 7 天后仍需重新登录。

本机版与 GitHub Pages 版使用不同数据库。本机数据库中的已有记录不会自动同步。部署时本机数据库为空，因此没有待迁移记录。

## 本地开发

1. 复制 `.env.example` 为 `.env`，填入 InsForge 项目的公开 URL 和 anon key。anon key 可公开；管理密钥与登录密码不可放进网页或 Git 仓库。
2. 运行 `npm ci`、`npm run dev`。运行 `npm run check` 和 `npm run build` 检查代码。
3. GitHub Actions 从仓库变量 `VITE_INSFORGE_URL`、`VITE_INSFORGE_ANON_KEY` 构建并发布 Pages。

数据库表结构、授权规则在 `migrations/`；`insforge.toml` 记录后端登录配置。公开注册已关闭，只有后端已有账号能登录。
