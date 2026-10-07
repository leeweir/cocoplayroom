# 入口统计

方案：Umami Cloud。统计脚本已配置在 `index.html` 的 `<head>`；站点 ID 为 `b72a1b50-0b5a-4d61-a9f5-d3878d826048`，仅在 `leeweir.github.io` 上收集。站点 ID 会出现在公开网页中，用于关联统计站点。
没有脚本或脚本被拦截时，页面仍能正常打开游戏。

## 数据范围

- 页面访问：由 Umami 官方脚本自动采集，可查看入口访问趋势、访客估算、设备和来源。
- 游戏入口点击：普通卡片、上次玩的游戏、随机推荐统一使用 `game_click` 事件。
- 本次只改入口，点击量表示从入口打开游戏的次数。游戏内的时长和关卡进度需要后续在各游戏接入。

## 事件属性

| 属性 | 内容 |
| --- | --- |
| `game_id` | 稳定的游戏编号，例如 `cococat` |
| `game_title` | 游戏名称，例如「喵呜小屋」 |
| `entry_source` | `card` 普通卡片、`recent` 上次玩的游戏、`random` 随机推荐 |

左键、触屏、键盘激活及鼠标中键点击都会记录；单纯筛选分类、抽取推荐或返回入口不会产生游戏点击事件。

## 接入与查看

1. 打开 [Umami Cloud 后台](https://cloud.umami.is/)，选择对应的统计网站。
2. 在网站概览查看入口访问量、访客估算、设备和来源；如以后同一 ID 也用于其他页面，可按 `/cocoplayroom/` 路径筛选。
3. 点击游戏后，在 Events 查看 `game_click`；Properties 按 `game_title` 看各游戏的点击量，按 `entry_source` 看入口来源。

默认将数据留在 Umami 的账号后台，不公开统计报表。
URL 查询参数和页面片段不参与统计。本地预览不收集数据。

## 跳转与故障

游戏链接保持浏览器原生跳转；调用 Umami 的 `track()` 后不等待网络响应。官方脚本使用 `keepalive` 发送请求，统计服务暂不可用时不会拖住游戏跳转。
不会向事件属性添加真实姓名、游戏存档或账号标识。浏览器拦截统计请求时可能漏计。

官方文档：

- [获取统计代码](https://docs.umami.is/docs/collect-data)
- [自定义事件](https://docs.umami.is/docs/track-events)
- [统计指标定义](https://docs.umami.is/docs/metric-definitions)
