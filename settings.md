# 网站设置：改这里就能生效

这是全站设置的实际来源，不只是说明文档。修改后保存、构建并同步 GitHub 即可。
中文说明不会进入网页；引号中的网站文字请填写英文。
只改下面代码块中的值，不要改代码块标记 `json site` / `json home` 或字段名。
文字用英文双引号包住，true / false 和数字不加引号；相邻项目之间加逗号，最后一项后不加逗号。

## 1. 网站资料、天气、分类

| 字段 | 你可以改什么 |
| --- | --- |
| title | 浏览器标签页的网站标题 |
| description | 首页简介和网页描述 |
| period | 作品页顶部的展示年份范围 |
| email | 联系页邮箱，请替换演示邮箱 |
| contactNote | 联系页说明文字，填写英文 |
| socials | 社交链接，例如 [{"name": "Instagram", "url": "https://www.instagram.com/your-name/"}]；留空 [] 显示英文占位提示 |
| weather.enabled | true 显示天气，false 隐藏天气 |
| weather.defaultLabel | 默认天气城市的英文名，目前 BUSAN（釜山）；不改变时钟文字 |
| weather.latitude / longitude | 天气城市的纬度 / 经度，目前为釜山坐标；换城市时要一起改 |
| weather.refreshMinutes | 天气自动刷新分钟数，至少 5，默认 15 |
| hideEmptyCategories | true 自动隐藏没有已发布作品的分类；false 保留空分类 |
| categories 中的 name | 分类英文名，必须与作品设置中的 category 完全相同 |
| categories 中的 enabled | true 显示分类入口，false 隐藏；无需注释整行 |

分类顺序就是下面数组的顺序。隐藏分类入口后，作品仍会显示在 All 中。
新增分类可复制一行修改名称；作品用了未列出的新分类时会自动显示，想关闭就加到此处并设 false。

```json site
{
  "title": "07S — Creative Studio",
  "description": "Art, Design, Moving Image & Digital Experiences.",
  "period": "2025 — 2026",
  "email": "hello@your-domain.com",
  "contactNote": "For collaborations and project inquiries, please get in touch by email.",
  "socials": [],
  "weather": {
    "enabled": true,
    "defaultLabel": "BUSAN",
    "latitude": 35.1796,
    "longitude": 129.0756,
    "refreshMinutes": 15
  },
  "hideEmptyCategories": true,
  "categories": [
    {
      "name": "New Media Art",
      "enabled": true
    },
    {
      "name": "Spatial & Exhibition",
      "enabled": true
    },
    {
      "name": "Interactive Experiences",
      "enabled": true
    },
    {
      "name": "Visual & Moving Image",
      "enabled": true
    }
  ]
}
```

## 2. 首页精选 SELECTED WORKS

| 字段 | 你可以改什么 |
| --- | --- |
| eyebrow | 大标题上方的小字，例如 01 / FEATURED |
| title | 精选区大标题，例如 SELECTED WORKS |
| linkLabel | 右侧查看全部作品的链接文字 |
| projectIds | 填作品文件夹名；顺序就是首页精选顺序，同时决定卡片的 FEATURED 标记 |

比如作品目录 works/light-field/ 对应 "light-field"。想撤下精选就删除对应那一项；[] 表示不放精选作品。
这里的作品必须存在且已发布；删除作品或改为草稿时也要从此列表移除。

```json home
{
  "selectedWorks": {
    "eyebrow": "01 / FEATURED",
    "title": "SELECTED WORKS",
    "linkLabel": "ALL WORKS",
    "projectIds": [
      "visual-stories",
      "light-field",
      "echo-chamber"
    ]
  }
}
```

## 3. 单个作品在哪里设置

- 作品资料：works/作品文件夹/settings.md（名称、分类、封面、发布开关等）。
- 作品正文：works/作品文件夹/content.md（文字、图片和视频段落）。
- 作品素材：works/作品文件夹/media/。
- 新增作品：复制整个 templates/work/ 到 works/，重命名为小写英文文件夹名，再照其中中文提示修改。

网页布局、首页动效和工作室长篇文案仍在 templates/site.html、assets/css/site.css 和 assets/js/app.js；这些不属于本文件的设置项。
不要修改 dist/ 或 assets/js/data.js，它们会在构建时自动生成。
