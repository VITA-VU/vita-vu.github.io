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

    def list_programmes(self, listing_url, faculties):
        """
        Open the listing. Select English. Select given faculties. Read page one.
        Click to page two using several fallbacks. Wait for real refresh.
        Read again. Return unique cards across both pages.
        """
        d = self.driver
        w = self.wait

        def _open_filter_panel(title_text):
            xp = f"//div[contains(@class,'sg-dropdown-title')][.//span[contains(normalize-space(.), '{title_text}')]]"
            hdr = w.until(EC.element_to_be_clickable((By.XPATH, xp)))
            d.execute_script("arguments[0].scrollIntoView({block:'center'});", hdr)
            time.sleep(0.2)
            hdr.click()
            time.sleep(0.2)
            try:
                panel = hdr.find_element(By.XPATH, "following-sibling::*[1]")
            except Exception:
                panel = d
            return panel

        def _click_option(panel, text_contains=None, id_prefix=None):
            if id_prefix:
                try:
                    cb = panel.find_element(By.CSS_SELECTOR, f"input[id^='{id_prefix}']")
                    lab = cb.find_element(By.XPATH, "following-sibling::label[1]")
                    d.execute_script("arguments[0].scrollIntoView({block:'center'});", lab)
                    time.sleep(0.1)
                    d.execute_script("arguments[0].click();", lab)
                    time.sleep(0.2)
                    return True
                except Exception:
                    pass
            if text_contains:
                try:
                    lbl = panel.find_element(
                        By.XPATH,
                        f".//label[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), '{text_contains.lower()}')]"
                    )
                    d.execute_script("arguments[0].scrollIntoView({block:'center'});", lbl)
                    time.sleep(0.1)
                    lbl.click()
                    time.sleep(0.2)
                    return True
                except Exception:
                    pass
            return False

        def _read_cards():
            cards = []
            seen_local = set()
            for c in d.find_elements(By.CSS_SELECTOR, ".sg-search-result"):
                try:
                    title_el = c.find_element(By.CSS_SELECTOR, ".sg-mb-1")
                    title = title_el.text.strip()
                    try:
                        a = title_el.find_element(By.CSS_SELECTOR, "a[href]")
                    except Exception:
                        a = c.find_element(By.CSS_SELECTOR, "a[href]")
                    href = a.get_attribute("href")
                    if title and href and href not in seen_local:
                        cards.append({"title": title, "url": href})
                        seen_local.add(href)
                except Exception:
                    continue
            return cards

        def _find_paginator():
            # try the deep selector you observed, then fall back to generic
            selectors = [
                "body > div > div > div.grid-container > div > div > div > div.cell.small-12.large-8.xlarge-9 > div.sg-mt-2.sg-mt-m-3.sg-mt-l-8 > nav.sg-pagination.sg-mt-7.sg-mt-m-6.show-for-medium",
                "nav.sg-pagination",
                "nav[class*='sg-pagination']",
            ]
            for sel in selectors:
                try:
                    nav = d.find_element(By.CSS_SELECTOR, sel)
                    return nav
                except Exception:
                    continue
            return None

        def _wait_results_refresh(prev_hrefs, timeout=6):
            t0 = time.time()
            while time.time() - t0 < timeout:
                try:
                    anchors = d.find_elements(By.CSS_SELECTOR, ".sg-search-result a[href]")
                    hrefs = [a.get_attribute("href") for a in anchors if a.get_attribute("href")]
                    if any(h not in prev_hrefs for h in hrefs):
                        return True
                except Exception:
                    pass
                time.sleep(0.2)
            return False

        # 1. open listing and wait for filters or results
        d.get(listing_url)
        self._dismiss_cookies()
        w.until(lambda x: x.find_elements(By.CSS_SELECTOR, "div.sg-dropdown-title") or x.find_elements(By.CSS_SELECTOR, ".sg-search-result"))

        # 2. Language
        try:
            lang_panel = _open_filter_panel("Language")
            clicked = _click_option(lang_panel, id_prefix="LanguageEN")
            if not clicked:
                clicked = _click_option(lang_panel, text_contains="english")
            time.sleep(0.5)
        except Exception:
            pass

        # 3. Faculty
        try:
            fac_panel = _open_filter_panel("Faculty")
            for fac in faculties:
                _click_option(fac_panel, text_contains=fac)
            time.sleep(0.6)
        except Exception:
            pass

        # 4. collect page one
        items = _read_cards()
        seen = {it["url"] for it in items}

        # 5. navigate to page two with several strategies
        try:
            d.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(0.6)
            nav = _find_paginator()
            if nav:
                clicked = False

                # strategy a. explicit page 2 by text or aria label
                for el in nav.find_elements(By.XPATH, ".//a[normalize-space()='2'] | .//button[normalize-space()='2'] | .//*[@aria-label='2' or @aria-label='Go to page 2']"):
                    try:
                        d.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
                        time.sleep(0.1)
                        el.click()
                        clicked = True
                        break
                    except Exception:
                        continue

                # strategy b. click the second page candidate li
                if not clicked:
                    try:
                        lis = nav.find_elements(By.CSS_SELECTOR, "li")
                        for li in lis:
                            cls = li.get_attribute("class") or ""
                            if "next" in cls.lower() or "prev" in cls.lower():
                                continue
                            link = None
                            try:
                                link = li.find_element(By.CSS_SELECTOR, "a,button")
                            except Exception:
                                link = None
                            if not link:
                                continue
                            lab = (link.text or "").strip()
                            aria = link.get_attribute("aria-label") or ""
                            if lab == "2" or "page 2" in aria.lower() or aria.strip() == "2":
                                d.execute_script("arguments[0].scrollIntoView({block:'center'});", link)
                                time.sleep(0.1)
                                link.click()
                                clicked = True
                                break
                    except Exception:
                        pass

                # strategy c. next button
                if not clicked:
                    for el in nav.find_elements(By.XPATH, ".//*[@aria-label='Next'] | .//a[contains(@class,'sg-pagination__next')] | .//button[contains(@class,'sg-pagination__next')]"):
                        try:
                            d.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
                            time.sleep(0.1)
                            el.click()
                            clicked = True
                            break
                        except Exception:
                            continue

                # wait for a real refresh, then read again
                if clicked:
                    _wait_results_refresh(seen, timeout=6)
                    items2 = _read_cards()
                    for it in items2:
                        if it["url"] not in seen:
                            items.append(it)
                            seen.add(it["url"])
        except Exception:
            pass

        return items



    def parse_programme_studiegids(self, url, skip_honors=False, include_minors=True):
        """
        Open tab 3. Click every accordion top section and every nested section.
        After each click, scrape all visible tables under the study area.
        Include minors by default. Optionally skip honors.
        """
        # go to the Study programme tab
        self._open_tab_three(url)

        out = []
        seen = set()
        ROOT = "#study-program"

        def labels_from_stack(stack):
            """derive track label and year label from the labels stack"""
            year_label = ""
            for lab in reversed(stack):
                if re.search(r"\byear\b", str(lab), flags=re.I):
                    year_label = lab
                    break
            track_label = ""
            for lab in stack:
                s = str(lab or "")
                if re.search(r"\byear\b", s, flags=re.I):
                    continue
                # strip common prefixes
                s2 = re.sub(r"^(Track|Specialization|Specialisation)\s+", "", s, flags=re.I).strip()
                # ignore generic group names when picking a track
                if re.search(r"\b(compulsory|constrained|choice|elective)\b", s2, flags=re.I):
                    continue
                track_label = s2 if s2 else track_label
                if track_label:
                    break
            return track_label, year_label

        def scrape_now(stack):
            """scrape every visible course row under the whole study area right now"""
            track_label, year_label = labels_from_stack(stack)
            try:
                scope = self.driver.find_element(By.CSS_SELECTOR, ROOT)
            except Exception:
                return
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
                    # keep rows even without code, but drop obvious summary lines
                    if not code and per is None and ects is None:
                        continue
                    row = {
                        "course_name": name,
                        "period": per,
                        "ects": ects,
                        "code": code,
                        "track": track_label or "",
                        "year_label": year_label or "",
                    }
                    key = (row["course_name"], row["code"], row["track"], row["year_label"])
                    if key not in seen:
                        seen.add(key)
                        out.append(row)

        def section_title(container_css):
            """read a title for any accordion container"""
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

        def click_header(container_css):
            """click the header of a section, wait briefly for DOM update"""
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
                    time.sleep(0.4)
                    return True
                except Exception:
                    continue
            return False

        def child_selectors(parent_css):
            """return fresh css selectors for direct child accordion items"""
            pc = f"{parent_css} .accordion-content"
            sels = []
            # gather each accordion block inside the content area
            accs = self.driver.find_elements(By.CSS_SELECTOR, f"{pc} .accordion")
            if not accs:
                return sels
            for a_idx in range(1, len(accs) + 1):
                a_css = f"{pc} .accordion:nth-of-type({a_idx})"
                items = self.driver.find_elements(By.CSS_SELECTOR, f"{a_css} > div")
                for i in range(1, len(items) + 1):
                    sels.append(f"{a_css} > div:nth-child({i})")
            return sels

        def walk(container_css, stack, depth):
            """open this section, scrape, then recurse into its children"""
            title = section_title(container_css)
            if not title:
                return
            # include minors by default, optionally skip honors
            if not include_minors and re.search(r"\bminor\b", title, flags=re.I):
                return
            if skip_honors and re.search(r"\bhonours|\bhonors", title, flags=re.I):
                return

            click_header(container_css)
            scrape_now(stack + [title])

            # recurse into children if any
            for child_css in child_selectors(container_css):
                walk(child_css, stack + [title], depth + 1)

        # if there are no accordions, scrape whatever is visible and return
        if not self.driver.find_elements(By.CSS_SELECTOR, f"{ROOT} .accordion > div"):
            scrape_now([])
            return out

        # always start by scraping after opening each top section, then drill down
        top_items = self.driver.find_elements(By.CSS_SELECTOR, f"{ROOT} .accordion > div")
        for idx in range(1, len(top_items) + 1):
            top_css = f"{ROOT} .accordion > div:nth-child({idx})"
            # do not pre filter minors here, the user asked to include all sections
            walk(top_css, [], 0)

        return out


        return out
