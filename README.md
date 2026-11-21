# 可可的游戏小屋

给可可的小游戏入口。使用真实游戏截图，按游戏类型筛选，点击卡片进入原游戏。

纯 HTML、CSS 和 JavaScript，不需要框架、账号、后端或安装依赖。

## 本地预览

需要 Node.js 22 或更新版本：

```sh
npm run dev      # 预览源码
npm run preview  # 构建后预览 dist/，与线上发布内容一致
```

打开 <http://127.0.0.1:4177>。在同一局域网的手机或平板上查看：`HOST=0.0.0.0 npm run dev`，再打开这台电脑的局域网 IP。不建议双击 HTML，因为浏览器会限制本地文件的 JavaScript 模块。

```sh
npm run check
npm run build
```

`check` 校验游戏数据、封面文件、图片体积（`assets/` 每个文件不超过 150KB）、分类图标与配色，以及圆体字体是否缺字。`build` 把发布文件复制到 `dist/`，根据 `games.js` 生成不启用 JavaScript 时的备用链接，并给样式、脚本、字体和图片地址加上内容哈希版本号：文件内容变了，浏览器就会取新版本，源码里不写版本号。

## 添加游戏

1. 截取游戏的角色或玩法画面，裁成 4:3，先缩到约 160px 宽确认能辨认主角或动作，再导出 800×600 JPG 到 `assets/`。文件名使用小写字母、数字和连字符，例如：

```sh
sips --cropToHeightWidth 900 1200 截图.png --out /tmp/cover.png   # 先裁成 4:3
sips -z 600 800 -s format jpeg -s formatOptions 78 /tmp/cover.png --out assets/new-game.jpg
```

2. 在 `games.js` 的 `games` 数组最前面添加新上线游戏（数组按上线时间从新到旧维护），例如：

```js
{
  id: 'new-game',
  title: '新游戏的名字',
  description: '一句小朋友看得懂的介绍。',
  category: 'puzzle',
  image: 'assets/new-game.jpg',
  url: 'https://leeweir.github.io/new-game/',
},
```

3. 运行 `npm run check`。如果提示圆体字体缺字（新游戏名里有新字），按下方「圆体字体」重新生成子集。
4. 提交并推送到 `main`。

分类在 `games.js` 的 `categories` 中维护，当前为 `life` 经营生活、`care` 装扮养成、`puzzle` 益智解谜、`explore` 探索漫游、`garage` 汽车改装。卡片底色、分类按钮和推荐弹窗都跟随分类配色。新增分类时，在 `index.html` 加一个剪纸图标 `<symbol id="icon-<id>">`，在 `style.css` 加一组 `[data-category="<id>"]` 浅色与深色配色，`check` 会检查这两处。

### 圆体字体

标题、分类和按钮使用资源圆体 Resource Han Rounded Bold（SIL OFL 1.1，许可证见 `assets/resource-han-rounded-OFL.txt`）。当前字体文件约 26 KB。字符来自 HTML 的一至三级标题、带 `data-rounded` 的静态文案、分类与游戏名称，以及可打印的非空白 ASCII 字符。新增静态圆体按钮时为其添加 `data-rounded`。重新生成子集：

```sh
# 源字体：https://github.com/CyanoHao/Resource-Han-Rounded/releases/tag/v0.990 的 RHR-CN-0.990.7z 中的 ResourceHanRoundedCN-Bold.ttf
node scripts/font.mjs > /tmp/rounded.txt
uvx --from 'fonttools[woff]' pyftsubset ResourceHanRoundedCN-Bold.ttf --text-file=/tmp/rounded.txt --flavor=woff2 --output-file=assets/resource-han-rounded-bold.woff2
```

游戏数量、分类导航和随机推荐会自动更新。默认按上线时间从新到旧展示全部游戏，点击分类只显示该类游戏，并保留相同顺序；点击“全部”恢复完整列表。分类写入 URL 锚点，可分享，也能通过浏览器前进、返回恢复；原有分类地址继续可用。空分类不显示；卡片宽度不随筛选数量放大。`id` 尽量保持不变。

## 发布

GitHub Pages 仓库为 `leeweir/cocoplayroom`，发布地址为 <https://leeweir.github.io/cocoplayroom/>。

仓库的 Settings → Pages → Source 设为 GitHub Actions。推送到 `main` 后，`.github/workflows/pages.yml` 自动校验、构建并发布 `dist/`，也可以从 Actions 手动运行。

## 数据与跳转

- 游戏直接在当前标签页打开，用浏览器返回即可回到入口。
- “上次玩了”只保存最后点击的游戏编号，使用独立键 `coco-game-index:last-game:v1`。
- 不读取、修改或迁移游戏进度，不提供跨设备存档同步。
- 浏览器禁止本地存储时仍可正常打开游戏，只是不记住上次点击。
- 正文使用系统字体，标题使用随网站发布的圆体子集；所有字体、封面和首页插画都随网站发布。
- Umami 汇总入口访问量与各游戏点击量，详见 [入口统计说明](ANALYTICS.md)。
- 页面没有广告、自动播放声音或第三方字体请求。

## 图片与设计

游戏封面截取自对应的已发布游戏。2026-10-25 新增「疯狂动物城·侦探档案」和「小小旅行家 Coco」，入口共十二个游戏；新游戏地址与封面已在浏览器核对。
2026-11-19 更新「疯狂动物城·侦探档案」封面，截取已发布版本 `88a4ccc` 的新版选角画面；图片与模块地址加入版本号以刷新缓存。
2026-11-22 新增「南湾夜行」，归入探索漫游，并按上线时间排在入口及分类的最前面；封面截取自已发布游戏的实际驾驶画面，入口现有十三个游戏。
2026-11-22 封面统一缩到 800px 宽，首页插画改用 420px 宽的 JPG（原始 PNG 移到 `design/`），首次访问从约 3.6MB 降到约 1.1MB；预加载游戏数据模块，统计脚本排在入口脚本之后执行，封面不再等待外部统计脚本。
2026-11-22 剪纸书架改版：封面统一重新截取为 4:3 的标题或角色画面；卡片以封面为主，去掉「开始玩」行；每个分类有剪纸图标和取自首页插画的配色；首页插画抠成透明底放大展示，深色模式下不再出现奶油色方块；标题改用资源圆体。
首页插画使用内置 ImageGen 生成，详见 `DESIGN.md` 的完整提示词。

视觉方向：剪纸绘本风的儿童游戏书架，以图找游戏。分类用图标和颜色区分，桌面四列、平板三列、手机双列，手机隐藏游戏介绍。配色跟随系统的明暗偏好，减少动态效果的系统设置也会生效。详见 `DESIGN.md`。
