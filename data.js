/* נתונים לעדכון קל: מה בשבוע הזה, המקצועות והקישורים.
   לא לשנות כאן מפתחות שמירה של אפליקציות התרגול. */
window.LIMUDIM = {
  title: "הלימודים של אמיליה",
  subtitle: "כיתה ה1 · מגד",
  weekLabel: "15.11–20.11.2026",
  weekNote: "לפי התוכנית השבועית שאורלי שלחה",

  thisWeek: [
    {
      date: "2026-11-18",
      dateLabel: "18.11",
      weekday: "יום רביעי",
      title: "מבדק שברים",
      detail: "חיבור וחיסור שברים עם מכנים שונים",
      subject: "math",
      highlight: true,
      countdown: true
    },
    {
      date: "2026-11-18",
      dateLabel: "18.11",
      weekday: "יום רביעי",
      title: "שיעור ערבית: צבעים",
      detail: "יחידת הוראה — צבעים",
      subject: "arabic",
      highlight: true
    },
    {
      date: "2026-11-20",
      dateLabel: "20.11",
      weekday: "יום שישי",
      title: "שיעור מקבילית בגיאומטריה",
      detail: "עם אלכסנדרה · וגם להביא מד זווית",
      subject: "geometry",
      highlight: true
    },
    {
      date: "2026-12-02",
      dateLabel: "2.12",
      weekday: "יום רביעי",
      title: "מבחן באנגלית",
      detail: "Unit 1 Hey! Friends",
      subject: "english",
      highlight: false
    },
    {
      date: "2026-12-04",
      dateLabel: "4.12",
      weekday: "יום שישי",
      title: "תערוכה",
      detail: "בשעה 11:45",
      subject: "other",
      highlight: false
    }
  ],

  standing: [
    {
      when: "כל יום שישי",
      title: "להביא מד זווית",
      detail: "חובה לשיעור גיאומטריה"
    }
  ],

  groups: [
    {
      id: "math",
      title: "מתמטיקה",
      emoji: "🔢",
      items: [
        {
          id: "mivhan",
          title: "תרגול למבחן",
          subtitle: "שברים, ישר המספרים ועוד",
          badge: "חשבון",
          url: "https://bronfmanmarina15620-crypto.github.io/hisur-emilia/mivhan/",
          status: "ready",
          teacher: "אורלי"
        },
        {
          id: "kefel",
          title: "לוח הכפל",
          subtitle: "תרגול כפל",
          badge: "חשבון",
          url: "https://bronfmanmarina15620-crypto.github.io/kefel-emilia/",
          status: "ready",
          teacher: "אורלי"
        },
        {
          id: "hiluk",
          title: "חילוק ארוך",
          subtitle: "תרגול חילוק עם שארית",
          badge: "חשבון",
          url: "https://bronfmanmarina15620-crypto.github.io/hiluk-emilia/",
          status: "ready",
          teacher: "אורלי"
        },
        {
          id: "hisur",
          title: "חיסור במאונך",
          subtitle: "תרגול חיסור עם הלוואה",
          badge: "חשבון",
          url: "https://bronfmanmarina15620-crypto.github.io/hisur-emilia/",
          status: "ready",
          teacher: "אורלי"
        },
        {
          id: "seder",
          title: "סדר פעולות",
          subtitle: "סוגריים, כפל וחילוק, חיבור וחיסור",
          badge: "חשבון",
          url: "https://bronfmanmarina15620-crypto.github.io/hisur-emilia/seder/",
          status: "ready",
          teacher: "אורלי"
        }
      ]
    },
    {
      id: "geometry",
      title: "גיאומטריה",
      emoji: "🔷",
      items: [
        {
          id: "geometry",
          title: "משולשים ומרובעים",
          subtitle: "מיון משולשים ומרובעים, מקבילית",
          badge: "גיאומטריה",
          url: "https://bronfmanmarina15620-crypto.github.io/geometry-emilia/",
          status: "ready",
          teacher: "אלכסנדרה"
        },
        {
          id: "mivhan-geo",
          title: "צלעות ומצולעים",
          subtitle: "צלעות מקבילות וסמוכות, מצולעים ואלכסונים",
          badge: "גיאומטריה",
          url: "https://bronfmanmarina15620-crypto.github.io/hisur-emilia/mivhan/?section=geo",
          status: "ready",
          teacher: "אלכסנדרה",
          new: true
        }
      ]
    },
    {
      id: "languages",
      title: "שפות",
      emoji: "💬",
      items: [
        {
          id: "arabic",
          title: "ערבית",
          subtitle: "אותיות, מילים, מספרים וצבעים",
          badge: "ערבית",
          url: "https://bronfmanmarina15620-crypto.github.io/arabic-emilia/",
          status: "ready",
          teacher: "מאר"
        },
        {
          id: "english",
          title: "אנגלית",
          subtitle: "Unit 1 Hey! Friends",
          badge: "אנגלית",
          url: "",
          status: "soon",
          teacher: "סנדי"
        },
        {
          id: "hebrew",
          title: "שפה",
          subtitle: "עברית — קריאה וכתיבה",
          badge: "שפה",
          url: "",
          status: "soon",
          teacher: "ענת"
        }
      ]
    },
    {
      id: "other",
      title: "עוד מקצועות",
      emoji: "📚",
      items: [
        {
          id: "science",
          title: "מדעים",
          subtitle: "מתכות, תכונות ושימושים",
          badge: "מדעים",
          url: "",
          status: "soon",
          teacher: "מאר"
        },
        {
          id: "geography",
          title: "גיאוגרפיה",
          subtitle: "מגלי עולם והמפות בימינו",
          badge: "גיאוגרפיה",
          url: "",
          status: "soon",
          teacher: "דפנה"
        },
        {
          id: "bible",
          title: "תנ״ך",
          subtitle: "סיפורים מהתנ״ך",
          badge: "תנ״ך",
          url: "",
          status: "soon",
          teacher: "ענת"
        }
      ]
    }
  ]
};
