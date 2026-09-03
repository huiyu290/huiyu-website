/* ============================================================
   惠瑜 · 个人网站 —— 内容模块与面板渲染
   面板左上角标注：星球名-模块名（首字母大写，如 Sun-Work Experience）
   简历文案逐字录入。
   ============================================================ */
(function () {
  'use strict';

  var enc = function (p) { return encodeURI(p); };

  /* ---------- 模块注册 ---------- */
  var MODULES = {
    sun:     { name: 'sun',     label: 'Work Experience', zh: '工作经历' },
    moon:    { name: 'moon',    label: 'Projects',        zh: '项目经历' },
    mercury: { name: 'mercury', label: 'Internships',     zh: '实习经历' },
    saturn:  { name: 'saturn',  label: 'Education',       zh: '教育背景' },
    venus:   { name: 'venus',   label: 'Portfolio',       zh: '作品集' },
    neptune: { name: 'neptune', label: 'To Be Explored', zh: '' },
    earth:   { name: 'earth',   label: 'More',          zh: '环英旅行' },
    mars:    { name: 'mars',    label: 'To Be Explored',  zh: '' },
    jupiter: { name: 'jupiter', label: 'To Be Explored',  zh: '' }
  };

  /* ---------- 作品集文件路径 ---------- */
  var MEDIA = {
    durexPpt: '作品集/marketing/Durex X Colorrun_新品发布campaign策划.pptx',
    lorealVideo: "作品集/marketing/L'Oreal HairRing Video.mp4",
    lorealPdf: '作品集/marketing/电商HairRing平台设计_欧莱雅商赛.pdf',
    lipstickPpt: '作品集/marketing/lipsticks naming style consumer research_消费者研究.pptx',
    herbalTeaVideo: '作品集/marketing/凉茶饮品-负责分镜撰写.mp4',
    restaurantDoc: '作品集/coding/《餐厅点餐系统》项目需求文档.docx',
    restaurantVideo: '作品集/coding/点餐系统功能演示（加速）.mp4',
    qiyeguitanPpt: '作品集/coding/七夜怪谈项目汇报.pptx',
    escapeVideo: '作品集/coding/密室恐怖游戏-策划以及开发.mp4',
    ukPhoto1: '关于我/环英旅行照1.jpg',
    ukPhoto2: '关于我/环英旅行照2.jpg',
    ukPhoto3: '关于我/环英旅行照3.jpg',
    ukPhoto4: '关于我/环英旅行照4.JPG',
    ukPhoto5: '关于我/环英旅行照5.JPG',
    ukPhoto6: '关于我/环英旅行照6.JPG',
    ukPhoto7: '关于我/环英旅行照7.JPG',
    ukTripPdf: '关于我/英国🇬🇧.pdf',
    subsidyImg: '关于我/定向补贴产品能力.jpg',
    xhsImg: '关于我/小红书实习.JPG',
    gradPhoto: '教育/研究生主修课程/研究生毕业照.jpg'
  };

  /* ---------- 小工具 ---------- */
  function cap(str) {
    return str.split(' ').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }
  function placeholder(note) {
    return '<div class="placeholder-note">内容待补充<span>' + note + '</span></div>';
  }
  function imgSlot(note) {
    return '\n<!-- 🖼 图片位（' + note + '）：替换为 <img src="..."> 即可 -->\n' +
      '<div class="img-placeholder">🖼️ 图片待补充<span>' + note + '</span></div>';
  }
  function card(headHTML, bodyHTML) {
    return '<section class="card">' + headHTML + bodyHTML + '</section>';
  }
  function head3(title, role, date) {
    var h = '<div class="card-head"><div><h3>' + title + '</h3>';
    if (role) h += '<div class="role">' + role + '</div>';
    h += '</div>';
    if (date) h += '<span class="date">' + date + '</span>';
    h += '</div>';
    return h;
  }
  function video(src) {
    return '<video controls preload="metadata" playsinline src="' + enc(src) + '"></video>';
  }
  function downloadBtn(href, label) {
    return '<a class="download-btn" href="' + enc(href) + '" download>' + label + '</a>';
  }
  function projCard(title, date, text, slot) {
    var extra = '';
    if (slot) {
      if (slot.indexOf('img:') === 0) {
        extra = '<img class="proj-img" src="' + enc(slot.slice(4)) + '" loading="lazy">';
      } else {
        extra = imgSlot(slot);
      }
    }
    return card(head3(title, '', date), '<p>' + text + '</p>' + extra);
  }

  /* ============ 太阳 · 工作经历 ============ */
  function sunBody() {
    return card(head3('美团 · 医药健康事业部', '消费药商品运营', '2024.11 - 2026.6'),
      '<p>负责睡眠、男科、脱发三大消费药品类目快递电商全链路商品运营，日均80万销售规模。完整操盘品类策略、定价体系、内容营销、商业化合作、供应链协同、数据复盘模块，达成类目销量增长、毛利优化、用户规模扩容的核心目标，实现品类持续增长。</p>' +
      '<div class="sub-grid">' +
        '<div class="sub"><h4>✦ 品类策略</h4><p>基于行业趋势、平台规模及用户购药心智，搭建三大类目差异化运营方案，从货品供给、商品定价、用户运营维度落地专项优化动作。核心成果：男科类目25、26年销售同比分别为11%、4%，脱发类目年销售同比15%、26%；睡眠类目沉淀核心用户8万+，市场占有率达到30%。</p></div>' +
        '<div class="sub"><h4>✦ 定价体系</h4><p>搭建自营+卖场双渠道商品分层定价模型，筛选高价敏高销售品、成本优势核心品组建重点货品池。结合日销情况、需求波动及营销节点，落地定价与补贴策略。保障重点品低价率、销售规模与利润，月度目标平均完成率98%。</p></div>' +
        '<div class="sub"><h4>✦ 内容营销</h4><p>迭代优化30余款核心单品全链路内容材料，涵盖患教内容、主图商详、医生问答等，提升商品点击、种草、转化效率。打通万艾可、希爱力多规格商品互通，升级营销场景氛围，拉升男科单品动销；重构达利雷生、莱博雷生等睡眠产品内容体系，从重度失眠换药指导，延伸至泛失眠日常助眠场景，拓宽受众圈层，激活增量市场。</p></div>' +
        '<div class="sub"><h4>✦ 成本优化</h4><p>与品牌运营共同对接先声、卫材、欧加隆等10家头部药企，落地年度框架合作，策划并落地双十一等大促专项营销方案以及年度营销方案，锁定自营渠道专属成本，保障价格优势；操盘期间商业化增收130w，男科自营综毛率保持在0.5%，脱发自营综毛率0.5%→1.1%，且同时保持销售增长。</p></div>' +
        '<div class="sub"><h4>✦ 数据复盘</h4><p>建立周度销售复盘机制并封装为skill，依据ROI、友商定价、需求波动迭代主推规格与定价。2025年重点完成数据体系搭建、竞品价格监控、主推规格梳理，夯实运营基础；2026年精准定位卖场男科类目负增长核心症结，落地投流加码、品牌定向合作、货品结构优化、场景营销补强四大整改举措，实现类目业绩止跌回升。</p></div>' +
      '</div>') +

    card(head3('其他经历', '', ''),
      '<ul class="plain">' +
        '<li><strong>小红书</strong> · 电商行业运营实习（服配内衣组）· 2024.4 - 2024.10</li>' +
        '<li><strong>北京篱笆帮科技有限公司</strong> · 新媒体内容运营实习（海外求职）· 2023.5 - 2024.1</li>' +
      '</ul>' +
      '<p class="placeholder-note" style="margin-top:12px;">完整经历详见 Internships</p>');
  }

  /* ============ 月亮 · 项目经历 ============ */
  function moonBody() {
    return projCard('春节不打烊项目', '2024.10 - 2025.02',
      '基于春节假期药品履约中断风险高，用户购药需求难以保障的背景。负责统筹2025春节不打烊整体方案，跨商家运营、治理、体验、物流多团队协同，落地为涵盖活动节奏、C端展示、履约考核的执行方案；推动可发货商品优先曝光，拉动商家报名，扩大有效供给。活动期间商家报名数量同比+284%，日均实付1433万，农历同比+51.2%，用户万服指标同比改善22.5%，实现销售规模与服务体验同步增长。',
      '春节不打烊项目 · 活动海报 / 数据截图') +
    projCard('DORAS创新睡眠药用户调研', '2026.04 - 2026.06',
      '基于创新睡眠药DORAS用户认知不足，复购率低，缺少用户决策等信息支撑精细化运营的问题。牵头开展深度用户调研，挖掘运营痛点，输出可落地方案。完成30+场用户访谈，围绕购药渠道、决策因素、流失/复购原因、使用场景/推荐意愿收集反馈；从购前、购中、购后全链路梳理用户痛点，输出打消用户用药依赖顾虑，简化用药指导，买赠睡眠礼包等运营优化策略，为睡眠类目拉新、转化、复购运营提供决策依据。',
      'DORAS用户调研 · 调研结论 / 用户画像') +
    projCard('定向补贴产品能力建设', '2025.11 - 2026.05',
      '基于原有补贴工具存在报价展示模糊、多活动叠加冲突，无法有效激励商家让利的问题。设计并推动落地定向补贴产品功能，保障日常及大促核心商品价格竞争力与稳定供给。牵头输出需求文档，协同商家运营、产品以及研发完成功能开发以及后续迭代；通过补贴+流量扶持锁定重点品低价供给，设置保护期、PK期机制，引导商家开展价格竞争。活动商品销售额占品类40%，日均商家点击UV1000+，重点品低价率提升3pp，夯实平台低价心智。',
      'img:' + MEDIA.subsidyImg);
  }

  /* ============ 水星 · 实习经历 ============ */
  function mercuryBody() {
    return card(head3('小红书', '电商运营（服配内衣组）', '2024.04 - 2024.10'),
      '<ul class="plain">' +
        '<li>BK建联:协助服配内衣品牌商务建联博主,推进达成笔记种草或者直播带货合作,主要有提报,推荐,选品会几种方式,成功为20+品牌对接100+博主。</li>' +
        '<li>营销活动策划及执行:策划或落实平台与时尚内衣商家相关的线上线下活动,关于线上活动,例如以带动中部尾部防晒类服饰商家GMV为目的,在小红书软件搜索页推出"我的防晒秘密武器"活动。关于线下活动,以加强小红书电商市场定位,促进博主商家合作为目的,参与小红书"时尚伙伴日"link电商伙伴大会活动。</li>' +
        '<li>数据分析:制作月报,密切关注并分析商家日常以及营销活动后在GMV以及博主建联数量上的变动,并协助品牌方研究GMV,ROI提升方法,与不同商家会议14次,提供有效建议5+。</li>' +
        '<li>日常运营:负责服配内衣商家的日常运营,解答200+内衣类目商家在直播,笔记,店铺等方面遇到的问题。</li>' +
        '<li>品牌入驻:挖掘有调性的品牌入驻小红书或与小红书平台深度合作,实习期间累计BD10+品牌。</li>' +
      '</ul>' +
      '<img class="proj-img" src="' + enc(MEDIA.xhsImg) + '" alt="小红书实习" loading="lazy">') +
    card(head3('北京篱笆帮科技有限公司', '内容运营', '2023.05 - 2024.01'),
      '<ul class="plain">' +
        '<li>账号运营：以拉新促活为目的，负责公司小红书，b站账号的运营管理，包括内容发布，粉丝维护，引流获客，数据统计等工作，累计粉丝量4w+，实现流量变现10w元+，产品销售环比提升44%。</li>' +
        '<li>内容产出：负责公司小红书，b站，抖音账号的部分内容选题，文案撰写，视频录制，后期制作。与计算机，金融，产品，电子工程，数据等不同领域50+专业人士沟通对接并成功实现内容产出100+，最高阅读量达3w+。</li>' +
        '<li>SOP优化：以提高内容产出效率为目的，提出后期剪辑简化方案。使用AI剪辑工具，提升公司内容创作效率200%。</li>' +
        '<li>AI工具设计与优化：优化AI写稿工具，在稿件输出，稿件选择，页面布局等功能模块提出7个新需求并撰写需求文档，与开发部门对接，迭代3版。</li>' +
        '<li>团队管理：管理新媒体实习生团队共12人，负责剪辑，文稿，运营各环节实习生的高效沟通，每个月统计新媒体产出数据并举行复盘会议，尝试2种新的视频形式，有效总结10条用户内容偏好。</li>' +
      '</ul>');
  }

  /* ============ 土星 · 教育背景 ============ */
  function saturnBody() {
    return '<section class="edu-card"><div class="edu-top"><h3>香港城市大学 · 硕士</h3><span class="date">09/2023 – 10/2024</span></div>' +
      '<div class="edu-meta"><span>专业：<b>整合营销传播（IMC）</b></span><span>院系：<b>媒体与传播系</b></span><span>绩点：<b>GPA 3.76</b></span></div>' +
      '<div class="edu-courses"><h4>研究生主修课程</h4><div class="course-tags">' +
        '<span>整合营销传播</span><span>公共关系</span><span>广告策划</span><span>传播与新媒体研究方法</span>' +
      '</div></div>' +
      '<img class="edu-photo" src="' + enc(MEDIA.gradPhoto) + '" alt="研究生毕业照" loading="lazy">' +
    '</section>' +
    '<section class="edu-card"><div class="edu-top"><h3>重庆大学 · 本科双学位</h3><span class="date">09/2018 – 06/2022</span></div>' +
      '<div class="edu-meta"><span>主修：<b>软件工程（大数据与软件学院）</b></span><span>绩点：<b>GPA 3.46</b></span><span>辅修：<b>新闻（新闻与传播学院）</b></span><span>绩点：<b>GPA 3.64</b></span></div>' +
      '<div class="edu-courses"><h4>本科主修课程</h4><div class="course-tags">' +
        '<span>数字动画与游戏设计</span><span>JAVA</span><span>C语言</span><span>人工智能导论</span><span>软件项目管理</span>' +
      '</div></div>' +
    '</section>' +
    card(head3('荣誉奖项', '', ''),
      '<ul class="award-list">' +
        '<li>第五届“全国大学生百强实践团队”优秀实践团队</li>' +
        '<li>第六届全国青年科普创新实验暨作品大赛重庆赛区三等奖</li>' +
        '<li>长江电力市级奖学金</li>' +
        '<li>重庆大学综合奖学金</li>' +
        '<li>国创项目“文学的影视化改编”结项</li>' +
      '</ul>');
  }

  /* ============ 金星 · 作品集 ============ */
  function portfolioProject(title, intro, mediaHTML, summary, btns) {
    return '<div class="project"><h4>' + title + '</h4>' +
      '<p class="intro">' + intro + '</p>' +
      (mediaHTML || '') +
      (summary ? '<p class="summary">' + summary + '</p>' : '') +
      (btns || '') + '</div>';
  }
  function venusBody() {
    return '<div class="group-title">MARKETING · 营销作品</div>' +
      portfolioProject('Durex × Colorrun 联名新品发布 Campaign',
        '杜蕾斯 × Colorrun 联名新品“指套”发布 campaign 全案策划，覆盖消费者洞察、产品定位与预热期 / 爆发期 / 长尾期三阶段传播策略。',
        '',
        'Campaign 涵盖背景洞察、新品与 USP、消费者细分，以及 Warm-up / Eruptive / Continuous 三阶段活动策略，输出完整 Campaign Plan Book。',
        downloadBtn(MEDIA.durexPpt, '📄 下载方案 PPT')) +
      portfolioProject('欧莱雅 HairRing 电商平台设计（商赛）',
        '欧莱雅商赛 HairRing 电商平台设计方案，先看视频展示，下方附平台设计文档。',
        video(MEDIA.lorealVideo),
        '方案围绕 HairRing 电商平台展开，输出平台设计方案 PDF（视频与文档为同一项目）。',
        downloadBtn(MEDIA.lorealPdf, '📄 下载平台设计 PDF')) +
      portfolioProject('名人口红命名消费者研究',
        '研究“名人昵称式”口红命名对消费者购买意愿的影响，200+ 有效样本 SPSS 实证分析。',
        '',
        '建立以独特性感知为中介变量的研究模型，通过 SPSS 独立样本 t 检验验证口红命名与消费者购买意愿的关系。',
        downloadBtn(MEDIA.lipstickPpt, '📄 下载研究 PPT')) +
      portfolioProject('凉茶饮品广告 · 分镜撰写',
        '凉茶饮品广告片，负责分镜撰写与创意落地。',
        video(MEDIA.herbalTeaVideo),
        '', '') +
      '<div class="group-title">CODING · 编程作品</div>' +
      portfolioProject('餐厅点餐系统',
        '面向餐厅的完整点餐系统：先看功能演示视频，下方附完整需求文档。',
        video(MEDIA.restaurantVideo),
        '需求文档覆盖引言、综述、需求分析（服务员 / 管理员 / 厨师 / 顾客用例）、界面风格、验收标准与部署环境要求。',
        downloadBtn(MEDIA.restaurantDoc, '📄 下载需求文档')) +
      portfolioProject('七夜怪谈 · 恐怖解谜游戏',
        '2D 像素风格校园恐怖解谜游戏《七夜怪谈》，Unity + Fungus 开发的课程项目汇报。',
        '',
        '包含项目简介、成果演示、技术难点与总结反思四个部分。',
        downloadBtn(MEDIA.qiyeguitanPpt, '📄 下载项目汇报 PPT')) +
      portfolioProject('密室恐怖游戏',
        '密室恐怖游戏从策划到开发的完整过程展示。',
        video(MEDIA.escapeVideo),
        '', '');
  }

  /* ============ 地球 · 27岁环英旅行 ============ */
  function earthBody() {
    return '<div class="trip-intro"><span class="trip-big">🌍</span><p>27岁和朋友策划并圆满完成了环英旅行</p></div>' +
      '<div class="trip-gallery">' +
        '<img src="' + enc(MEDIA.ukPhoto1) + '" alt="环英旅行照1" loading="lazy">' +
        '<img src="' + enc(MEDIA.ukPhoto2) + '" alt="环英旅行照2" class="landscape" loading="lazy">' +
        '<img src="' + enc(MEDIA.ukPhoto3) + '" alt="环英旅行照3" class="landscape" loading="lazy">' +
        '<img src="' + enc(MEDIA.ukPhoto4) + '" alt="环英旅行照4" loading="lazy">' +
        '<img src="' + enc(MEDIA.ukPhoto5) + '" alt="环英旅行照5" loading="lazy">' +
        '<img src="' + enc(MEDIA.ukPhoto6) + '" alt="环英旅行照6" loading="lazy">' +
        '<img src="' + enc(MEDIA.ukPhoto7) + '" alt="环英旅行照7" loading="lazy">' +
      '</div>' +
      downloadBtn(MEDIA.ukTripPdf, '📄 查看完整旅行计划 PDF');
  }

  /* ============ 海王星 · 关于我（待补充） ============ */
  function neptuneBody() {
    return '<div style="min-height:240px;"></div>';
  }

  /* ============ 敬请期待（留白） ============ */
  function soonBody() {
    return '<div style="min-height:240px;"></div>';
  }

  var BODY = {
    sun: sunBody, moon: moonBody, mercury: mercuryBody,
    saturn: saturnBody, venus: venusBody, neptune: neptuneBody,
    earth: earthBody, mars: soonBody, jupiter: soonBody
  };

  /* ---------- 面板控制 ---------- */
  var overlay = document.getElementById('panel-overlay');
  var panel = document.getElementById('panel');
  var closeBtn = document.getElementById('panel-close');
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  var currentKey = null;

  function openPanel(key) {
    var mod = MODULES[key];
    if (!mod) return;
    currentKey = key;
    var body = (BODY[key] || soonBody)();
    if (key === 'sun' || key === 'moon') {
      body = body.replace(/<p>([^<]*)<\/p>/g, function (m, t) {
        var parts = t.split('。'), out = '';
        for (var i = 0; i < parts.length; i++) {
          var s = parts[i];
          if (!s.trim()) continue;
          out += '<div class="dot-line">' + s + '。</div>';
        }
        return out;
      });
    }
    var isSoon = (key === 'mars' || key === 'jupiter');
    var html = '<div class="panel-kicker">' + cap(mod.name) + '-' + cap(mod.label) + '</div>' +
               ((isSoon || !mod.zh) ? '' : '<h2 class="panel-title">' + mod.zh + '</h2>') +
               '<div class="panel-body">' + body + '</div>';
    document.getElementById('panel-content').innerHTML = html;
    overlay.classList.remove('hidden');
    document.body.classList.add('panel-open');
    panel.scrollTop = 0;
    if (location.hash !== '#' + key) {
      try { history.pushState(null, '', '#' + key); } catch (e) {}
    }
  }

  function closePanel() {
    currentKey = null;
    overlay.classList.add('hidden');
    document.body.classList.remove('panel-open');
    try {
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    } catch (e) {}
    if (window.__onPanelClose) window.__onPanelClose();
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.add('hidden'); }, 2200);
  }

  function syncHash() {
    var h = (location.hash || '').replace('#', '');
    if (h && MODULES[h]) { if (currentKey !== h) openPanel(h); }
    else if (!h && currentKey) { closePanel(); }
  }

  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closePanel(); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
  window.addEventListener('hashchange', syncHash);
  syncHash();

  window.openPanel = openPanel;
  window.closePanel = closePanel;
  window.showToast = showToast;
})();
