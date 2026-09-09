/* 首页「Notes」栏：通过 GitHub Discussions API 拉取最近评论（随笔） */
(function () {
  'use strict';

  if (window.__homeRecentCommentsLoaded) return;
  window.__homeRecentCommentsLoaded = true;

  var CACHE_TTL = 10 * 60 * 1000; // 缓存 10 分钟

  function init() {
    var container = document.getElementById('recent-comments');
    if (!container) return;

    var repo = container.getAttribute('data-repo') || '';
    var term = container.getAttribute('data-term') || 'notes/';
    var count = parseInt(container.getAttribute('data-count'), 10) || 3;
    var notesUrl = container.getAttribute('data-notes-url') || '/notes/';
    var cacheKey = 'home-recent-comments:' + repo + ':' + term;

    var headers = { Accept: 'application/vnd.github+json' };

    function render(items) {
      if (!items || !items.length) {
        container.innerHTML = '<div class="home-section-empty">暂无评论</div>';
        return;
      }
      container.innerHTML = items.map(function (item) {
        var text = escapeHtml(stripMarkdown(item.body));
        var date = formatDate(item.created_at);
        var author = escapeHtml(item.user && item.user.login ? item.user.login : '');
        var url = escapeHtml(notesUrl);
        var meta = date ? date : '';
        if (meta && author) meta += ' · ';
        meta += author;
        return [
          '<a class="home-card-item" href="' + url + '">',
          '  <div class="home-card-excerpt">' + text + '</div>',
          '  <div class="home-card-date">' + meta + '</div>',
          '</a>'
        ].join('');
      }).join('');
    }

    // 优先读缓存
    try {
      var cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && cached.time && (Date.now() - cached.time) < CACHE_TTL) {
        render(cached.items);
        return;
      }
    } catch (e) { /* 忽略缓存解析错误 */ }

    fetchComments();

    function fetchComments() {
      if (!repo) {
        render([]);
        return;
      }
      fetch('https://api.github.com/repos/' + repo + '/discussions?per_page=100', { headers: headers })
        .then(function (r) { return r.json(); })
        .then(function (discussions) {
          if (!Array.isArray(discussions)) throw new Error('no discussions');
          var normTerm = term.replace(/^\/+|\/+$/g, '');
          var target = discussions.find(function (d) {
            return d.title === term || d.title.replace(/^\/+|\/+$/g, '') === normTerm;
          });
          if (!target) { render([]); return; }
          return fetch('https://api.github.com/repos/' + repo + '/discussions/' + target.number + '/comments?per_page=100', { headers: headers })
            .then(function (r) { return r.json(); })
            .then(function (comments) {
              if (!Array.isArray(comments)) throw new Error('no comments');
              var recent = comments.slice(-count);
              try {
                localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), items: recent }));
              } catch (e) { /* 忽略写入失败 */ }
              render(recent);
            });
        })
        .catch(function () {
          container.innerHTML = '<div class="home-section-empty">评论加载失败</div>';
        });
    }
  }

  function stripMarkdown(str) {
    return String(str == null ? '' : str)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '[图片]')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Pjax 导航回首页时重新初始化
  document.addEventListener('pjax:complete', init);

  // 点击 Notes 卡片后，跳到评论区锚点（pjax 下需手动滚动）
  var pendingScroll = false;
  document.addEventListener('click', function (e) {
    var el = e.target;
    if (el && el.closest && el.closest('#recent-comments .home-card-item')) {
      pendingScroll = true;
    }
  });

  function scrollToComments() {
    if (!pendingScroll) return;
    pendingScroll = false;
    var anchor = document.getElementById('post-comment');
    if (anchor) {
      setTimeout(function () {
        anchor.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }, 100);
    }
  }
  document.addEventListener('pjax:complete', scrollToComments);
})();
