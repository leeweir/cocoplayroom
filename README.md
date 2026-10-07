# 可可的游戏小屋

给可可的小游戏入口。使用真实游戏截图，点击卡片进入原游戏。

纯 HTML、CSS 和 JavaScript，不需要框架、账号、后端或安装依赖。

## 本地预览

需要 Node.js 22 或更新版本：

```sh
npm run dev
```

打开 <http://127.0.0.1:4177>。不建议双击 HTML，因为浏览器会限制本地文件的 JavaScript 模块。

```sh
npm run check
npm run build
```

`check` 校验游戏数据、封面文件和不启用 JavaScript 时的备用链接。`build` 只把发布需要的文件复制到 `dist/`。

## 添加游戏

1. 把游戏截图放到 `assets/`，推荐横图 JPG。
2. 在 `games.js` 添加一条记录，例如：

```js
{
  id: 'new-game',
  title: '新游戏的名字',
  description: '一句小朋友看得懂的介绍。',
  category: 'puzzle',
  label: '动脑解谜',
  color: 'sage',
  image: 'assets/new-game.jpg',
  url: 'https://leeweir.github.io/new-game/',
},
```

3. 同时在 `index.html` 的 `<noscript>` 列表里加入链接。
4. 运行 `npm run check`，提交并推送到 `main`。

分类：`puzzle` 动动脑，`adventure` 去冒险，`relax` 慢慢玩。
卡片颜色：`peach`、`sage`、`butter`、`pink`、`blue`、`lavender`。

游戏数量、筛选和随机推荐会自动更新。`id` 尽量保持不变。

## 发布

GitHub Pages 仓库为 `leeweir/cocoplayroom`，发布地址为 <https://leeweir.github.io/cocoplayroom/>。

仓库的 Settings → Pages → Source 设为 GitHub Actions。推送到 `main` 后，`.github/workflows/pages.yml` 自动校验、构建并发布 `dist/`，也可以从 Actions 手动运行。

## 数据与跳转

- 游戏直接在当前标签页打开，用浏览器返回即可回到入口。
- “上次玩了”只保存最后点击的游戏编号，使用独立键 `coco-game-index:last-game:v1`。
- 不读取、修改或迁移游戏进度，不提供跨设备存档同步。
- 浏览器禁止本地存储时仍可正常打开游戏，只是不记住上次点击。
- 所有字体使用系统字体，所有封面和首页插画随网站发布。
- Umami 汇总入口访问量与各游戏点击量，详见 [入口统计说明](ANALYTICS.md)。
- 页面没有广告、自动播放声音或第三方字体请求。

## 图片与设计

六张游戏封面截取自对应的已发布游戏，2026-10-07 核对六个地址均返回 HTTP 200。
首页插画使用内置 ImageGen 生成，详见 `DESIGN.md` 的完整提示词。

视觉方向：适合儿童的温暖绘本风。视觉变化 4/10、动效 2/10、信息密度 4/10，以稳定布局和大点击区域为主；桌面三列是真实游戏目录，平板两列、窄手机一列。
