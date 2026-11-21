#!/usr/bin/env python3
"""History back: hub → hiluk screens go one step; #parent never skips the PIN."""
import http.server
import os
import sys
import threading
from functools import partial

from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PORT = 0
BASE = None
KEY = "hiluk_amelia_v1"


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


def wait_practice(page):
    page.wait_for_function(
        """() => {
          const el = document.getElementById('practice');
          const q = document.getElementById('qText');
          return el && !el.classList.contains('hidden')
              && q && q.textContent && q.textContent.indexOf('÷') >= 0;
        }"""
    )


def wait_hidden(page, sid, shown):
    page.wait_for_function(
        """([sid, shown]) => {
          const el = document.getElementById(sid);
          return el && el.classList.contains('hidden') === !shown;
        }""",
        arg=[sid, shown],
    )


def main():
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    global BASE
    BASE = f"http://127.0.0.1:{httpd.server_address[1]}"

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--headless=new", "--no-sandbox", "--disable-gpu"],
        )
        context = browser.new_context()
        page = context.new_page()
        page.route("**://nrxhjzmmmzqjytmdgzjg.supabase.co/**", abort_cloud)

        # --- A: hub → practice home (no hash) ---
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.wait_for_selector('#groups a.app[href="hiluk/"]')
        page.click('#groups a.app[href="hiluk/"]')
        wait_practice(page)
        if "#pin" in page.url or "#parent" in page.url or "#summary" in page.url:
            fail(f"practice opened with a screen hash: {page.url}")
        if visible(page, "#pinScreen:not(.hidden)") or visible(page, "#parent:not(.hidden)") or visible(page, "#summary:not(.hidden)"):
            fail("a non-practice screen was visible on open")
        ok("hub → hiluk practice (home)")

        q_before = page.locator("#qText").inner_text().strip()
        stored_before = page.evaluate(
            """() => {
              const raw = localStorage.getItem('hiluk_amelia_v1');
              const db = raw ? JSON.parse(raw) : {};
              return { answers: db.answers || 0, sessions: (db.sessions||[]).length, q: ((db.sessions||[])[0]||{}).q || 0, key: 'hiluk_amelia_v1' };
            }"""
        )

        # --- B: practice → summary → back returns to practice ---
        page.evaluate(
            """() => {
              document.getElementById('summaryBody').innerHTML = '<p>בדיקת חזרה</p>';
              window.HilukApp.go('summary', 'push');
            }"""
        )
        wait_hidden(page, "summary", True)
        if not page.url.endswith("#summary"):
            fail(f"summary URL is {page.url}")
        if visible(page, "#practice:not(.hidden)"):
            fail("practice still visible on summary")
        ok("practice → summary (#summary)")

        page.go_back()
        wait_practice(page)
        if "#summary" in page.url or "#pin" in page.url or "#parent" in page.url:
            fail(f"back from summary did not return to practice: {page.url}")
        if visible(page, "#summary:not(.hidden)"):
            fail("summary still visible after back")
        q_after_sum = page.locator("#qText").inner_text().strip()
        if q_after_sum != q_before:
            fail(f"back from summary changed the exercise: {q_before!r} → {q_after_sum!r}")
        ok("phone back from summary → practice (exercise kept)")

        # --- C: mid-exercise practice → PIN → back keeps progress ---
        page.click("#btnParent")
        wait_hidden(page, "pinScreen", True)
        if not page.url.endswith("#pin"):
            fail(f"PIN URL is {page.url}")
        if visible(page, "#parent:not(.hidden)"):
            fail("parents area opened without a PIN")
        ok("practice → PIN (#pin)")

        page.go_back()
        wait_practice(page)
        if "#pin" in page.url or "#parent" in page.url:
            fail(f"back from PIN did not return to practice: {page.url}")
        q_after_pin = page.locator("#qText").inner_text().strip()
        if q_after_pin != q_before:
            fail(f"back from PIN lost the exercise: {q_before!r} → {q_after_pin!r}")
        stored_after = page.evaluate(
            """() => {
              const raw = localStorage.getItem('hiluk_amelia_v1');
              const db = raw ? JSON.parse(raw) : {};
              return { answers: db.answers || 0, sessions: (db.sessions||[]).length, q: ((db.sessions||[])[0]||{}).q || 0 };
            }"""
        )
        if stored_after["answers"] < stored_before["answers"] or stored_after["sessions"] < stored_before["sessions"]:
            fail(f"back lost saved progress: before={stored_before} after={stored_after}")
        ok("phone back from PIN → practice (progress kept)")

        # --- D: in-app חזרה on PIN ---
        page.click("#btnParent")
        wait_hidden(page, "pinScreen", True)
        page.click("#btnPinBack")
        wait_practice(page)
        if "#pin" in page.url:
            fail(f"btnPinBack did not drop #pin: {page.url}")
        ok("in-app חזרה from PIN → practice")

        # --- E: home → PIN → parents → back → back ---
        page.click("#btnParent")
        wait_hidden(page, "pinScreen", True)
        page.fill("#pinInput", "2604")
        page.wait_for_function(
            """() => {
              const parent = document.getElementById('parent');
              return parent && !parent.classList.contains('hidden')
                  && location.hash === '#parent';
            }"""
        )
        if visible(page, "#pinScreen:not(.hidden)"):
            fail("PIN screen stayed visible after a correct code")
        ok("PIN → parents (#parent, PIN replaced in history)")

        page.go_back()
        wait_practice(page)
        if "#parent" in page.url or "#pin" in page.url:
            fail(f"back from parents did not return to practice: {page.url}")
        if visible(page, "#parent:not(.hidden)"):
            fail("parents area still visible after back")
        unlocked = page.evaluate("() => window.HilukApp.isParentOk()")
        if unlocked:
            fail("parentOk stayed true after leaving the parents area")
        ok("phone back from parents → practice (PIN required again)")

        # Forward must not reopen parents without the PIN
        page.go_forward()
        page.wait_for_timeout(200)
        page.wait_for_function(
            """() => {
              const parent = document.getElementById('parent');
              return !parent || parent.classList.contains('hidden');
            }"""
        )
        if visible(page, "#parent:not(.hidden)"):
            fail("forward landed on the parents area without a PIN")
        if not visible(page, "#pinScreen:not(.hidden)") and not visible(page, "#practice:not(.hidden)"):
            fail("forward after leaving parents showed neither PIN nor practice")
        ok("forward after leaving parents does not open parents without PIN")

        # If we landed on PIN via forward, go back to practice for the second back
        if visible(page, "#pinScreen:not(.hidden)"):
            page.go_back()
            wait_practice(page)

        page.go_back()
        page.wait_for_selector('#groups a.app[href="hiluk/"]')
        title = page.locator("h1").first.inner_text().strip()
        if "הלימודים של אמיליה" not in title:
            fail(f"second back did not land on hub, title={title!r} url={page.url}")
        ok("phone back from practice home → hub")

        # --- F: opening #parent cold must not skip the PIN ---
        page.goto(BASE + "/hiluk/#parent", wait_until="domcontentloaded")
        page.wait_for_selector("#pinScreen:not(.hidden)")
        if visible(page, "#parent:not(.hidden)"):
            fail("direct #parent opened the parents area without a PIN")
        if "#parent" in page.url and visible(page, "#parent:not(.hidden)"):
            fail("direct #parent bypassed the PIN")
        # URL should be rewritten to #pin or show PIN while not showing parent
        if not visible(page, "#pinScreen:not(.hidden)"):
            fail("direct #parent did not show the PIN screen")
        ok("direct #parent → PIN, not parents")

        page.go_back()
        wait_practice(page)
        if visible(page, "#parent:not(.hidden)"):
            fail("back from cold PIN opened parents")
        ok("back from cold #parent PIN → practice")

        # --- G: in-app חזרה לתרגול from parents ---
        page.click("#btnParent")
        wait_hidden(page, "pinScreen", True)
        page.fill("#pinInput", "2604")
        page.wait_for_selector("#parent:not(.hidden)")
        page.click("#btnBack")
        wait_practice(page)
        if "#parent" in page.url or "#pin" in page.url:
            fail(f"btnBack did not return to practice: {page.url}")
        ok("in-app חזרה לתרגול from parents → practice")

        browser.close()
    httpd.shutdown()
    print("ALL TESTS PASSED")


if __name__ == "__main__":
    main()
