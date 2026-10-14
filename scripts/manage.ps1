param(
    [ValidateSet('Menu','Check','Build','Backup','List','Restore','Push','Login','Preview')]
    [string]$Action = 'Menu',
    [string]$ProjectRoot = (Split-Path $PSScriptRoot -Parent)
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$script:Root = [IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')
if (-not (Test-Path -LiteralPath (Join-Path $script:Root 'settings.md'))) { throw '找不到 settings.md，请把工具放在网站根目录运行。' }
$script:BackupRoot = Join-Path $script:Root '_backups'
$script:Excluded = @('.git','node_modules','.npm-cache','dist','output','.playwright-cli','_backups','.codex','.agents','.aws')
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

function Resolve-SafePath([string]$Relative) {
    if ([string]::IsNullOrWhiteSpace($Relative) -or [IO.Path]::IsPathRooted($Relative) -or $Relative -match '[:\\]' -or $Relative.Split('/') -contains '..') { throw "不安全的备份路径：$Relative" }
    foreach ($part in $Relative.Split('/')) {
        if (-not $part -or $part -eq '.' -or $part.TrimEnd(' ','.') -ne $part) { throw "备份路径格式无效：$Relative" }
    }
    if ($script:Excluded -contains $Relative.Split('/')[0] -or $Relative -eq '_07s_backup_manifest.json') { throw "备份包含不允许覆盖的文件：$Relative" }
    $full = [IO.Path]::GetFullPath((Join-Path $script:Root $Relative))
    if (-not $full.StartsWith($script:Root + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "路径超出项目目录：$Relative" }
    $check = $full
    while ($check -and $check -ne $script:Root) {
        if (Test-Path -LiteralPath $check) {
            if ((Get-Item -LiteralPath $check -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "拒绝覆盖链接路径：$Relative" }
        }
        $check = Split-Path $check -Parent
    }
    return $full
}
function Get-SourceFiles {
    function Walk([string]$Directory) {
        foreach ($item in Get-ChildItem -LiteralPath $Directory -Force) {
            $relative = $item.FullName.Substring($script:Root.Length + 1).Replace('\','/')
            if ($script:Excluded -contains $relative.Split('/')[0]) { continue }
            if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "项目内有链接，请先移出再备份：$relative" }
            if ($item.PSIsContainer) { Walk $item.FullName }
            elseif ($item.Name -notin @('Thumbs.db','.DS_Store')) {
                $null = Resolve-SafePath $relative
                $item
            }
        }
    }
    @(Walk $script:Root | Sort-Object FullName)
}
function Run-Git([string[]]$Arguments) {
    & git -C $script:Root @Arguments
    if ($LASTEXITCODE -ne 0) { throw 'Git 操作未成功，已停止。请按上方提示处理后重试。' }
}
function Require-Tool([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) { throw "缺少 $Name。请先安装 Node.js LTS（含 npm）或 Git for Windows，然后重新打开 BAT。" }
}
function Get-FileDigest([string]$File) {
    $stream = [IO.File]::OpenRead($File)
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','') }
    finally { $stream.Dispose(); $sha.Dispose() }
}
function Check-Environment {
    Require-Tool 'node'; Require-Tool 'npm.cmd'; Require-Tool 'git'
    & node --version; & npm.cmd --version; & git --version
    Write-Host "项目：$script:Root"
    Write-Host '环境检查完成。第一次检查会自动安装依赖；GitHub 登录只在登录/推送时进行。'
}
function Build-Site {
    Require-Tool 'node'; Require-Tool 'npm.cmd'
    Push-Location $script:Root
    try {
        $hash = Get-FileDigest (Join-Path $script:Root 'package-lock.json')
        $stamp = 'node_modules/.07s-lock-sha'
        $installed = Test-Path -LiteralPath 'node_modules/markdown-it/package.json'
        if (-not $installed -or -not (Test-Path -LiteralPath $stamp) -or (Get-Content -LiteralPath $stamp -Raw).Trim() -ne $hash) {
            & npm.cmd ci --ignore-scripts --no-fund --no-audit --cache .npm-cache
            if ($LASTEXITCODE -ne 0) { throw '依赖安装失败，未继续检查。请检查网络后重试。' }
            Set-Content -LiteralPath $stamp -Value $hash -Encoding ASCII
        }
        & node 'scripts/run.cjs' check
        if ($LASTEXITCODE -ne 0) { throw '检查失败，请根据上方文件名和字段提示修改 MD 后重试。未推送 GitHub。' }
        Write-Host '检查成功。' -ForegroundColor Green
    } finally { Pop-Location }
}
function New-Backup([string]$Reason = 'manual') {
    $files = @(Get-SourceFiles)
    if ($files.Count -eq 0) { throw '没有可备份的源文件。' }
    $null = New-Item -ItemType Directory -Path $script:BackupRoot -Force
    Set-Content -LiteralPath (Join-Path $script:BackupRoot '_说明_备份版本在这里.md') -Value '# 本地备份：ZIP 文件按日期保存。双击根目录 BAT，选择恢复，再按编号选择版本。不要上传此文件夹。恢复前会自动备份当前源文件。' -Encoding UTF8
    $name = (Get-Date -Format 'yyyy-MM-dd_HH-mm-ss-fff') + '_' + $Reason + '.zip'
    $zipPath = Join-Path $script:BackupRoot $name
    $manifest = [ordered]@{ format = '07s-source-v1'; created = (Get-Date).ToString('o'); reason = $Reason; files = @() }
    $zip = [IO.Compression.ZipFile]::Open($zipPath, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in $files) {
            $relative = $file.FullName.Substring($script:Root.Length + 1).Replace('\','/')
            $before = Get-FileDigest $file.FullName
            $null = [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal)
            if ((Get-FileDigest $file.FullName) -ne $before) { throw "备份时文件发生变化，请重试：$relative" }
            $manifest.files += [ordered]@{ path = $relative; sha256 = $before }
        }
        $entry = $zip.CreateEntry('_07s_backup_manifest.json')
        $writer = [IO.StreamWriter]::new($entry.Open(), [Text.UTF8Encoding]::new($false))
        try { $writer.Write(($manifest | ConvertTo-Json -Depth 6)) } finally { $writer.Dispose() }
    } catch {
        $zip.Dispose()
        if ([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($zipPath)) -eq $script:BackupRoot) { Remove-Item -LiteralPath $zipPath -Force }
        throw
    } finally { $zip.Dispose() }
    Write-Host "已备份：$zipPath（$($files.Count) 个源文件，含素材；不含 Git 登录信息和缓存）" -ForegroundColor Green
    return $zipPath
}
function Get-Backups {
    if (-not (Test-Path -LiteralPath $script:BackupRoot)) { return @() }
    @(Get-ChildItem -LiteralPath $script:BackupRoot -Filter '*.zip' -File | Sort-Object Name -Descending)
}
function Show-Backups {
    $backups = @(Get-Backups)
    if ($backups.Count -eq 0) { Write-Host '还没有备份，请先选“创建备份”。'; return }
    for ($i = 0; $i -lt $backups.Count; $i++) { Write-Host ("[{0}] {1}  {2:N1} MB" -f ($i + 1), $backups[$i].Name, ($backups[$i].Length / 1MB)) }
}
function Restore-Backup {
    $backups = @(Get-Backups)
    Show-Backups
    if ($backups.Count -eq 0) { return }
    $number = 0
    if (-not [int]::TryParse((Read-Host '选择备份编号（0 取消）'), [ref]$number) -or $number -lt 1 -or $number -gt $backups.Count) { return }
    $selected = $backups[$number - 1]
    if ([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($selected.FullName)) -ne $script:BackupRoot) { throw '备份文件不在本项目备份目录。' }
    $zip = [IO.Compression.ZipFile]::OpenRead($selected.FullName)
    try {
        $metaEntry = $zip.GetEntry('_07s_backup_manifest.json')
        if (-not $metaEntry) { throw '不是本工具创建的备份。' }
        $reader = [IO.StreamReader]::new($metaEntry.Open())
        try { $manifest = $reader.ReadToEnd() | ConvertFrom-Json } finally { $reader.Dispose() }
        if ($manifest.format -ne '07s-source-v1' -or @($manifest.files).Count -eq 0) { throw '备份格式无效。' }
        $paths = @{}
        foreach ($file in $manifest.files) {
            $null = Resolve-SafePath $file.path
            if ($paths.ContainsKey($file.path) -or $file.sha256 -notmatch '^[A-Fa-f0-9]{64}$') { throw '备份文件清单无效。' }
            $paths[$file.path] = $file.sha256
        }
        $seen = @{}
        foreach ($entry in $zip.Entries) {
            if ($entry.FullName -eq '_07s_backup_manifest.json') { continue }
            $null = Resolve-SafePath $entry.FullName
            if (-not $paths.ContainsKey($entry.FullName) -or $seen.ContainsKey($entry.FullName)) { throw '压缩包与清单不一致。' }
            $stream = $entry.Open(); $sha = [Security.Cryptography.SHA256]::Create()
            try { $hash = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','') } finally { $stream.Dispose(); $sha.Dispose() }
            if ($hash -ne $paths[$entry.FullName]) { throw "备份校验失败：$($entry.FullName)" }
            $seen[$entry.FullName] = $true
        }
        if ($seen.Count -ne $paths.Count) { throw '备份文件缺失。' }
        Write-Host "将恢复：$($selected.Name)，时间：$($manifest.created)，共 $($paths.Count) 个源文件。"
        Write-Host '恢复会撤回之后新增/修改的源文件；恢复前会自动备份当前内容。Git 历史、登录和已有备份不受影响。不会自动推送。'
        if ((Read-Host '确认恢复请输入 RESTORE，其余输入取消') -cne 'RESTORE') { return }
        $current = @(Get-SourceFiles)
        $null = New-Backup 'before-restore'
        # Both old and new file paths are checked against the project root before writes/deletes.
        foreach ($entry in $zip.Entries) {
            if ($entry.FullName -eq '_07s_backup_manifest.json') { continue }
            $target = Resolve-SafePath $entry.FullName
            $null = New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force
            [IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)
        }
        foreach ($file in $current) {
            $relative = $file.FullName.Substring($script:Root.Length + 1).Replace('\','/')
            if (-not $paths.ContainsKey($relative)) { Remove-Item -LiteralPath (Resolve-SafePath $relative) -Force }
        }
        # Remove only empty source folders, never caches, .git or backups.
        $directories = @($current | ForEach-Object { Split-Path $_.FullName -Parent } | Sort-Object -Unique | Sort-Object Length -Descending)
        foreach ($directory in $directories) {
            $check = $directory
            while ($check -ne $script:Root -and (Test-Path -LiteralPath $check)) {
                $relative = $check.Substring($script:Root.Length + 1).Replace('\','/')
                $null = Resolve-SafePath $relative
                if (@(Get-ChildItem -LiteralPath $check -Force).Count -ne 0) { break }
                Remove-Item -LiteralPath $check -Force
                $check = Split-Path $check -Parent
            }
        }
        Write-Host '恢复完成。请先选择检查/预览检查，再选择推送 GitHub。' -ForegroundColor Green
    } finally { $zip.Dispose() }
}
function Login-GitHub {
    Require-Tool 'git'
    & git credential-manager --version *> $null
    if ($LASTEXITCODE -eq 0) {
        & git credential-manager github login --url https://github.com --browser
        if ($LASTEXITCODE -ne 0) { throw '登录未完成，请重试；也可以在下一次推送时按浏览器提示登录。' }
    } else {
        Start-Process 'https://github.com/login'
        Write-Host '已打开 GitHub。推送时请按 Git 的登录提示完成授权，账号密码不会写入项目。'
    }
}
function Push-GitHub {
    Require-Tool 'git'
    if (-not (Test-Path -LiteralPath (Join-Path $script:Root '.git'))) { throw '此目录缺少 Git 仓库信息，请先克隆 openc2023/7S，再把源文件放入仓库；不要上传 _backups。' }
    $branch = (& git -C $script:Root branch --show-current).Trim()
    if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') { throw '请先切换到 main 分支再推送；工具不会重置或覆盖其他分支。' }
    $remote = & git -C $script:Root remote get-url origin
    if ($LASTEXITCODE -ne 0 -or $remote.Trim() -notin @('https://github.com/openc2023/7S.git','https://github.com/openc2023/7S','git@github.com:openc2023/7S.git')) { throw 'origin 不是预期的 openc2023/7S 仓库，已停止，请检查远程地址。' }
    Build-Site
    Write-Host '将获取远程状态；首次可能弹出浏览器要求登录 GitHub。'
    Run-Git @('fetch','origin','main')
    $counts = (& git -C $script:Root rev-list --left-right --count 'HEAD...origin/main') -split '\s+'
    if ($LASTEXITCODE -ne 0 -or [int]$counts[1] -gt 0) { throw 'GitHub 上有本地尚未同步的提交，请先合并远程改动后再推送。工具不会强制覆盖。' }
    foreach ($directory in @('_backups/','dist/','node_modules/','.npm-cache/','output/')) {
        & git -C $script:Root check-ignore -q $directory
        if ($LASTEXITCODE -ne 0) { throw "请先在 .gitignore 中添加 $directory，工具已停止，避免误上传。" }
    }
    $changes = @(& git -C $script:Root status --short)
    if ($changes.Count -gt 0) {
        Write-Host '将提交以下源文件变更（dist、备份和缓存已排除）：'
        $changes | ForEach-Object { Write-Host $_ }
        if ((Read-Host '确认提交并推送请输入 PUSH，其余输入取消') -cne 'PUSH') { return }
        $null = New-Backup 'before-push'
        $message = Read-Host '提交说明（直接回车使用日期）'
        if ([string]::IsNullOrWhiteSpace($message)) { $message = 'Update portfolio ' + (Get-Date -Format 'yyyy-MM-dd HH:mm') }
        if (-not (& git -C $script:Root config user.name) -or -not (& git -C $script:Root config user.email)) {
            $name = Read-Host 'Git 提交署名（不是登录密码）'
            $email = Read-Host 'Git 提交邮箱（可用 GitHub noreply 邮箱）'
            if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($email)) { throw '署名和邮箱不能为空。' }
            Run-Git @('config','--local','user.name',$name); Run-Git @('config','--local','user.email',$email)
        }
        Run-Git @('add','--all'); Run-Git @('commit','-m',$message)
    } elseif ([int]$counts[0] -gt 0) {
        if ((Read-Host '本地有未推送提交，输入 PUSH 推送，其余输入取消') -cne 'PUSH') { return }
        $null = New-Backup 'before-push'
    } else { Write-Host '本地和 GitHub 已同步，无需推送。'; return }
    Run-Git @('push','origin','main')
    Write-Host '推送成功；线上更新请等待 GitHub Actions 部署完成。' -ForegroundColor Green
    Write-Host 'https://github.com/openc2023/7S/actions'
}
function Preview-Site {
    Build-Site
    $running = $false
    try { $response = Invoke-WebRequest 'http://127.0.0.1:5177/07s-preview/' -UseBasicParsing -TimeoutSec 2; $running = $response.StatusCode -eq 200 } catch { }
    if (-not $running) {
        $node = (Get-Command node).Source
        $bundled = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
        if (Test-Path -LiteralPath $bundled) { $node = $bundled }
        $null = New-Item -ItemType Directory -Path (Join-Path $script:Root 'output') -Force
        Start-Process -FilePath $node -ArgumentList ('"' + (Join-Path $script:Root 'scripts/preview.cjs') + '"') -WorkingDirectory $script:Root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $script:Root 'output/preview.log') -RedirectStandardError (Join-Path $script:Root 'output/preview-error.log')
    }
    Start-Process 'http://127.0.0.1:5177/07s-preview/'
    Write-Host '已打开预览。修改 MD 后直接刷新浏览器，无需转换 HTML。'
}
function Invoke-Action([string]$Choice) {
    switch ($Choice) {
        'Check' { Check-Environment }
        'Build' { Build-Site }
        'Backup' { $null = New-Backup }
        'List' { Show-Backups }
        'Restore' { Restore-Backup }
        'Push' { Push-GitHub }
        'Login' { Login-GitHub }
        'Preview' { Preview-Site }
    }
}
if ($Action -ne 'Menu') { Invoke-Action $Action; exit }
while ($true) {
    Write-Host "`n07S 网站管理 —— $script:Root" -ForegroundColor Cyan
    Write-Host '1 环境检查    2 检查并预览    3 创建备份    4 选择备份恢复'
    Write-Host '5 推送 GitHub  6 登录 GitHub  7 查看备份    8 打开编辑指南    0 退出'
    $choice = Read-Host '请选择'
    if ($choice -eq '0') { break }
    try {
        $commands = @{ '1'='Check'; '2'='Preview'; '3'='Backup'; '4'='Restore'; '5'='Push'; '6'='Login'; '7'='List' }
        if ($choice -eq '8') { Start-Process (Join-Path $script:Root '_说明_从这里开始.md') }
        elseif ($commands.ContainsKey($choice)) { Invoke-Action $commands[$choice] }
        else { Write-Host '请输入菜单中的编号。' }
    } catch { Write-Host $_.Exception.Message -ForegroundColor Red }
}
