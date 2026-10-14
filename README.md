# 07S Portfolio

An English portfolio for GitHub Pages. Fixed HTML shells read and parse Markdown in the browser. Publishing copies existing files; it never generates HTML from Markdown.

中文编辑入口：[从这里开始](_说明_从这里开始.md)。全站设置在 `settings.md`，页面文案在 `pages/`，作品清单在 `works/index.md`，每件作品的资料和正文在自己的文件夹里。

双击 `07S-Manager.bat` 可检查预览、备份、选择版本恢复、登录并推送 GitHub。

Requires Node.js 20+ and Git. Install dependencies with `npm ci`, then:

- `npm run preview` — preview source files at http://127.0.0.1:5177/07s-preview/.
- `npm run check` — validate Markdown, work entries and local media.
- `npm run package` — validate and copy public files into `dist/` for GitHub Pages.

`assets/` contains shared styles and scripts; `templates/work/` is the copyable work template. `_backups/`, `node_modules/`, temporary preview logs and publishing output are ignored by Git. Draft works are kept in source and excluded from the published site.
