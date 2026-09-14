(() => {
  "use strict";
  const data = window.ROCK_NEWS_DATA || {news:[], lastUpdated:null, live:false};
  const games = [
    ["Grand Theft Auto VI","GTA VI","القادم الأهم من Rockstar، مع Leonida وشخصيتي Jason وLucia."],
    ["GTA Online","GTA Online","العالم الجماعي المستمر لـ Grand Theft Auto V."],
    ["GTA V","GTA V","قصة Los Santos وطور GTA Online."],
    ["Red Dead Redemption 2","RDR2","مغامرة Arthur Morgan وعصابة Van der Linde."],
    ["Red Dead Online","Red Dead Online","العالم الجماعي في Red Dead Redemption 2."],
    ["Red Dead Redemption","Red Dead Redemption","قصة John Marston الأصلية."],
    ["Bully","Bully","مغامرة Jimmy Hopkins في Bullworth Academy."],
    ["Max Payne","Max Payne","سلسلة الأكشن النوارية من Rockstar."],
    ["L.A. Noire","L.A. Noire","تحقيقات الجريمة في Los Angeles التاريخية."],
    ["Grand Theft Auto IV","GTA IV","قصة Niko Bellic في Liberty City."],
    ["Grand Theft Auto: San Andreas","GTA SA","رحلة CJ في San Andreas."],
    ["Midnight Club","Midnight Club","سلسلة سباقات الشوارع من Rockstar."]
  ];
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  let activeFilter = "all";
  let query = "";
  let favorites = new Set(JSON.parse(localStorage.getItem("rock-news-favorites") || "[]"));

  const dateFmt = new Intl.DateTimeFormat("ar-EG",{year:"numeric",month:"long",day:"numeric"});
  const updatedFmt = new Intl.DateTimeFormat("ar-EG",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});

  function saveFavs(){localStorage.setItem("rock-news-favorites", JSON.stringify([...favorites])); updateFavCount();}
  function updateFavCount(){ $("#favCount").textContent = favorites.size; }
  function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}
  function isOther(game){return !["GTA VI","GTA Online","GTA V","Red Dead Online","Red Dead Redemption"].includes(game)}
  function matches(n){
    const f = activeFilter;
    const filterOK = f==="all" || (f==="favorites" ? favorites.has(n.id) : f==="Red Dead" ? n.game.startsWith("Red Dead") : f==="other" ? isOther(n.game) : n.game===f);
    const hay = `${n.title} ${n.description} ${n.game} ${n.source}`.toLowerCase();
    return filterOK && (!query || hay.includes(query.toLowerCase()));
  }
  function card(n){
    const saved=favorites.has(n.id);
    return `<article class="news-card">
      <div class="card-top"><span class="tag">${escapeHTML(n.game)}</span>${n.official?'<span class="official">رسمي</span>':''}</div>
      <h3>${escapeHTML(n.title)}</h3>
      <p>${escapeHTML(n.description)}</p>
      <div class="card-meta"><span>${dateFmt.format(new Date(n.date+"T12:00:00"))}</span><span>${escapeHTML(n.source)}</span></div>
      <div class="card-actions">
        <button class="icon-btn open-news" data-id="${n.id}">قراءة</button>
        <button class="icon-btn ${saved?'saved':''} fav-news" data-id="${n.id}" aria-label="المفضلة">${saved?'★ محفوظ':'☆ حفظ'}</button>
        <a class="icon-btn source-link" href="${n.sourceURL}" target="_blank" rel="noopener noreferrer">المصدر ↗</a>
      </div>
    </article>`;
  }
  function renderNews(){
    const list=data.news.filter(matches).sort((a,b)=>new Date(b.date)-new Date(a.date));
    $("#newsGrid").innerHTML=list.map(card).join("");
    $("#emptyState").classList.toggle("hidden", list.length>0);
    bindCardActions($("#newsGrid"));
  }
  function renderFavorites(){
    const list=data.news.filter(n=>favorites.has(n.id)).sort((a,b)=>new Date(b.date)-new Date(a.date));
    $("#favoritesGrid").innerHTML=list.map(card).join("");
    $("#favoritesEmpty").classList.toggle("hidden", list.length>0);
    bindCardActions($("#favoritesGrid"));
  }
  function bindCardActions(scope){
    scope.querySelectorAll(".fav-news").forEach(btn=>btn.addEventListener("click",()=>toggleFavorite(btn.dataset.id)));
    scope.querySelectorAll(".open-news").forEach(btn=>btn.addEventListener("click",()=>openReader(btn.dataset.id)));
  }
  function toggleFavorite(id){
    if(favorites.has(id)){favorites.delete(id);toast("تمت إزالة الخبر من المفضلة");}
    else{favorites.add(id);toast("تمت إضافة الخبر إلى المفضلة");}
    saveFavs();renderNews();renderFavorites();
  }
  function openReader(id){
    const n=data.news.find(x=>x.id===id); if(!n)return;
    $("#readerBody").innerHTML=`<div class="reader-meta"><span class="tag">${escapeHTML(n.game)}</span><span>${dateFmt.format(new Date(n.date+"T12:00:00"))}</span><span>${escapeHTML(n.source)}</span>${n.official?'<span class="official">رسمي</span>':''}</div>
      <h2 id="readerTitle">${escapeHTML(n.title)}</h2>
      <p class="reader-summary">${escapeHTML(n.description)}</p>
      <div class="reader-source"><strong>المصدر الأصلي</strong><p>${escapeHTML(n.source)}</p>
      <div class="hero-actions"><a class="btn btn-light" href="${n.sourceURL}" target="_blank" rel="noopener noreferrer">زيارة الخبر الأصلي ↗</a>
      <button class="btn btn-outline" id="shareBtn">مشاركة الخبر</button><button class="btn btn-outline" id="copyBtn">نسخ الرابط</button></div></div>`;
    $("#reader").classList.remove("hidden");document.body.style.overflow="hidden";
    $("#shareBtn").onclick=()=>shareNews(n);
    $("#copyBtn").onclick=()=>copyNews(n);
  }
  function closeReader(){ $("#reader").classList.add("hidden");document.body.style.overflow=""; }
  async function shareNews(n){
    const url=location.href.split("#")[0]+"#news="+encodeURIComponent(n.id);
    try{if(navigator.share) await navigator.share({title:n.title,text:n.description,url});else{await navigator.clipboard.writeText(url);toast("تم نسخ رابط الخبر");}}
    catch(e){}
  }
  async function copyNews(n){
    const url=location.href.split("#")[0]+"#news="+encodeURIComponent(n.id);
    try{await navigator.clipboard.writeText(url);toast("تم نسخ رابط الخبر");}catch(e){toast("تعذر النسخ من المتصفح");}
  }
  function escapeHTML(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
  function setFilter(f){
    activeFilter=f;
    $$(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===f));
    renderNews();
    if(f==="favorites") location.hash="favorites";
    else location.hash="latest";
  }
  function renderGames(){
    $("#gamesGrid").innerHTML=games.map((g,i)=>`<article class="game-card" data-game="${escapeHTML(g[1])}"><span class="game-number">${String(i+1).padStart(2,"0")}</span><h3>${escapeHTML(g[0])}</h3><p>${escapeHTML(g[2])}</p></article>`).join("");
    $$("#gamesGrid .game-card").forEach(c=>c.addEventListener("click",()=>{
      const game=c.dataset.game;
      if(["GTA VI","GTA Online","GTA V"].includes(game)){setFilter(game);}
      else if(game.startsWith("Red Dead")){setFilter("Red Dead");}
      else{activeFilter="other";$$(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter==="other"));query="";$("#searchInput").value="";renderNews();location.hash="latest";}
      $("#latest").scrollIntoView({behavior:"smooth"});
    }));
  }
  function init(){
    $("#lastUpdated").textContent=data.lastUpdated?`آخر تحديث: ${updatedFmt.format(new Date(data.lastUpdated))}`:"آخر تحديث: غير محدد";
    $("#footerUpdated").textContent=$("#lastUpdated").textContent;
    updateFavCount();renderNews();renderFavorites();renderGames();
    $$(".filter").forEach(b=>b.addEventListener("click",()=>setFilter(b.dataset.filter)));
    $("#clearFilters").onclick=()=>{activeFilter="all";query="";$("#searchInput").value="";$$(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter==="all"));renderNews();};
    $("#emptyReset").onclick=()=>$("#clearFilters").click();
    $("#searchInput").addEventListener("input",e=>{query=e.target.value.trim();renderNews();});
    $("#searchOpen").addEventListener("click",()=>{$("#searchInput").focus();$("#latest").scrollIntoView({behavior:"smooth"});});
    $("#navToggle").addEventListener("click",()=>{const open=$("#navLinks").classList.toggle("open");$("#navToggle").setAttribute("aria-expanded",open)});
    $$("[data-filter-link]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();setFilter(a.dataset.filterLink);$("#navLinks").classList.remove("open");$("#latest").scrollIntoView({behavior:"smooth"});}));
    $$("[data-close]").forEach(x=>x.addEventListener("click",closeReader));
    document.addEventListener("keydown",e=>{if(e.key==="Escape")closeReader()});
    window.addEventListener("scroll",()=>$("#backTop").classList.toggle("show",scrollY>500));
    $("#backTop").onclick=()=>scrollTo({top:0,behavior:"smooth"});
    const match=location.hash.match(/^#news=(.+)$/); if(match){setTimeout(()=>openReader(decodeURIComponent(match[1])),300);}
    setTimeout(()=>$("#loading").remove(),450);
  }
  init();
  if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();