# 作品详情共用文字

<!-- 中文编辑提示：这是实际文案来源，中文说明不会显示在网页中。 -->

只修改下方 `json text` 代码块中的值，不改字段名和代码块标记。网站文案填写英文。
数组每项是一行标题或一个列表项；{花括号} 是自动替换的占位符，请保留。双引号、逗号和方括号须保持完整。

| 字段 | 页面位置 / 修改说明 |
| --- | --- |
| titleSuffix | 浏览器作品标题后缀 |
| backWorks | 返回作品链接 |
| technologyFallback | 技术未填写时显示 |
| overview | 概览标题 |
| copyLink | 复制链接按钮 |
| watchVideo | 观看视频按钮 |
| details | 资料标题 |
| year | 年份字段标题 |
| category | 分类字段标题 |
| location | 地点字段标题 |
| technology | 技术字段标题 |
| series | 所属系列字段标题 |
| film | 影片区标题 |
| videoTitle | 播放器描述，保留占位符 |
| gallery | 图库标题，保留占位符 |
| galleryAlt | 图片替代描述，保留占位符 |
| moreIn | 相关推荐小字，保留占位符 |
| related | 相关推荐标题 |
| keyboardHint | 作品翻页键盘提示 |
| linkCopied | 复制成功提示 |
| lightboxClose | 大图关闭按钮 |

```json text
{
  "titleSuffix": " — 07S",
  "backWorks": "← WORKS",
  "technologyFallback": "Creative Studio",
  "overview": "PROJECT OVERVIEW",
  "copyLink": "Copy link ⧉",
  "watchVideo": "WATCH VIDEO ↗︎",
  "details": "PROJECT DETAILS",
  "year": "YEAR",
  "category": "CATEGORY",
  "location": "LOCATION",
  "technology": "TECHNOLOGY",
  "series": "SERIES",
  "film": "FILM",
  "videoTitle": "{title} video",
  "gallery": "PROJECT GALLERY · {count}",
  "galleryAlt": "Gallery image {number}",
  "moreIn": "MORE IN {category}",
  "related": "RELATED",
  "keyboardHint": "← → Use arrow keys to navigate",
  "linkCopied": "Link copied",
  "lightboxClose": "ESC ×"
}
```

## 中文 / 한국어 版本

<!-- 中文编辑提示：网页右上角可切换 EN / 中 / 한。下面两个代码块只写需要翻译的字段，没写的字段自动用上面的英文。字段名与英文块相同，{花括号} 占位符要保留。 -->

```json text-zh
{
  "backWorks": "← 作品",
  "technologyFallback": "创意工作室",
  "overview": "作品概述",
  "copyLink": "复制链接 ⧉",
  "watchVideo": "观看视频 ↗︎",
  "details": "作品信息",
  "year": "年份",
  "category": "类别",
  "location": "地点",
  "technology": "技术",
  "series": "系列",
  "film": "影片",
  "videoTitle": "{title} 视频",
  "gallery": "作品图集 · {count}",
  "galleryAlt": "图集第 {number} 张",
  "moreIn": "更多 · {category}",
  "related": "相关作品",
  "keyboardHint": "← → 使用方向键切换",
  "linkCopied": "链接已复制"
}
```

```json text-ko
{
  "backWorks": "← 작업",
  "technologyFallback": "크리에이티브 스튜디오",
  "overview": "프로젝트 개요",
  "copyLink": "링크 복사 ⧉",
  "watchVideo": "영상 보기 ↗︎",
  "details": "프로젝트 정보",
  "year": "연도",
  "category": "분류",
  "location": "장소",
  "technology": "기술",
  "series": "시리즈",
  "film": "영상",
  "videoTitle": "{title} 영상",
  "gallery": "프로젝트 갤러리 · {count}",
  "galleryAlt": "갤러리 이미지 {number}",
  "moreIn": "{category} 더 보기",
  "related": "관련 작업",
  "keyboardHint": "← → 방향키로 이동",
  "linkCopied": "링크가 복사되었습니다"
}
```
