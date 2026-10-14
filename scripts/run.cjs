// Prefer the available LTS runtime on this Windows machine, where Node 25 exits
// unexpectedly during file operations. GitHub and other machines use their Node.
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawnSync}=require('node:child_process');
const command=process.argv[2];
if(!['build','preview'].includes(command))throw Error('Use build or preview');
const bundled=path.join(os.homedir(),'.cache','codex-runtimes','codex-primary-runtime','dependencies','node','bin','node.exe');
const runtime=process.platform==='win32'&&Number(process.versions.node.split('.')[0])>=25&&fs.existsSync(bundled)?bundled:process.execPath;
const result=spawnSync(runtime,[path.join(__dirname,command+'.cjs')],{stdio:'inherit'});
if(result.error)throw result.error;
process.exit(result.status??1);
