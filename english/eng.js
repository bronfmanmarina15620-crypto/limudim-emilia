/* אנגלית של אמיליה – מנוע תרגול.
   כללים קבועים: עד 3 ניסיונות, לא מגלים תשובה, אחרי 3 טעויות – לבקש ממבוגר להסביר.
   שמירה: localStorage "english_amelia_v1" + ענן kefel_state / emilia-english (משיכה, מיזוג, דחיפה). */
(function(){
  "use strict";
  var EN = window.EN;
  var KEY = "english_amelia_v1";
  var CLOUD = {
    url: "https://nrxhjzmmmzqjytmdgzjg.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yeGhqem1tbXpxanl0bWRnempnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDg3MTAsImV4cCI6MjEwNDEyNDcxMH0.5KYX69e1AyXqtHHRejFarK-r1yoXdmlpav2Oazb2WIs",
    rowId: "emilia-english"
  };
  var TEST_DATE = "2026-12-02";
  var DAY = 86400000, MAX_TRIES = 3, SESSION_SIZE = 10;

  var TOPICS = [
    {id:"voc_eh", label:"מילים: אנגלית ← עברית", ico:"🔤", grp:"words"},
    {id:"voc_he", label:"מילים: עברית ← אנגלית", ico:"🔁", grp:"words"},
    {id:"spell", label:"כתיבה בעל פה – 7 המילים", ico:"✍️", grp:"words"},
    {id:"cloze", label:"השלמת משפטים – Cloze", ico:"🧩", grp:"words"},
    {id:"article", label:"a / an / the", ico:"🅰️", grp:"grammar"},
    {id:"pron", label:"כינויי גוף – Pronouns", ico:"🙋", grp:"grammar"},
    {id:"be", label:"הפועל to be: am, is, are", ico:"🟰", grp:"grammar"},
    {id:"short", label:"צורות מקוצרות: I'm, he's", ico:"✂️", grp:"grammar"},
    {id:"trans", label:"תרגום משפטים עם to be", ico:"🔄", grp:"grammar"},
    {id:"match", label:"חיבור חצאי משפטים", ico:"🔗", grp:"reading"},
    {id:"read", label:"הבנת הנקרא", ico:"📖", grp:"reading"},
    {id:"listen", label:"הבנת הנשמע: תמונות", ico:"🎧", grp:"listening"},
    {id:"dialog", label:"הבנת הנשמע: בן ואמא בפארק", ico:"🗣️", grp:"listening"}
  ];
  var GROUPS = [["words","מילים"],["grammar","דקדוק"],["reading","קריאה"],["listening","האזנה"]];
  function topicById(id){ for(var i=0;i<TOPICS.length;i++) if(TOPICS[i].id===id) return TOPICS[i]; return {id:id,label:id,ico:"⭐"}; }

  /* ---------- helpers ---------- */
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c];}); }
  /* Hebrew text with English runs isolated, so mixed lines read correctly in RTL */
  function bx(s){
    s=String(s==null?"":s);
    var out="", last=0, re=/[A-Za-z][A-Za-z0-9 '\u2019,\/\u2026.\-]*[A-Za-z0-9'\u2019\u2026]|[A-Za-z]/g, m;
    while((m=re.exec(s))){ out+=esc(s.slice(last,m.index))+'<bdi dir="ltr">'+esc(m[0])+'</bdi>'; last=m.index+m[0].length; }
    return out+esc(s.slice(last));
  }
  function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function pick(a,n){ return shuffle(a).slice(0,n); }
  function norm(s){
    return String(s||"").toLowerCase().replace(/[\u2019\u2018\u02bc`´]/g,"'").replace(/\s+/g," ")
      .replace(/\s*([.,!?])\s*/g,"$1").replace(/[.!?]+$/,"").trim();
  }
  function lev(a,b){
    var m=a.length,n=b.length,d=[],i,j;
    for(i=0;i<=m;i++){ d[i]=[i]; }
    for(j=0;j<=n;j++) d[0][j]=j;
    for(i=1;i<=m;i++) for(j=1;j<=n;j++) d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    return d[m][n];
  }
  function daysUntil(iso){
    var t; try{ t=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jerusalem",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()); }catch(e){ var d=new Date(); t=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
    var a=t.split("-"), b=iso.split("-");
    return Math.round((Date.UTC(+b[0],+b[1]-1,+b[2])-Date.UTC(+a[0],+a[1]-1,+a[2]))/DAY);
  }
  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

  /* ---------- storage ---------- */
  var mem=null, pushTimer=null;
  function blank(){ return { v:1, sessions:[], reviewBank:[], active:null }; }
  function normalize(d){
    if(!d||typeof d!=="object") d=blank();
    if(!Array.isArray(d.sessions)) d.sessions=[];
    if(!Array.isArray(d.reviewBank)) d.reviewBank=[];
    if(d.active && (!d.active.queue || !d.active.sid)) d.active=null;
    recount(d);
    return d;
  }
  function recount(d){
    var n=0, st=0;
    d.sessions.forEach(function(s){ (s.items||[]).forEach(function(x){ n++; if(x.outcome==="first") st++; }); });
    d.answers=n; d.stars=st;
  }
  function load(){
    try{ var raw=localStorage.getItem(KEY); return normalize(raw?JSON.parse(raw):null); }
    catch(e){ return mem||(mem=blank()); }
  }
  var db=load();
  function saveLocal(){ recount(db); db.updatedAt=Date.now(); try{ localStorage.setItem(KEY, JSON.stringify(db)); }catch(e){ mem=db; } }
  function save(){ saveLocal(); if(pushTimer) clearTimeout(pushTimer); pushTimer=setTimeout(function(){ pushTimer=null; cloudPush(); }, 800); }

  function mergeDb(a,b){
    a=normalize(a); b=normalize(b);
    var out={ v:1, sessions:[], reviewBank:[], active:a.active||null };
    var byId={}, list=[];
    a.sessions.concat(b.sessions).forEach(function(s){
      if(!s||!s.id) return;
      var p=byId[s.id];
      if(!p){ byId[s.id]=s; list.push(s); }
      else if((s.items||[]).length>(p.items||[]).length){ list[list.indexOf(p)]=s; byId[s.id]=s; }
    });
    list.sort(function(x,y){ return (x.start||0)-(y.start||0); });
    out.sessions=list;
    var rb={};
    a.reviewBank.concat(b.reviewBank).forEach(function(r){
      if(!r||!r.id) return;
      var p=rb[r.id];
      if(!p || (r.upd||0)>(p.upd||0)) rb[r.id]=r;
    });
    out.reviewBank=Object.keys(rb).map(function(k){ return rb[k]; });
    recount(out);
    return out;
  }
  function setSync(t){ var el=$("sync"); if(el) el.textContent=t||""; }
  function headers(){ return { "apikey":CLOUD.anonKey, "Authorization":"Bearer "+CLOUD.anonKey, "Content-Type":"application/json" }; }
  function cloudPull(){
    setSync("מסנכרן…");
    var url=CLOUD.url+"/rest/v1/kefel_state?id=eq."+encodeURIComponent(CLOUD.rowId)+"&select=data,updated_at";
    return fetch(url,{method:"GET",headers:headers()}).then(function(r){ if(!r.ok) throw new Error("pull"); return r.json(); })
    .then(function(rows){
      var cd=null;
      if(rows&&rows[0]&&rows[0].data){ cd=rows[0].data; if(typeof cd==="string"){ try{ cd=JSON.parse(cd); }catch(e){ cd=null; } } }
      if(cd){
        var before=JSON.stringify(db.sessions.map(function(s){return s.id+":"+(s.items||[]).length;}));
        db=mergeDb(db, cd);
        saveLocal();
        var after=JSON.stringify(db.sessions.map(function(s){return s.id+":"+(s.items||[]).length;}));
        if(before!==after && typeof renderHome==="function" && !$("home").classList.contains("hidden")) renderHome();
      }
      if(db.sessions.length || db.reviewBank.length) return cloudPush();
      setSync("מסונכרן ☁️"); return true;
    }).catch(function(){ setSync("נשמר במכשיר"); return false; });
  }
  function cloudPush(){
    var body={ id:CLOUD.rowId, data:db, updated_at:new Date().toISOString() };
    var h=headers(); h["Prefer"]="resolution=merge-duplicates,return=minimal";
    return fetch(CLOUD.url+"/rest/v1/kefel_state?on_conflict=id",{method:"POST",headers:h,body:JSON.stringify(body)})
      .then(function(r){ if(!r.ok) throw new Error("push"); setSync("נשמר בענן ☁️"); return true; })
      .catch(function(){ setSync("נשמר במכשיר"); return false; });
  }
  /* pull-merge-push before every push so a second device never overwrites */
  function syncNow(){ return cloudPull(); }

  /* ---------- speech ---------- */
  var VOICE=null;
  function pickVoice(){
    try{
      var vs=window.speechSynthesis.getVoices()||[];
      VOICE=vs.filter(function(v){return /en[-_]US/i.test(v.lang);})[0]||vs.filter(function(v){return /^en/i.test(v.lang);})[0]||null;
    }catch(e){}
  }
  var canSpeak=!!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  if(canSpeak){ pickVoice(); try{ window.speechSynthesis.onvoiceschanged=pickVoice; }catch(e){} }
  function speak(lines, slow){
    if(!canSpeak) return false;
    try{
      window.speechSynthesis.cancel();
      (Array.isArray(lines)?lines:[lines]).forEach(function(l){
        var text=typeof l==="string"?l:l.text;
        var u=new SpeechSynthesisUtterance(text);
        u.lang="en-US"; if(VOICE) u.voice=VOICE;
        u.rate=slow?0.6:0.85;
        u.pitch=(l&&l.pitch)||1;
        window.speechSynthesis.speak(u);
      });
      return true;
    }catch(e){ return false; }
  }

  /* ---------- item bank ---------- */
  var WORDS=EN.W.map(function(w){ return {en:w[0],he:w[1],cat:w[2]}; });
  function heOf(en){ for(var i=0;i<WORDS.length;i++) if(WORDS[i].en===en) return WORDS[i].he; return ""; }
  function vocDistractors(w, field, n){
    var same=WORDS.filter(function(x){ return x.cat===w.cat && x[field]!==w[field] && x.he!==w.he && x.en!==w.en; });
    var other=WORDS.filter(function(x){ return x.cat!==w.cat && x.he!==w.he; });
    var out=pick(same,n).map(function(x){return x[field];});
    if(out.length<n) out=out.concat(pick(other,n-out.length).map(function(x){return x[field];}));
    return out;
  }
  function firstHeb(s){ var m=String(s).match(/[\u05d0-\u05ea]/); return m?m[0]:""; }

  var GEN={
    voc_eh:function(){ return WORDS.map(function(w){ return {
      id:"voc_eh:"+w.en, topic:"voc_eh", kind:"mcq", prompt:"מה הפירוש בעברית?", en:w.en, say:w.en,
      options:shuffle([w.he].concat(vocDistractors(w,"he",3))), answer:w.he, optDir:"rtl",
      hints:["קטגוריה: "+EN.CAT_HE[w.cat]+". הקשיבי למילה 🔊","התשובה מתחילה באות «"+firstHeb(w.he)+"»"] }; }); },
    voc_he:function(){ return WORDS.filter(function(w){ return w.en!=="maybe"; }).map(function(w){ return {
      id:"voc_he:"+w.en, topic:"voc_he", kind:"mcq", prompt:"איך אומרים באנגלית?", he:w.he,
      options:shuffle([w.en].concat(vocDistractors(w,"en",3))), answer:w.en, optDir:"ltr", speakOpts:true,
      hints:["קטגוריה: "+EN.CAT_HE[w.cat]+". אפשר ללחוץ 🔊 ליד כל תשובה","התשובה מתחילה באות "+w.en.charAt(0)] }; }); },
    spell:function(){ return EN.MUST.map(function(m){ return {
      id:"spell:"+m[0], topic:"spell", kind:"type", prompt:"הקשיבי וכתבי באנגלית", he:m[1], say:m[0], autoSay:true,
      answers:[m[0]], spell:true, hints:["מספר האותיות: "+m[0].replace(/ /g,"").length+(m[0].indexOf(" ")>=0?" (שתי מילים)":"")+". הקשיבי שוב 🔊","מסומנות האותיות שכבר כתבת נכון"] }; }); },
    article:function(){ return EN.ARTICLE.map(function(x,i){ return {
      id:"article:"+i, topic:"article", kind:"mcq", prompt:"בחרי a, an או the", en:x.s, options:x.o.slice(), answer:x.a, optDir:"ltr", keepOrder:true,
      hints:["an לפני מילה שמתחילה בצליל של תנועה (a, e, i, o, u). a לפני שאר המילים.","the – כשכבר דיברנו על הדבר הזה, או כשיש רק אחד כזה."] }; }); },
    pron:function(){
      var a=EN.PRON.map(function(x,i){ return {
        id:"pron:"+i, topic:"pron", kind:"mcq", prompt:"בחרי את כינוי הגוף המתאים", en:x.s, options:shuffle(x.o), answer:x.a, optDir:"ltr",
        hints:["מי עושה את הפעולה? בן, בת, חפץ, או כמה אנשים?","אני + עוד מישהו = We. כמה אנשים בלי אני = They. חפץ או חיה = It."] }; });
      var all=["I","you","he","she","it","we","they"];
      EN.PRON_CHART.forEach(function(c,i){
        a.push({ id:"pron:chart"+i, topic:"pron", kind:"mcq", prompt:"איך כותבים באנגלית?", he:c[0],
          options:shuffle([c[1]].concat(pick(all.filter(function(x){return x!==c[1];}),3))), answer:c[1], optDir:"ltr",
          hints:["חשבי על טבלת הגופים: I, you, he, she, it, we, you, they","יחיד או רבים?"] });
      });
      return a; },
    be:function(){ return EN.BE.map(function(x,i){ return {
      id:"be:"+i, topic:"be", kind:"mcq", prompt:"השלימי am, is או are", en:x.s, options:["am","is","are"], answer:x.a, optDir:"ltr", keepOrder:true,
      hints:["I → am. he / she / it → is. we / you / they → are.","מי במשפט? אחד (חוץ מ־I) → is. כמה → are."] }; }); },
    short:function(){
      var a=EN.SHORT.map(function(x,i){ return {
        id:"short:"+i, topic:"short", kind:"type", prompt:"כתבי את המשפט בצורה מקוצרת", en:x.full, answers:x.a, shortForm:true,
        hints:["מחברים את הגוף והפועל בגרש ('): are → 're, is → 's, am → 'm","דוגמה מהדף: They are → They're"] }; });
      EN.SHORT_PAIRS.forEach(function(p,i){
        a.push({ id:"short:p"+i, topic:"short", kind:"mcq", prompt:"מה הצורה המקוצרת?", en:p[0],
          options:shuffle([p[1]].concat(pick(EN.SHORT_PAIRS.filter(function(q){return q[1]!==p[1];}).map(function(q){return q[1];}),3))), answer:p[1], optDir:"ltr",
          hints:["הגוף נשאר אותו גוף","am → 'm, is → 's, are → 're"] });
      });
      return a; },
    trans:function(){ return EN.TRANS.map(function(x,i){ return {
      id:"trans:"+i, topic:"trans", kind:"type", prompt:"תרגמי לאנגלית (עם הפועל להיות)", he:x.he, answers:x.a, sentence:true,
      hints:["אל תשכחי את הפועל להיות: am / is / are","בדקי שכל מילה כתובה נכון. אפשר להיעזר בדף המילים 📒"] }; }); },
    cloze:function(){
      return EN.CLOZE.map(function(x,i){
        var others=pick(EN.CLOZE.filter(function(y){ return y.he!==x.he && y.a!==x.a; }),2).map(function(y){return y.he;});
        return { id:"cloze:"+i, topic:"cloze", kind:"type", prompt:"השלימי את המילה החסרה וכתבי אותה באנגלית", en:x.s, bank:shuffle([x.he].concat(others)), answers:[x.a], spell:true,
          hints:["איזו מילה מהתיבה מתאימה למשפט? 🤔","המילה בעברית: «"+x.he+"». עכשיו כתבי אותה באנגלית"] };
      }); },
    match:function(){ return EN.MATCH.map(function(x,i){ return {
      id:"match:"+i, topic:"match", kind:"mcq", prompt:"בחרי את ההמשך המתאים למשפט", en:x.a+" …", options:shuffle(x.o), answer:x.b, optDir:"ltr",
      hints:["קראי את המשפט המלא בקול עם כל אחת מהאפשרויות","איזה המשך נשמע הגיוני?"] }; }); },
    read:function(){
      var a=[];
      EN.READ.forEach(function(r){ r.q.forEach(function(q,i){ a.push({
        id:"read:"+r.id+":"+i, topic:"read", kind:"mcq", prompt:"קראי את הקטע וענִי על השאלה", passage:{title:r.title,text:r.text}, group:r.id,
        en:q.q, options:q.o.length>2?shuffle(q.o):q.o.slice(), answer:q.a, optDir:"ltr",
        hints:[q.hint||"חזרי לקטע וחפשי את התשובה","קראי שוב לאט את המשפט הזה בקטע"] }); }); });
      return a; },
    listen:function(){
      var a=EN.PICS.map(function(p,i){
        var others=pick(EN.PICS.filter(function(x){return x.e!==p.e;}),3);
        return { id:"listen:"+i, topic:"listen", kind:"mcq", prompt:"הקשיבי ובחרי את התמונה המתאימה", say:p.say, autoSay:true, hideText:true,
          options:shuffle([p.e].concat(others.map(function(x){return x.e;}))), answer:p.e, emoji:true,
          hints:["הקשיבי שוב 🔊 – איזו פעולה או איזה דבר שומעים?","אפשר לשמוע לאט 🐢"] };
      });
      for(var k=0;k<4;k++) a.push(orderItem());
      return a; },
    dialog:function(){ return EN.DIALOG.q.map(function(q,i){ return {
      id:"dialog:"+i, topic:"dialog", kind:"mcq", prompt:"הקשיבי לשיחה בין בן ואמא בפארק וענִי", dialog:true, en:q.q,
      options:shuffle(q.o), answer:q.a, optDir:"ltr",
      hints:["הקשיבי שוב לשיחה 🔊","אפשר לשמוע לאט 🐢 ולחפש את המילה מהשאלה"] }; }); }
  };
  function orderItem(){
    var four=pick(EN.PICS,5), extra=four.pop();
    return { id:"listen:order:"+four.map(function(p){return EN.PICS.indexOf(p);}).join("-"), topic:"listen", kind:"order",
      prompt:"הקשיבי ומספרי את התמונות לפי הסדר. יש תמונה אחת מיותרת", say:four.map(function(p){return p.say;}), autoSay:true, hideText:true,
      options:shuffle(four.concat([extra]).map(function(p){return p.e;})), answer:four.map(function(p){return p.e;}),
      hints:["הקשיבי שוב. אחרי כל משפט לחצי על התמונה שלו","אפשר לשמוע לאט 🐢"] };
  }
  var POOL={}; TOPICS.forEach(function(t){ POOL[t.id]=GEN[t.id](); });

  /* ---------- adaptive ---------- */
  function allItems(){ var a=[]; db.sessions.forEach(function(s){ (s.items||[]).forEach(function(x){ a.push(x); }); }); return a; }
  function topicStats(){
    var st={};
    TOPICS.forEach(function(t){ st[t.id]={n:0,first:0,fail:0,att:0,last:0}; });
    allItems().forEach(function(x){
      var o=st[x.type]; if(!o) return;
      o.n++; o.att+=x.attempts||1; if(x.outcome==="first") o.first++; if(x.outcome==="failed") o.fail++; o.last=Math.max(o.last,x.at||0);
    });
    return st;
  }
  function topicWeight(o, id){
    var w;
    if(!o.n) w=2.5;
    else w=1+3*(o.fail/o.n)+2*(1-o.first/o.n)+((o.att/o.n)-1);
    if(o.n && o.last && Date.now()-o.last>5*DAY) w+=0.7;
    if(id==="spell") w+=0.8;
    return Math.max(0.2,w);
  }
  function itemHistory(){
    var h={};
    allItems().forEach(function(x){ var o=h[x.id]||(h[x.id]={n:0,bad:0,last:0}); o.n++; if(x.outcome!=="first") o.bad++; o.last=Math.max(o.last,x.at||0); });
    return h;
  }
  function chooseFrom(topic, n, avoid){
    var h=itemHistory(), pool=POOL[topic].filter(function(x){ return !avoid[x.id]; });
    if(topic==="listen") pool=pool.filter(function(x){ return x.kind!=="order"; }).concat([orderItem()]);
    var scored=pool.map(function(x){ var o=h[x.id]; var s=Math.random()*1.5; if(!o) s+=2; else { s+=2*o.bad/o.n; s-=Math.min(2,(Date.now()-o.last)<DAY?1.5:0); } return {x:x,s:s}; });
    scored.sort(function(a,b){ return b.s-a.s; });
    return scored.slice(0,n).map(function(o){ avoid[o.x.id]=1; return o.x; });
  }
  function dueReviews(max){
    var t=Date.now();
    return db.reviewBank.filter(function(r){ return r.item && (r.dueAt||0)<=t; })
      .sort(function(a,b){ return (a.dueAt||0)-(b.dueAt||0); }).slice(0,max)
      .map(function(r){ var c=JSON.parse(JSON.stringify(r.item)); c.review=true; return c; });
  }
  function updateReview(item, outcome){
    var id=item.id, ix=-1;
    for(var i=0;i<db.reviewBank.length;i++) if(db.reviewBank[i].id===id){ ix=i; break; }
    if(outcome==="first"){
      if(ix<0) return;
      var r=db.reviewBank[ix];
      if((r.stage||1)<2 && item.review){ r.stage=2; r.dueAt=Date.now()+3*DAY; r.upd=Date.now(); }
      else if(item.review){ r.item=null; r.done=true; r.upd=Date.now(); }
      return;
    }
    var clean=JSON.parse(JSON.stringify(item)); delete clean.review;
    if(ix<0) db.reviewBank.push({id:id,item:clean,stage:1,dueAt:Date.now()+DAY,misses:1,upd:Date.now()});
    else { var e=db.reviewBank[ix]; e.item=clean; e.done=false; e.stage=1; e.dueAt=Date.now()+DAY; e.misses=(e.misses||0)+1; e.upd=Date.now(); }
  }
  function buildSmart(){
    var avoid={}, q=dueReviews(4);
    q.forEach(function(x){ avoid[x.id]=1; });
    var st=topicStats();
    var guard=0;
    while(q.length<SESSION_SIZE && guard++<60){
      var tot=0, ws=TOPICS.map(function(t){ var w=topicWeight(st[t.id],t.id); tot+=w; return w; });
      var r=Math.random()*tot, k=0;
      for(;k<ws.length;k++){ r-=ws[k]; if(r<=0) break; }
      var t=TOPICS[Math.min(k,TOPICS.length-1)].id;
      var got=chooseFrom(t,1,avoid);
      if(got.length) q.push(got[0]);
      st[t].n++; st[t].first++; /* spread: lower weight after a pick */
    }
    return shuffle(q);
  }
  function buildTopic(t){
    var avoid={};
    if(t==="read"){
      var h=itemHistory();
      var rs=EN.READ.slice().sort(function(a,b){
        function bad(r){ var s=0; r.q.forEach(function(_,i){ var o=h["read:"+r.id+":"+i]; s+= o?(o.bad?2:-1):1; }); return s+Math.random(); }
        return bad(b)-bad(a);
      }).slice(0,2);
      var out=[]; rs.forEach(function(r){ POOL.read.forEach(function(x){ if(x.group===r.id) out.push(x); }); });
      return out;
    }
    if(t==="dialog") return POOL.dialog.slice();
    if(t==="spell") return shuffle(POOL.spell.slice()).concat(chooseFrom("cloze",3,avoid));
    return chooseFrom(t, SESSION_SIZE, avoid);
  }
  function buildMock(){
    var avoid={}, q=[];
    function sec(label, items){ items.forEach(function(x){ var c=JSON.parse(JSON.stringify(x)); c.section=label; q.push(c); }); }
    sec("חלק A – הבנת הנשמע: מספרי את התמונות", [orderItem(), orderItem()]);
    sec("חלק B – הבנת הנשמע: בן ואמא בפארק", pick(POOL.dialog,5));
    sec("חלק C – אוצר מילים", chooseFrom("voc_eh",5,avoid));
    sec("חלק D – השלמת משפטים", chooseFrom("cloze",4,avoid));
    sec("חלק E – הבנת הנקרא: חיבור משפטים", chooseFrom("match",3,avoid));
    var r=EN.READ[Math.floor(Math.random()*EN.READ.length)];
    sec("חלק F – הבנת הנקרא: קטע ושאלות", POOL.read.filter(function(x){ return x.group===r.id; }));
    sec("דקדוק – a / an / the", chooseFrom("article",2,avoid));
    sec("דקדוק – Pronouns", chooseFrom("pron",2,avoid));
    sec("דקדוק – Verb To Be", chooseFrom("be",2,avoid));
    sec("דקדוק – Short forms", pick(POOL.short.filter(function(x){return x.kind==="type";}),2));
    sec("דקדוק – תרגום", chooseFrom("trans",1,avoid));
    sec("כתיבה בעל פה", chooseFrom("spell",2,avoid));
    return q;
  }

  /* ---------- session flow ---------- */
  var cur=null; /* {item, tries, picks, t0, done, outcome, order:[]} */
  function startSession(mode, topic){
    var q = mode==="mock" ? buildMock() : mode==="smart" ? buildSmart() : buildTopic(topic);
    var sid=uid();
    db.active={ sid:sid, mode:mode, topic:topic||null, queue:q, idx:0, start:Date.now() };
    db.sessions.push({ id:sid, start:Date.now(), last:Date.now(), mode:mode, topic:topic||null, items:[] });
    save();
    show("play"); renderItem();
  }
  function sessionRec(){ for(var i=db.sessions.length-1;i>=0;i--) if(db.sessions[i].id===db.active.sid) return db.sessions[i]; return null; }
  function sessionTitle(){
    var a=db.active; if(!a) return "";
    if(a.mode==="mock") return "📝 מבחן לדוגמה";
    if(a.mode==="smart") return "🎯 תרגול חכם";
    var t=topicById(a.topic); return t.ico+" "+t.label;
  }
  function renderItem(){
    var a=db.active; if(!a){ renderHome(); show("home"); return; }
    if(a.idx>=a.queue.length){ finishSession(); return; }
    var it=a.queue[a.idx];
    if(it.kind==="order" && !it.options){ it=a.queue[a.idx]=orderItem(); }
    cur={ item:it, tries:0, picks:[], t0:Date.now(), done:false, outcome:null, order:[] };
    $("pTitle").innerHTML=bx(sessionTitle());
    $("pCount").textContent=(a.idx+1)+" / "+a.queue.length;
    $("pBar").style.width=Math.round(100*a.idx/a.queue.length)+"%";
    var h="";
    if(it.section) h+='<div class="section">'+bx(it.section)+'</div>';
    if(it.review) h+='<div class="tagline">🔁 חוזרים על תרגיל שהיה קשה</div>';
    h+='<p class="prompt">'+bx(it.prompt)+'</p>';
    if(it.passage) h+='<details class="passage" open><summary>📖 הקטע</summary><h4 dir="ltr">'+esc(it.passage.title)+'</h4><p dir="ltr" lang="en">'+esc(it.passage.text)+'</p></details>';
    if(it.dialog) h+='<div class="audio-row"><button class="sbtn" id="sayDlg" type="button">🔊 השיחה</button><button class="sbtn soft" id="sayDlgSlow" type="button">🐢 לאט</button></div>';
    if(it.say && !it.dialog){
      h+='<div class="audio-row"><button class="sbtn" id="sayBtn" type="button">🔊 הקשיבי</button><button class="sbtn soft" id="saySlow" type="button">🐢 לאט</button></div>';
      if(!canSpeak && it.hideText) h+='<p class="note">אין קול במכשיר הזה. בקשי ממבוגר להקריא: <span dir="ltr" lang="en">'+esc(Array.isArray(it.say)?it.say.join(" / "):it.say)+'</span></p>';
    }
    if(it.en && !(it.hideText)) h+='<div class="stim" dir="ltr" lang="en">'+esc(it.en)+'</div>';
    if(it.he) h+='<div class="stim he">'+esc(it.he)+'</div>';
    if(it.bank) h+='<div class="bank"><span>תיבת מילים:</span>'+it.bank.map(function(b){ return '<b>'+esc(b)+'</b>'; }).join("")+'</div>';
    if(it.kind==="mcq"){
      h+='<div class="opts'+(it.emoji?" emoji":"")+'">';
      it.options.forEach(function(o,i){
        h+='<div class="optwrap"><button type="button" class="opt" data-i="'+i+'" dir="'+(it.emoji?"ltr":(it.optDir||"ltr"))+'"'+(it.optDir==="ltr"?' lang="en"':'')+'>'+esc(o)+'</button>'+
          (it.speakOpts&&canSpeak?'<button type="button" class="mini" data-say="'+esc(o)+'" aria-label="השמעה">🔊</button>':'')+'</div>';
      });
      h+='</div>';
    } else if(it.kind==="type"){
      h+='<div class="typebox"><input id="ans" type="text" dir="ltr" lang="en" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="כתבי כאן באנגלית"><button class="btn" id="checkBtn" type="button">בדיקה</button></div>';
      h+='<p class="note kb">⌨️ אם המקלדת בעברית – החליפי לאנגלית 🌐</p>';
      h+='<div id="pattern" class="pattern" dir="ltr"></div>';
    } else if(it.kind==="order"){
      h+='<div class="opts emoji order">';
      it.options.forEach(function(o,i){ h+='<div class="optwrap"><button type="button" class="opt" data-i="'+i+'"><span class="num"></span>'+esc(o)+'</button></div>'; });
      h+='</div><div class="row"><button class="ghost" id="ordReset" type="button">מחיקה</button><button class="btn" id="ordCheck" type="button">בדיקה</button></div>';
    }
    h+='<div id="fb" class="fb" aria-live="polite"></div>';
    h+='<div class="row end"><button class="btn mint hidden" id="nextBtn" type="button">הבא ←</button></div>';
    $("pBody").innerHTML=h;
    wireItem(it);
    if(it.autoSay) setTimeout(function(){ sayItem(it,false); }, 350);
    var inp=$("ans"); if(inp) setTimeout(function(){ try{ inp.focus(); }catch(e){} }, 400);
    window.scrollTo(0,0);
  }
  function dialogLines(){ return EN.DIALOG.lines.map(function(l){ return { text:l[1], pitch:l[0]==="Mom"?1.15:0.85 }; }); }
  function sayItem(it, slow){
    if(it.dialog) return speak(dialogLines(), slow);
    return speak(Array.isArray(it.say)?it.say.map(function(s){return {text:s};}):it.say, slow);
  }
  function wireItem(it){
    function on(id,fn){ var el=$(id); if(el) el.addEventListener("click",fn); }
    on("sayBtn",function(){ sayItem(it,false); }); on("saySlow",function(){ sayItem(it,true); });
    on("sayDlg",function(){ sayItem(it,false); }); on("sayDlgSlow",function(){ sayItem(it,true); });
    on("nextBtn", next);
    Array.prototype.forEach.call(document.querySelectorAll(".mini"),function(b){ b.addEventListener("click",function(){ speak(b.getAttribute("data-say")); }); });
    if(it.kind==="mcq"){
      Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){
        b.addEventListener("click",function(){ if(cur.done) return; answerMcq(b); });
      });
    } else if(it.kind==="type"){
      on("checkBtn", answerType);
      $("ans").addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); if(cur.done) next(); else answerType(); } });
    } else if(it.kind==="order"){
      Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){
        b.addEventListener("click",function(){
          if(cur.done) return;
          var i=+b.getAttribute("data-i"), pos=cur.order.indexOf(i);
          if(pos>=0) return;
          if(cur.order.length>=it.answer.length) return;
          cur.order.push(i); paintOrder();
        });
      });
      on("ordReset",function(){ if(cur.done) return; cur.order=[]; paintOrder(); });
      on("ordCheck", answerOrder);
    }
  }
  function paintOrder(){
    Array.prototype.forEach.call(document.querySelectorAll(".order .opt"),function(b){
      var i=+b.getAttribute("data-i"), p=cur.order.indexOf(i);
      b.querySelector(".num").textContent=p>=0?String(p+1):"";
      b.classList.toggle("picked", p>=0);
    });
  }
  function feedback(html, cls){ var f=$("fb"); f.className="fb "+(cls||""); f.innerHTML=html; }
  var PRAISE=["כל הכבוד! 🌟","מעולה! ⭐","יופי! 💜","נכון! 🎉","את אלופה! 🏆"];
  function onWrong(extra){
    cur.tries++;
    if(cur.tries>=MAX_TRIES){ finishItem("failed"); return; }
    var it=cur.item, hint=it.hints&&it.hints[cur.tries-1];
    var msg='<b>עוד לא 🙂 נסי שוב</b> (ניסיון '+(cur.tries+1)+' מתוך '+MAX_TRIES+')';
    if(extra) msg+='<div class="hint">'+bx(extra)+'</div>';
    if(hint) msg+='<div class="hint">💡 '+bx(hint)+'</div>';
    feedback(msg,"bad");
  }
  function answerMcq(b){
    var it=cur.item, val=it.options[+b.getAttribute("data-i")];
    cur.picks.push(val);
    if(val===it.answer){ b.classList.add("ok"); finishItem(cur.tries===0?"first":"later"); return; }
    b.classList.add("no"); setTimeout(function(){ b.classList.remove("no"); }, 700);
    onWrong();
  }
  function patternFor(target, typed){
    var t=target.split(""), g=String(typed||"").toLowerCase().split("");
    return t.map(function(ch,i){ if(ch===" ") return "&nbsp;&nbsp;"; return (g[i]===ch.toLowerCase())?'<b>'+esc(ch)+'</b>':'<i>_</i>'; }).join(" ");
  }
  function answerType(){
    var it=cur.item, inp=$("ans"), raw=inp.value||"";
    if(!raw.trim()){ feedback("כתבי תשובה ואז לחצי «בדיקה» ✏️",""); return; }
    cur.picks.push(raw.trim());
    var n=norm(raw), ok=it.answers.some(function(a){ return norm(a)===n; });
    if(ok){ inp.classList.add("ok"); inp.disabled=true; finishItem(cur.tries===0?"first":"later"); return; }
    var extra="";
    var best=it.answers.reduce(function(m,a){ return Math.min(m, lev(norm(a),n)); }, 99);
    if(it.shortForm && norm(it.en)===n) extra="צריך לכתוב בצורה המקוצרת, עם גרש (').";
    else if(it.shortForm && n.indexOf("'")<0) extra="בצורה המקוצרת יש גרש (').";
    else if(best<=2) extra="כמעט! יש טעות קטנה באיות. בדקי כל אות.";
    inp.classList.add("no"); setTimeout(function(){ inp.classList.remove("no"); }, 700);
    onWrong(extra);
    if(!cur.done && it.spell && cur.tries>=2){ $("pattern").innerHTML=patternFor(it.answers[0], raw.trim()); }
    if(!cur.done){ try{ inp.focus(); inp.select(); }catch(e){} }
  }
  function answerOrder(){
    var it=cur.item;
    if(cur.order.length<it.answer.length){ feedback("בחרי "+it.answer.length+" תמונות לפי הסדר, ואז «בדיקה»",""); return; }
    var picked=cur.order.map(function(i){ return it.options[i]; });
    cur.picks.push(picked.join(" "));
    var right=0; for(var i=0;i<picked.length;i++) if(picked[i]===it.answer[i]) right++;
    if(right===it.answer.length){ finishItem(cur.tries===0?"first":"later"); return; }
    cur.order=[]; paintOrder();
    onWrong(right?("יש "+right+" תמונות במקום הנכון. הקשיבי שוב ונסי שוב."):"הקשיבי שוב מההתחלה.");
  }
  function finishItem(outcome){
    var it=cur.item; cur.done=true; cur.outcome=outcome;
    var ms=Math.min(Date.now()-cur.t0, 600000);
    var rec=sessionRec();
    var stim = it.en || it.he || (it.kind==="order" ? "סידור "+it.answer.length+" תמונות" : "") || "";
    if(it.hideText && it.say) stim = "🎧 "+(Array.isArray(it.say)?it.say.join(" / "):it.say);
    var row={ id:it.id, type:it.topic, at:Date.now(), prompt:it.prompt, stim:stim, he:it.he||"", picks:cur.picks.slice(), attempts:cur.tries+(outcome==="failed"?0:1), ms:ms, outcome:outcome, section:it.section||"" };
    if(outcome==="failed") row.attempts=MAX_TRIES;
    if(rec){ rec.items.push(row); rec.last=Date.now(); }
    updateReview(it, outcome);
    Array.prototype.forEach.call(document.querySelectorAll(".opt,#checkBtn,#ordCheck,#ordReset"),function(b){ b.disabled=true; });
    var inp=$("ans"); if(inp) inp.disabled=true;
    if(outcome==="failed"){
      feedback('<b>זה תרגיל קשה 💜</b><div class="hint">בקשי מאמא, מאבא או מהמורה סנדי שיסבירו לך אותו. הוא יחכה לך ברשימה בסוף.</div>',"help");
    } else {
      feedback('<b>'+PRAISE[Math.floor(Math.random()*PRAISE.length)]+'</b>'+(outcome==="first"?' <span class="star">⭐</span>':''),"good");
      if(it.say && !it.dialog && it.kind!=="order" && canSpeak && it.topic!=="listen") speak(Array.isArray(it.say)?it.say[0]:it.say);
    }
    db.active.idx++;
    save();
    $("nextBtn").classList.remove("hidden");
    try{ $("nextBtn").focus(); }catch(e){}
  }
  function next(){ renderItem(); }
  function finishSession(){
    var a=db.active, rec=sessionRec();
    if(rec){ rec.done=true; rec.end=Date.now(); }
    db.active=null; save();
    var items=rec?rec.items:[];
    var first=items.filter(function(x){return x.outcome==="first";}).length;
    var later=items.filter(function(x){return x.outcome==="later";}).length;
    var failed=items.filter(function(x){return x.outcome==="failed";});
    var h='<div class="card center"><div class="big">🎉</div><h2>סיימת!</h2>';
    h+='<p class="sum">'+items.length+' תרגילים · ⭐ '+first+' בניסיון הראשון · '+later+' אחרי עוד ניסיון</p></div>';
    if(a && a.mode==="mock"){
      var secs={}, order=[];
      items.forEach(function(x){ var s=x.section||"אחר"; if(!secs[s]){ secs[s]={n:0,ok:0}; order.push(s); } secs[s].n++; if(x.outcome!=="failed") secs[s].ok++; });
      h+='<div class="panel"><h3>לפי חלקי המבחן</h3>'+order.map(function(s){ return '<div class="secrow"><span>'+bx(s)+'</span><b>'+secs[s].ok+' / '+secs[s].n+'</b></div>'; }).join("")+'</div>';
    }
    if(failed.length){
      h+='<div class="panel help"><h3>💜 לבקש מאמא או מהמורה להסביר</h3><ul>'+failed.map(function(x){
        return '<li><span class="tp">'+bx(topicById(x.type).label)+'</span><div>'+bx(x.prompt)+'</div>'+(x.stim?'<div class="fstim" dir="'+(/[A-Za-z]/.test(x.stim)?'ltr':'rtl')+'">'+esc(x.stim)+'</div>':'')+'</li>';
      }).join("")+'</ul><p class="note">התרגילים האלה יחזרו בתרגול החכם בימים הקרובים.</p></div>';
    }
    h+='<div class="row"><button class="btn" id="again" type="button">עוד סבב</button><button class="ghost" id="toHome" type="button">לרשימת הנושאים</button></div>';
    $("pBar").style.width="100%";
    $("pBody").innerHTML=h;
    $("again").addEventListener("click",function(){ startSession(a?a.mode:"smart", a?a.topic:null); });
    $("toHome").addEventListener("click",function(){ goUp(); });
    syncNow();
  }

  /* ---------- screens + history ---------- */
  /* Hashes: (empty) menu, #topic=<id>, #mode=smart|mock, #words.
     Every in-app screen change pushes history; phone back and «חזרה»/«הפסקה» go one step.
     Leaving a session mid-way keeps db.active (and already-saved items). */
  function show(n){ ["home","play","words"].forEach(function(id){ $(id).classList.toggle("hidden", id!==n); }); window.scrollTo(0,0); }
  function parseHash(){
    var h=(location.hash||"").replace(/^#/,"");
    if(!h || h==="menu" || h==="home") return {view:"home"};
    if(h==="words") return {view:"words"};
    var m=h.match(/^topic=(.+)$/);
    if(m){ var id=decodeURIComponent(m[1]); return POOL[id] ? {view:"play", mode:"topic", topic:id} : {view:"home"}; }
    m=h.match(/^mode=(smart|mock)$/);
    if(m) return {view:"play", mode:m[1]};
    return {view:"home"};
  }
  function hashOf(r){
    if(!r || r.view==="home") return "";
    if(r.view==="words") return "#words";
    if(r.mode==="topic" && r.topic) return "#topic="+encodeURIComponent(r.topic);
    if(r.mode==="smart" || r.mode==="mock") return "#mode="+r.mode;
    return "";
  }
  function routeFromActive(){
    var a=db.active; if(!a) return {view:"home"};
    if(a.mode==="topic") return {view:"play", mode:"topic", topic:a.topic};
    return {view:"play", mode:a.mode};
  }
  function sessionMatches(r){
    var a=db.active;
    if(!a || !a.queue || a.idx>=a.queue.length) return false;
    if(r.mode==="topic") return a.mode==="topic" && a.topic===r.topic;
    return a.mode===r.mode;
  }
  function stopSpeech(){ try{ window.speechSynthesis&&window.speechSynthesis.cancel(); }catch(e){} }
  function applyRoute(r){
    r=r||{view:"home"};
    if(r.view==="words"){ stopSpeech(); renderWords(); show("words"); return; }
    if(r.view==="play"){
      if(sessionMatches(r)){ show("play"); renderItem(); return; }
      confirmLeave(function(){ startSession(r.mode, r.topic||null); });
      return;
    }
    stopSpeech(); renderHome(); show("home");
  }
  function go(r, how){
    r=r||{view:"home"};
    var url=location.pathname+hashOf(r);
    var state={eng:1, view:r.view, mode:r.mode||null, topic:r.topic||null};
    if(how==="replace"){
      if(history.replaceState) history.replaceState(state,"",url);
    } else if(how!=="silent"){
      var now=(location.pathname+(location.hash||"")).replace(/#$/,"");
      var want=url.replace(/#$/,"");
      if(now!==want && history.pushState) history.pushState(state,"",url);
    }
    applyRoute(r);
  }
  function goUp(){
    if(parseHash().view==="home") return;
    if(history.state && history.state.eng){ history.back(); return; }
    go({view:"home"}, "replace");
  }
  window.addEventListener("popstate", function(){ applyRoute(parseHash()); });

  function renderHome(){
    var left=daysUntil(TEST_DATE), cd="";
    if(left>1) cd="המבחן ביום רביעי 2.12 · עוד "+left+" ימים";
    else if(left===1) cd="המבחן מחר! את מוכנה 💪";
    else if(left===0) cd="המבחן היום – בהצלחה! 💜";
    else cd="Unit 1 · Hey! Friends";
    $("cd").textContent=cd;
    $("stars").textContent=db.stars?("⭐ "+db.stars):"";
    var st=topicStats();
    var res="";
    if(db.active && db.active.queue && db.active.idx<db.active.queue.length){
      res='<button class="resume" id="resume" type="button"><b>▶️ להמשיך מאיפה שעצרת</b><p>'+bx(sessionTitle())+' · '+(db.active.idx)+' / '+db.active.queue.length+'</p></button>';
    }
    $("resumeBox").innerHTML=res;
    var due=db.reviewBank.filter(function(r){ return r.item && (r.dueAt||0)<=Date.now(); }).length;
    $("smartNote").textContent= due ? ("מה שקשה לך, ו־"+due+" תרגילים לחזרה") : "מה שקשה לך יותר – יופיע יותר";
    var g="";
    GROUPS.forEach(function(gr){
      g+='<h2 class="gh">'+esc(gr[1])+'</h2><div class="grid">';
      TOPICS.filter(function(t){return t.grp===gr[0];}).forEach(function(t){
        var o=st[t.id], badge = !o.n ? '<span class="tag">חדש</span>' : '<span class="tag '+((o.first/o.n)>=0.8?"good":((o.first/o.n)<0.6?"warn":""))+'">'+Math.round(100*o.first/o.n)+'% בניסיון ראשון</span>';
        g+='<button class="topic" type="button" data-t="'+t.id+'"><span class="ti">'+t.ico+'</span><b>'+bx(t.label)+'</b>'+badge+'</button>';
      });
      g+='</div>';
    });
    $("topics").innerHTML=g;
    Array.prototype.forEach.call(document.querySelectorAll(".topic"),function(b){ b.addEventListener("click",function(){ go({view:"play", mode:"topic", topic:b.getAttribute("data-t")}, "push"); }); });
    var r=$("resume"); if(r) r.addEventListener("click",function(){ go(routeFromActive(), "push"); });
  }
  function confirmLeave(fn){
    /* starting something new keeps everything already answered; the unfinished queue is just replaced */
    if(db.active && db.active.idx<db.active.queue.length && db.active.idx>0){
      var rec=sessionRec(); if(rec) rec.done=true;
    }
    fn();
  }
  function renderWords(){
    var by={};
    WORDS.forEach(function(w){ (by[w.cat]=by[w.cat]||[]).push(w); });
    var must={}; EN.MUST.forEach(function(m){ must[m[0]]=1; });
    var h='<p class="note">⭐ = מילה שצריך לדעת לכתוב בעל פה. לחצי על מילה כדי לשמוע אותה.</p>';
    Object.keys(EN.CAT_HE).forEach(function(c){
      if(!by[c]) return;
      h+='<div class="panel"><h3>'+esc(EN.CAT_HE[c])+'</h3><div class="wl">';
      by[c].forEach(function(w){ h+='<button type="button" class="wrow" data-say="'+esc(w.en)+'"><span dir="ltr" lang="en">'+(must[w.en]?"⭐ ":"")+esc(w.en)+'</span><span>'+esc(w.he)+'</span></button>'; });
      h+='</div></div>';
    });
    $("wBody").innerHTML=h;
    Array.prototype.forEach.call(document.querySelectorAll(".wrow"),function(b){ b.addEventListener("click",function(){ speak(b.getAttribute("data-say")); }); });
  }

  $("btnSmart").addEventListener("click",function(){ go({view:"play", mode:"smart"}, "push"); });
  $("btnMock").addEventListener("click",function(){ go({view:"play", mode:"mock"}, "push"); });
  $("btnWords").addEventListener("click",function(){ go({view:"words"}, "push"); });
  $("wBack").addEventListener("click",function(){ goUp(); });
  $("pBack").addEventListener("click",function(){ goUp(); });

  renderHome(); show("home");
  /* deep link from the hub: ?topic=<id> or ?mode=smart|mock, or a hash on refresh */
  try{
    var qs=new URLSearchParams(location.search), tp=qs.get("topic"), md=qs.get("mode");
    var boot=parseHash();
    if(tp||md){
      var route = (tp && POOL[tp]) ? {view:"play", mode:"topic", topic:tp}
                : (md==="smart"||md==="mock") ? {view:"play", mode:md}
                : {view:"home"};
      if(history.replaceState) history.replaceState({eng:1, view:"home"},"",location.pathname);
      if(route.view!=="home") go(route, "push");
    } else if(boot.view!=="home"){
      if(!(history.state && history.state.eng)){
        var keep=location.hash;
        if(history.replaceState) history.replaceState({eng:1, view:"home"},"",location.pathname);
        if(history.pushState) history.pushState({eng:1, view:boot.view, mode:boot.mode||null, topic:boot.topic||null},"",location.pathname+keep);
      }
      applyRoute(boot);
    } else if(history.replaceState){
      history.replaceState({eng:1, view:"home"},"",location.pathname+location.search);
    }
  }catch(e){}
  cloudPull();
  document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="hidden" && (db.sessions.length)) cloudPush(); });

  window.EnglishApp={ db:function(){return db;}, POOL:POOL, TOPICS:TOPICS, buildMock:buildMock, buildSmart:buildSmart, norm:norm, mergeDb:mergeDb, parseHash:parseHash, go:go, goUp:goUp };
})();
