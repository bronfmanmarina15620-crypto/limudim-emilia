#!/usr/bin/env python3
"""History back: hub → geometry → session → back lands on the geometry menu, then the hub."""
import http.server
import os
import sys
import threading
from functools import partial

from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PORT = 0
BASE = None  # set in main() after bind
KEY = "geometry_emilia_v1"
CONSOLE = []


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


def on_console(msg):
    if msg.type in ("error", "warning"):
        CONSOLE.append(f"{msg.type}: {msg.text}")


def on_pageerror(err):
    CONSOLE.append(f"pageerror: {err}")


def wait_menu(page):
    page.wait_for_function(
        """() => {
          const home = document.getElementById('home');
          const practice = document.getElementById('practice');
          const summary = document.getElementById('summary');
          return home && !home.classList.contains('hidden')
              && practice && practice.classList.contains('hidden')
              && summary && summary.classList.contains('hidden');
        }"""
    )


def wait_practice(page):
    page.wait_for_selector("#practice:not(.hidden)")


def stored():
    return """() => {
      const raw = localStorage.getItem('geometry_emilia_v1');
      const db = raw ? JSON.parse(raw) : {};
      const sessions = db.sessions || [];
      const items = sessions.reduce((n,s)=>n+((s.items||[]).length),0);
      const q = sessions.reduce((n,s)=>n+(s.q||0),0);
      return { sessions: sessions.length, items, q, lastScore: db.lastScore || null };
    }"""


