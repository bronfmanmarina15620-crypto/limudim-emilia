# HANDOFF — הלימודים של אמיליה (אפליקציה אחת)

הכול מרוכז בריפו `limudim-emilia` ובכתובת:

https://bronfmanmarina15620-crypto.github.io/limudim-emilia/

המאגרים הישנים (`kefel-emilia`, `hisur-emilia`, `hiluk-emilia`, `geometry-emilia`, `arabic-emilia`) נשארים ב-GitHub, אבל דפי הכניסה שלהם מפנים לתיקיות כאן. לא מוחקים אותם.

## איפה לערוך

עריכות של מקצוע נעשות **רק** בתוך הריפו הזה, בתיקייה של המקצוע:

| מקצוע | תיקייה ב-`limudim-emilia` | מפתח localStorage (לא לשנות) | שורת ענן ב-`kefel_state` (לא לשנות) |
|---|---|---|---|
| לוח הכפל | `kefel/` | `kefel_amelia_v1` | `emilia` |
| חילוק ארוך | `hiluk/` | `hiluk_amelia_v1` | `emilia-hiluk` |
| גיאומטריה | `geometry/` | `geometry_emilia_v1` | `emilia-geometry` |
| ערבית | `arabic/` | `arabic_amelia_v1` | `emilia-arabic` |
| חיסור במאונך | `hisur/` | `hisur_amelia_v1` | `emilia-hisur` |
| תרגול למבחן | `hisur/mivhan/` | `mivhan_emilia_v1` | `emilia-mivhan` |
| סדר פעולות | `hisur/seder/` | `seder_emilia_v1` | `emilia-seder` |

`hisur/mivhan/` ו-`hisur/seder/` חייבים להישאר אחים: האימון טוען `../seder/engine.js`.

גיאומטריה של צלעות ומצולעים באימון: `hisur/mivhan/?section=geo`.

## מה אסור

- לא לשנות ולא למחוק מפתחות שמירה קיימים, ולא לנקות `localStorage`.
- לא לשנות מזהי שורות בענן.
- לא להוסיף אזור הורים שני, ולא תפריט מקצועות שני בתוך מקצוע (רק כפתור חזרה למסך הראשי).
- האפליקציה המרכזית (`app.js`) רק קוראת נתונים. היא לא כותבת למפתחות של המקצועות ולא שולחת לענן.

## מסך הבית ואזור ההורים

- כרטיסים ושבוע: `data.js`.
- כוכבים, «המשיכי מכאן», ספירה לאחור למבדק, אזור הורים, תרגול מחזק / לרענון: `app.js`.
- אזור ההורים קורא גם את שורת הענן `emilia-geometry` (גיאומטריה כבר מגובה בענן).
- כפתור חזרה בכל מקצוע: «← הלימודים של אמיליה», נתיב יחסי לשורש ההאב (`../` או `../../` מתוך `hisur/mivhan` ו-`hisur/seder`).

## הפניות מהמאגרים הישנים

הפניות ב-JavaScript עם `location.replace`, כולל `location.search` ו-`location.hash`, וביטול Service Worker ישן אם יש. דוגמה: `/hisur-emilia/mivhan/?section=geo` → `/limudim-emilia/hisur/mivhan/?section=geo`.

## הערות לבוט של ערבית / גיאומטריה / אימון

- ערבית: יחידות 23–24 (צבעים) וכפתור «🎨 צבעים בערבית» כבר בתוך `arabic/index.html`.
- גיאומטריה: גיבוי הענן (`rowId: "emilia-geometry"`) כבר בתוך `geometry/index.html`.
- אימון: גרסה `2026-11-15d`.
