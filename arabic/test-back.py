#!/usr/bin/env python3
"""History back: hub → Arabic → session → back lands on the Arabic menu, then the hub."""
import http.server
import os
import threading
import sys
from functools import partial

from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PORT = 0
BASE = None
KEY = "arabic_amelia_v1"

def visible(page, sel):
    loc = page.locator(sel)
    return loc.count() > 0 and loc.first.is_visible()

def fail(msg):
    print("FAIL:", msg)
    sys.exit(1)

def ok(msg):
    print("OK:", msg)

def abort_cloud(route):
    route.abort()

def wait_ready(page):
    page.wait_for_function("() => window.historyReady === true && !!document.getElementById('btnColors')")

def wait_menu(page):
    wait_ready(page)
    page.wait_for_function(
        """() => {
          const home = document.getElementById('home');
          const practice = document.getElementById('practice');
          return home && !home.classList.contains('hidden')
              && practice && practice.classList.contains('hidden')
              && !!document.getElementById('btnColors');
        }"""
    )

def wait_practice(page):
    page.wait_for_selector("#practice:not(.hidden) #opts .opt, #practice:not(.hidden) #qPrompt")

def main():
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    global BASE, PORT
    PORT = httpd.server_address[1]
    BASE = f"http://127.0.0.1:{PORT}"
    print("serving", BASE)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--headless=new", "--no-sandbox", "--disable-gpu"],
        )
        context = browser.new_context()
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.on("dialog", lambda d: d.accept())
        page.route("**://nrxhjzmmmzqjytmdgzjg.supabase.co/**", abort_cloud)

        # --- A: full path Amelia actually uses ---
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.wait_for_selector('#groups a.app[href="arabic/"]')
        if not visible(page, "h1"):
            fail("hub home did not render")
        title = page.locator("h1").first.inner_text().strip()
        if "הלימודים של אמיליה" not in title:
            fail(f"hub title was {title!r}")
        ok("hub home")

        page.click('#groups a.app[href="arabic/"]')
        wait_menu(page)
        if visible(page, "#practice:not(.hidden)"):
            fail("Arabic opened already inside a session")
        if "#session=" in page.url:
            fail(f"Arabic menu URL already has a session hash: {page.url}")
        ok("hub → Arabic menu")

        page.click("#btnColors")
        wait_practice(page)
        sess = page.locator("#sessNum").inner_text().strip()
        if sess != "23":
            fail(f"colors button opened session {sess}, expected 23")
        if not page.url.endswith("#session=23"):
            fail(f"session URL is {page.url}, expected #session=23")
        if visible(page, "#home:not(.hidden)"):
            fail("home still visible inside session")
        ok("colors button opened session 23")

        # Answer one question so progress is saved
        answer = page.evaluate("() => (play && play.queue && play.queue[play.idx] || {}).answer")
        if answer:
            opts = page.locator("#opts .opt")
            clicked = False
            for i in range(opts.count()):
                txt = opts.nth(i).inner_text().strip()
                if txt == str(answer):
                    opts.nth(i).click()
                    clicked = True
                    break
            if not clicked and opts.count():
                opts.first.click()
        elif page.locator("#opts .opt").count():
            page.locator("#opts .opt").first.click()
        page.wait_for_timeout(300)

        stored_before = page.evaluate(
            f"""() => {{
              const raw = localStorage.getItem('{KEY}');
              const db = raw ? JSON.parse(raw) : {{}};
              const items = (db.sessions||[]).reduce((n,s)=>n+((s.items||[]).length),0);
              return {{ items, sessions: (db.sessions||[]).length, answers: db.answers||0, key: Object.keys(localStorage).filter(k=>k.startsWith('arabic_')) }};
            }}"""
        )
        if KEY not in (stored_before.get("key") or []):
            fail(f"localStorage key {KEY} missing after an answer: {stored_before}")
        ok(f"answered a question, items={stored_before['items']} answers={stored_before['answers']}")

        page.go_back()
        wait_menu(page)
        if "arabic" not in page.url or "#session=" in page.url or "#summary" in page.url or "#pin" in page.url:
            fail(f"after first back, expected Arabic menu, got {page.url}")
        if not visible(page, "#home:not(.hidden) #btnColors"):
            fail("Arabic menu missing after phone back")
        stored_after = page.evaluate(
            f"""() => {{
              const raw = localStorage.getItem('{KEY}');
              const db = raw ? JSON.parse(raw) : {{}};
              const items = (db.sessions||[]).reduce((n,s)=>n+((s.items||[]).length),0);
              return {{ items, answers: db.answers||0, hasKey: raw !== null }};
            }}"""
        )
        if not stored_after["hasKey"]:
            fail(f"back removed {KEY}")
        if stored_after["items"] < stored_before["items"] or stored_after["answers"] < stored_before["answers"]:
            fail(f"back lost progress: before={stored_before} after={stored_after}")
        ok("phone back → Arabic menu (progress kept)")

        page.go_back()
        page.wait_for_selector('#groups a.app[href="arabic/"]')
        if "/arabic" in page.url and (page.url.rstrip("/").endswith("/arabic") or "/arabic/" in page.url):
            # still ok if hash-only? no, should be hub
            if not page.url.rstrip("/#").endswith(str(PORT)) and "/arabic/" in page.url:
                fail(f"second back stayed in Arabic: {page.url}")
        title = page.locator("h1").first.inner_text().strip()
        if "הלימודים של אמיליה" not in title:
            fail(f"second back did not land on hub, title={title!r} url={page.url}")
        if visible(page, "#groups"):
            ok("phone back → hub")
        else:
            fail("hub groups missing after second back")

        # --- B: in-app back buttons ---
        page.click('#groups a.app[href="arabic/"]')
        wait_menu(page)
        page.click("#btnParentHome")
        page.wait_for_selector("#pinScreen:not(.hidden)")
        page.wait_for_function("() => location.hash === '#pin'")
        if not page.url.endswith("#pin"):
            fail(f"pin URL is {page.url}")
        page.click("#btnPinBack")
        wait_menu(page)
        if "#pin" in page.url:
            fail(f"pin חזרה did not drop #pin: {page.url}")
        ok("in-app חזרה from PIN → Arabic menu")

        page.click("#btnParentHome")
        page.wait_for_selector("#pinScreen:not(.hidden) #pinInput")
        page.fill("#pinInput", "2604")
        page.wait_for_selector("#parent:not(.hidden)")
        page.wait_for_function("() => location.hash === '#parent'")
        if not page.url.endswith("#parent"):
            fail(f"parent URL is {page.url}")
        page.click("#btnBack")
        page.wait_for_selector("#pinScreen:not(.hidden)")
        if "#parent" in page.url:
            fail(f"parent חזרה skipped pin or stayed: {page.url}")
        page.click("#btnPinBack")
        wait_menu(page)
        ok("in-app חזרה from parent → PIN → menu")

        page.click("#btnColors")
        wait_practice(page)
        page.click("#btnQuit")
        wait_menu(page)
        if "#session=" in page.url:
            fail(f"יציאה did not return to menu: {page.url}")
        if visible(page, "#practice:not(.hidden)"):
            fail("practice still visible after יציאה")
        ok("in-app יציאה from session → Arabic menu")

        # --- C: reload with hash lands on the menu, no errors ---
        # about:blank first so this is a real document load, not just a hash change.
        page.goto("about:blank")
        page.goto(BASE + "/arabic/#session=23", wait_until="domcontentloaded")
        wait_menu(page)
        if "#session=" in page.url:
            fail(f"reload with hash did not land on menu: {page.url}")
        if visible(page, "#practice:not(.hidden)"):
            fail("reload with #session=23 started a session")
        ok("reload #session=23 → menu (no auto-start)")

        # --- D: key still present, no page errors ---
        has_key = page.evaluate(f"() => localStorage.getItem('{KEY}') !== null")
        if not has_key:
            fail(f"{KEY} missing at end of tests")
        ok(f"localStorage key {KEY} preserved")

        if errors:
            fail("console page errors: " + " | ".join(errors))
        ok("no page errors")

        browser.close()
    httpd.shutdown()
    print("ALL TESTS PASSED")

if __name__ == "__main__":
    main()