def main():
    global BASE
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    BASE = f"http://127.0.0.1:{httpd.server_address[1]}"
    print("serving", BASE)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--headless=new", "--no-sandbox", "--disable-gpu"],
        )
        context = browser.new_context()
        page = context.new_page()
        page.on("console", on_console)
        page.on("pageerror", on_pageerror)
        page.route("**://nrxhjzmmmzqjytmdgzjg.supabase.co/**", abort_cloud)
        page.on("dialog", lambda d: d.accept())

        # --- A: hub → geometry menu → session → phone back → menu → hub ---
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.wait_for_selector('#groups a.app[href="geometry/"]')
        title = page.locator("h1").first.inner_text().strip()
        if "הלימודים של אמיליה" not in title:
            fail(f"hub title was {title!r}")
        ok("hub home")

        page.click('#groups a.app[href="geometry/"]')
        page.wait_for_selector('#home:not(.hidden) button.topic[data-topic="tri"]')
        if visible(page, "#practice:not(.hidden)"):
            fail("geometry opened already inside a session")
        if "#practice" in page.url or "#summary" in page.url or "#parents" in page.url:
            fail(f"geometry menu URL already has a screen hash: {page.url}")
        ok("hub → geometry menu")

        page.click('button.topic[data-topic="tri"]')
        wait_practice(page)
        if not page.url.endswith("#practice"):
            fail(f"practice URL is {page.url}, expected #practice")
        if visible(page, "#home:not(.hidden)"):
            fail("home still visible inside session")
        ok("opened משולשים session")

        page.go_back()
        wait_menu(page)
        if "geometry" not in page.url or "#practice" in page.url or "#summary" in page.url:
            fail(f"after first back, expected geometry menu, got {page.url}")
        if not visible(page, '#home:not(.hidden) button.topic[data-topic="tri"]'):
            fail("geometry topic list missing after phone back")
        ok("phone back → geometry menu")

        page.go_back()
        page.wait_for_selector('#groups a.app[href="geometry/"]')
        title = page.locator("h1").first.inner_text().strip()
        if "הלימודים של אמיליה" not in title:
            fail(f"second back did not land on hub, title={title!r} url={page.url}")
        if "/geometry" in page.url.rstrip("/") and not page.url.rstrip("/").endswith("limudim-emilia"):
            if page.url.rstrip("/").endswith("/geometry") or "/geometry/" in page.url:
                fail(f"second back stayed in geometry: {page.url}")
        ok("phone back → hub")

        # --- B: btnQuit mid-session keeps saved answers and returns to menu ---
        page.click('#groups a.app[href="geometry/"]')
        page.wait_for_selector('#home:not(.hidden) button.topic[data-topic="quad"]')
        page.click('button.topic[data-topic="quad"]')
        wait_practice(page)
        # answer the first question correctly so an item is saved
        answer = page.evaluate("() => play.queue[play.idx].answer")
        page.locator("#opts button.opt").filter(has_text=answer).first.click()
        page.wait_for_timeout(1000)
        before = page.evaluate(stored())
        if before["items"] < 1 or before["q"] < 1:
            fail(f"expected a saved item before quit, got {before}")
        page.click("#btnQuit")
        wait_menu(page)
        if "#practice" in page.url:
            fail(f"btnQuit did not drop #practice: {page.url}")
        after = page.evaluate(stored())
        if after["items"] < before["items"] or after["q"] < before["q"]:
            fail(f"btnQuit lost saved data: before={before} after={after}")
        ok(f"btnQuit → menu, kept items={after['items']} q={after['q']}")

        # one more back should reach the hub (no duplicate menu entry)
        page.go_back()
        page.wait_for_selector('#groups a.app[href="geometry/"]')
        title = page.locator("h1").first.inner_text().strip()
        if "הלימודים של אמיליה" not in title:
            fail(f"back after btnQuit did not land on hub: {title!r} {page.url}")
        ok("back after btnQuit → hub (no duplicate menu)")

        # --- C: summary phone back + btnSumHome ---
        page.click('#groups a.app[href="geometry/"]')
        page.wait_for_selector('#home:not(.hidden) button.topic[data-topic="mix"]')
        page.click('button.topic[data-topic="mix"]')
        wait_practice(page)
        page.evaluate(
            """() => {
              play.idx = play.queue.length;
              finishSession();
            }"""
        )
        page.wait_for_selector("#summary:not(.hidden)")
        if not page.url.endswith("#summary"):
            fail(f"summary URL is {page.url}, expected #summary")
        if visible(page, "#practice:not(.hidden)"):
            fail("practice still visible on summary")
        ok("session finished → #summary")

        page.go_back()
        wait_menu(page)
        if "#summary" in page.url or "#practice" in page.url:
            fail(f"phone back from summary did not reach menu: {page.url}")
        ok("phone back from summary → geometry menu")

        # again, then in-app למסך הראשי
        page.click('button.topic[data-topic="tri"]')
        wait_practice(page)
        page.evaluate(
            """() => {
              play.idx = play.queue.length;
              finishSession();
            }"""
        )
        page.wait_for_selector("#summary:not(.hidden)")
        page.click("#btnSumHome")
        wait_menu(page)
        if "#summary" in page.url or "#practice" in page.url:
            fail(f"btnSumHome did not return to menu: {page.url}")
        ok("btnSumHome → geometry menu")

        page.go_back()
        page.wait_for_selector('#groups a.app[href="geometry/"]')
        title = page.locator("h1").first.inner_text().strip()
        if "הלימודים של אמיליה" not in title:
            fail(f"back after btnSumHome did not land on hub: {title!r} {page.url}")
        ok("back after btnSumHome → hub")

        # --- D: reload with #practice / #summary falls back to menu ---
        page.goto(BASE + "/geometry/#practice", wait_until="domcontentloaded")
        wait_menu(page)
        if "#practice" in page.url or "#summary" in page.url:
            fail(f"reload #practice did not fall back to menu: {page.url}")
        if visible(page, "#practice:not(.hidden)"):
            fail("reload #practice showed practice with no live session")
        ok("reload #practice → menu")

        page.goto(BASE + "/geometry/#summary", wait_until="domcontentloaded")
        wait_menu(page)
        if "#summary" in page.url or "#practice" in page.url:
            fail(f"reload #summary did not fall back to menu: {page.url}")
        ok("reload #summary → menu")

        # --- E: parents pin, phone back → menu ---
        page.goto(BASE + "/geometry/", wait_until="domcontentloaded")
        page.wait_for_selector("#btnParentHome")
        page.click("#btnParentHome")
        page.wait_for_selector("#pinScreen:not(.hidden)")
        if not page.url.endswith("#pin"):
            fail(f"pin URL is {page.url}")
        page.go_back()
        wait_menu(page)
        if "#pin" in page.url or "#parents" in page.url:
            fail(f"back from pin did not reach menu: {page.url}")
        ok("phone back from הורים pin → geometry menu")

        # pin → parent (#parents) → in-app חזרה → menu
        page.click("#btnParentHome")
        page.wait_for_selector("#pinScreen:not(.hidden)")
        page.fill("#pinInput", "2604")
        page.wait_for_selector("#parent:not(.hidden)")
        if not page.url.endswith("#parents"):
            fail(f"parent URL is {page.url}, expected #parents")
        page.click("#btnBack")
        wait_menu(page)
        if "#parents" in page.url or "#pin" in page.url:
            fail(f"btnBack from parents did not reach menu: {page.url}")
        ok("btnBack from parents → geometry menu")

        # reload #parents without unlock → menu
        # leave the page first so this is a real document load, not a same-document hash change
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.wait_for_selector('#groups a.app[href="geometry/"]')
        page.goto(BASE + "/geometry/#parents", wait_until="domcontentloaded")
        wait_menu(page)
        if "#parents" in page.url:
            fail(f"reload #parents did not fall back to menu: {page.url}")
        ok("reload #parents → menu")

        # console: ignore aborted cloud fetches
        serious = [
            c for c in CONSOLE
            if "ERR_FAILED" not in c
            and "net::" not in c
            and "Failed to fetch" not in c
            and "supabase" not in c.lower()
        ]
        if serious:
            fail("JS console issues: " + " | ".join(serious[:8]))
        ok("no JS console errors")

        browser.close()
    httpd.shutdown()
    print("ALL TESTS PASSED")


if __name__ == "__main__":
    main()
