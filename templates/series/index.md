# 系列设置（模板）

复制整个 templates/series 文件夹到 works/，改成小写英文文件夹名（例如 works/my-show-2026/），再修改下面的值。
字段说明见 works/wenxin/index.md。完成后把文件夹名加入 works/index.md 的 seriesIds，作品页下方 SERIES 区就会显示。
作品加入系列：在作品 settings.md 中添加 "series": ["文件夹名"]。

```json series
{
  "title": "YOUR SERIES TITLE",
  "subtitle": "",
  "type": "Solo exhibition",
  "dates": "",
  "venue": "",
  "cover": "media/cover.svg",
  "description": "Write a short description of the series or exhibition.",
  "chapters": [],
  "planned": []
}
```
