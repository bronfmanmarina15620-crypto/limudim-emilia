#!/usr/bin/env python3
"""History back in kefel: hub -> kefel -> round -> back = kefel menu -> back = hub. Same for pin/parent."""
import http.server, os, threading, sys, json
from functools import partial
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def vis(page, sel): return page.locator(sel).first.is_visible()
def check(c, m):
    print(("OK: " if c else "FAIL: ") + m)
    if not c: sys.exit(1)
httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), partial(http.server.SimpleHTTPRequestHandler, directory=ROOT))
BASE = f"http://127.0.0.1:{httpd.server_address[1]}"
threading.Thread(target=httpd.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--headless=new","--no-sandbox","--disable-gpu"])
    pg = b.new_page(); pg.route("**/*supabase*/**", lambda r: r.abort())
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE + "/"); pg.goto(BASE + "/kefel/"); pg.wait_for_timeout(800)
    check(vis(pg,"#home"), "kefel menu shown")
    pg.click("#btnStart"); pg.wait_for_timeout(200)
    check(vis(pg,"#play") and pg.url.endswith("#round"), "round started, #round")
    q = pg.inner_text("#qText"); a,b2 = [int(x) for x in q.replace("= ?","").split("×")]
    for ch in str(a*b2): pg.click(f"#pad .key:text-is('{ch}')")
    pg.click("#pad .key:text-is('בדקי')"); pg.wait_for_timeout(300)
    logs1 = len(json.loads(pg.evaluate("localStorage.getItem('kefel_amelia_v1')") or "{}").get("log",[]))
    pg.wait_for_timeout(1300)
    pg.go_back(); pg.wait_for_timeout(300)
    check(vis(pg,"#home") and "/kefel/" in pg.url and "#" not in pg.url, "phone back from round -> kefel menu")
    d = json.loads(pg.evaluate("localStorage.getItem('kefel_amelia_v1')"))
    check(len(d.get("log",[])) >= logs1 >= 1, "answered exercise kept")
    check(d["rounds"][-1].get("done") is False and d["rounds"][-1].get("reached") == 1, "partial round recorded")
    pg.click("#btnStart"); pg.wait_for_timeout(200); pg.click("#btnQuit"); pg.wait_for_timeout(300)
    check(vis(pg,"#home") and "#" not in pg.url, "in-app סיום -> kefel menu")
    pg.click("#btnParent"); pg.wait_for_timeout(200); pg.fill("#pinInput","2604"); pg.wait_for_timeout(800)
    check(vis(pg,"#parent") and pg.url.endswith("#parent"), "parent screen")
    pg.go_back(); pg.wait_for_timeout(300)
    check(vis(pg,"#home"), "back from parent -> kefel menu")
    pg.click("#btnParent"); pg.wait_for_timeout(200); pg.click("#btnPinBack"); pg.wait_for_timeout(300)
    check(vis(pg,"#home"), "pin חזרה -> kefel menu")
    pg.go_back(); pg.wait_for_timeout(500)
    check(pg.url.rstrip("/") == BASE, "back from kefel menu -> hub")
    check(not errs, "no JS errors " + str(errs))
    b.close()
