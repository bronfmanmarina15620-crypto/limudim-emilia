#!/usr/bin/env python3
"""History back: hub → English → topic → back lands on the English menu, then the hub."""
import http.server
import os
import threading
import sys
from functools import partial

from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PORT = 8765
BASE = f"http://127.0.0.1:{PORT}"
KEY = "english_amelia_v1"

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

def main():
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    httpd.daemon_threads = True
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--headless=new", "--no-sandbox", "--disable-gpu"],
        )
        context = browser.new_context()
        page = context.new_page()
        page.route("**://nrxhjzmmmzqjytmdgzjg.supabase.co/**", abort_cloud)

        # --- A: full path Amelia actually uses ---
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.wait_for_selector('#groups a.app[href="english/"]')
        if not visible(page, "h1"):
            fail("hub home did not render")
        title = page.locator("h1").first.inner_text().strip()
        if "הלימודים של אמיליה" not in title:
            fail(f"hub title was {title!r}")
        ok("hub home")

        page.click('#groups a.app[href="english/"]')
        page.wait_for_selector("#home:not(.hidden) button.topic[data-t='voc_eh']")
        if visible(page, "#play:not(.hidden)"):
            fail("English opened already inside a topic")
        if "#topic=" in page.url:
            fail(f"English menu URL already has a topic hash: {page.url}")
        ok("hub → English menu")

        page.click("button.topic[data-t='voc_eh']")
        page.wait_for_selector("#play:not(.hidden)")
        if not page.url.endswith("#topic=voc_eh"):
            fail(f"topic URL is {page.url}, expected #topic=voc_eh")
        if visible(page, "#home:not(.hidden)"):
            fail("home still visible inside topic")
        ok("opened מילים אנגלית←עברית")

        page.go_back()
        page.wait_for_function(
            """() => {
              const home = document.getElementById('home');
              const play = document.getElementById('play');
              return home && !home.classList.contains('hidden')
                  && play && play.classList.contains('hidden');
            }"""
        )
        if "english" not in page.url or "#topic=" in page.url or "#mode=" in page.url or page.url.endswith("#words"):
            fail(f"after first back, expected English menu, got {page.url}")
        if not visible(page, "#home:not(.hidden) button.topic[data-t='voc_eh']"):
            fail("English topic list missing after phone back")
        # Must still have an active session to resume (we left immediately, idx may be 0)
        active = page.evaluate("() => (window.EnglishApp && EnglishApp.db() || {}).active")
        if not active or active.get("topic") != "voc_eh":
            fail(f"leaving mid-session lost db.active: {active}")
        ok("phone back → English menu (session kept)")

        page.go_back()
        page.wait_for_selector('#groups a.app[href="english/"]')
        if "/english" in page.url.rstrip("/") and not page.url.rstrip("/").endswith("limudim-emilia"):
            # after back we should be at hub root, not still in /english/
            if page.url.rstrip("/").endswith("/english") or "/english/" in page.url:
                fail(f"second back stayed in English: {page.url}")
        title = page.locator("h1").first.inner_text().strip()
        if "הלימודים של אמיליה" not in title:
            fail(f"second back did not land on hub, title={title!r} url={page.url}")
        if visible(page, "#groups"):
            ok("phone back → hub")
        else:
            fail("hub groups missing after second back")

        # --- B: in-app back on word sheet and on a topic ---
        page.click('#groups a.app[href="english/"]')
        page.wait_for_selector("#btnWords")
        page.click("#btnWords")
        page.wait_for_selector("#words:not(.hidden)")
        if not page.url.endswith("#words"):
            fail(f"word sheet URL is {page.url}")
        page.click("#wBack")
        page.wait_for_selector("#home:not(.hidden)")
        if "#words" in page.url:
            fail(f"wBack did not drop #words: {page.url}")
        ok("in-app חזרה from word sheet → English menu")

        page.click("button.topic[data-t='voc_he']")
        page.wait_for_selector("#play:not(.hidden)")
        page.click("#pBack")
        page.wait_for_selector("#home:not(.hidden)")
        if not page.url.rstrip("#").endswith("/english/") and "#topic=" in page.url:
            fail(f"pBack did not return to menu: {page.url}")
        if visible(page, "#play:not(.hidden)"):
            fail("play still visible after הפסקה")
        ok("in-app הפסקה from topic → English menu")

        # --- C: mid-session answers survive a back ---
        page.click("button.topic[data-t='voc_eh']")
        page.wait_for_selector("#play:not(.hidden) .opt, #play:not(.hidden) .typebox")
        # Answer one item (right or wrong); then next if needed so idx advances / item is saved.
        def try_save_one():
            # multiple-choice
            if page.locator("#play:not(.hidden) button.opt").count():
                page.locator("#play:not(.hidden) button.opt").first.click()
            elif page.locator("#play #ans").count():
                page.fill("#play #ans", "xxx")
                if page.locator("#checkBtn").count():
                    page.click("#checkBtn")
            page.wait_for_timeout(400)
            if page.locator("#nextBtn:not(.hidden)").count():
                page.click("#nextBtn")
                page.wait_for_timeout(200)

        try_save_one()
        # After a finished item, idx >= 1 or sessions[].items has entries
        stored_before = page.evaluate(
            """() => {
              const raw = localStorage.getItem('english_amelia_v1');
              const db = raw ? JSON.parse(raw) : {};
              const items = (db.sessions||[]).reduce((n,s)=>n+((s.items||[]).length),0);
              return { items, active: !!(db.active && db.active.queue), idx: db.active && db.active.idx, key: 'english_amelia_v1' };
            }"""
        )
        page.click("#pBack")
        page.wait_for_selector("#home:not(.hidden)")
        stored_after = page.evaluate(
            """() => {
              const raw = localStorage.getItem('english_amelia_v1');
              const db = raw ? JSON.parse(raw) : {};
              const items = (db.sessions||[]).reduce((n,s)=>n+((s.items||[]).length),0);
              return { items, active: !!(db.active && db.active.queue), idx: db.active && db.active.idx };
            }"""
        )
        if stored_after["items"] < stored_before["items"]:
            fail(f"back lost saved items: before={stored_before} after={stored_after}")
        if stored_before["items"] == 0 and stored_before["idx"] == 0:
            # first question may not have been markable in this UI path; active must still exist
            if not stored_after["active"]:
                fail(f"back cleared active session: {stored_after}")
            ok("mid-session back kept active session (no completed item yet)")
        else:
            if stored_after["items"] < 1 and not stored_after["active"]:
                fail(f"back lost progress: {stored_after}")
            ok(f"mid-session back kept progress items={stored_after['items']} idx={stored_after['idx']}")

        # --- D: refresh with hash opens the topic; back → menu ---
        page.goto(BASE + "/english/#topic=spell", wait_until="domcontentloaded")
        page.wait_for_selector("#play:not(.hidden)")
        if not page.url.endswith("#topic=spell"):
            fail(f"hash refresh URL {page.url}")
        page.go_back()
        page.wait_for_selector("#home:not(.hidden)")
        if "#topic=" in page.url:
            fail(f"back from hashed topic did not reach menu: {page.url}")
        ok("refresh #topic=spell → play; back → menu")

        # --- E: ?topic= deep link from hub recs: back → English menu ---
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.wait_for_selector("#groups")
        page.goto(BASE + "/english/?topic=voc_eh", wait_until="domcontentloaded")
        page.wait_for_selector("#play:not(.hidden)")
        if "#topic=voc_eh" not in page.url:
            fail(f"query deep link did not become hash: {page.url}")
        if "topic=" in page.url.split("#")[0] and "?topic=" in page.url:
            fail(f"query was not stripped: {page.url}")
        page.go_back()
        page.wait_for_selector("#home:not(.hidden)")
        if "english" not in page.url:
            fail(f"back from ?topic= skipped English menu: {page.url}")
        ok("?topic= deep link → play; back → English menu")

        # --- F: hub in-page reinforce back ---
        page.goto(BASE + "/", wait_until="domcontentloaded")
        page.wait_for_selector("#btnReinforce")
        page.click("#btnReinforce")
        page.wait_for_selector("#reinforce:not(.hidden)")
        if not page.url.endswith("#reinforce"):
            fail(f"reinforce URL is {page.url}")
        page.go_back()
        page.wait_for_selector("#home:not(.hidden)")
        if "#reinforce" in page.url:
            fail(f"hub back from reinforce stayed on hash: {page.url}")
        if not visible(page, "#groups"):
            fail("hub groups missing after back from reinforce")
        ok("hub: phone back from תרגול מחזק → hub home")

        browser.close()
    httpd.shutdown()
    print("ALL TESTS PASSED")

if __name__ == "__main__":
    main()
