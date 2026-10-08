const crypto = require('node:crypto');

const OWNER = 'nikon2023';
const REPO = 'suishi-jiaji';
const BRANCH = 'main';
const PHOTO_LIMIT = 30;
const MAX_IMAGE_BYTES = 1_800_000;
const ALLOWED_ISSUE = /^[a-z0-9][a-z0-9-]{1,50}$/;
const ID_RE = /^[a-zA-Z0-9-]{10,85}$/;

class GithubError extends Error {
  constructor(status, reason) { super(reason || 'GitHub API 调用失败'); this.status = status; }
}
function response(res, status, object) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(object);
}
function secretValid(received, expected) {
  if (!expected || !received || typeof received !== 'string') return false;
  return crypto.timingSafeEqual(
    crypto.createHash('sha256').update(received).digest(),
    crypto.createHash('sha256').update(expected).digest()
  );
}
async function github(path, opts = {}) {
  // A pasted token may contain an accidental newline; trim credentials only, never log them.
  const token = String(process.env.ALBUM_GITHUB_TOKEN || '').trim();
  if (!token) throw new GithubError(503, '未配置相册 GitHub 凭据');
  const url = 'https://api.github.com/repos/' + OWNER + '/' + REPO + path;
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(opts.body ? {'Content-Type': 'application/json'} : {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: AbortSignal.timeout(20000)
  });
  if (res.status === 404 && opts.allow404) return null;
  if (!res.ok) throw new GithubError(res.status, 'GitHub 存储请求失败 (HTTP ' + res.status + ')');
  return res.status === 204 ? null : res.json();
}
const folder = issue => '/albums/' + issue;
async function readManifest(issue, sha = BRANCH) {
  const file = await github('/contents' + folder(issue) + '/manifest.json?ref=' + encodeURIComponent(sha), {allow404:true});
  if (!file) return [];
  if (file.encoding !== 'base64' || typeof file.content !== 'string') throw new GithubError(502, '图片清单格式无效');
  let items;
  try { items = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')); }
  catch { throw new GithubError(502, '图片清单解析失败'); }
  if (!Array.isArray(items)) throw new GithubError(502, '图片清单不是数组');
  return items.filter(p => p && ID_RE.test(p.id) && /^[0-9a-z-]+\.webp$/.test(p.file));
}
async function assertPrivate() {
  const repo = await github('');
  if (!repo.private) throw new GithubError(409, '请先将 GitHub 仓库设置为 Private，才能启用照片云端上传');
}
function validWebp(buf) {
  return buf.length >= 16 &&
    buf.subarray(0,4).toString('ascii') === 'RIFF' &&
    buf.subarray(8,12).toString('ascii') === 'WEBP';
}
async function commitChange(issue, apply, image) {
  const imageBlob = image
    ? await github('/git/blobs', {method:'POST',body:{content:image.data,encoding:'base64'}})
    : null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const branch = await github('/git/ref/heads/' + BRANCH);
    const sha = branch.object.sha;
    const commit = await github('/git/commits/' + sha);
    const original = await readManifest(issue, sha);
    const change = apply(original);
    if (change.error) throw new GithubError(change.status || 400, change.error);
    const treeItems = [{
      path:'albums/' + issue + '/manifest.json',
      mode:'100644',type:'blob',
      content:JSON.stringify(change.items, null, 2) + '\n'
    }];
    if (imageBlob) treeItems.push({
      path:'albums/' + issue + '/photos/' + image.file,
      mode:'100644',type:'blob',sha:imageBlob.sha
    });
    if (change.deleteFile) treeItems.push({
      path:'albums/' + issue + '/photos/' + change.deleteFile,
      mode:'100644',type:'blob',sha:null
    });
    const tree = await github('/git/trees', {
      method:'POST',body:{base_tree:commit.tree.sha,tree:treeItems}
    });
    const next = await github('/git/commits', {
      method:'POST',
      body:{message:change.message || 'Update family photo album',tree:tree.sha,parents:[sha]}
    });
    try {
      await github('/git/refs/heads/' + BRANCH,{
        method:'PATCH',body:{sha:next.sha,force:false}
      });
      return {items:change.items,commit:next.sha};
    } catch(err) {
      if (!(err instanceof GithubError) || ![409,422].includes(err.status) || attempt === 2) throw err;
    }
  }
  throw new GithubError(409, '写入冲突，请重试');
}

