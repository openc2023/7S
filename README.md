# 07S Portfolio

English portfolio for GitHub Pages. Fixed HTML shells load and parse original Markdown in the browser; publication copies files without generating HTML.

# 网站编辑说明：直接解析 MD

网页打开时，浏览器读取并解析 MD。HTML 是固定外壳，发布时不会根据 MD 生成 HTML。

## 日常修改入口

| 要改什么 | 修改哪个文件 |
| --- | --- |
| 全站资料、天气、分类开关、首页 SELECTED WORKS | 根目录 settings.md |
| 导航、页脚、共用提示 | pages/shared.md |
| 首页文字 | pages/home.md |
| 作品列表文字 | pages/works.md |
| 工作室文字 | pages/studio.md |
| 联系页面文字 | pages/contact.md |
| 作品详情页共用文字 | pages/project.md |
| 显示哪些作品 | works/index.md |
| 单个作品标题、分类、封面等 | works/作品文件夹/settings.md |
| 单个作品正文 | works/作品文件夹/content.md |
| 单个作品图片、视频 | works/作品文件夹/media/ |

设置 MD 中的中文表格和注释告诉你每个字段的用途。修改 json 代码块中的值，保留英文双引号，最后一项不要加逗号。网站可见文字请填写英文。

## 添加作品

1. 复制 templates/work 整个文件夹到 works/my-new-work。包含固定 index.html，不需要修改 HTML。
2. 修改新文件夹的 settings.md、content.md，把图片和视频放入 media/。
3. 完成后将 status 改为 publish。
4. 在 works/index.md 的 projectIds 中加入 my-new-work。静态托管无法自动列出目录，因此这一步必须手动填写。
5. 如果需要首页精选，再把 my-new-work 加到根目录 settings.md 的 selectedWorks.projectIds。
6. 本地刷新预览；用 BAT 推送后，等待 GitHub Pages 部署完成。

作品网址使用文件夹名，复制的 HTML 会自动识别所在文件夹，不需要改里面的作品 ID。作品正文中的媒体路径写 media/文件名。

下架作品：从 works/index.md 和首页精选移除名称，将作品 status 改 draft。发布检查会阻止清单与状态不一致；草稿文件夹不会复制到发布目录。

## 预览与同步

双击 07S-Manager.bat，选择「检查并预览」。预览直接读取源文件；以后保存 MD，再刷新浏览器即可看到修改，无需重新构建。

BAT 保留备份、选择版本恢复、GitHub 登录和推送功能。恢复前会创建安全备份。推送前会检查 MD 格式、媒体路径和作品清单。GitHub Actions 运行 npm run package，只把固定 HTML、原始 MD 和公开媒体复制到 dist/，不会把 MD 转换为 HTML。dist/ 不要手动修改。

命令行：npm run check 检查；npm run preview 本地预览；npm run package 检查并复制发布文件。npm run build 仅为旧命令保留的打包别名，也不生成 HTML。

网站需要 JavaScript 和 HTTP/HTTPS 访问；不要直接双击 HTML 使用 file:// 打开。Markdown 解析器随网站保存在 assets/vendor/，无需从 CDN 下载解析器。

## 注释与公开内容

中文提示、HTML 注释不会显示在网页上，但发布所需的 MD 会公开下载。请不要在 MD 中写密码、令牌或私人资料。_说明_ 前缀文件、工具、备份与草稿不会进入发布目录；GitHub 仓库本身仍保留已提交的源文件。

## 天气与时间

默认显示 BUSAN 城市名、天气及温度；时间跟随天气地点的当地时区，不显示 SEOUL 前缀。点击天气并授权定位后查询当前位置天气及英文城市名。天气失败不影响作品加载。默认城市和坐标在 settings.md，天气文字在 pages/shared.md。
