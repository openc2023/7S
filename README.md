# 07S 静态作品网站

**先看 [_说明_从这里开始.md](_说明_从这里开始.md)：各页面文字已分到 pages/ 下的 MD，双击 07S-Manager.bat 可预览、备份、恢复和推送。**

**日常设置入口：[settings.md](settings.md)。所有字段均有中文说明，直接修改其中的配置值即可生效。**

以这个「07s作品」文件夹作为 GitHub 仓库根目录。网站发布后的文件是普通 HTML、CSS、JavaScript 和媒体文件，不需要服务器后台。作品正文用 Markdown 编辑，构建时转换为 HTML；首次使用需要运行 npm ci 安装解析器。

原始 `index.v4-before-en.html` 保留用于对照，不会进入发布目录。原先 Manage 在浏览器 localStorage 中保存的数据不会自动进入新网站；本次迁移使用原文件里的 8 个演示作品，其中 7 个发布、1 个草稿。

## 文件夹规划

```text
07s作品/
├── settings.md                  带中文说明的全站设置：资料、天气、分类、首页精选
├── 07S-Manager.bat              双击：预览、备份、恢复、登录、推送
├── _说明_从这里开始.md           中文编辑索引和使用说明
├── pages/                       每个页面的文字设置 MD，均带中文说明
├── assets/
│   ├── css/site.css              全站样式
│   ├── js/app.js                 列表筛选、详情、灯箱和页面交互
│   ├── js/hero.js                首页 3D 动效
│   ├── js/weather.js             天气与当前位置授权
│   └── favicon.svg              网站图标
├── templates/
│   ├── site.html                共用页面外壳：导航、页脚和资源引用
│   └── work/                    新作品模板，复制这个文件夹即可
│       ├── settings.md         作品信息
│       ├── content.md           带编辑注释的 Markdown 作品正文
│       └── media/cover.svg      占位封面
├── works/
│   ├── light-field/
│   │   ├── settings.md
│   │   ├── content.md
│   │   └── media/               该作品的图片、视频
│   └── …                        每个作品一个文件夹
├── scripts/                     构建和本地预览工具
├── .github/workflows/pages.yml   推送 main 后自动构建和部署
└── dist/                        自动生成的发布文件，不手动修改
    ├── index.html               首页
    ├── studio/index.html        工作室
    ├── contact/index.html       联系页
    ├── assets/                  共用资源
    └── works/
        ├── index.html           自动汇总的作品列表
        └── light-field/
            ├── index.html      自动生成的独立作品页
            └── media/          对应作品的媒体
```

## 添加作品：复制 → 修改 → 同步

1. 复制 `templates/work/` 到 `works/你的作品名/`。文件夹名使用小写英文字母、数字和连字符，例如 `my-new-installation`，它就是作品网址的一部分。
2. 把封面、照片和视频放入该作品的 `media/` 文件夹。
3. 修改 `settings.md`。文件内有中文字段说明，修改 json project 代码块中的值，最后一个字段后面不要加逗号。
4. 修改 `content.md`。用 Markdown 写标题、段落、列表和图片；复制模板里的示例即可。视频或特殊布局也可以嵌入自己编写的 HTML。
5. 把 `status` 改成 `publish`；未完成时保持 `draft`。草稿信息、页面和媒体不会发布。
6. 将修改提交并推送到 GitHub `main`，Actions 会重新生成并发布网页，无需手动改首页或列表。

作品 `settings.md` 中的 `json project` 字段：

| 字段 | 用途 |
| --- | --- |
| title | 标题 |
| category | 分类；新分类会自动进入筛选，显示开关和分类顺序在 settings.md 调整 |
| year | 年份，使用带引号的字符串，例如 "2026" |
| location / technology | 地点与技术 |
| description | 简介，参与搜索，并用于网页描述 |
| cover | 封面路径，例如 "media/cover.webp" |
| gallery | 图库路径数组，例如 ["media/01.webp", "media/02.webp"] |
| video | YouTube/Vimeo 网页链接，可自动嵌入；其他 http(s) 视频链接显示观看按钮 |
| status | publish 发布 / draft 草稿 |
| order | 排序数字，越小越靠前 |
| added | 添加日期，例如 "2026-10-14"，用于最近添加排序 |

作品正文里的图片、视频路径同样写 `media/文件名`，不要写电脑绝对路径。每个作品可有自己的正文区块，外壳与详情布局共用。删除作品时删除对应源文件夹，下次构建会一并移除生成页面。

## 用 Markdown 编辑作品正文

每个作品只需要维护作品信息 `settings.md`、正文 `content.md` 和媒体 `media/`。`settings.md` 保存标题、分类、年份等字段；`content.md` 保存详细介绍，支持编辑注释：

```markdown
<!-- 编辑备注：这里写给自己的提醒，不显示在网页中。 -->

## Project concept

Write your project story here. Use **bold text** for emphasis.

## Process

- Research
- Production
- Installation

![Installation view](media/cover.svg)

*Image caption.*
```

使用 `<!-- ... -->` 写注释或临时停用某个区块。注释会从生成的 HTML 和浏览器作品数据中移除，源 Markdown 也不会复制到 dist；GitHub 源码仓库仍会包含你的原始文件。普通换行不会创建新段落，段落间请空一行。图片名称要对应 media 中的实际文件，否则构建会提醒。

