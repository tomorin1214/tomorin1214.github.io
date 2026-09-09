'use strict';
const fs = require('fs');
const path = require('path');

// 为音频文件添加 HTTP Range 请求支持，修复进度条拖拽问题
hexo.extend.filter.register('server_middleware', function(app) {
  app.use(function(req, res, next) {
    if (!req.headers.range) return next();

    const url = decodeURIComponent(req.url.split('?')[0]);
    if (!/\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i.test(url)) return next();

    const filePath = path.join(hexo.source_dir, url);
    if (!fs.existsSync(filePath)) return next();

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.statusCode = 416;
      res.setHeader('Content-Range', 'bytes */' + fileSize);
      return res.end();
    }

    const chunksize = (end - start) + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    res.statusCode = 206;
    res.setHeader('Content-Range', 'bytes ' + start + '-' + end + '/' + fileSize);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', chunksize);

    stream.on('error', next);
    stream.pipe(res);
  });
}, 0);
