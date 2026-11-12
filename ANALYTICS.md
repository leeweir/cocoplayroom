# 网站与游戏统计

使用已有的 Umami Cloud 网站 `leeweir.github.io`，网站 ID 为 `b72a1b50-0b5a-4d61-a9f5-d3878d826048`。博客、游戏入口和各个游戏共用这个网站，用 tag 分开查看，无需为每个路径创建统计网站。网站 ID 是公开采集标识，报表仍需登录查看。

## 标签与查看入口

打开 [Umami 后台](https://cloud.umami.is/analytics/us/websites/b72a1b50-0b5a-4d61-a9f5-d3878d826048)，在 Overview 选择 **Filter → Tag → Is**。未筛选时显示共用网站的合计数据。

| 页面 | Tag | 路径 |
| --- | --- | --- |
| 博客 | `blog` | `/`、`/blog/`、`/posts/…` 等 |
| 可可的游戏小屋（入口） | `playroom` | `/cocoplayroom/` |
| 疯狂动物城·侦探档案 | `zoocity` | `/zoocity/` |
| 小小旅行家 Coco | `cocotravel` | `/cocotravel/` |
| 桃桃茶屋 | `cocoshop` | `/cocoshop/` |
| 紫禁城·中轴九阙 | `forbidden-city-axis` | `/forbidden-city-axis/` |
| 流光跑车工作室 | `supercar` | `/supercar/` |
| 星愿衣橱 | `royal-closet` | `/royal-closet/` |
| 喵呜小屋 | `cococat` | `/cococat/` |
| 小火车接轨 | `perlica-rail` | `/perlica-rail/` |
| 小兔的胡萝卜探险 | `bunny-carrot-adventure` | `/bunny-carrot-adventure/` |
| 佩奇的完美假期 | `peppapig` | `/peppapig/` |
| 可可的小世界 | `cocoworld` | `/cocoworld/` |

快捷入口：[游戏小屋](https://cloud.umami.is/analytics/us/websites/b72a1b50-0b5a-4d61-a9f5-d3878d826048?tag=eq.playroom)、[博客](https://cloud.umami.is/analytics/us/websites/b72a1b50-0b5a-4d61-a9f5-d3878d826048?tag=eq.blog)。

新标签从本次发布后生效，不会自动补到历史事件。查看入口的历史数据仍可用 **Path = /cocoplayroom/**，包含加标签前后的访问。

## 数据范围

- 每个页面由 Umami 官方脚本自动记录页面浏览，Overview 查看 **Views**、**Visitors**，Sources → Referrers 查看浏览器提供的访问来源。
- 直接打开、收藏和分享的游戏链接也会统计；无需经过游戏入口。
- 入口继续记录 `game_click`，表示点击游戏链接的次数。它与游戏自身的页面浏览量是两种不同指标；不要把点击事件当成游戏启动或关卡完成次数。
- 只在 `leeweir.github.io` 域名上报，本地预览不计入。小火车和可可世界在本地文件及本地预览中连统计脚本也不会加载，保持离线游玩。
- 不额外采集游戏操作、关卡进度、存档、玩家输入或账号标识。开发用模型预览页面不接入统计。
- URL 查询参数和页面锚点不参与统计，因此不记录搜索词或 UTM 参数。直接访问、同域跳转或浏览器不提供来源时，外部来源可能为空。
- Visitors 是访客估算，不等同于精确人数；浏览器拦截统计时可能漏计。

## 游戏入口事件

普通卡片、上次玩的游戏、随机推荐统一通过 `analytics.js` 上报 `game_click`，继承入口的 `playroom` 标签。

| 属性 | 内容 |
| --- | --- |
| `game_id` | 游戏编号，与各游戏 tag 一致，例如 `cococat` |
| `game_title` | 游戏名称，例如「喵呜小屋」 |
| `entry_source` | `card` 普通卡片、`recent` 上次玩的游戏、`random` 随机推荐 |

左键、触屏、键盘激活及鼠标中键点击都会记录；切换分类、抽取推荐、返回入口不会产生游戏点击事件。按 Events 查看 `game_click`，按属性查看游戏与点击入口。

游戏链接保持浏览器原生跳转；调用 `track()` 后不等待网络响应。统计缺失、被拦截或暂不可用时，不影响打开游戏。

## 后续维护

新增游戏时，在实际发布入口 HTML 中添加一次官方脚本，沿用同一网站 ID、`data-domains="leeweir.github.io"`、排除查询参数和锚点，并设置与 `games.js` 的游戏 ID 相同的 `data-tag`。若项目需要构建，应修改源码模板后构建，不能只改临时产物。

单文件离线游戏应沿用 `perlica-rail` 或 `cocoworld` 的按域名加载方式。仅统计浏览量、访客和来源不需要 API key，也不需要再手动上报一次页面浏览。

参考：[获取统计代码](https://docs.umami.is/docs/collect-data)、[标签](https://docs.umami.is/docs/tags)、[脚本配置](https://docs.umami.is/docs/tracker-configuration)、[指标定义](https://docs.umami.is/docs/metric-definitions)。
