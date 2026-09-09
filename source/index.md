---
title: Home
type: page
comments: false
---

<div class="home-sections">
  <section class="home-section">
    <div class="home-section-head">
      <span class="home-section-title">📝 Posts<span class="home-section-sub">正式文章 · 深度思考与分析</span></span>
      <a class="home-section-more" href="/posts/">浏览文章 →</a>
    </div>
    <div class="home-section-grid">
      {% recent_posts 3 %}
    </div>
  </section>

  <section class="home-section">
    <div class="home-section-head">
      <span class="home-section-title">💬 Notes<span class="home-section-sub">日常随笔 · 碎片想法与分享</span></span>
      <a class="home-section-more" href="/notes/">看看随笔 →</a>
    </div>
    <div class="home-section-grid" id="recent-comments" data-repo="tomorin1214/tomorin1214.github.io" data-term="notes/" data-count="3" data-notes-url="/notes/#post-comment">
      <div class="home-section-empty">正在加载最近随笔…</div>
    </div>
  </section>
</div>

<script src="/js/recent-comments.js"></script>