module.exports = async function handler(req, res) {
  const issue = typeof req.query?.issue === 'string' ? req.query.issue : 'jianggao-001';
  if (!ALLOWED_ISSUE.test(issue)) return response(res,400,{error:'无效的篇目编号'});
  try {
    if (req.method === 'GET') {
      const imageId = req.query?.image;
      // A missing manifest is normal for an empty album, but a private repository
      // returning 404 for an unauthorized token must NOT masquerade as empty.
      await github('');
      const items = await readManifest(issue);
      if (!imageId) return response(res,200,{issue,items:items.map(({id,caption,name,addedAt})=>({id,caption,name,addedAt}))});
      if (typeof imageId !== 'string' || !ID_RE.test(imageId)) return response(res,400,{error:'照片标识无效'});
      const target = items.find(p => p.id === imageId);
      if (!target) return response(res,404,{error:'照片不存在'});
      const data = await github('/contents' + folder(issue) + '/photos/' + encodeURIComponent(target.file) + '?ref=' + BRANCH);
      if (data.encoding !== 'base64' || typeof data.content !== 'string') return response(res,502,{error:'照片读取失败'});
      const bytes = Buffer.from(data.content,'base64');
      if (bytes.length > MAX_IMAGE_BYTES || !validWebp(bytes)) return response(res,502,{error:'存储的照片不符合格式要求'});
      res.setHeader('Content-Type','image/webp');
      res.setHeader('Cache-Control','public, max-age=60');
      res.setHeader('X-Content-Type-Options','nosniff');
      return res.status(200).end(bytes);
    }
    if (!['POST','PATCH','DELETE'].includes(req.method)) return response(res,405,{error:'不支持的请求方法'});
    if (!secretValid(req.headers['x-album-admin'],process.env.ALBUM_ADMIN_PASSWORD))
      return response(res,401,{error:'管理员口令错误'});
    await assertPrivate();

    if (req.method === 'POST') {
      if (Number(req.headers['content-length'] || 0) > 2_700_000) return response(res,413,{error:'照片过大'});
      const raw = req.body?.data;
      if (typeof raw !== 'string' || raw.length > 2_500_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw))
        return response(res,400,{error:'图片编码无效'});
      const bytes = Buffer.from(raw,'base64');
      if (bytes.length > MAX_IMAGE_BYTES || !validWebp(bytes)) return response(res,413,{error:'图片必须为压缩后的 WebP，且不大于 1.8MB'});
      const id = Date.now().toString(36) + '-' + crypto.randomBytes(8).toString('hex');
      const file = id + '.webp';
      const name = String(req.body?.name || '本期照片').slice(0,100);
      const caption = String(req.body?.caption || '').slice(0,80);
      const item = {id,file,name,caption,addedAt:new Date().toISOString()};
      const result = await commitChange(issue, current => {
        if (current.length >= PHOTO_LIMIT) return {error:'本期相册已满（最多30张）',status:409};
        return {items:[...current,item],message:'album: add photo to ' + issue};
      },{file,data:raw});
      return response(res,201,{ok:true,item:{id,name,caption,addedAt:item.addedAt},commit:result.commit});
    }
    const id = String(req.body?.id || '');
    if (!ID_RE.test(id)) return response(res,400,{error:'照片标识无效'});
    if (req.method === 'PATCH') {
      const caption = String(req.body?.caption || '').slice(0,80);
      const result = await commitChange(issue,current=>{
        const old = current.find(p => p.id === id);
        if (!old) return {error:'照片不存在',status:404};
        return {items:current.map(p=>p.id===id?{...p,caption}:p),message:'album: update caption'};
      });
      return response(res,200,{ok:true,commit:result.commit});
    }
    const result = await commitChange(issue,current=>{
      const old = current.find(p=>p.id===id);
      if (!old) return {error:'照片不存在',status:404};
      return {items:current.filter(p=>p.id!==id),deleteFile:old.file,message:'album: delete photo from ' + issue};
    });
    return response(res,200,{ok:true,commit:result.commit});
  } catch(e) {
    console.error('Album API:',e.name, e.status || '',e.message);
    // Expose a diagnostic category, not credentials or upstream request details.
    const upstream = e instanceof GithubError ? e.status : 0;
    const hint = {
      401:'GitHub Token 已失效或填写错误（401）；请检查 ALBUM_GITHUB_TOKEN，并重新部署。',
      403:'GitHub Token 权限不足或请求受限（403）；请检查私有仓库授权和 Contents 权限。',
      404:'GitHub Token 无法访问指定私有仓库（404）；请确认仅授权 nikon2023/suishi-jiaji。',
      422:'GitHub 写入操作校验失败（422）；请重试或检查 GitHub 权限。'
    };
    const status = [400,404,409,413,503].includes(upstream) && upstream!==404
      ? upstream : 502;
    const message = hint[upstream] || (e instanceof GithubError && [400,409,413,503].includes(upstream)
      ? e.message : '相册服务暂不可用：请检查 Vercel 的相册服务日志与 GitHub Token 权限。');
    const code = hint[upstream] ? 'GITHUB_HTTP_'+upstream : (upstream===503?'TOKEN_MISSING':'ALBUM_SERVER_ERROR');
    return response(res,status,{error:message,code});
  }
};
