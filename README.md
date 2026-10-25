# 可可的游戏小屋

给可可的小游戏入口。使用真实游戏截图，按游戏类型分区，点击卡片进入原游戏。

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

分类在 `games.js` 的 `categories` 中维护，当前为 `life` 经营生活、`care` 装扮养成、`puzzle` 益智解谜、`explore` 探索漫游、`garage` 汽车改装。新增类型时，同时补上不启用 JavaScript 时的分组链接。
卡片颜色：`peach`、`sage`、`butter`、`pink`、`blue`、`lavender`。

游戏数量、按类型分区、分类导航和随机推荐会自动更新。分类导航直接跳转到对应分区，所有游戏始终在页面上展示。空分类不显示；只有一个游戏的分区在电脑上使用横向卡片。`id` 尽量保持不变。

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

游戏封面截取自对应的已发布游戏。2026-10-25 新增「疯狂动物城·侦探档案」和「小小旅行家 Coco」，入口共十二个游戏；新游戏地址与封面已在浏览器核对。
首页插画使用内置 ImageGen 生成，详见 `DESIGN.md` 的完整提示词。

视觉方向：适合儿童的温暖绘本风。视觉变化 4/10、动效 2/10、信息密度 5/10。桌面使用侧边分类目录，手机使用可横向滑动的分类导航；游戏按类型分组，窄手机单列显示。配色跟随系统的明暗偏好，减少动态效果的系统设置也会生效。
