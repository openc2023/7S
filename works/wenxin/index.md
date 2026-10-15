# 問心 / WENXIN — 系列设置

这是一个「系列 / 展览」，网址是 works/wenxin/。所有系列共用同一套版式（作品页下半部分的系列卡片 + 系列详情页），这里只填资料，不需要改 HTML、JS 或 CSS。

| 字段 | 修改说明 |
| --- | --- |
| title | 系列名称 |
| subtitle | 副标题，显示在名称下方；不需要就留空 "" |
| type | 系列类型，必须是根目录 settings.md 中 seriesTypes 的名称之一：Series / Solo exhibition / Group exhibition |
| dates | 展期或年份，自由填写，例如 "Mar 12 – May 24, 2026"；留空 "" 不显示 |
| venue | 展出地点；留空 "" 不显示 |
| cover | 系列封面，放在本文件夹 media/ 中；留空 "" 不显示大图 |
| description | 系列简介，显示在 ABOUT THE SERIES |
| chapters | 可选：系列内的章节，显示为系列页的筛选按钮；不需要就写 [] |
| planned | 可选：尚未上传真实素材的展示位置；不需要就写 [] |

作品加入系列：在作品的 settings.md 中添加 `"series": ["wenxin"]`；有章节时再加 `"chapter": "seven-aspects"`。

planned 中的卡片**不代表作品已正式发布**。当前 `media/01.svg`—`media/08.svg` 复用 WORKS 的 07S SVG 封面占位风格，视频占位会叠加播放标记。之后上传真实图片时，替换对应的 `cover`（如 `media/01.webp`）即可。真实作品发布后，与 planned 中标题和章节相同的占位卡会自动隐藏。

```json series
{
  "title": "問心",
  "subtitle": "WENXIN / QUESTIONING THE MIND",
  "type": "Series",
  "dates": "",
  "venue": "",
  "cover": "media/01.svg",
  "description": "由根入心，由心生相；见相，破相，无相，而见本心。",
  "chapters": [
    {"id":"six-roots","name":"六根"},
    {"id":"seven-aspects","name":"七相"},
    {"id":"formlessness","name":"无相"},
    {"id":"original-mind","name":"本心"}
  ],
  "planned": [
    {"title":"我相","chapter":"seven-aspects","type":"image","cover":"media/01.svg"},
    {"title":"人相","chapter":"seven-aspects","type":"image","cover":"media/02.svg"},
    {"title":"众生相","chapter":"seven-aspects","type":"image","cover":"media/03.svg"},
    {"title":"寿者相","chapter":"seven-aspects","type":"image","cover":"media/04.svg"},
    {"title":"法相","chapter":"seven-aspects","type":"image","cover":"media/05.svg"},
    {"title":"文字相","chapter":"seven-aspects","type":"image","cover":"media/06.svg"},
    {"title":"执著相","chapter":"seven-aspects","type":"image","cover":"media/07.svg"},
    {"title":"七相 · 影像","chapter":"seven-aspects","type":"video","cover":"media/08.svg"}
  ]
}
```
