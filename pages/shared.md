# 全站共用文字

<!-- 中文编辑提示：这是实际文案来源，中文说明不会显示在网页中。 -->

只修改下方 `json text` 代码块中的值，不改字段名和代码块标记。网站文案填写英文。
数组每项是一行标题或一个列表项；{花括号} 是自动替换的占位符，请保留。双引号、逗号和方括号须保持完整。

| 字段 | 页面位置 / 修改说明 |
| --- | --- |
| brand | 左上角标志文字（图形素材另改） |
| heroLetters | 3D 动效的三个字符，必须恰好 3 个英文字母或数字，例如 07S |
| brandSuffix | 标志旁小符号 |
| prefix | 页头小字前缀 |
| navHome | 首页导航 |
| navWorks | 作品导航 |
| navStudio | 工作室导航 |
| navContact | 联系导航 |
| menuTitle / menuIndex | 手机侧边栏标题和导航小标题 |
| menuSeries / menuWorksAll | WORKS 子菜单文案 |
| menuOpen / menuClose | 侧边栏开关的无障碍标签 |
| footerCopyright | 页脚版权和年份 |
| footerSlogan | 页脚标语 |
| clockTimezone | 天气未加载时的备用时区；天气成功后跟随该城市时区。时间不再显示城市前缀 |
| backTop | 回顶按钮提示 |
| featured | 精选角标 |
| viewProject | 作品卡片提示 |
| emptySelected | 无精选提示 |
| undo | 撤销按钮 |
| copyFailed | 复制失败提示 |
| weatherPlaceholder | 天气未加载或失败文字 |
| weatherUseLocation | 天气按钮初始提示 |
| weatherCredit | 天气来源，保留服务商署名 |
| weatherLocal | 当前位置标签 |
| weatherTitle | 天气提示，保留占位符 |
| weatherAria | 天气无障碍说明，保留占位符 |
| weatherFailedTitle | 天气请求失败提示 |
| weatherFailedAria | 天气失败无障碍说明 |
| weatherInsecure | 定位不可用提示 |
| weatherDenied | 拒绝定位提示 |
| weatherUnavailable | 定位失败提示 |
| clear | 晴 |
| overcast | 阴 |
| cloudy | 多云 |
| fog | 雾 |
| drizzle | 毛毛雨 |
| rain | 雨 |
| snow | 雪 |
| showers | 阵雨 |
| snowShowers | 阵雪 |
| thunderstorm | 雷暴 |

```json text
{
  "brand": "07S",
  "heroLetters": "07S",
  "brandSuffix": "®",
  "prefix": "07S / ",
  "navHome": "HOME",
  "navWorks": "WORKS",
  "navStudio": "STUDIO",
  "navContact": "CONTACT",
  "menuTitle": "MENU",
  "menuIndex": "NAVIGATION",
  "menuSeries": "PROJECT SERIES",
  "menuWorksAll": "ALL WORKS",
  "menuOpen": "Open menu",
  "menuClose": "Close menu",
  "footerCopyright": "© 2026 07S STUDIO",
  "footerSlogan": "SEVEN IS MORE THAN A NUMBER.",
  "clockTimezone": "Asia/Seoul",
  "backTop": "Back to top",
  "featured": "★ FEATURED",
  "viewProject": "VIEW PROJECT ↗",
  "emptySelected": "No selected works yet.",
  "undo": "Undo",
  "copyFailed": "Copy unavailable. Please copy from the page or address bar.",
  "weatherPlaceholder": "WEATHER —",
  "weatherUseLocation": "Show your city weather and local time (uses Open-Meteo and BigDataCloud)",
  "weatherCredit": "Weather: Open-Meteo",
  "weatherLocal": "LOCAL",
  "weatherTitle": "{location}: {condition}. Use current location (approximate coordinates sent to Open-Meteo and BigDataCloud).",
  "weatherAria": "{location} weather: {condition}, {temperature} degrees Celsius. Use current location.",
  "weatherFailedTitle": "Weather unavailable. Click to try your current location.",
  "weatherFailedAria": "Weather unavailable. Try current location.",
  "weatherInsecure": "Location requires HTTPS and browser support. Showing default location.",
  "weatherDenied": "Location permission denied. Using the displayed location.",
  "weatherUnavailable": "Location unavailable. Using the displayed location.",
  "clear": "Clear",
  "overcast": "Overcast",
  "cloudy": "Partly cloudy",
  "fog": "Fog",
  "drizzle": "Drizzle",
  "rain": "Rain",
  "snow": "Snow",
  "showers": "Rain showers",
  "snowShowers": "Snow showers",
  "thunderstorm": "Thunderstorm"
}
```
