# 作品设置：改这里

这是本作品资料的实际来源，中文说明不会显示在网页上。下面代码块只修改值，不要改 `json project` 标记和字段名。
网站文字填写英文；字符串要有英文双引号，数字不加引号，最后一项后不要加逗号。
正文内容另改同文件夹的 content.md，图片和视频放在 media/。

| 字段 | 修改说明 |
| --- | --- |
| title | 作品英文标题 |
| category | 作品分类，须与网站根目录 settings.md 中的分类名一致 |
| year | 年份，保留引号，例如 "2026" |
| location | 创作或展出地点，填写英文 |
| technology | 使用的技术或媒介，填写英文 |
| description | 简短英文介绍，用于作品概览、搜索和网页描述 |
| cover | 封面相对路径，例如 media/cover.webp；必须先放入真实图片 |
| gallery | 图库图片路径，例如 ["media/01.webp", "media/02.webp"]；[] 表示没有图库 |
| video | YouTube / Vimeo 链接，留空 "" 表示不使用；本地视频请放进 content.md |
| status | "publish" 发布；"draft" 草稿，不显示在网站中 |
| order | 推荐排序，数字越小越靠前；首页精选顺序另在全站 settings.md 设置 |
| added | 添加日期，使用 YYYY-MM-DD 格式，用于最近添加排序 |

复制模板新增作品时，记得把 status 从 draft 改为 publish 才会显示。
要设为首页精选，请在全站 settings.md 的 projectIds 中添加本作品的文件夹名。
删除作品或改为草稿时，也要移除全站精选列表里的对应文件夹名。

```json project
{
  "title": "AFTER IMAGE",
  "category": "New Media Art",
  "year": "2023",
  "location": "Berlin, Germany",
  "technology": "Generative Art, Projection",
  "description": "A generative projection piece where every frame remembers the one before it.",
  "cover": "media/cover.svg",
  "gallery": [],
  "video": "",
  "status": "publish",
  "order": 6,
  "added": "2026-01-07"
}
```
