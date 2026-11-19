/* אנגלית – Unit 1 "Hey! Friends" (מבחן 2.12.2026)
   מילים: רק מדף «Words – Unit 1 – Friends» שהמורה חילקה. דקדוק: לפי דף החזרה (עמ' 4–5). */
window.EN = (function(){
  "use strict";
  /* [english, hebrew, category] */
  var W = [
    ["people","אנשים","people"],["woman","אישה","people"],["girl","ילדה","people"],["boy","ילד","people"],
    ["family","משפחה","people"],["families","משפחות","people"],["friends","חברים","people"],
    ["best friends","חברים הכי טובים","people"],["kids","ילדים","people"],
    ["happy","שמח","adj"],["sad","עצוב","adj"],["big","גדול","adj"],["small","קטן","adj"],["tall","גבוה","adj"],
    ["short","נמוך / קצר","adj"],["new","חדש","adj"],["old","זקן / ישן","adj"],["young","צעיר","adj"],["fat","שמן","adj"],
    ["fast","מהר / מהיר","adj"],["different","שונה","adj"],["important","חשוב","adj"],["dirty","מלוכלך","adj"],
    ["nice","נחמד","adj"],["better","יותר טוב","adj"],["a lot of","הרבה","adj"],["beautiful","יפה","adj"],["the same","אותו הדבר","adj"],
    ["now","עכשיו","time"],["always","תמיד","time"],["at night","בלילה","time"],["three times a week","3 פעמים בשבוע","time"],
    ["four times a week","4 פעמים בשבוע","time"],["every day","כל יום","time"],["every week","כל שבוע","time"],["every month","כל חודש","time"],
    ["play","לשחק / לנגן","verb"],["cry","לבכות","verb"],["find","למצוא","verb"],["can","יכול","verb"],["can't","לא יכול","verb"],
    ["wash","לרחוץ / לשטוף","verb"],["brush","להבריש","verb"],["walk a dog","להוציא את הכלב לטיול","verb"],["need","צריך","verb"],
    ["run","לרוץ","verb"],["live","לגור / לחיות","verb"],["take care","לטפל","verb"],["begin","להתחיל","verb"],["begins","מתחיל","verb"],
    ["choose","לבחור","verb"],["chooses","בוחר","verb"],["watch","לצפות","verb"],["win","לנצח","verb"],["look for","לחפש","verb"],
    ["do","לעשות","verb"],["swim","לשחות","verb"],["draw","לצייר","verb"],["dance","לרקוד","verb"],["learn","ללמוד","verb"],
    ["break","לשבור","verb"],["know","לדעת","verb"],
    ["twenty","עשרים (20)","num"],["forty","ארבעים (40)","num"],["fifty","חמישים (50)","num"],["seventy","שבעים (70)","num"],
    ["a hundred","מאה (100)","num"],["eighteen years old","בן 18","num"],
    ["April","אפריל","other"],["together","ביחד","other"],["team","קבוצה","other"],["present","מתנה","other"],["birthday","יום הולדת","other"],
    ["garden","גינה","other"],["flowers","פרחים","other"],["food","אוכל","other"],["fun","כיף","other"],["money","כסף","other"],
    ["pool","בריכה","other"],["toy","צעצוע","other"],["perhaps","אולי","other"],["maybe","אולי","other"],["floor","רצפה","other"],
    ["bedroom","חדר שינה","other"],["because","בגלל","other"],["but","אבל","other"],["June","יוני","other"],["phone","טלפון","other"],
    ["races","תחרויות / מירוצים","other"],["trees","עצים","other"],["chess","שחמט","other"],["blanket","שמיכה","other"],["age","גיל","other"]
  ];
  var CAT_HE = { people:"אנשים", adj:"שמות תואר", time:"ביטויי זמן", verb:"פעלים", num:"מספרים", other:"מילים נוספות" };

  /* 7 המילים שצריך לדעת לכתוב בעל פה (דף החזרה, סעיף 3) */
  var MUST = [
    ["seventy","שבעים"],["chooses","בוחר"],["begins","מתחיל"],["people","אנשים"],
    ["at night","בלילה"],["blanket","שמיכה"],["garden","גינה"]
  ];

  /* a / an / the. a = התשובה; s = המשפט עם ___ ; src = מהדף? */
  var ARTICLE = [
    {s:"___ book", a:"a", o:["a","an"]},
    {s:"___ igloo", a:"an", o:["a","an"]},
    {s:"___ umbrella", a:"an", o:["a","an"]},
    {s:"___ girl", a:"a", o:["a","an"]},
    {s:"___ old woman", a:"an", o:["a","an"]},
    {s:"___ garden", a:"a", o:["a","an"]},
    {s:"___ important present", a:"an", o:["a","an"]},
    {s:"___ blanket", a:"a", o:["a","an"]},
    {s:"___ new toy", a:"a", o:["a","an"]},
    {s:"___ old phone", a:"an", o:["a","an"]},
    {s:"I want ___ new dress.", a:"a", o:["a","an","the"]},
    {s:"I want a new dress. I don't like ___ old dress.", a:"the", o:["a","an","the"]},
    {s:"There is ___ cat on my car.", a:"a", o:["a","an","the"]},
    {s:"There is a cat on my car. ___ cat is white.", a:"The", o:["A","An","The"]},
    {s:"He is ___ nice boy.", a:"a", o:["a","an","the"]},
    {s:"I have ___ blanket. The blanket is new.", a:"a", o:["a","an","the"]},
    {s:"I have a blanket. ___ blanket is new.", a:"The", o:["A","An","The"]},
    {s:"My grandmother has ___ big garden.", a:"a", o:["a","an","the"]},
    {s:"She is ___ old woman.", a:"an", o:["a","an","the"]},
    {s:"I got a present. ___ present is a toy.", a:"The", o:["A","An","The"]},
    {s:"We swim in ___ pool every day.", a:"the", o:["an","the"]},
    {s:"There is ___ dog in the garden. The dog is dirty.", a:"a", o:["a","an","the"]}
  ];

  /* כינויי גוף */
  var PRON = [
    {s:"Maya and Tali like fruit. ___ don't like vegetables.", a:"They", o:["They","She","We","He"]},
    {s:"Garfield the cat is funny. ___ likes to play games.", a:"It", o:["It","He","They","We"]},
    {s:"My sister is not in Israel. ___ is in New York.", a:"She", o:["She","He","It","They"]},
    {s:"Dan loves music. ___ plays the piano.", a:"He", o:["He","She","It","They"]},
    {s:"My father and I are at the mall. ___ are having a good time.", a:"We", o:["We","They","You","I"]},
    {s:"The girl is tall. (She is / He is) a basketball player.", a:"She is", o:["She is","He is"]},
    {s:"You and your brother are happy. (We are / You are) at a party.", a:"You are", o:["We are","You are"]},
    {s:"The cars are big. (It is / They are) blue.", a:"They are", o:["It is","They are"]},
    {s:"My mother and I are at home. (We are / I am) baking a cake.", a:"We are", o:["We are","I am"]},
    {s:"Yoni is my friend. (He is / She is) funny.", a:"He is", o:["He is","She is"]},
    {s:"Noa and Dana are best friends. ___ play together.", a:"They", o:["They","She","We","It"]},
    {s:"My grandfather is seventy. ___ lives in a small house.", a:"He", o:["He","She","It","They"]},
    {s:"The blanket is new. ___ is on my bed.", a:"It", o:["It","He","She","They"]},
    {s:"My brother and I like chess. ___ play every day.", a:"We", o:["We","They","He","You"]},
    {s:"The flowers are beautiful. ___ are in the garden.", a:"They", o:["They","It","She","We"]},
    {s:"Mom, ___ are beautiful!", a:"you", o:["you","she","it","they"]}
  ];
  /* טבלת הגופים: עברית ← אנגלית */
  var PRON_CHART = [
    ["אני","I"],["אתה / את","you"],["הוא","he"],["היא","she"],["זה (חפץ או חיה)","it"],
    ["אנחנו","we"],["אתם / אתן","you"],["הם / הן","they"]
  ];

  /* הפועל to be */
  var BE = [
    {s:"My mother and my father ___ in Japan.", a:"are"},
    {s:"Tom ___ sad today.", a:"is"},
    {s:"Dana ___ a singer.", a:"is"},
    {s:"You and I ___ good friends.", a:"are"},
    {s:"I ___ ten years old.", a:"am"},
    {s:"The garden ___ beautiful.", a:"is"},
    {s:"The kids ___ in the pool.", a:"are"},
    {s:"My grandfather ___ seventy years old.", a:"is"},
    {s:"We ___ a team.", a:"are"},
    {s:"I ___ happy because it is my birthday.", a:"am"},
    {s:"The flowers ___ new.", a:"are"},
    {s:"It ___ fun!", a:"is"},
    {s:"You ___ my best friend.", a:"are"},
    {s:"She ___ tall and young.", a:"is"}
  ];

  /* צורות מקוצרות – חיוב בלבד (כמו בדף החזרה) */
  var SHORT = [
    {full:"They are on time.", a:["They're on time."]},
    {full:"She is a nurse.", a:["She's a nurse."]},
    {full:"He is my friend.", a:["He's my friend."]},
    {full:"It is fun.", a:["It's fun."]},
    {full:"We are in the classroom.", a:["We're in the classroom."]},
    {full:"You are amazing.", a:["You're amazing."]},
    {full:"I am a dancer.", a:["I'm a dancer."]},
    {full:"I am happy.", a:["I'm happy."]},
    {full:"They are best friends.", a:["They're best friends."]},
    {full:"She is in the garden.", a:["She's in the garden."]},
    {full:"We are a team.", a:["We're a team."]},
    {full:"He is seventy.", a:["He's seventy."]}
  ];
  /* התאמה: צורה מלאה ← מקוצרת (בחירה) */
  var SHORT_PAIRS = [["I am","I'm"],["You are","You're"],["He is","He's"],["She is","She's"],["It is","It's"],["We are","We're"],["They are","They're"]];

  /* תרגום עם הפועל להיות (סעיף I בדף) */
  var TRANS = [
    {he:"אני זמרת.", a:["I am a singer.","I'm a singer."]},
    {he:"הכיתה יפה.", a:["The classroom is beautiful.","The classroom's beautiful."]},
    {he:"אנחנו חברים טובים.", a:["We are good friends.","We're good friends."]},
    {he:"היא שמחה.", a:["She is happy.","She's happy."]},
    {he:"הגינה גדולה.", a:["The garden is big.","The garden's big."]},
    {he:"הם גבוהים.", a:["They are tall.","They're tall."]},
    {he:"הוא עצוב.", a:["He is sad.","He's sad."]},
    {he:"השמיכה חדשה.", a:["The blanket is new.","The blanket's new."]}
  ];

  /* Cloze – כמו בסעיף D: תיבת מילים בעברית, כותבים באנגלית */
  var CLOZE = [
    {s:"Winter ___ in December.", a:"begins", he:"מתחיל"},
    {s:"It's important to help old ___.", a:"people", he:"אנשים"},
    {s:"My grandmother has a lot of flowers in her ___.", a:"garden", he:"גינה"},
    {s:"It is cold. I need a ___.", a:"blanket", he:"שמיכה"},
    {s:"My grandfather is ___ years old.", a:"seventy", he:"שבעים"},
    {s:"Every morning Dana ___ a dress for school.", a:"chooses", he:"בוחרת"},
    {s:"I sleep ___.", a:"at night", he:"בלילה"},
    {s:"I play chess with my best ___.", a:"friends", he:"חברים"},
    {s:"We play together. We are a good ___.", a:"team", he:"קבוצה"},
    {s:"I got a new toy for my ___.", a:"birthday", he:"יום הולדת"},
    {s:"In the summer we swim in the ___.", a:"pool", he:"בריכה"},
    {s:"Ben can run very ___.", a:"fast", he:"מהר"},
    {s:"My phone is on the ___.", a:"floor", he:"רצפה"},
    {s:"The game ___ now.", a:"begins", he:"מתחיל"},
    {s:"There are a lot of ___ in the park.", a:"trees", he:"עצים"},
    {s:"I am happy ___ it is my birthday.", a:"because", he:"בגלל"}
  ];

  /* Reading – Match A to B (סעיף E) */
  var MATCH = [
    {a:"I walk", b:"the dog every day.", o:["the dog every day.","in the pool.","a present."]},
    {a:"We swim", b:"in the pool.", o:["in the pool.","the dog every day.","fifty years old."]},
    {a:"My grandfather is", b:"seventy years old.", o:["seventy years old.","in the pool.","chess."]},
    {a:"I sleep with a blanket", b:"at night.", o:["at night.","a hundred.","the same."]},
    {a:"Mom gives me", b:"a present for my birthday.", o:["a present for my birthday.","at night.","fast."]},
    {a:"Dan and Yoni play", b:"chess together.", o:["chess together.","a blanket.","old people."]},
    {a:"The kids look for", b:"the toy under the bed.", o:["the toy under the bed.","seventy years old.","in June."]},
    {a:"My birthday is", b:"in April.", o:["in April.","the dog.","a lot of flowers."]},
    {a:"It's important to", b:"take care of the garden.", o:["take care of the garden.","at night.","a hundred kids."]},
    {a:"The girls dance", b:"three times a week.", o:["three times a week.","a blanket.","the floor is dirty."]}
  ];

  /* Reading Comprehension (סעיף F) – טקסטים מקוריים במילים של הפרק */
  var READ = [
    { id:"r1", title:"My Best Friend",
      text:"Hi! My name is Noa. I am ten years old. I live in Haifa with my family. My best friend is Dana. Dana is tall and nice. We are in the same class. We play together every day. We swim in the pool three times a week. Dana can swim fast! Perhaps we can win the races in June.",
      q:[
        {q:"Who is Noa's best friend?", a:"Dana", o:["Dana","Maya","Tali"], hint:"חפשי את המילים best friend"},
        {q:"Where does Noa live?", a:"in Haifa", o:["in Haifa","in New York","in Japan"], hint:"חפשי את המילה live"},
        {q:"Dana is ___.", a:"tall and nice", o:["tall and nice","short and sad","old and fat"], hint:"קראי שוב את המשפט השלישי עם Dana"},
        {q:"How often do they swim?", a:"three times a week", o:["three times a week","every day","four times a week"], hint:"חפשי את המילה swim"},
        {q:"True or false: Noa and Dana are in different classes.", a:"False", o:["True","False"], hint:"חפשי את המילה same"}
      ]},
    { id:"r2", title:"Grandpa Sam",
      text:"My grandfather Sam is seventy years old. He is old, but he is not sad. He lives in a small house with a big garden. There are a lot of flowers and trees in the garden. Grandpa takes care of the garden every day. Three times a week he plays chess with me. I always win! Grandpa says: \"It's important to have fun.\"",
      q:[
        {q:"How old is Grandpa Sam?", a:"seventy", o:["seventy","fifty","forty"], hint:"חפשי את המילים years old"},
        {q:"Grandpa's house is ___.", a:"small", o:["small","big","new"], hint:"חפשי את המילה house"},
        {q:"What is in the garden?", a:"flowers and trees", o:["flowers and trees","a pool","toys"], hint:"חפשי את המילה garden"},
        {q:"What do they play?", a:"chess", o:["chess","football","games on the phone"], hint:"חפשי את המילה play"},
        {q:"True or false: Grandpa is sad.", a:"False", o:["True","False"], hint:"חפשי את המילה sad"}
      ]},
    { id:"r3", title:"A Birthday Present",
      text:"Today is Tom's birthday. He is eleven. Tom's mother and father want to buy a present. They look for a toy, but Tom has a lot of toys. Maybe a phone? No, Tom is young. They choose a new blanket with dogs on it, because Tom loves dogs. Tom is very happy!",
      q:[
        {q:"Whose birthday is it?", a:"Tom's", o:["Tom's","Dan's","Mom's"], hint:"חפשי את המילה birthday"},
        {q:"Why don't they buy a toy?", a:"Tom has a lot of toys.", o:["Tom has a lot of toys.","Tom is old.","Toys are dirty."], hint:"חפשי את המילה but"},
        {q:"What do they choose?", a:"a blanket", o:["a blanket","a phone","a dog"], hint:"חפשי את המילה choose"},
        {q:"Why a blanket with dogs?", a:"because Tom loves dogs", o:["because Tom loves dogs","because it is cold","because it is cheap"], hint:"חפשי את המילה because"},
        {q:"True or false: Tom is sad.", a:"False", o:["True","False"], hint:"קראי את המשפט האחרון"}
      ]}
  ];

  /* Listening A – שומעים משפט ובוחרים תמונה */
  var PICS = [
    {say:"The boy is swimming in the pool.", e:"🏊‍♂️", d:"ילד שוחה"},
    {say:"The girl is drawing a picture.", e:"🎨", d:"ציור"},
    {say:"The kids are playing chess.", e:"♟️", d:"שחמט"},
    {say:"She is dancing.", e:"💃", d:"ריקוד"},
    {say:"I sleep with a blanket at night.", e:"🛌", d:"שינה"},
    {say:"There are a lot of flowers in the garden.", e:"🌷", d:"פרחים"},
    {say:"The baby is crying.", e:"😭", d:"בכי"},
    {say:"I walk the dog every day.", e:"🐕", d:"כלב"},
    {say:"Mom gives me a birthday present.", e:"🎁", d:"מתנה"},
    {say:"He is running fast.", e:"🏃‍♂️", d:"ריצה"},
    {say:"I am looking for my phone.", e:"📱", d:"טלפון"},
    {say:"There are big trees in the park.", e:"🌳", d:"עצים"},
    {say:"I brush my teeth.", e:"🪥", d:"מברשת שיניים"},
    {say:"We win the races!", e:"🏆", d:"גביע"},
    {say:"She has a lot of money.", e:"💰", d:"כסף"},
    {say:"The kids watch TV.", e:"📺", d:"טלוויזיה"}
  ];

  /* Listening B – שיחה בין בן ואמו בפארק (מקורית) */
  var DIALOG = {
    lines:[
      ["Mom","Ben, it's a beautiful day. Let's go to the park."],
      ["Ben","Yes! Can my friend Dan come too?"],
      ["Mom","Sure, Dan can come."],
      ["Ben","Look, Mom! A lot of kids are playing together."],
      ["Mom","Do you want to run with them?"],
      ["Ben","No. I want to walk the dog."],
      ["Mom","OK. But where is the dog?"],
      ["Ben","He is near the trees. Oh no, he is dirty!"],
      ["Mom","We need to wash him at home."],
      ["Ben","Mom, can we come to the park every day?"],
      ["Mom","Maybe three times a week."]
    ],
    q:[
      {q:"Where are Ben and his mother?", a:"in the park", o:["in the park","in the pool","in the garden"]},
      {q:"Who can come with Ben?", a:"Dan", o:["Dan","Tom","Yoni"]},
      {q:"What does Ben want to do?", a:"walk the dog", o:["walk the dog","run with the kids","play chess"]},
      {q:"Where is the dog?", a:"near the trees", o:["near the trees","in the pool","at home"]},
      {q:"The dog is ___.", a:"dirty", o:["dirty","sad","small"]},
      {q:"How often can they come to the park?", a:"maybe three times a week", o:["maybe three times a week","every day","four times a week"]}
    ]
  };

  return { W:W, CAT_HE:CAT_HE, MUST:MUST, ARTICLE:ARTICLE, PRON:PRON, PRON_CHART:PRON_CHART, BE:BE,
    SHORT:SHORT, SHORT_PAIRS:SHORT_PAIRS, TRANS:TRANS, CLOZE:CLOZE, MATCH:MATCH, READ:READ, PICS:PICS, DIALOG:DIALOG };
})();
