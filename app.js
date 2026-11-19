/* הלימודים של אמיליה
   קריאה בלבד ממפתחות האפליקציות הקיימות. לא מוחקים ולא דורסים תרגול. */
(function(){
  "use strict";

  var TZ = "Asia/Jerusalem";
  var DAY = 86400000;
  var REFRESH_AFTER = 7 * DAY;
  var PARENT_CODE = "2604"; /* זהה לאפליקציות הקיימות; לא מוצג במסך */
  var CLOUD = {
    url: "https://nrxhjzmmmzqjytmdgzjg.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yeGhqem1tbXpxanl0bWRnempnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDg3MTAsImV4cCI6MjEwNDEyNDcxMH0.5KYX69e1AyXqtHHRejFarK-r1yoXdmlpav2Oazb2WIs"
  };

  var MIVHAN_LABELS = {
    nl:"ישר המספרים", word:"שאלות מילוליות", seder:"סדר פעולות",
    col:"חיבור וחיסור במאונך", miss:"מספר חסר", mul:"כפל דו־ספרתי",
    fpic:"שברים בציור ובמילים", fnl:"שברים על ישר", fcmp:"השוואת שברים",
    fword:"שאלות עם שברים", fops:"חיבור וחיסור שברים", geo:"צלעות מקבילות וסמוכות",
    chart:"דיאגרמות", fexp:"הרחבה וצמצום שברים", wmin:"שלם פחות שבר",
    comp1:"השלמה לשלם", ineq:"אי־שוויונות (גדול, קטן, שווה)",
    zero1:"תכונות האפס והאחד", round:"כפל מספרים עגולים",
    poly:"מצולעים ואלכסונים", terms:"סכום, הפרש, מכפלה, מנה",
    divis:"סימני התחלקות", prime:"מספרים ראשוניים ופריקים",
    mixf:"שבר מדומה ↔ מספר מעורב"
  };
  var SEDER_LABELS = {
    1:"כפל וחילוק לפני חיבור וחיסור", 2:"כמה פעולות בלי סוגריים",
    8:"אותה דרגה – משמאל לימין", 3:"סוגריים", 9:"סוגריים בתוך סוגריים",
    4:"מספרים באלפים", 5:"כפל ב־0 וב־1, חילוק ב־1", 6:"מספר חסר", 7:"מצאי את הטעות"
  };
  var ARABIC_TYPES = {
    read_syllable:"קריאת הברה", read_word:"קריאת מילה", recognition:"זיהוי אות",
    haraka:"ניקוד", discrimination:"הבחנה בין אותיות", connected_form:"צורות מחוברות",
    translate_ar_he:"תרגום ערבית←עברית", translate_he_ar:"תרגום עברית←ערבית",
    matching:"התאמה", grammar:"דקדוק", cloze:"השלמת מילה", dialogue_choice:"שיחה",
    review:"חזרה", interleave:"ערבוב", true_false:"נכון/לא נכון",
    num_word:"מספרים: ספרה←מילה", num_read:"מספרים: מילה←ספרה",
    num_digit:"ספרות ערביות", num_count:"ספירה", num_arith:"חשבון במילים",
    color_swatch:"צבעים: ציור←מילה"
  };
  var ENGLISH_TOPICS = {
    voc_eh:"מילים: אנגלית ← עברית", voc_he:"מילים: עברית ← אנגלית", spell:"כתיבה בעל פה – 7 המילים",
    cloze:"השלמת משפטים – Cloze", article:"a / an / the", pron:"כינויי גוף – Pronouns",
    be:"הפועל to be: am, is, are", short:"צורות מקוצרות: I'm, he's", trans:"תרגום משפטים עם to be",
    match:"חיבור חצאי משפטים", read:"הבנת הנקרא", listen:"הבנת הנשמע: תמונות", dialog:"הבנת הנשמע: בן ואמא בפארק"
  };
  var HISUR_PAT = { borrow_zero:"הלוואה דרך אפס", multi_borrow:"הלוואות רבות", borrow:"הלוואה", no_borrow:"בלי הלוואה" };
  var KEFEL_MODE = { facts:"לוח הכפל", dd:"דו בדו", test:"מבחן קטן" };
  var GEO_SKILLS = [
    "זוויות: חד זווית","זוויות: ישר זווית","זוויות: קהה זווית",
    "צלעות: שווה צלעות","צלעות: שווה שוקיים","צלעות: שונה צלעות",
    "מרובעים: זיהוי","מרובעים: צלעות מקבילות","מרובעים: סמוכות ונגדיות",
    "מרובעים: תכונות","מרובעים: מי הוא גם מי"
  ];
  var APP_ICON = {
    mivhan:"⭐", kefel:"✖️", hiluk:"➗", hisur:"➖", seder:"🧮",
    geometry:"🔷", "mivhan-geo":"⬠", arabic:"🌙", english:"🔤", hebrew:"📖",
    science:"🔬", geography:"🗺️", bible:"📜"
  };
  var MIVHAN_GEO_URL = "hisur/mivhan/?section=geo";

  var APPS = [
    { id:"mivhan", key:"mivhan_emilia_v1", row:"emilia-mivhan", label:"תרגול למבחן", url:"hisur/mivhan/", parse:parseMivhan, catalog:Object.keys(MIVHAN_LABELS).map(function(k){return {id:"mivhan:"+k, label:MIVHAN_LABELS[k], app:"mivhan"};}) },
    { id:"kefel", key:"kefel_amelia_v1", row:"emilia", label:"לוח הכפל", url:"kefel/", parse:parseKefel, catalog:["facts","dd","test"].map(function(k){return {id:"kefel:"+k, label:KEFEL_MODE[k], app:"kefel"};}) },
    { id:"hiluk", key:"hiluk_amelia_v1", row:"emilia-hiluk", label:"חילוק ארוך", url:"hiluk/", parse:parseHiluk, catalog:[1,2,3,4,5].map(function(n){return {id:"hiluk:"+n, label:"חילוק · רמה "+n, app:"hiluk"};}) },
    { id:"hisur", key:"hisur_amelia_v1", row:"emilia-hisur", label:"חיסור במאונך", url:"hisur/", parse:parseHisur, catalog:Object.keys(HISUR_PAT).map(function(k){return {id:"hisur:"+k, label:HISUR_PAT[k], app:"hisur"};}) },
    { id:"seder", key:"seder_emilia_v1", row:"emilia-seder", label:"סדר פעולות", url:"hisur/seder/", parse:parseSeder, catalog:Object.keys(SEDER_LABELS).map(function(k){return {id:"seder:"+k, label:SEDER_LABELS[k], app:"seder"};}) },
    { id:"geometry", key:"geometry_emilia_v1", row:"emilia-geometry", label:"גיאומטריה", url:"geometry/", parse:parseGeometry, catalog:GEO_SKILLS.map(function(s){return {id:"geometry:"+s, label:s, app:"geometry"};}) },
    { id:"arabic", key:"arabic_amelia_v1", row:"emilia-arabic", label:"ערבית", url:"arabic/", parse:parseArabic, catalog:Object.keys(ARABIC_TYPES).map(function(k){return {id:"arabic:"+k, label:ARABIC_TYPES[k], app:"arabic"};}) },
    { id:"english", key:"english_amelia_v1", row:"emilia-english", label:"אנגלית", url:"english/", parse:parseEnglish, catalog:Object.keys(ENGLISH_TOPICS).map(function(k){return {id:"english:"+k, label:ENGLISH_TOPICS[k], app:"english"};}) }
  ];

  /* ---------- helpers ---------- */
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]; }); }
  function now(){ return Date.now(); }
  function jDate(ts){
    try{
      return new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(ts));
    }catch(e){
      var d=new Date(ts); return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
    }
  }
  function pad(n){ return (n<10?"0":"")+n; }
  function todayISO(){ return jDate(now()); }
  function daysUntil(iso){
    if(!iso) return null;
    var a=todayISO().split("-"), b=String(iso).split("-");
    if(a.length<3||b.length<3) return null;
    var da=Date.UTC(+a[0],+a[1]-1,+a[2]);
    var db=Date.UTC(+b[0],+b[1]-1,+b[2]);
    return Math.round((db-da)/DAY);
  }
  function countdownText(n){
    if(n===0) return "היום – בהצלחה! 💜";
    if(n===1) return "מחר";
    if(n===2) return "עוד יומיים";
    if(n>2) return "עוד "+n+" ימים";
    return "";
  }
  function isGeoMivhanTopic(topic){
    var t=String(topic||"");
    return t==="geo"||t==="poly"||t.indexOf("mivhan:geo")===0||t.indexOf("mivhan:poly")===0||t==="geo:par"||t==="geo:adj";
  }
  function urlForAppTopic(app, topic){
    if(app==="mivhan" && isGeoMivhanTopic(topic)) return MIVHAN_GEO_URL;
    if(app==="english"){
      var et=String(topic||"").replace(/^english:/,"");
      return ENGLISH_TOPICS[et] ? "english/?topic="+encodeURIComponent(et) : "english/";
    }
    var a=appById(app);
    return a&&a.url ? a.url : "#";
  }
  function fmtDay(ts){
    try{ return new Intl.DateTimeFormat("he-IL",{timeZone:TZ,day:"numeric",month:"numeric"}).format(new Date(ts)); }
    catch(e){ return jDate(ts); }
  }
  function fmtWhen(ts){
    try{ return new Intl.DateTimeFormat("he-IL",{timeZone:TZ,day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(ts)); }
    catch(e){ return jDate(ts); }
  }
  function fmtDur(ms){
    ms=Math.max(0,+ms||0);
    if(ms<20000) return "פחות מחצי דקה";
    var m=ms/60000;
    if(m<0.75) return "חצי דקה";
    var h=Math.round(m*2)/2;
    if(h===1) return "דקה אחת";
    if(h<60) return h+" דקות";
    return Math.round(h/60*10)/10+" שע׳";
  }
  function outcomeOf(v){
    if(v==="first"||v==="correct_first") return "first";
    if(v==="fixed"||v==="self"||v==="later"||v==="correct_after_retries"||v==="within3") return "retry";
    if(v==="adult"||v==="failed"||v==="needs_help"||v==="guided"||v==="help") return "fail";
    return v||"unknown";
  }
  var _uid = 0;
  function ev(o){
    return {
      app:o.app, at:+o.at||0, topic:o.topic, topicLabel:o.topicLabel||o.topic,
      question:o.question||"", answers:Array.isArray(o.answers)?o.answers:[],
      attempts:+o.attempts||1, ms:+o.ms||0, outcome:outcomeOf(o.outcome),
      hasQuestion:!!(o.question|| (o.answers&&o.answers.length)),
      uid:o.uid || ("e-"+(_uid++))
    };
  }
  function uniqueKey(e){
    if(e.uid) return e.uid;
    return [e.app, e.at, e.topic, e.question, (e.answers||[]).join(","), e.outcome, e.attempts].join("|");
  }
  function readLocal(key){
    try{
      var raw=localStorage.getItem(key);
      if(!raw) return null;
      var d=JSON.parse(raw);
      return d && typeof d==="object" ? d : null;
    }catch(e){ return null; }
  }
  function asObj(data){
    if(!data) return null;
    if(typeof data==="string"){ try{ data=JSON.parse(data); }catch(e){ return null; } }
    return data && typeof data==="object" ? data : null;
  }

  /* ---------- cloud (GET only) ---------- */
  function cloudHeaders(){
    return { "apikey":CLOUD.key, "Authorization":"Bearer "+CLOUD.key, "Accept":"application/json" };
  }
  function pullCloud(row){
    if(!row) return Promise.resolve({ data:null, updated:null, status:"empty" });
    var url=CLOUD.url+"/rest/v1/kefel_state?id=eq."+encodeURIComponent(row)+"&select=data,updated_at";
    var init={ method:"GET", headers:cloudHeaders() };
    var timer=null;
    try{
      if(typeof AbortController==="function"){
        var ctl=new AbortController();
        init.signal=ctl.signal;
        timer=setTimeout(function(){ try{ ctl.abort(); }catch(e){} }, 10000);
      }
    }catch(e){}
    return fetch(url, init)
      .then(function(r){
        if(timer) clearTimeout(timer);
        if(!r.ok) throw new Error("cloud "+r.status);
        return r.json();
      }, function(e){
        if(timer) clearTimeout(timer);
        throw e;
      })
      .then(function(rows){
        if(!rows||!rows[0]) return { data:null, updated:null, status:"empty" };
        var data=asObj(rows[0].data);
        if(!data) return { data:null, updated:rows[0].updated_at||null, status:"empty" };
        return { data:data, updated:rows[0].updated_at||null, status:"ok" };
      })
      .catch(function(){ return { data:null, updated:null, status:"error" }; });
  }

  function histLen(d){ return d && Array.isArray(d.hist) ? d.hist.length : 0; }
  function logLen(d){ return d && Array.isArray(d.log) ? d.log.length : 0; }
  function sessLen(d){ return d && Array.isArray(d.sessions) ? d.sessions.length : 0; }
  function ansOf(d){ return d && typeof d.answers==="number" ? d.answers : 0; }

  function mergeHist(a,b){
    a=a||{}; b=b||{};
    var m={};
    (a.hist||[]).concat(b.hist||[]).forEach(function(r){
      if(!r) return;
      var id=r.id || (r.date+"|"+(r.items&&r.items.length)+"|"+(r.n||""));
      if(!m[id]) m[id]=r;
      else {
        var x=m[id], ia=(x.items||[]).length, ib=(r.items||[]).length;
        if(ib>ia) m[id]=r;
        else if(ib===ia && !!x.partial && !r.partial) m[id]=r;
        else if(ib===ia && (r.upd||0)>(x.upd||0)) m[id]=r;
      }
    });
    var out={};
    for(var k in a) out[k]=a[k];
    for(var k2 in b) if(out[k2]==null) out[k2]=b[k2];
    out.hist=Object.keys(m).map(function(k){ return m[k]; })
      .sort(function(x,y){ return String(y.date||"").localeCompare(String(x.date||"")); });
    return out;
  }
  function mergeLog(a,b,logKey){
    a=a||{}; b=b||{};
    var out={};
    for(var k in a) out[k]=a[k];
    for(var k2 in b){
      if(k2===logKey) continue;
      if(Array.isArray(out[k2]) && Array.isArray(b[k2])){
        if(b[k2].length>out[k2].length) out[k2]=b[k2];
      } else if(typeof out[k2]==="number" && typeof b[k2]==="number"){
        out[k2]=Math.max(out[k2], b[k2]);
      } else if(out[k2]==null) out[k2]=b[k2];
    }
    var seen={}, logs=[];
    (a[logKey]||[]).concat(b[logKey]||[]).forEach(function(e){
      if(!e) return;
      var id=(e.t||e.at||"")+"|"+(e.k||e.key||"")+"|"+(e.ms||"")+"|"+(e.result||e.outcome||"");
      if(seen[id]) return; seen[id]=1; logs.push(e);
    });
    logs.sort(function(x,y){ return (x.t||x.at||0)-(y.t||y.at||0); });
    out[logKey]=logs;
    return out;
  }
  function mergeSessions(a,b){
    a=a||{}; b=b||{};
    var out={};
    for(var k in a) out[k]=a[k];
    for(var k2 in b) if(k2!=="sessions" && out[k2]==null) out[k2]=b[k2];
    if(typeof a.answers==="number" || typeof b.answers==="number")
      out.answers=Math.max(a.answers||0,b.answers||0);
    var seen={}, list=[];
    (a.sessions||[]).concat(b.sessions||[]).forEach(function(s){
      if(!s) return;
      var id=s.start||s.id||JSON.stringify(s).slice(0,80);
      if(seen[id]){
        var prev=seen[id];
        var ia=(prev.items||[]).length, ib=(s.items||[]).length;
        if(ib>ia){ list[list.indexOf(prev)]=s; seen[id]=s; }
      } else { seen[id]=s; list.push(s); }
    });
    out.sessions=list;
    return out;
  }
  function mergeApp(app, local, cloud){
    if(!local && !cloud) return null;
    if(!cloud) return local;
    if(!local) return cloud;
    if(app.id==="mivhan"||app.id==="seder") return mergeHist(local, cloud);
    if(app.id==="kefel"||app.id==="hiluk") return mergeLog(local, cloud, "log");
    if(app.id==="arabic"||app.id==="geometry"||app.id==="hisur"||app.id==="english") return mergeSessions(local, cloud);
    var ls=ansOf(local)+logLen(local)+histLen(local)+sessLen(local);
    var cs=ansOf(cloud)+logLen(cloud)+histLen(cloud)+sessLen(cloud);
    return cs>ls ? cloud : local;
  }

  /* ---------- parsers ---------- */
  function parseKefel(db){
    var events=[];
    (db&&db.log||[]).forEach(function(e){
      if(!e) return;
      var mode=e.mode||e.type||"facts";
      events.push(ev({
        app:"kefel", at:e.t, topic:"kefel:"+mode, topicLabel:KEFEL_MODE[mode]||mode,
        question: String(e.k||"").replace(/x/i," × ") + " = ?",
        answers:e.answers||[], attempts:e.attempts||1, ms:e.ms, outcome:e.result
      }));
    });
    return events;
  }
  function parseHiluk(db){
    var events=[];
    (db&&db.log||[]).forEach(function(e){
      if(!e) return;
      var lvl=e.level||1;
      events.push(ev({
        app:"hiluk", at:e.t, topic:"hiluk:"+lvl, topicLabel:"חילוק · רמה "+lvl,
        question: (e.div!=null && e.dvs!=null) ? (e.div+" : "+e.dvs) : (e.key||""),
        answers:e.answers||[], attempts:e.tries||e.attempts||1, ms:e.ms, outcome:e.outcome
      }));
    });
    return events;
  }
  function parseHisur(db){
    var events=[];
    function addProb(p, at){
      if(!p||!p.done) return;
      var oc=p.guided?"fail":(p.firstTry?"first":"retry");
      events.push(ev({
        app:"hisur", at:at, topic:"hisur:"+(p.pattern||"borrow"),
        topicLabel:HISUR_PAT[p.pattern]||p.pattern||"חיסור",
        question: (p.minuend!=null && p.subtrahend!=null) ? (p.minuend+" − "+p.subtrahend) : "",
        answers:[], attempts:p.attempts||1, ms:p.ms, outcome:oc
      }));
    }
    if(db&&db.activeSession&&Array.isArray(db.activeSession.problems)){
      db.activeSession.problems.forEach(function(p){ addProb(p, p.ms? (db.activeSession.last||db.activeSession.start||now()) : (db.activeSession.start||now())); });
    }
    (db&&db.sessions||[]).forEach(function(s){
      if(s.problems){ s.problems.forEach(function(p){ addProb(p, s.start||s.last); }); return; }
      var pats=s.patterns||{};
      Object.keys(pats).forEach(function(k){
        var m=pats[k]||{};
        var n=m.n||0, first=m.first||0, guided=m.guided||0;
        var rest=Math.max(0, n-first-guided);
        var i;
        for(i=0;i<first;i++) events.push(ev({app:"hisur",at:s.start,topic:"hisur:"+k,topicLabel:HISUR_PAT[k]||k,question:"",answers:[],attempts:1,ms:0,outcome:"first"}));
        for(i=0;i<rest;i++) events.push(ev({app:"hisur",at:s.start,topic:"hisur:"+k,topicLabel:HISUR_PAT[k]||k,question:"",answers:[],attempts:2,ms:0,outcome:"retry"}));
        for(i=0;i<guided;i++) events.push(ev({app:"hisur",at:s.start,topic:"hisur:"+k,topicLabel:HISUR_PAT[k]||k,question:"",answers:[],attempts:3,ms:0,outcome:"fail"}));
      });
      /* session time is attached to the session as a whole; split later in stats if no item ms */
      if(s.ms && events.length){
        var mine=events.filter(function(e){ return e.app==="hisur" && e.at===(s.start||0) && !e.ms; });
        if(mine.length){ var share=Math.round((s.ms||s.totalMs||0)/mine.length); mine.forEach(function(e){ e.ms=share; }); }
      }
    });
    return events;
  }
  function parseMivhan(db){
    var events=[];
    (db&&db.hist||[]).forEach(function(r){
      var base=r.date ? Date.parse(r.date) : 0;
      (r.items||[]).forEach(function(x,i){
        var q=x.math||x.text||x.eq||x.code||"";
        events.push(ev({
          app:"mivhan", at:base+i, topic:"mivhan:"+(x.topic||"other"),
          topicLabel:MIVHAN_LABELS[x.topic]||x.topic||"תרגול למבחן",
          question:q, answers:x.entries||[], attempts:x.tries||1,
          ms:Math.min(x.total_ms||0, 180000), outcome:x.outcome
        }));
      });
    });
    return events;
  }
  function parseSeder(db){
    var events=[];
    (db&&db.hist||[]).forEach(function(r){
      var base=r.date ? Date.parse(r.date) : 0;
      (r.items||[]).forEach(function(x,i){
        events.push(ev({
          app:"seder", at:base+i, topic:"seder:"+(x.type||""),
          topicLabel:SEDER_LABELS[x.type]||("סוג "+x.type),
          question:x.expr||x.display||"", answers:x.entries||[],
          attempts:x.tries||1, ms:Math.min(x.total_ms||0,180000), outcome:x.outcome
        }));
      });
    });
    return events;
  }
  function parseArabic(db){
    var events=[];
    (db&&db.sessions||[]).forEach(function(s){
      (s.items||[]).forEach(function(x){
        var q=[x.prompt,x.stim].filter(Boolean).join(" · ");
        events.push(ev({
          app:"arabic", at:x.at||s.start, topic:"arabic:"+(x.type||"other"),
          topicLabel:ARABIC_TYPES[x.type]||x.type||"ערבית",
          question:q, answers:x.picks||[], attempts:x.attempts||1, ms:x.ms, outcome:x.outcome
        }));
      });
    });
    return events;
  }
  function parseEnglish(db){
    var events=[];
    (db&&db.sessions||[]).forEach(function(s){
      (s.items||[]).forEach(function(x,i){
        var q=[x.prompt,x.stim].filter(Boolean).join(" · ");
        events.push(ev({
          app:"english", at:x.at||((s.start||0)+i), topic:"english:"+(x.type||"other"),
          topicLabel:ENGLISH_TOPICS[x.type]||x.type||"אנגלית",
          question:q, answers:x.picks||[], attempts:x.attempts||1, ms:Math.min(x.ms||0,180000), outcome:x.outcome,
          uid:"en-"+(s.id||s.start)+"-"+i
        }));
      });
    });
    return events;
  }
  function parseGeometry(db){
    var events=[];
    (db&&db.sessions||[]).forEach(function(s){
      (s.items||[]).forEach(function(x){
        events.push(ev({
          app:"geometry", at:x.at||s.start, topic:"geometry:"+(x.skill||x.topic||"tri"),
          topicLabel:x.skill||x.topic||"גיאומטריה",
          question:x.q || (x.skill ? ("תרגיל ב«"+x.skill+"»") : ""),
          answers:x.picks||[], attempts:x.attempts||1, ms:(x.sec||0)*1000, outcome:x.outcome
        }));
      });
    });
    return events;
  }

  /* ---------- load all (memory only, never write existing keys) ---------- */
  var STATE = { events:[], sources:{}, catalog:[], cloud:{}, ready:false, period:"week" };

  function loadAll(){
    var locals={};
    APPS.forEach(function(app){ locals[app.id]=readLocal(app.key); });
    return Promise.all(APPS.map(function(app){
      if(!app.row) return Promise.resolve({ id:app.id, cloud:null });
      return pullCloud(app.row).then(function(c){ return { id:app.id, cloud:c }; });
    })).then(function(rows){
      var events=[], catalog=[], sources={};
      APPS.forEach(function(app,i){
        var pulled=rows[i]&&rows[i].cloud;
        var cloud=pulled&&pulled.data;
        var cloudStatus=(pulled&&pulled.status)||"error";
        var merged=mergeApp(app, locals[app.id], cloud);
        var evs=merged ? app.parse(merged) : [];
        var cloudEvs=cloud ? app.parse(cloud) : [];
        events=events.concat(evs);
        catalog=catalog.concat(app.catalog||[]);
        sources[app.id]={
          label:app.label, key:app.key, deviceOnly:!!app.deviceOnly,
          hasLocal:!!locals[app.id], hasCloud:cloudStatus==="ok",
          cloudStatus:cloudStatus,
          cloudUpdated:pulled&&pulled.updated,
          cloudEvents:cloudEvs.length,
          events:evs.length,
          parsed:true
        };
      });
      /* unique events */
      var seen={}, uniq=[];
      events.sort(function(a,b){ return b.at-a.at; });
      events.forEach(function(e){
        var k=uniqueKey(e);
        if(seen[k]) return; seen[k]=1; uniq.push(e);
      });
      STATE.events=uniq;
      STATE.catalog=catalog;
      STATE.sources=sources;
      STATE.ready=true;
      return STATE;
    });
  }

  /* ---------- period stats ---------- */
  function rangeOf(period, t){
    t=t||now();
    var end=t;
    var start= period==="month" ? (end-30*DAY) : (end-7*DAY);
    var len=end-start;
    return { start:start, end:end, prevStart:start-len, prevEnd:start, label: period==="month"?"30 הימים האחרונים":"7 הימים האחרונים" };
  }
  function inRange(at, a, b){ return at>=a && at<b; }

  function summarize(events){
    var s={ n:0, first:0, retry:0, fail:0, ms:0, attempts:0, topics:{}, apps:{} };
    events.forEach(function(e){
      s.n++; s.ms+=e.ms||0; s.attempts+=e.attempts||1;
      if(e.outcome==="first") s.first++;
      else if(e.outcome==="retry") s.retry++;
      else if(e.outcome==="fail") s.fail++;
      var t=s.topics[e.topic]||(s.topics[e.topic]={id:e.topic,label:e.topicLabel,app:e.app,n:0,first:0,retry:0,fail:0,ms:0,attempts:0,lastAt:0});
      t.n++; t.ms+=e.ms||0; t.attempts+=e.attempts||1; t.lastAt=Math.max(t.lastAt,e.at||0);
      if(e.outcome==="first") t.first++; else if(e.outcome==="retry") t.retry++; else if(e.outcome==="fail") t.fail++;
      var a=s.apps[e.app]||(s.apps[e.app]={id:e.app,n:0,first:0,retry:0,fail:0,ms:0,attempts:0,lastAt:0});
      a.n++; a.ms+=e.ms||0; a.attempts+=e.attempts||1; a.lastAt=Math.max(a.lastAt,e.at||0);
      if(e.outcome==="first") a.first++; else if(e.outcome==="retry") a.retry++; else if(e.outcome==="fail") a.fail++;
    });
    function enrich(o){
      o.ok=o.first+o.retry;
      o.acc=o.n?Math.round(100*o.ok/o.n):null;
      o.firstPct=o.n?Math.round(100*o.first/o.n):null;
      o.avgAtt=o.n?(o.attempts/o.n):null;
      o.hardScore=o.n? (o.fail/o.n)*2 + (1-(o.first/o.n)) + (((o.avgAtt||1)-1)/2) : 0;
    }
    enrich(s);
    Object.keys(s.topics).forEach(function(k){ enrich(s.topics[k]); });
    Object.keys(s.apps).forEach(function(k){ enrich(s.apps[k]); });
    return s;
  }
  function trend(cur, prev, key){
    if(cur==null || prev==null) return {dir:"flat", text:"אין השוואה"};
    var d=cur-prev;
    if(Math.abs(d)<1) return {dir:"flat", text:"בלי שינוי"};
    var sign=d>0?"+":"";
    return { dir:d>0?"up":"down", text:sign+d+(key==="acc"?" נק׳":"") };
  }
  function allTimeTopics(){
    return summarize(STATE.events).topics;
  }
  function refreshList(){
    var t=now(), out=[];
    var topics=allTimeTopics();
    Object.keys(topics).forEach(function(id){
      var o=topics[id];
      if(o.n<5) return;
      if((o.acc||0)<80 && (o.firstPct||0)<75) return;
      if(!o.lastAt || (t-o.lastAt)<REFRESH_AFTER) return;
      var days=Math.round((t-o.lastAt)/DAY);
      out.push({ topic:o, days:days });
    });
    out.sort(function(a,b){ return b.days-a.days; });
    return out;
  }
  function hardEasy(stat){
    var arr=Object.keys(stat.topics).map(function(k){ return stat.topics[k]; });
    arr=arr.filter(function(t){ return t.n>=2; });
    arr.sort(function(a,b){ return b.hardScore-a.hardScore; });
    return arr;
  }
  function notPracticed(stat){
    var have={};
    Object.keys(stat.topics).forEach(function(k){ have[k]=1; });
    return STATE.catalog.filter(function(c){ return !have[c.id]; });
  }
  function hardQuestions(events){
    return events.filter(function(e){
      return e.hasQuestion && (e.outcome==="retry"||e.outcome==="fail") && (e.attempts>=2 || e.outcome==="fail");
    }).sort(function(a,b){ return b.at-a.at; });
  }
  function appById(id){
    for(var i=0;i<APPS.length;i++) if(APPS[i].id===id) return APPS[i];
    return null;
  }

  function recommendations(periodStat){
    var recs=[], seen={};
    function add(kind, topic, why, extra){
      if(!topic||seen[topic.id]) return;
      seen[topic.id]=1;
      recs.push({ kind:kind, topic:topic, why:why, extra:extra||"" });
    }
    hardEasy(periodStat).filter(function(t){ return t.fail>0 || (t.firstPct!=null && t.firstPct<70); }).slice(0,5)
      .forEach(function(t){ add("hard", t, "קשה לה עכשיו — כדאי לחזק"); });
    refreshList().slice(0,5).forEach(function(r){
      add("refresh", r.topic, "שלטה בזה, אבל לא תרגלה "+r.days+" ימים");
    });
    /* upcoming school topics */
    var upcoming=[
      { id:"mivhan:mixf", why:"הנושא החדש מהכיתה (18.11): מספר מעורב ושבר גדול משלם" },
      { id:"mivhan:fops", why:"חיזוק: חיבור שברים עם מכנים שונים" },
      { id:"mivhan:fnl", why:"שבר על ישר המספרים מופיע בהכנה למבדק" },
      { id:"arabic:color_swatch", why:"חזרה על הצבעים בערבית מהשיעור ב־18.11" },
      { id:"geometry:מרובעים: צלעות מקבילות", why:"שיעור המקבילית ב־20.11" },
      { id:"english:spell", why:"מבחן אנגלית ב־2.12: 7 מילים שצריך לכתוב בעל פה" },
      { id:"english:voc_eh", why:"מבחן אנגלית ב־2.12: המילים של Unit 1" },
      { id:"english:be", why:"מבחן אנגלית ב־2.12: הפועל to be וצורות מקוצרות" },
      { id:"english:pron", why:"מבחן אנגלית ב־2.12: כינויי גוף" }
    ];
    var all=allTimeTopics();
    upcoming.forEach(function(u){
      var t=periodStat.topics[u.id]||all[u.id]||(function(){
        var c=STATE.catalog.filter(function(x){ return x.id===u.id; })[0];
        return c?{id:c.id,label:c.label,app:c.app,n:0,acc:null,firstPct:null}:null;
      })();
      if(t) add("upcoming", t, u.why);
    });
    return recs;
  }

  function bottomLine(cur, prev, period){
    var word=period==="month"?"החודש":"השבוע";
    if(!cur.n){
      return { bottom: word+" עוד לא נשמר תרגול במכשיר הזה (או בענן).", points:["אחרי שאמיליה מתרגלת באפליקציות, הסיכום יופיע כאן."] };
    }
    var points=[];
    var acc=cur.acc, first=cur.firstPct;
    var tAcc=trend(acc, prev&&prev.n?prev.acc:null, "acc");
    var tN=trend(cur.n, prev&&prev.n, "n");
    var bottom=word+" אמיליה פתרה "+cur.n+" תרגילים, "+(first!=null?first+"%":"—")+" מהם נכון כבר בניסיון הראשון.";
    if(prev&&prev.n){
      bottom+=" דיוק כולל "+(acc!=null?acc+"%":"—")+" ("+tAcc.text+" לעומת התקופה הקודמת).";
    }
    var hard=hardEasy(cur);
    if(hard.length && (hard[0].fail>0 || (hard[0].firstPct!=null && hard[0].firstPct<70))){
      points.push("הכי כדאי לחזק: "+hard[0].label+".");
    }
    if(hard.length && hard[hard.length-1].firstPct>=80){
      points.push("חזק אצלה: "+hard[hard.length-1].label+".");
    }
    var ref=refreshList();
    if(ref.length) points.push("לרענון (כדי לא לשכוח): "+ref.slice(0,3).map(function(r){ return r.topic.label; }).join(", ")+".");
    var never=notPracticed(cur);
    if(never.length) points.push(word+" לא תרגלה "+never.length+" סוגי תרגילים שיש באפליקציות.");
    if(tN.dir==="down" && prev&&prev.n) points.push("היקף התרגול ירד לעומת התקופה הקודמת.");
    if(tAcc.dir==="up") points.push("הדיוק עלה לעומת התקופה הקודמת — יפה.");
    return { bottom:bottom, points:points, tAcc:tAcc, tN:tN };
  }

  /* ---------- UI ---------- */
  function show(name){
    ["home","pinScreen","parent","reinforce"].forEach(function(id){
      $(id).classList.toggle("hidden", id!==name);
    });
    window.scrollTo(0,0);
  }
  function weekdayHe(iso){
    var map=["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
    var p=iso.split("-"); var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2],10,0,0));
    /* weekday in Israel: iso date at noon JLM */
    try{
      var w=new Intl.DateTimeFormat("en-US",{timeZone:TZ,weekday:"short"}).format(new Date(iso+"T12:00:00+02:00"));
      var m={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
      return "יום "+(map[m[w]]||"");
    }catch(e){ return ""; }
  }

  function starsOf(app, db){
    if(!db) return 0;
    if(typeof db.stars==="number" && db.stars>0) return db.stars;
    if(app.id==="arabic" && Array.isArray(db.sessions)){
      return db.sessions.reduce(function(s,x){ return s+(x.stars||0); },0);
    }
    return typeof db.stars==="number" ? db.stars : 0;
  }
  function totalStarsLocal(){
    var n=0;
    APPS.forEach(function(app){ n+=starsOf(app, readLocal(app.key)); });
    return n;
  }
  function findResume(){
    var cands=[];
    var m=readLocal("mivhan_emilia_v1");
    if(m&&m.active&&m.active.ses){
      var geo=m.active.exam==="geo"||isGeoMivhanTopic(m.active.only);
      if(!geo && Array.isArray(m.active.ses)){
        var q=m.active.ses[m.active.idx]||m.active.ses[0];
        if(q && (q.topic==="geo"||q.topic==="poly")) geo=true;
      }
      var at=0;
      try{ at=m.active.id?parseInt(m.active.id,36)||0:0; }catch(e){}
      cands.push({ app:"mivhan", label: geo?"צלעות ומצולעים":"תרגול למבחן", url: geo?MIVHAN_GEO_URL:"hisur/mivhan/", at:at });
    }
    var s=readLocal("seder_emilia_v1");
    if(s&&s.active&&s.active.ses){
      var at2=0;
      try{ at2=s.active.id?parseInt(s.active.id,36)||0:0; }catch(e){}
      cands.push({ app:"seder", label:"סדר פעולות", url:"hisur/seder/", at:at2 });
    }
    var h=readLocal("hisur_amelia_v1");
    if(h&&h.activeSession&&!h.activeSession.finished){
      cands.push({ app:"hisur", label:"חיסור במאונך", url:"hisur/", at:h.activeSession.start||0 });
    }
    var k=readLocal("hiluk_amelia_v1");
    if(k&&Array.isArray(k.sessions)&&k.sessions.length){
      var last=k.sessions[k.sessions.length-1];
      if(last&&!last.done&&(last.q||0)<(last.size||20)){
        cands.push({ app:"hiluk", label:"חילוק ארוך", url:"hiluk/", at:last.last||last.start||0 });
      }
    }
    cands.sort(function(a,b){ return (b.at||0)-(a.at||0); });
    return cands[0]||null;
  }
  function renderHomeBar(starCount){
    var bar=$("homeBar"); if(!bar) return;
    var n=typeof starCount==="number" ? starCount : totalStarsLocal();
    var html="";
    if(n>0) html+='<div class="stars-line" id="starLine">⭐ '+n+' כוכבים</div>';
    else html+='<div class="stars-line hidden" id="starLine"></div>';
    var r=findResume();
    if(r) html+='<a class="resume-btn" id="btnResume" href="'+esc(r.url)+'"><b>▶️ להמשיך מאיפה שעצרת</b><p>'+esc(r.label)+'</p></a>';
    bar.innerHTML=html;
  }
  function refreshStarsFromCloud(){
    var locals={};
    APPS.forEach(function(app){ locals[app.id]=readLocal(app.key); });
    return Promise.all(APPS.map(function(app){
      if(!app.row) return Promise.resolve({app:app, db:locals[app.id]});
      return pullCloud(app.row).then(function(c){
        var cloud=c&&c.data;
        var merged=mergeApp(app, locals[app.id], cloud);
        return {app:app, db:merged};
      });
    })).then(function(rows){
      var n=0;
      rows.forEach(function(r){ n+=starsOf(r.app, r.db); });
      var el=$("starLine");
      if(n>0 && el){ el.textContent="⭐ "+n+" כוכבים"; el.classList.remove("hidden"); }
      return n;
    }).catch(function(){ return null; });
  }

  function renderHome(){
    var D=window.LIMUDIM||{};
    $("weekLabel").innerHTML = esc(D.weekNote||"") + (D.weekLabel? ' · <span dir="ltr">'+esc(D.weekLabel)+'</span>' : "");
    var html="";
    (D.thisWeek||[]).forEach(function(e){
      var left=daysUntil(e.date);
      if(e.date && left!=null && left<0) return;
      var cd="";
      if(e.countdown && left!=null && left>=0){
        cd='<div class="cd'+(left===0?" today":"")+'">'+esc(countdownText(left))+'</div>';
      }
      html+='<div class="card event'+(e.highlight?" hot":"")+(left===0?" today":"")+'">'+
        '<div class="when"><b>'+esc(e.dateLabel)+'</b><small>'+esc(e.weekday||"")+'</small></div>'+
        '<div class="evtxt"><h3>'+esc(e.title)+'</h3><p>'+esc(e.detail||"")+'</p>'+cd+'</div></div>';
    });
    (D.standing||[]).forEach(function(s){
      html+='<div class="card stand"><span class="ico">📐</span><div><b>'+esc(s.title)+'</b><div class="note">'+esc(s.when)+(s.detail?" · "+s.detail:"")+'</div></div></div>';
    });
    $("weekBox").innerHTML=html;

    var ghtml="";
    (D.groups||[]).forEach(function(g){
      ghtml+='<section class="sec" data-group="'+esc(g.id||"")+'"><h2>'+esc((g.emoji?g.emoji+" ":"")+g.title)+'</h2><div class="grid">';
      (g.items||[]).forEach(function(it){
        var soon=it.status==="soon";
        var ico=APP_ICON[it.id]||"✨";
        var tag=soon?'<span class="tag soon">בקרוב</span>':'<span class="tag mint">תרגול</span>';
        if(it.new) tag+='<span class="tag new">חדש ✨</span>';
        if(it.badge && !soon) tag+='<span class="tag">'+esc(it.badge)+'</span>';
        var inner='<div class="ico">'+ico+'</div><h3>'+esc(it.title)+'</h3><p>'+esc(it.subtitle||"")+'</p><div class="meta">'+tag+'</div>';
        if(soon) ghtml+='<div class="app soon" aria-disabled="true">'+inner+'</div>';
        else ghtml+='<a class="app" href="'+esc(it.url)+'">'+inner+'</a>';
      });
      ghtml+='</div></section>';
    });
    $("groups").innerHTML=ghtml;
    renderHomeBar();
    refreshStarsFromCloud();
  }

  function pct(n){ return n==null?"—":(n+"%"); }
  function trendTag(tr){
    if(!tr) return "";
    return '<span class="trend '+tr.dir+'">'+esc(tr.text)+'</span>';
  }

  function cloudStatusLine(sources){
    var err=0, empty=0, ok=0, n=0, apps=0;
    APPS.forEach(function(app){
      if(app.deviceOnly) return;
      apps++;
      var s=(sources||{})[app.id]||{};
      if(s.cloudStatus==="ok"){ ok++; n+=s.cloudEvents||0; }
      else if(s.cloudStatus==="empty") empty++;
      else err++;
    });
    if(ok && err) return { kind:"ok", text:"נמשכו מהענן "+n+" תרגילים מ־"+ok+" אפליקציות. לחלק מהאפליקציות אין חיבור לענן." };
    if(ok) return { kind:"ok", text:"נמשכו מהענן "+n+" תרגילים מ־"+ok+" אפליקציות." };
    if(err===apps) return { kind:"error", text:"אין חיבור לענן. מה שמוצג כאן הוא רק מה שנשמר במכשיר הזה." };
    if(err) return { kind:"error", text:"אין חיבור לענן לחלק מהאפליקציות, ובשאר בענן אין נתונים. מה שמוצג כאן הוא רק מה שנשמר במכשיר הזה." };
    return { kind:"empty", text:"יש חיבור לענן, אבל בענן אין נתונים." };
  }
  function cloudAppLabel(s){
    if(!s) return "אין חיבור לענן";
    if(s.cloudStatus==="ok"){
      var t="נמשך מהענן · "+(s.cloudEvents||0)+" תרגילים";
      if(s.cloudUpdated){
        try{
          var ts=Date.parse(s.cloudUpdated);
          if(!isNaN(ts)) t+=" · עודכן "+fmtWhen(ts);
        }catch(e){}
      }
      return t;
    }
    if(s.cloudStatus==="empty") return "בענן אין נתונים";
    return "אין חיבור לענן";
  }

  function renderParent(){
    var period=STATE.period||"week";
    $("tabWeek").classList.toggle("on", period==="week");
    $("tabMonth").classList.toggle("on", period==="month");
    var r=rangeOf(period);
    var evs=STATE.events.filter(function(e){ return inRange(e.at,r.start,r.end); });
    var prev=STATE.events.filter(function(e){ return inRange(e.at,r.prevStart,r.prevEnd); });
    var cur=summarize(evs), pre=summarize(prev);
    var bl=bottomLine(cur, pre, period);
    var srcNotes=[];
    APPS.forEach(function(app){
      var s=STATE.sources[app.id]||{};
      if(app.deviceOnly) srcNotes.push(app.label+": רק במכשיר שבו תרגלה (אין סנכרון בענן)");
      else if(!s.hasLocal && s.cloudStatus==="error") srcNotes.push(app.label+": אין חיבור לענן, וגם אין נתונים במכשיר הזה");
      else if(!s.hasLocal && s.cloudStatus==="empty") srcNotes.push(app.label+": בענן אין נתונים, וגם אין נתונים במכשיר הזה");
      else if(!s.hasLocal && s.hasCloud) srcNotes.push(app.label+": מהענן (אין עותק במכשיר הזה)");
    });

    var h="";
    var cstat=cloudStatusLine(STATE.sources);
    h+='<p class="sync">'+esc(r.label)+' · עדכון לפי המכשיר הזה והענן של האפליקציות. לא מוחקים כלום.</p>';
    h+='<p class="cloud-status '+cstat.kind+'">'+esc(cstat.text)+'</p>';
    h+='<div class="chips">';
    h+='<div class="chip"><b>'+cur.n+'</b><small>תרגילים</small></div>';
    h+='<div class="chip"><b>'+pct(cur.acc)+'</b><small>דיוק כולל</small></div>';
    h+='<div class="chip"><b>'+pct(cur.firstPct)+'</b><small>ניסיון ראשון</small></div>';
    h+='<div class="chip"><b>'+esc(fmtDur(cur.ms))+'</b><small>זמן תרגול</small></div>';
    h+='</div>';
    h+='<div class="card bottom"><div class="bl">שורה תחתונה</div><p style="margin:0;font-weight:600;line-height:1.5">'+esc(bl.bottom)+'</p>';
    if(pre.n){
      h+='<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">'+
        '<span class="note">לעומת התקופה הקודמת:</span>'+
        trendTag(bl.tAcc)+" "+trendTag(bl.tN)+'</div>';
    }
    h+='</div>';
    if(bl.points.length){
      h+='<div class="panel"><h3>מסקנות והמלצות</h3><ul>'+bl.points.map(function(p){ return "<li>"+esc(p)+"</li>"; }).join("")+'</ul></div>';
    }

    /* per app */
    h+='<div class="panel"><h3>לפי אפליקציה</h3>';
    APPS.forEach(function(app){
      var a=cur.apps[app.id], p=pre.apps[app.id];
      var line=a? (a.n+" תרגילים · דיוק "+pct(a.acc)+" · ראשון "+pct(a.firstPct)+" · "+fmtDur(a.ms)) : "לא תרגלה בתקופה הזו";
      var tr=a&&p? trend(a.acc,p.acc,"acc") : null;
      h+='<div class="row'+(a?"":" muted-row")+'"><div class="l">'+(APP_ICON[app.id]||"")+" "+esc(app.label)+
        (tr?" "+trendTag(tr):"")+'</div><div class="r">'+esc(line)+'</div></div>';
    });
    h+='</div>';

    /* practiced topics */
    var topics=Object.keys(cur.topics).map(function(k){ return cur.topics[k]; })
      .sort(function(a,b){ return b.n-a.n; });
    h+='<div class="panel"><h3>נושאים שתרגלה</h3>';
    if(!topics.length) h+='<p class="note">אין תרגול בתקופה הזו.</p>';
    topics.forEach(function(t){
      var p=pre.topics[t.id];
      var tr=p?trend(t.acc,p.acc,"acc"):null;
      h+='<div class="row"><div class="l">'+esc(t.label)+(tr?" "+trendTag(tr):"")+
        '</div><div class="r">'+t.n+" · "+pct(t.acc)+" · "+(t.avgAtt?t.avgAtt.toFixed(1):"—")+" ניסיונות · "+fmtDur(t.ms)+'</div></div>';
    });
    h+='</div>';

    var never=notPracticed(cur);
    h+='<div class="panel"><h3>נושאים שלא תרגלה בתקופה</h3>';
    if(!never.length) h+='<p class="note">כיסתה את כל סוגי התרגילים שיש באפליקציות. כל הכבוד!</p>';
    else {
      /* group by app */
      var by={};
      never.forEach(function(c){ (by[c.app]||(by[c.app]=[])).push(c); });
      Object.keys(by).forEach(function(app){
        var ap=appById(app);
        h+='<p style="margin:8px 0 4px;font-weight:800;font-size:13px">'+(ap?ap.label:app)+'</p>';
        h+='<p class="note">'+by[app].map(function(c){ return esc(c.label); }).join(" · ")+'</p>';
      });
    }
    h+='</div>';

    /* hard to easy */
    var rank=hardEasy(cur);
    h+='<div class="panel"><h3>מהקשה לקל</h3>';
    if(!rank.length) h+='<p class="note">צריך עוד קצת תרגול כדי לדרג.</p>';
    rank.forEach(function(t,i){
      var cls=i<2&&(t.fail|| (t.firstPct!=null&&t.firstPct<70))?"hard":(i>=rank.length-2?"easy":"");
      h+='<div class="rank '+cls+'"><div class="n">'+(i+1)+'</div><div><b>'+esc(t.label)+'</b>'+
        '<p>'+t.n+' תרגילים · בניסיון ראשון '+pct(t.firstPct)+' · נעזרה במבוגר '+t.fail+' · ממוצע ניסיונות '+(t.avgAtt?t.avgAtt.toFixed(1):"—")+'</p></div></div>';
    });
    h+='</div>';

    /* refresh */
    var ref=refreshList();
    h+='<div class="panel"><h3>לרענון</h3>';
    if(!ref.length) h+='<p class="note">אין כרגע נושא ששלטה בו ונשכח (7 ימים בלי תרגול).</p>';
    else ref.forEach(function(r){
      h+='<div class="row"><div class="l">'+esc(r.topic.label)+'</div><div class="r">'+r.days+' ימים בלי תרגול · דיוק '+pct(r.topic.acc)+'</div></div>';
    });
    h+='</div>';

    /* hard questions */
    var qs=hardQuestions(evs);
    h+='<div class="panel"><h3>תרגילים בניסיון 2–3, או שלא נפתרו</h3>';
    if(!qs.length) h+='<p class="note">בתקופה הזו אין תרגילים כאלה עם נוסח שמור, או שהכול יצא בניסיון הראשון.</p>';
    qs.slice(0,40).forEach(function(e){
      var cls=e.outcome==="fail"?"fail":"retry";
      var ans=(e.answers||[]).map(function(a){ return esc(String(a)); }).join(" ← ");
      var oc=e.outcome==="fail"?"לא נפתר אחרי 3 ניסיונות":("נפתר בניסיון "+e.attempts);
      var app=appById(e.app);
      var qcls=/[\u0590-\u05FF]/.test(e.question)?"q he":"q";
      h+='<div class="qitem '+cls+'"><div class="'+qcls+'">'+esc(e.question||"(תרגיל)")+'</div>'+
        '<div class="meta">'+esc(e.topicLabel)+" · "+(app?app.label:"")+" · "+esc(fmtWhen(e.at))+" · "+oc+" · "+fmtDur(e.ms)+'</div>'+
        (ans?'<div class="ans">ענתה: '+ans+'</div>':'')+'</div>';
    });
    if(qs.length>40) h+='<p class="note">מוצגים 40 האחרונים מתוך '+qs.length+'.</p>';
    h+='</div>';

    /* data sources note */
    h+='<div class="panel"><h3>איפה הנתונים נשמרים</h3><ul>';
    APPS.forEach(function(app){
      var s=STATE.sources[app.id]||{};
      var loc=s.hasLocal?"יש במכשיר הזה":"אין במכשיר הזה";
      var cld=app.deviceOnly?"רק במכשיר (בלי ענן)":cloudAppLabel(s);
      h+="<li><b>"+esc(app.label)+":</b> "+esc(loc)+" · "+esc(cld)+(s.events?" · "+s.events+" תרגילים":"")+"</li>";
    });
    h+='</ul><p class="note">אם אמיליה מתרגלת בטלפון אחר, הנתונים יופיעו כאן אחרי הסנכרון לענן (כולל גיאומטריה).</p></div>';

    h+='<p style="margin:14px 0 8px"><a class="btn mint" href="#reinforce" id="goRe" style="display:block;text-align:center;text-decoration:none">אל התרגול המחזק</a></p>';
    $("parentBody").innerHTML=h;
    var go=$("goRe"); if(go) go.addEventListener("click", function(e){ e.preventDefault(); openReinforce(); });
  }

  function openParent(){
    show("parent");
    $("parentBody").innerHTML='<p class="note">טוען סיכום…</p>';
    loadAll().then(function(){ renderParent(); }).catch(function(){
      $("parentBody").innerHTML='<p class="note">לא הצלחתי לטעון את הסיכום. אפשר לנסות שוב.</p>';
    });
  }

  function openReinforce(){
    show("reinforce");
    $("reBody").innerHTML='<p class="note">בודקת מה כדאי לתרגל…</p>';
    loadAll().then(function(){
      var r=rangeOf(STATE.period||"week");
      var evs=STATE.events.filter(function(e){ return inRange(e.at,r.start,r.end); });
      if(!evs.length) evs=STATE.events; /* if this week empty, use all-time hard */
      var cur=summarize(evs.length?evs:STATE.events);
      var recs=recommendations(cur);
      var h='<div class="card"><p style="margin:0;font-weight:600;line-height:1.5">כאן מרוכזים הנושאים שכדאי לחזק, וגם נושאים שכבר שלטה בהם וכדאי לרענן כדי לא לשכוח. התרגול עצמו נעשה באפליקציות הרגילות — בלי למחוק מה שכבר נעשה.</p></div>';
      if(!recs.length){
        h+='<div class="panel"><p class="note">עוד אין מספיק נתונים להמלצה מדויקת. אפשר להתחיל מהנושא החדש בכיתה: מספר מעורב ושבר גדול משלם.</p>';
        var m=appById("mivhan");
        if(m) h+='<a class="rec-card" href="'+m.url+'"><b>⭐ תרגול למבחן</b><p>שברים, ישר המספרים ועוד</p></a>';
        h+='</div>';
      } else {
        recs.forEach(function(rec){
          var app=appById(rec.topic.app);
          var href=urlForAppTopic(rec.topic.app, rec.topic.id);
          var kind=rec.kind==="refresh"?"לרענון":(rec.kind==="upcoming"?"לקראת השיעור":"לחיזוק");
          h+='<a class="rec-card" href="'+esc(href)+'"><b>'+(APP_ICON[rec.topic.app]||"")+" "+esc(rec.topic.label)+'</b>'+
            '<p>'+(app?app.label:"")+' · '+esc(kind)+'</p><div class="why">'+esc(rec.why)+'</div></a>';
        });
      }
      $("reBody").innerHTML=h;
    }).catch(function(){
      $("reBody").innerHTML='<p class="note">לא הצלחתי להכין את הרשימה. אפשר להיכנס ישירות לאפליקציות מהמסך הראשי.</p>';
    });
  }

  /* ---------- wiring ---------- */
  function tryPin(){
    var v=$("pinInput").value||"";
    if(v===PARENT_CODE){ $("pinNote").textContent=""; $("pinInput").value=""; openParent(); }
    else { $("pinNote").textContent="קוד שגוי"; $("pinInput").value=""; $("pinInput").focus(); }
  }

  function goHome(){ show("home"); if(history.replaceState) history.replaceState(null,"",location.pathname+location.search); }

  $("btnParent").addEventListener("click", function(){ $("pinInput").value=""; $("pinNote").textContent=""; show("pinScreen"); setTimeout(function(){ $("pinInput").focus(); },50); });
  $("btnReinforce").addEventListener("click", openReinforce);
  $("pinBack").addEventListener("click", goHome);
  $("parentBack").addEventListener("click", goHome);
  $("reBack").addEventListener("click", goHome);
  $("pinGo").addEventListener("click", tryPin);
  $("pinInput").addEventListener("keydown", function(e){ if(e.key==="Enter") tryPin(); });
  $("tabWeek").addEventListener("click", function(){ STATE.period="week"; renderParent(); });
  $("tabMonth").addEventListener("click", function(){ STATE.period="month"; renderParent(); });

  renderHome();

  /* test hook: read-only inspection, no writes to existing keys */
  window.LimudimHub = {
    loadAll:loadAll, summarize:summarize, rangeOf:rangeOf, parse:{
      kefel:parseKefel, hiluk:parseHiluk, hisur:parseHisur, mivhan:parseMivhan,
      seder:parseSeder, arabic:parseArabic, geometry:parseGeometry, english:parseEnglish
    },
    state:function(){ return STATE; },
    totalStarsLocal:totalStarsLocal, findResume:findResume, daysUntil:daysUntil
  };
})();
