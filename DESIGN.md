# 图片来源

首页插画：使用内置 ImageGen 生成，原始 PNG 保存在 `assets/welcome.png`。

完整提示词：

> Use case: illustration-story. Asset type: compact website header illustration for a child's personal game collection. Primary request: a friendly little orange tabby kitten and a white bunny with pink ears sitting together in a tiny sunny play garden, next to a coral toy train with two carriages and a small wooden cottage, with a single carrot and a few flowers. Style: beautiful tactile cut-paper children's picture book, softly textured gouache on warm cream paper, simple rounded silhouettes, gently irregular edges, restrained detail, no outlines. Palette warm apricot, tomato coral, butter yellow, sage green, cream. Composition: wide landscape 3:2, all subjects grouped as one compact vignette centrally with generous clean cream margins, friendly expressive faces, welcoming mood. Background uniform cream #fff9ef so it sits naturally on a cream webpage. Not a UI mockup, only illustration. No text, letters, numerals, logos or watermark.

游戏卡片图片：对应游戏公开网页的浏览器截图。截图时使用全新的临时浏览器会话，没有读写用户的日常浏览器存档。

## 2026-10-18 分类目录改版

设计定位：面向孩子的分类游戏书架。沿用暖奶油色背景、陶红色操作按钮、C 字标志、系统中文字体、现有绘本插画与真实游戏截图，不迁移框架。

改版前：三种宽泛标签筛选同一个混排网格，十个游戏的具体类型不易扫读。
改版后：经营生活、装扮养成、益智解谜、探索漫游、汽车改装五类直接展开。桌面提供固定在可视范围内的侧边目录，手机提供横向分类导航。单个游戏的分区使用横向卡片，多个游戏的分区自适应分栏。

DESIGN_VARIANCE: 4；MOTION_INTENSITY: 2；VISUAL_DENSITY: 5。游戏目录以稳定扫描为主，保留一致的游戏卡片结构；真实截图区分内容，分类标题与间距形成层次。仅在悬停和按下时给出轻量反馈，不添加自动播放或滚动动画。

圆角规则：卡片与弹窗 16px，按钮与导航 12px，截图内边 8px，辅助箭头和关闭按钮为圆形；已有品牌标志保留原造型。全页采用语义颜色变量，系统深色模式统一切换，不逐段反转主题。

保留页面地址、`#games` 锚点、原生游戏跳转、上次游玩的存储键、随机推荐和 `game_click` 统计协议。分类导航不触发游戏点击事件。

## 2026-10-25 游戏网格优化

现状审视：欢迎区、独立最近游玩横条和目录占据过多首屏空间；分类数量为 2、2、3、4、1 时，自动拉伸的卡片宽度不一致，手机单列也需要较长滚动。

设计定位：延续孩子熟悉的绘本配色与封面，把游戏选择作为页面主角。保留原生 CSS、品牌字标、字体、页面标题、说明元数据、全部游戏地址、分类名称和分类锚点。

欢迎区缩小插画，将最近游玩并入按钮旁；顶部横向分类栏取代侧栏。默认按上线时间从新到旧排列十二张统一卡片，类别显示在游戏标题上方；点击类别筛选，保留同样的顺序，数量和无障碍状态提示同步更新。分类选择保存在原有 URL 锚点中，可直接访问并通过前进、返回恢复。一个游戏也保留标准卡片宽度。

DESIGN_VARIANCE: 3；MOTION_INTENSITY: 2；VISUAL_DENSITY: 6。桌面四列、平板三列、手机双列，统一 16:9 封面比例；窄屏允许游戏名自然换行，低于 380px 隐去辅助介绍。卡片整体可点击，保留键盘焦点、跳转到游戏列表、原生推荐弹窗和减少动态效果支持。

统计事件、最近游玩的存储键、随机推荐和原生跳转保持原协议。浅色和深色使用同一套语义颜色变量，分类筛选不发送游戏点击事件。