现有作品已转换为 Markdown。兼容旧作品：如果某个文件夹没有 content.md，构建仍读取 content.html；两者同时存在时优先使用 content.md。解析器使用 [markdown-it](https://github.com/markdown-it/markdown-it)，运行在构建阶段，访问网站时无需下载 Markdown 解析库。

## 顶栏天气

SEOUL 时钟左侧显示天气图标和摄氏温度。默认查询釜山，点击天气按钮后由浏览器请求当前位置授权；允许后显示 LOCAL 天气。定位只在点击后请求，坐标约取到小数点后两位并发送给 [Open-Meteo](https://open-meteo.com/en/docs) 查询，不写入配置文件、日志或浏览器存储。

定位需要 HTTPS（localhost 预览也可用）及浏览器许可；如果自定义域名仍使用 HTTP，先使用默认城市天气。拒绝定位会保留已显示的天气。每次页面打开默认使用釜山，授权定位只作用于当前页面；天气服务失败时显示 WEATHER —，不会阻塞作品内容。

`settings.md` 的 weather 中可修改 enabled 开关、defaultLabel、latitude、longitude 和 refreshMinutes（默认 15 分钟，最短 5 分钟）。免费天气接口的使用范围与额度以 [Open-Meteo 服务条款](https://open-meteo.com/en/terms) 为准。

## 手动修改首页 SELECTED WORKS

只需要编辑根目录 `settings.md` 中的 `json home` 代码块：

```json
{
  "selectedWorks": {
    "eyebrow": "01 / FEATURED",
    "title": "SELECTED WORKS",
    "linkLabel": "ALL WORKS",
    "projectIds": ["visual-stories", "light-field", "echo-chamber"]
  }
}
```

`eyebrow` 是上面的编号和小字，`title` 是大标题，`linkLabel` 是右侧作品列表链接的文字。`projectIds` 填 `works/` 下的作品文件夹名，列出哪些就显示哪些，数组顺序就是首页顺序，没有固定 4 个的限制。空数组表示不展示精选卡片。这里填写的作品必须存在且为 publish；删除或转为草稿时也要从这个数组移除，构建会提醒无效引用。

精选只有这一处设置：`projectIds` 里的作品会同时显示在首页，并在所有作品卡片上显示 ★ FEATURED 标记。作品的 settings.md 无需 featured 字段。

改完运行 `npm run build` 并刷新预览；推送 GitHub 后自动更新。这里的设置同时用于静态 HTML 和浏览器交互页面，不需要修改生成的 dist 或 assets/js/data.js。

## 分类显示开关与空分类

在根目录 `settings.md` 的 `json site` 代码块中修改：

```json
"hideEmptyCategories": true,
"categories": [
  { "name": "New Media Art", "enabled": true },
  { "name": "Spatial & Exhibition", "enabled": false }
]
```

`enabled: true` 显示分类入口，`false` 隐藏。隐藏只影响首页和作品列表的分类入口，作品仍在 All 和自己的独立页面中正常展示，也可以搜索到。已经选中的分类被关闭后，刷新会自动回到 All。

`hideEmptyCategories: true` 自动隐藏没有已发布作品的分类；只有草稿的分类也会隐藏。设为 false 可以保留启用但暂无作品的分类。分类排列按数组顺序；作品中出现的新分类默认启用，想手动关闭它就把它加入这个数组并设置 enabled 为 false。名称必须与作品的 category 完全一致。

## 本地构建与预览

安装 Node.js 20 或更新的 LTS 版本后，在本文件夹运行：

```powershell
npm ci --ignore-scripts
npm run build
npm run preview
```

打开 http://127.0.0.1:5177/07s-preview/ 。这个预览地址模拟 GitHub 仓库子路径，检查图片和链接是否正确。修改源文件后重新运行构建并刷新。

当前电脑的 Node 25 在文件操作时会异常退出，因此命令会自动选用现有 Codex 附带的 LTS Node。GitHub 使用 Node 22；其他电脑使用已安装的 Node，建议安装 LTS 版本。

`dist/` 可以交给任何静态服务器。无需执行 JavaScript 也能读取基础页面与作品正文；筛选、灯箱和动画需要 JavaScript。首页 3D 使用固定版本的外部 Three.js CDN，加载失败会保留原有背景。

## GitHub Pages 首次配置

1. 将本文件夹内的内容上传到一个 GitHub 仓库的根目录，包括 `.github/`。不要把整个 demo_lizi 上传，也不要在仓库根目录外再包一层 07s作品。
2. 默认分支使用 `main`。如果使用其他分支，需要修改 `.github/workflows/pages.yml` 的 branches。
3. 在仓库 Settings → Pages → Build and deployment → Source 中选择 GitHub Actions。
4. 提交到 main 后，在 Actions 等待 Deploy 07S to GitHub Pages 完成。首次也可以手动运行该工作流。
5. 此后新增作品、换图片、改文字只需再次提交并推送。

工作流遵循 [GitHub Pages 官方自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。只发布 dist，不发布源模板、配置、原型备份和草稿。`dist/` 已在 .gitignore 中，GitHub 会自行生成它。

联系页使用邮件链接，会打开访客的邮件软件。请在 `settings.md` 里将演示邮箱换成真实邮箱，并添加实际社交链接。首页、工作室、联系页、列表页、详情共用标题、导航和页脚的文字均在 `pages/` 对应 MD 中编辑，字段有中文说明。页面布局仍在共用模板和脚本中修改。

## 已绑定的仓库与日常同步

仓库：[openc2023/7S](https://github.com/openc2023/7S)

网站：[https://openc2023.github.io/7S/](https://openc2023.github.io/7S/)

本地目录已关联 origin 和 main，GitHub Pages 已设置为 GitHub Actions 模式。以后修改首页配置、作品内容或图片，在本文件夹运行：

```powershell
npm run build
git add .
git commit -m "Update portfolio"
git push
```

每次推送后，可在 [Actions](https://github.com/openc2023/7S/actions) 查看构建与部署结果。只有部署成功后线上内容才会更新；若配置里的作品名不存在、作品仍为草稿或媒体文件缺失，构建会报告错误。
