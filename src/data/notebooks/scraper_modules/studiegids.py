# simple Selenium scraper for studiegids
# notes: one section open at a time, scrape visible tables after each click
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import re, time

ROOT = "#study-program"

class StudiegidsScraper:
    def __init__(self, driver, wait_seconds=20, debug=False):
        self.driver = driver
        self.wait = WebDriverWait(driver, wait_seconds)
        self.debug = debug

    # small helpers
    def _dismiss_cookies(self):
        # tries a few common accept buttons, also inside iframes
        xpaths = [
            "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'accept')]",
            "//button[contains(., 'Akkoord')]",
            "//button[contains(., 'Alles accepteren')]",
            "//button[contains(., 'Accept all')]",
            "//button[contains(., 'Accept')]",
        ]
        def try_click():
            for xp in xpaths:
                try:
                    btn = WebDriverWait(self.driver, 2).until(EC.element_to_be_clickable((By.XPATH, xp)))
                    self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", btn)
                    time.sleep(0.2)
                    btn.click()
                    return True
                except Exception:
                    pass
            return False
        if try_click():
            return
        for fr in self.driver.find_elements(By.CSS_SELECTOR, "iframe"):
            try:
                self.driver.switch_to.frame(fr)
                if try_click():
                    self.driver.switch_to.default_content()
                    return
            except Exception:
                self.driver.switch_to.default_content()
            finally:
                self.driver.switch_to.default_content()

    def _open_tab_three(self, url):
        base = url.split("#/tab=")[0]
        self.driver.get(f"{base}#/tab=3")
        self._dismiss_cookies()
        time.sleep(0.8)

    def _section_title(self, container_css):
        # reads a title text for any accordion item
        for sel in [
            f"{container_css} .accordion-title",
            f"{container_css} [id$='-accordion-label']",
            f"{container_css} button",
            f"{container_css} h3",
            f"{container_css} h4",
        ]:
            try:
                el = self.driver.find_element(By.CSS_SELECTOR, sel)
                t = el.text.strip()
                if t:
                    return t
            except Exception:
                continue
        try:
            return self.driver.find_element(By.CSS_SELECTOR, container_css).text.strip()
        except Exception:
            return ""

    def _click_section(self, container_css):
        # clicks a section header and waits a moment
        for sel in [
            f"{container_css} .accordion-title",
            f"{container_css} [id$='-accordion-label']",
            f"{container_css} button",
        ]:
            try:
                el = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, sel)))
                self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
                time.sleep(0.2)
                el.click()
                time.sleep(0.5)
                return True
            except Exception:
                continue
        return False

    def _is_minor(self, txt):
        return bool(re.search(r"\bminor\b", str(txt or ""), flags=re.I))

    def _year_from(self, txt):
        s = str(txt or "")
        if re.search(r"\bfirst\s*year\b|\byear\s*1\b", s, flags=re.I): return 1
        if re.search(r"\bsecond\s*year\b|\byear\s*2\b", s, flags=re.I): return 2
        if re.search(r"\bthird\s*year\b|\byear\s*3\b", s, flags=re.I): return 3
        return None

    def _track_from(self, txt):
        # removes year part and common prefixes
        s = re.sub(r"\byear\s*\d\b.*", "", str(txt or ""), flags=re.I).strip()
        s = re.sub(r"^(Track|Specialization)\s+", "", s, flags=re.I).strip()
        return s

    def _labels_for(self, top_label, child_label):
        # prefer year from child, else from top
        ylab = child_label if self._year_from(child_label) else (top_label if self._year_from(top_label) else "")
        # if top has a year, take track from child, else from top
        if self._year_from(top_label):
            tlab = self._track_from(child_label)
        else:
            tlab = self._track_from(top_label)
        return ylab, tlab

    def _scrape_visible_rows(self, track_label, year_label):
        # walks all visible tables under ROOT and returns course dicts
        out = []
        try:
            scope = self.driver.find_element(By.CSS_SELECTOR, ROOT)
        except Exception:
            return out
        tbodys = scope.find_elements(By.CSS_SELECTOR, "table tbody")
        for tb in tbodys:
            if not tb.is_displayed(): 
                continue
            for tr in tb.find_elements(By.CSS_SELECTOR, "tr"):
                tds = tr.find_elements(By.CSS_SELECTOR, "td")
                if not tds: 
                    continue
                # name
                try:
                    name = tds[0].find_element(By.CSS_SELECTOR, "a").text.strip()
                except Exception:
                    name = tds[0].text.strip()
                if not name: 
                    continue
                # period
                per = None
                if len(tds) > 1:
                    try:
                        per_text = tds[1].find_element(By.CSS_SELECTOR, "a").text.strip()
                    except Exception:
                        per_text = tds[1].text.strip()
                    m = re.search(r"(\d+)", per_text)
                    per = int(m.group(1)) if m else None
                # ects
                ects = None
                if len(tds) > 2:
                    try:
                        ects_text = tds[2].find_element(By.CSS_SELECTOR, "a").text.strip()
                    except Exception:
                        ects_text = tds[2].text.strip()
                    m = re.search(r"(\d+)", ects_text)
                    ects = int(m.group(1)) if m else None
                # code
                code = ""
                if len(tds) > 3:
                    try:
                        code = tds[3].find_element(By.CSS_SELECTOR, "a").text.strip()
                    except Exception:
                        code = tds[3].text.strip()
                # drop obvious non rows
                if not code and per is None and ects is None:
                    continue
                out.append({
                    "course_name": name,
                    "period": per,
                    "ects": ects,
                    "code": code,
                    "track": track_label or "",
                    "year_label": year_label or ""
                })
        return out

    def list_programmes(self, listing_url, faculties, english_label_css="#LanguageEN0 + label"):
        # opens listing, sets filters, returns cards with title and url
        d = self.driver
        d.get(listing_url)
        self._dismiss_cookies()
        self.wait.until(lambda x: x.find_elements(By.CSS_SELECTOR, "div.sg-dropdown-title") or x.find_elements(By.CSS_SELECTOR, ".sg-search-result"))
        # language
        try:
            lang = self.wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, english_label_css)))
            d.execute_script("arguments[0].scrollIntoView({block:'center'});", lang)
            time.sleep(0.2)
            lang.click()
        except Exception:
            lab = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//label[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'english')]")))
            d.execute_script("arguments[0].scrollIntoView({block:'center'});", lab)
            time.sleep(0.2)
            lab.click()
        # faculty
        fac_title = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(@class,'sg-dropdown-title')][.//span[contains(., 'Faculty')]]")))
        d.execute_script("arguments[0].scrollIntoView({block:'center'});", fac_title)
        time.sleep(0.2)
        fac_title.click()
        for fac in faculties:
            lab = self.wait.until(EC.element_to_be_clickable((By.XPATH, f"//label[contains(., '{fac}')]")))
            d.execute_script("arguments[0].scrollIntoView({block:'center'});", lab)
            time.sleep(0.2)
            lab.click()
        time.sleep(1.0)
        # collect two pages
        def read_cards():
            cards = []
            seen = set()
            for c in d.find_elements(By.CSS_SELECTOR, ".sg-search-result"):
                try:
                    el = c.find_element(By.CSS_SELECTOR, ".sg-mb-1")
                    title = el.text.strip()
                    try:
                        a = el.find_element(By.CSS_SELECTOR, "a[href]")
                    except Exception:
                        a = c.find_element(By.CSS_SELECTOR, "a[href]")
                    href = a.get_attribute("href")
                    if href and href not in seen:
                        cards.append({"title": title, "url": href})
                        seen.add(href)
                except Exception:
                    continue
            return cards
        items = read_cards()
        d.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.0)
        try:
            nav = d.find_element(By.CSS_SELECTOR, "nav.sg-pagination")
            for el in nav.find_elements(By.XPATH, ".//*[normalize-space()='2' or @aria-label='Next']"):
                try:
                    d.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
                    time.sleep(0.2)
                    el.click()
                    time.sleep(1.0)
                    break
                except Exception:
                    continue
            items += read_cards()
        except Exception:
            pass
        return items

    def parse_programme_studiegids(self, url, skip_honors=False):
        # parses all visible rows after each click at every level
        self._open_tab_three(url)
        out, seen = [], set()

        # no accordion, just scrape
        if not self.driver.find_elements(By.CSS_SELECTOR, f"{ROOT} .accordion > div"):
            for r in self._scrape_visible_rows("", ""):
                key = (r["course_name"], r["code"], r["track"], r["year_label"])
                if key in seen: 
                    continue
                seen.add(key)
                out.append(r)
            return out

        top_count = len(self.driver.find_elements(By.CSS_SELECTOR, f"{ROOT} .accordion > div"))
        for i in range(1, top_count + 1):
            top_css = f"{ROOT} .accordion > div:nth-child({i})"
            tlab = self._section_title(top_css)
            if not tlab: 
                continue
            if self._is_minor(tlab): 
                if self.debug: print("skip minor", tlab)
                continue
            if skip_honors and re.search(r"\bhonours|\bhonors", tlab, flags=re.I):
                if self.debug: print("skip honors", tlab)
                continue

            self._click_section(top_css)
            if self.debug: print("top", tlab)
            ylab_top, track_top = self._labels_for(tlab, "")
            for r in self._scrape_visible_rows(track_top, ylab_top):
                key = (r["course_name"], r["code"], r["track"], r["year_label"])
                if key in seen: 
                    continue
                seen.add(key)
                out.append(r)

            parent_content = f"{top_css} .accordion-content"
            child_items = self.driver.find_elements(By.CSS_SELECTOR, f"{parent_content} .accordion > div")
            for j in range(1, len(child_items) + 1):
                child_css = f"{parent_content} .accordion > div:nth-child({j})"
                clab = self._section_title(child_css)
                if not clab: 
                    continue
                if self._is_minor(clab):
                    if self.debug: print("child skip minor", clab)
                    continue
                if skip_honors and re.search(r"\bhonours|\bhonors", clab, flags=re.I):
                    if self.debug: print("child skip honors", clab)
                    continue
                self._click_section(child_css)
                if self.debug: print(" child", clab)
                ylab, track_lab = self._labels_for(tlab, clab)
                for r in self._scrape_visible_rows(track_lab, ylab):
                    key = (r["course_name"], r["code"], r["track"], r["year_label"])
                    if key in seen: 
                        continue
                    seen.add(key)
                    out.append(r)

                # optional third level
                gparent = f"{child_css} .accordion-content"
                gkids = self.driver.find_elements(By.CSS_SELECTOR, f"{gparent} .accordion > div")
                for k in range(1, len(gkids) + 1):
                    g_css = f"{gparent} .accordion > div:nth-child({k})"
                    glab = self._section_title(g_css)
                    if not glab: 
                        continue
                    if self._is_minor(glab):
                        if self.debug: print("  grandchild skip minor", glab)
                        continue
                    self._click_section(g_css)
                    if self.debug: print("  grandchild", glab)
                    y2, t2 = self._labels_for(clab, glab)
                    for r in self._scrape_visible_rows(t2, y2):
                        key = (r["course_name"], r["code"], r["track"], r["year_label"])
                        if key in seen: 
                            continue
                        seen.add(key)
                        out.append(r)

        return out
