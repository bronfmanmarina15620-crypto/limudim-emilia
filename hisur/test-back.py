# Back-button test for hisur/ (21.11). Usage: python3 hisur/test-back.py <base-url-of-limudim-emilia/>
# Cloud (supabase) requests are blocked so no test data reaches Amelia's saved rows.
import sys, json
from playwright.sync_api import sync_playwright
BASE = sys.argv[1].rstrip("/") + "/"
fails = []; oks = 0
def ok(cond, name):
    global oks
    if cond: oks += 1
    else: fails.append(name); print("FAIL", name)
def vis(pg, sel): return pg.is_visible(sel)
def h(pg): return pg.evaluate("location.hash")
def back(pg):
    pg.evaluate("history.back()"); pg.wait_for_timeout(700)
def fwd(pg):
    pg.evaluate("history.forward()"); pg.wait_for_timeout(700)
def newpage(b):
    ctx = b.new_context(viewport={"width": 420, "height": 900})
    ctx.route("**/*supabase.co/**", lambda r: r.abort())
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.wait_for_timeout(600)
    return ctx, pg, errs
def at_hub(pg): return pg.evaluate("location.pathname").rstrip("/").endswith("limudim-emilia") or pg.evaluate("location.pathname") == "/"
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome")
    # ---------- mivhan ----------
    ctx, pg, errs = newpage(b)
    pg.goto(BASE + "hisur/mivhan/"); pg.wait_for_timeout(900)
    ok(vis(pg, "#homeMain"), "mivhan home")
    pg.click('#mathBody a[href="?section=mixf"], a[href="?section=mixf"]'); pg.wait_for_timeout(500)
    ok(h(pg) == "#sec=mixf" and vis(pg, "#secPanel"), "mivhan section via link")
    pg.click("#bSecMix"); pg.wait_for_timeout(600)
    ok(h(pg) == "#play" and vis(pg, "#vPlay"), "mivhan session")
    sid = pg.evaluate("sesId")
    back(pg)
    ok(vis(pg, "#secPanel") and vis(pg, "#vStart") and h(pg) == "#sec=mixf", "mivhan back play->section")
    act = pg.evaluate("JSON.parse(localStorage.mivhan_emilia_v1).active")
    ok(act and act["id"] == sid and act["exam"] == "mixf", "mivhan progress kept after back")
    ok(vis(pg, "#bResume"), "mivhan resume button")
    back(pg); ok(vis(pg, "#homeMain") and not vis(pg, "#secPanel") and h(pg) == "", "mivhan back section->home")
    fwd(pg); ok(vis(pg, "#secPanel"), "mivhan forward ->section")
    fwd(pg); ok(vis(pg, "#vPlay") and pg.evaluate("sesId") == sid, "mivhan forward ->same session")
    pg.click("#bAll"); pg.wait_for_timeout(700); ok(vis(pg, "#secPanel") and h(pg) == "#sec=mixf", "mivhan «לכל הנושאים» -> section")
    pg.click("#bSecBack"); pg.wait_for_timeout(700); ok(vis(pg, "#homeMain") and h(pg) == "", "mivhan bSecBack -> home")
    # pin / parent from home
    pg.click("#bParent"); pg.wait_for_timeout(300); ok(h(pg) == "#pin" and vis(pg, "#vPin"), "mivhan pin")
    pg.fill("#pin", "2604"); pg.click("#bPinOk"); pg.wait_for_timeout(500)
    ok(h(pg) == "#parent" and vis(pg, "#vParent"), "mivhan parent")
    back(pg); ok(vis(pg, "#homeMain") and h(pg) == "", "mivhan back parent->home")
    fwd(pg); ok(vis(pg, "#vPin") and not vis(pg, "#vParent") and h(pg) == "#pin", "mivhan forward to parent needs PIN")
    back(pg); ok(vis(pg, "#homeMain"), "mivhan back pin->home")
    # pin from inside a session
    pg.click("#bResume"); pg.wait_for_timeout(600); ok(vis(pg, "#vPlay") and h(pg) == "#play", "mivhan resume")
    pg.click("#bParent"); pg.wait_for_timeout(300); back(pg); ok(vis(pg, "#vPlay") and pg.evaluate("sesId") == sid, "mivhan back pin->session")
    back(pg); back(pg); ok(at_hub(pg), "mivhan home -> hub")
    ok(not errs, "mivhan no page errors " + str(errs)); ctx.close()
    # external ?section= link (hub -> section): back -> mivhan home -> hub
    ctx, pg, errs = newpage(b)
    pg.goto(BASE + "hisur/mivhan/?section=mixadd"); pg.wait_for_timeout(900)
    ok(vis(pg, "#secPanel") and "חיבור מספרים מעורבים" in pg.inner_text("#secTitle"), "mivhan ?section=mixadd opens")
    back(pg); ok(vis(pg, "#homeMain") and pg.url.endswith("/hisur/mivhan/"), "mivhan ?section back -> home")
    back(pg); ok(at_hub(pg), "mivhan ?section back x2 -> hub")
    pg.goto(BASE + "hisur/mivhan/?section=geo"); pg.wait_for_timeout(900); ok(vis(pg, "#secPanel"), "mivhan ?section=geo opens")
    ok(not errs, "mivhan2 no page errors " + str(errs)); ctx.close()
    # ---------- seder ----------
    ctx, pg, errs = newpage(b)
    pg.goto(BASE + "hisur/seder/"); pg.wait_for_timeout(900)
    ok(vis(pg, "#vStart"), "seder start")
    pg.click("#bStart"); pg.wait_for_timeout(500); ok(h(pg) == "#play" and vis(pg, "#vPlay"), "seder play")
    sid = pg.evaluate("sesId")
    back(pg); ok(vis(pg, "#vStart") and h(pg) == "", "seder back play->start")
    act = pg.evaluate("JSON.parse(localStorage.seder_emilia_v1).active")
    ok(act and act["id"] == sid, "seder progress kept")
    ok("ממשיכות" in pg.inner_text("#bStart"), "seder resume label")
    fwd(pg); ok(vis(pg, "#vPlay") and pg.evaluate("sesId") == sid, "seder forward -> same session")
    back(pg); pg.click("#bStart"); pg.wait_for_timeout(500); ok(pg.evaluate("sesId") == sid, "seder start button resumes")
    pg.click("#bParent"); pg.wait_for_timeout(300); ok(vis(pg, "#vPin"), "seder pin")
    pg.fill("#pin", "2604"); pg.click("#bPinOk"); pg.wait_for_timeout(400); ok(h(pg) == "#parent" and vis(pg, "#vParent"), "seder parent")
    pg.click("#bWS"); pg.wait_for_timeout(400); ok(h(pg) == "#ws" and vis(pg, "#vWS"), "seder worksheet")
    back(pg); ok(vis(pg, "#vParent"), "seder back ws->parent")
    back(pg); ok(vis(pg, "#vPlay") and h(pg) == "#play", "seder back parent->session")
    fwd(pg); ok(vis(pg, "#vPin") and not vis(pg, "#vParent"), "seder forward parent needs PIN")
    back(pg); back(pg); ok(vis(pg, "#vStart"), "seder back -> start"); back(pg); ok(at_hub(pg), "seder start -> hub")
    ok(not errs, "seder no page errors " + str(errs)); ctx.close()
    # ---------- hisur (חיסור במאונך) ----------
    ctx, pg, errs = newpage(b)
    pg.goto(BASE + "hisur/"); pg.wait_for_timeout(1200)
    ok(vis(pg, "#practice"), "hisur practice")
    pg.click("#btnParent"); pg.wait_for_timeout(300); ok(h(pg) == "#pin" and vis(pg, "#pinScreen"), "hisur pin")
    back(pg); ok(vis(pg, "#practice") and h(pg) == "", "hisur back pin->practice")
    pg.click("#btnParent"); pg.wait_for_timeout(300); pg.fill("#pinInput", "2604"); pg.wait_for_timeout(1500)
    ok(h(pg) == "#parent" and vis(pg, "#parent"), "hisur parent")
    back(pg); ok(vis(pg, "#practice") and h(pg) == "", "hisur back parent->practice")
    fwd(pg); ok(vis(pg, "#pinScreen") and not vis(pg, "#parent"), "hisur forward parent needs PIN")
    back(pg)
    pg.evaluate("finishSession()"); pg.wait_for_timeout(400); ok(h(pg) == "#summary" and vis(pg, "#summary"), "hisur summary")
    n = pg.evaluate("JSON.parse(localStorage.hisur_amelia_v1).sessions.length")
    back(pg); ok(vis(pg, "#practice") and h(pg) == "", "hisur back summary->practice")
    ok(pg.evaluate("JSON.parse(localStorage.hisur_amelia_v1).sessions.length") == n, "hisur sessions kept")
    back(pg); ok(at_hub(pg), "hisur practice -> hub")
    ok(not errs, "hisur no page errors " + str(errs)); ctx.close()
    b.close()
print("passed", oks, "failed", len(fails), fails)
sys.exit(1 if fails else 0)
