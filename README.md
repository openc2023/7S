# 07S 静态作品网站

以这个「07s作品」文件夹作为 GitHub 仓库根目录。网站发布后的文件是普通 HTML、CSS、JavaScript 和媒体文件，不需要服务器后台。构建脚本不需要安装 npm 依赖。

原始 `index.v4-before-en.html` 保留用于对照，不会进入发布目录。原先 Manage 在浏览器 localStorage 中保存的数据不会自动进入新网站；本次迁移使用原文件里的 8 个演示作品，其中 7 个发布、1 个草稿。

## 文件夹规划

```text
07s作品/
├── site.config.json             网站信息、邮箱、分类和社交链接
├── home.config.json             首页精选区标题、作品选择与排列顺序
├── assets/
│   ├── css/site.css              全站样式
│   ├── js/app.js                 列表筛选、详情、灯箱和页面交互
│   ├── js/hero.js                首页 3D 动效
│   └── favicon.svg              网站图标
├── templates/
│   ├── site.html                共用页面外壳：导航、页脚和资源引用
│   └── work/                    新作品模板，复制这个文件夹即可
│       ├── project.json         作品信息
│       ├── content.html         作品正文区块
│       └── media/cover.svg      占位封面
├── works/
│   ├── light-field/
│   │   ├── project.json
│   │   ├── content.html
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
3. 修改 `project.json`。JSON 不支持注释，最后一个字段后面不要加逗号。
4. 修改 `content.html`。复制里面的 section/figure 区块，就可以添加文字、图片和视频。它是你自己编写的可信 HTML，会直接作为正文发布。
5. 把 `status` 改成 `publish`；未完成时保持 `draft`。草稿信息、页面和媒体不会发布。
6. 将修改提交并推送到 GitHub `main`，Actions 会重新生成并发布网页，无需手动改首页或列表。

`project.json` 字段：

| 字段 | 用途 |
| --- | --- |
| title | 标题 |
| category | 分类；新分类会自动进入筛选，分类顺序可在 site.config.json 调整 |
| year | 年份，使用带引号的字符串，例如 "2026" |
| location / technology | 地点与技术 |
| description | 简介，参与搜索，并用于网页描述 |
| cover | 封面路径，例如 "media/cover.webp" |
| gallery | 图库路径数组，例如 ["media/01.webp", "media/02.webp"] |
| video | YouTube/Vimeo 网页链接，可自动嵌入；其他 http(s) 视频链接显示观看按钮 |
| featured | true 表示作品卡片显示 ★ FEATURED 标记；首页展示哪些作品由 home.config.json 控制 |
| status | publish 发布 / draft 草稿 |
| order | 排序数字，越小越靠前 |
| added | 添加日期，例如 "2026-10-14"，用于最近添加排序 |

作品正文里的图片、视频路径同样写 `media/文件名`，不要写电脑绝对路径。每个作品可有自己的正文区块，外壳与详情布局共用。删除作品时删除对应源文件夹，下次构建会一并移除生成页面。

## 手动修改首页 SELECTED WORKS

只需要编辑 `home.config.json`：

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

改完运行 `npm run build` 并刷新预览；推送 GitHub 后自动更新。这里的设置同时用于静态 HTML 和浏览器交互页面，不需要修改生成的 dist 或 assets/js/data.js。

## 本地构建与预览

安装 Node.js 20 或更新的 LTS 版本后，在本文件夹运行：

```powershell
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

联系页使用邮件链接，会打开访客的邮件软件。请在 `site.config.json` 里将演示邮箱换成真实邮箱，并添加实际社交链接。首页与工作室介绍的具体文案目前在 `assets/js/app.js` 中，页面布局在共用模板和脚本中统一修改。

当前只完成本地整理和预览，尚未绑定 GitHub 仓库或实际发布。
