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

## 中文 / 한국어 版本

<!-- 中文编辑提示：网页右上角可切换 EN / 中 / 한。下面两个代码块只写需要翻译的字段，没写的字段自动用上面的英文。字段名与英文块相同，{花括号} 占位符要保留。 -->

```json text-zh
{
  "navHome": "首页",
  "navWorks": "作品",
  "navStudio": "工作室",
  "navContact": "联系",
  "menuTitle": "菜单",
  "menuIndex": "导航",
  "menuSeries": "项目系列",
  "menuWorksAll": "全部作品",
  "menuOpen": "打开菜单",
  "menuClose": "关闭菜单",
  "footerSlogan": "七，不止是一个数字。",
  "backTop": "回到顶部",
  "featured": "★ 精选",
  "viewProject": "查看作品 ↗",
  "emptySelected": "暂无精选作品。",
  "undo": "撤销",
  "copyFailed": "无法复制，请从页面或地址栏手动复制。",
  "weatherPlaceholder": "天气 —",
  "weatherUseLocation": "显示你所在城市的天气和当地时间（使用 Open-Meteo 和 BigDataCloud）",
  "weatherCredit": "天气：Open-Meteo",
  "weatherLocal": "本地",
  "weatherTitle": "{location}：{condition}。点击使用当前位置（会向 Open-Meteo 和 BigDataCloud 发送大致坐标）。",
  "weatherAria": "{location}天气：{condition}，{temperature} 摄氏度。点击使用当前位置。",
  "weatherFailedTitle": "天气暂不可用，点击尝试使用当前位置。",
  "weatherFailedAria": "天气暂不可用，尝试使用当前位置。",
  "weatherInsecure": "定位需要 HTTPS 和浏览器支持，显示默认地点。",
  "weatherDenied": "定位权限被拒绝，使用当前显示的地点。",
  "weatherUnavailable": "无法获取位置，使用当前显示的地点。",
  "clear": "晴",
  "overcast": "阴",
  "cloudy": "多云",
  "fog": "雾",
  "drizzle": "毛毛雨",
  "rain": "雨",
  "snow": "雪",
  "showers": "阵雨",
  "snowShowers": "阵雪",
  "thunderstorm": "雷雨"
}
```

```json text-ko
{
  "navHome": "홈",
  "navWorks": "작업",
  "navStudio": "스튜디오",
  "navContact": "연락",
  "menuTitle": "메뉴",
  "menuIndex": "내비게이션",
  "menuSeries": "프로젝트 시리즈",
  "menuWorksAll": "전체 작업",
  "menuOpen": "메뉴 열기",
  "menuClose": "메뉴 닫기",
  "footerSlogan": "7은 숫자 그 이상이다.",
  "backTop": "맨 위로",
  "featured": "★ 추천",
  "viewProject": "작업 보기 ↗",
  "emptySelected": "아직 추천 작업이 없습니다.",
  "undo": "실행 취소",
  "copyFailed": "복사할 수 없습니다. 페이지나 주소창에서 직접 복사해 주세요.",
  "weatherPlaceholder": "날씨 —",
  "weatherUseLocation": "내 도시의 날씨와 현지 시간 보기 (Open-Meteo, BigDataCloud 사용)",
  "weatherCredit": "날씨: Open-Meteo",
  "weatherLocal": "현지",
  "weatherTitle": "{location}: {condition}. 현재 위치 사용 (대략적인 좌표가 Open-Meteo와 BigDataCloud로 전송됩니다).",
  "weatherAria": "{location} 날씨: {condition}, 섭씨 {temperature}도. 현재 위치 사용.",
  "weatherFailedTitle": "날씨를 불러올 수 없습니다. 클릭해 현재 위치로 다시 시도하세요.",
  "weatherFailedAria": "날씨를 불러올 수 없습니다. 현재 위치로 시도.",
  "weatherInsecure": "위치 기능은 HTTPS와 브라우저 지원이 필요합니다. 기본 위치를 표시합니다.",
  "weatherDenied": "위치 권한이 거부되었습니다. 표시된 위치를 사용합니다.",
  "weatherUnavailable": "위치를 확인할 수 없습니다. 표시된 위치를 사용합니다.",
  "clear": "맑음",
  "overcast": "흐림",
  "cloudy": "구름 조금",
  "fog": "안개",
  "drizzle": "이슬비",
  "rain": "비",
  "snow": "눈",
  "showers": "소나기",
  "snowShowers": "소낙눈",
  "thunderstorm": "뇌우"
}
```
