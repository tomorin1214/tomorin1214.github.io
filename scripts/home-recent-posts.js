'use strict';

// 首页「Posts」栏：渲染最近 N 篇文章（标题 + 日期）
hexo.extend.tag.register('recent_posts', function (args) {
  const limit = parseInt(args[0], 10) || 3;
  const dateFormat = hexo.config.date_format || 'YYYY-MM-DD';

  const posts = hexo.locals
    .get('posts')
    .sort('-date')
    .limit(limit)
    .toArray();

  if (!posts.length) {
    return '<div class="home-section-empty">暂无文章</div>';
  }

  return posts
    .map(function (post) {
      const title = escapeHtml(post.title || post.slug || '(无标题)');
      const date = post.date ? post.date.format(dateFormat) : '';
      const url = '/' + post.path;
      return [
        '<a class="home-card-item" href="' + escapeAttr(url) + '">',
        '  <div class="home-card-title">' + title + '</div>',
        date ? '  <div class="home-card-date">' + date + '</div>' : '',
        '</a>'
      ].join('');
    })
    .join('');
});

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}
