(() => {
  const { SONGS, DECADES, GENRES, METHODOLOGY, SPOTIFY } = window.__SX;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const peakStreams = Math.max(...SONGS.map(s => s.streams || 0));
  const peakSong = SONGS.find(s => s.streams === peakStreams);
  const totalStreams = SONGS.reduce((a, s) => a + (s.streams || 0), 0);
  const fmtB = n => { if (!n) return "live"; if (n >= 1e9) return (n/1e9).toFixed(2).replace(/\.?0+$/,"")+"B"; if (n >= 1e6) return (n/1e6).toFixed(0)+"M"; return n.toLocaleString(); };
  const spotifyUrl = s => `https://open.spotify.com/search/${encodeURIComponent(s.title+" "+s.artist)}`;
  const isCrown = s => s === peakSong;

  // ===== HERO TITLE — letter-drop with motion blur =====
  const htLine = $(".ht-line");
  if (htLine) {
    const text = htLine.dataset.letters || "ECHOES";
    htLine.innerHTML = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ht-letter";
      s.textContent = ch === " " ? " " : ch;
      s.style.setProperty("--d", `${0.15 + i * 0.09}s`);
      htLine.appendChild(s);
    });
  }

  // ===== HERO PARTICLES — floating green dots =====
  const particles = $("#heroParticles");
  if (particles) {
    for (let i = 0; i < 24; i++) {
      const d = document.createElement("div");
      d.className = "hp-dot";
      d.style.setProperty("--x", `${Math.random() * 100}%`);
      d.style.setProperty("--dur", `${10 + Math.random() * 14}s`);
      d.style.setProperty("--del", `${Math.random() * 12}s`);
      particles.appendChild(d);
    }
  }

  // ===== FLOATING ALBUM COVERS — 3D drift behind hero =====
  const floaters = $("#heroFloaters");
  if (floaters) {
    // Hand-pick iconic covers across decades
    const picks = ["Bohemian Rhapsody","Billie Jean","Don't Stop Believin'","Smells Like Teen Spirit","Mr. Brightside","Blinding Lights","Hotel California","Wonderwall","Lose Yourself","bad guy"];
    const chosen = picks.map(t => SONGS.find(s => s.title === t)).filter(Boolean).slice(0, 7);
    // Spread positions: left/right halves of viewport, varying depth
    const slots = [
      { x: "-38vw", y: "-22vh", z: "-280px", ry: -22, size: 130, op: 0.55, dur: 18 },
      { x: "36vw",  y: "-28vh", z: "-220px", ry: 18,  size: 110, op: 0.5,  dur: 20 },
      { x: "-44vw", y: "12vh",  z: "-160px", ry: -14, size: 150, op: 0.65, dur: 16 },
      { x: "42vw",  y: "8vh",   z: "-120px", ry: 14,  size: 140, op: 0.6,  dur: 22 },
      { x: "-30vw", y: "30vh",  z: "-340px", ry: -8,  size: 100, op: 0.42, dur: 24 },
      { x: "30vw",  y: "32vh",  z: "-380px", ry: 10,  size: 95,  op: 0.4,  dur: 19 },
      { x: "0",     y: "-34vh", z: "-420px", ry: 0,   size: 90,  op: 0.35, dur: 26 },
    ];
    chosen.forEach((song, i) => {
      const slot = slots[i]; if (!slot) return;
      const el = document.createElement("div");
      el.className = "hp-floater";
      el.style.setProperty("--x", slot.x);
      el.style.setProperty("--y", slot.y);
      el.style.setProperty("--z", slot.z);
      el.style.setProperty("--ry", slot.ry + "deg");
      el.style.setProperty("--rx", (Math.random() * 6 - 3) + "deg");
      el.style.setProperty("--rz", (Math.random() * 4 - 2) + "deg");
      el.style.setProperty("--size", slot.size + "px");
      el.style.setProperty("--op", slot.op);
      el.style.setProperty("--dur", slot.dur + "s");
      el.style.setProperty("--del", (Math.random() * -10) + "s");
      if (song.art) el.innerHTML = `<img src="${song.art}" alt="" loading="lazy" />`;
      else el.style.background = `linear-gradient(135deg,${song.palette.join(",")})`;
      floaters.appendChild(el);
      setTimeout(() => el.classList.add("in"), 1800 + i * 140);
    });
  }

  // ===== STAT COUNTERS in hero =====
  $$(".hs-num").forEach((el, i) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const start = performance.now() + 1700 + i * 120;
    const dur = 1100;
    const step = now => {
      if (now < start) { requestAnimationFrame(step); return; }
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * easeOut(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  // ===== BIRTH YEAR + CINEMATIC REVEAL =====
  const birthInput = $("#birthYear"), birthGo = $("#birthYearGo");
  const reveal = $("#reveal"), revealCover = $("#revealCover"), revealInfo = $("#revealInfo"), revealActions = $("#revealActions"), revealClose = $("#revealClose");

  const triggerReveal = (year) => {
    const song = SONGS.find(s => s.year === year);
    if (!song) return;
    const [a, b, c] = song.palette;
    const genre = GENRES[year] || "";

    // Cover
    if (song.art) {
      revealCover.innerHTML = `<img src="${song.art}" alt="${song.title}" />`;
    } else {
      revealCover.innerHTML = `<div class="reveal-cover-gradient" style="background:linear-gradient(135deg,${a},${b},${c})"></div>`;
    }
    revealCover.style.boxShadow = `0 40px 80px rgba(0,0,0,0.6), 0 0 60px ${a}40`;

    // Info (typed feel via staggered opacity)
    revealInfo.innerHTML = `
      <div class="reveal-year">${year}</div>
      <div class="reveal-song">${song.title}</div>
      <div class="reveal-artist">${song.artist}</div>
      <div class="reveal-streams"><span class="counting" id="revealCount">0</span> streams</div>
      ${genre ? `<span class="reveal-genre">${genre}</span>` : ""}
      <p class="reveal-note">${song.note}</p>
    `;

    // Actions
    revealActions.innerHTML = `
      <a class="reveal-btn primary" href="${spotifyUrl(song)}" target="_blank" rel="noopener">▶ Play on Spotify</a>
      <button class="reveal-btn secondary" id="revealShare">↓ Download for Stories</button>
      <button class="reveal-btn secondary" id="revealCopy">Copy link</button>
      <span class="reveal-tag">Now share yours. Tag someone born in a different decade.</span>
    `;

    requestAnimationFrame(() => {
      reveal.classList.add("active");
      // Count up streams
      countUp($("#revealCount"), song.streams, 1400);
      // Set hash
      history.replaceState(null, "", `#${year}`);
    });

    $("#revealShare")?.addEventListener("click", () => downloadCard(song));
    $("#revealCopy")?.addEventListener("click", () => {
      navigator.clipboard.writeText(location.origin + location.pathname + `#${year}`);
      const el = $("#revealCopy"); el.textContent = "Copied!"; setTimeout(() => el.textContent = "Copy link", 1500);
    });
  };

  const closeReveal = () => {
    reveal.classList.remove("active");
    history.replaceState(null, "", location.pathname);
  };
  revealClose?.addEventListener("click", closeReveal);

  birthGo?.addEventListener("click", () => { const v = parseInt(birthInput.value); if (v >= 1960 && v <= 2026) triggerReveal(v); });
  birthInput?.addEventListener("keydown", e => { if (e.key === "Enter") birthGo.click(); });

  // ===== TIMELINE SCRUBBER + HERO ARTWORK CROSS-FADE =====
  const scrubTrack = $("#scrubTrack"), stHandle = $("#stHandle"), stFill = $("#stFill"), stTicks = $("#stTicks"), stDecLabels = $("#stDecLabels");
  const htYear = $("#htYear"), htTitle = $("#htTitle"), htArtist = $("#htArtist"), htStreams = $("#htStreams");
  const haA = $("#haA"), haB = $("#haB"), haGlow = $("#haGlow");
  const Y_MIN = 1960, Y_MAX = 2026, Y_RANGE = Y_MAX - Y_MIN;

  if (scrubTrack && stHandle) {
    // Build ticks (every year, major every 5)
    if (stTicks) {
      for (let y = Y_MIN; y <= Y_MAX; y++) {
        const t = document.createElement("span");
        if (y % 5 === 0) t.className = "major";
        t.style.left = `${((y - Y_MIN) / Y_RANGE) * 100}%`;
        stTicks.appendChild(t);
      }
    }
    // Decade labels
    if (stDecLabels) {
      [1960, 1970, 1980, 1990, 2000, 2010, 2020].forEach(y => {
        const s = document.createElement("span");
        s.style.left = `${((y - Y_MIN) / Y_RANGE) * 100}%`;
        s.textContent = `'${String(y).slice(2)}`;
        stDecLabels.appendChild(s);
      });
    }

    // Preload images so cross-fade is instant
    const artCache = new Set();
    const preloadArt = (src) => {
      if (!src || artCache.has(src)) return;
      artCache.add(src);
      const i = new Image(); i.src = src;
    };
    SONGS.forEach(s => preloadArt(s.art));

    let curYear = 1995, activeLayer = "B", flipRaf = 0, lastTextYear = 0;

    const setArtwork = (song) => {
      if (!haA || !haB) return;
      const incoming = activeLayer === "A" ? haB : haA;
      const outgoing = activeLayer === "A" ? haA : haB;
      activeLayer = activeLayer === "A" ? "B" : "A";
      if (song.art) {
        incoming.style.backgroundImage = `url("${song.art}")`;
        incoming.style.backgroundColor = "";
      } else {
        incoming.style.backgroundImage = "";
        incoming.style.backgroundColor = song.palette[1];
      }
      requestAnimationFrame(() => {
        incoming.classList.add("on");
        outgoing.classList.remove("on");
      });
      if (haGlow) {
        const [a, b] = song.palette;
        haGlow.style.background = `radial-gradient(circle, ${b}99, ${a}66 35%, transparent 70%)`;
      }
    };

    // ===== streams count-up animation (Instagram-ready wow factor) =====
    let streamsRaf = 0;
    const animateStreams = (toVal) => {
      if (!htStreams) return;
      cancelAnimationFrame(streamsRaf);
      if (!toVal) { htStreams.textContent = "live"; return; }
      const dur = 900;
      const start = performance.now();
      const fromVal = 0;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = fromVal + (toVal - fromVal) * eased;
        htStreams.textContent = `${fmtB(v)} streams`;
        if (t < 1) streamsRaf = requestAnimationFrame(step);
        else htStreams.textContent = `${fmtB(toVal)} streams`;
      };
      streamsRaf = requestAnimationFrame(step);
    };

    const setText = (song, year) => {
      if (htYear) htYear.textContent = year;
      animateStreams(song.streams || 0);
      if (!htTitle || !htArtist) return;
      htTitle.classList.add("flip"); htArtist.classList.add("flip");
      cancelAnimationFrame(flipRaf);
      flipRaf = requestAnimationFrame(() => setTimeout(() => {
        htTitle.textContent = song.title;
        htArtist.textContent = song.artist;
        htTitle.classList.remove("flip"); htArtist.classList.remove("flip");
      }, 110));
    };

    // ===== decade transition overlay (the Instagram money shot) =====
    // When crossing a decade boundary, briefly flash a full-screen "Welcome to the 90s"
    // banner with cinematic typography.
    const decadeNames = {
      1960: "the sixties", 1970: "the seventies", 1980: "the eighties",
      1990: "the nineties", 2000: "the two-thousands", 2010: "the twenty-tens",
      2020: "the twenty-twenties",
    };
    const decadeOf = (y) => Math.floor(y / 10) * 10;
    let lastDecade = decadeOf(1995);

    // Inject overlay element once
    let decadeOverlay = document.getElementById("decadeOverlay");
    if (!decadeOverlay) {
      decadeOverlay = document.createElement("div");
      decadeOverlay.id = "decadeOverlay";
      decadeOverlay.className = "decade-overlay";
      decadeOverlay.innerHTML = `<span class="do-pre">welcome to</span><span class="do-decade"></span><span class="do-post">&#x25BC; keep scrolling</span>`;
      document.body.appendChild(decadeOverlay);
    }
    const doDecade = decadeOverlay.querySelector(".do-decade");
    let decadeFadeT = null;
    const flashDecade = (decade) => {
      if (!doDecade) return;
      doDecade.textContent = decadeNames[decade] || `the ${decade}s`;
      decadeOverlay.classList.add("show");
      clearTimeout(decadeFadeT);
      decadeFadeT = setTimeout(() => decadeOverlay.classList.remove("show"), 1500);
    };

    // ===== per-decade color theming (subtle accent shift) =====
    const decadeAccent = {
      1960: "#d4a13d", 1970: "#cf7e2b", 1980: "#e84e9a", 1990: "#1ed760",
      2000: "#b164e8", 2010: "#ff6ec7", 2020: "#1ed760",
    };
    const applyDecadeTheme = (year) => {
      const acc = decadeAccent[decadeOf(year)] || "#1ed760";
      document.documentElement.style.setProperty("--decade-accent", acc);
    };

    const setYear = (year, force = false) => {
      year = Math.max(Y_MIN, Math.min(Y_MAX, Math.round(year)));
      if (year === curYear && !force) return;
      const prevYear = curYear;
      curYear = year;
      const pct = ((year - Y_MIN) / Y_RANGE) * 100;
      stHandle.style.left = `${pct}%`;
      if (stFill) stFill.style.width = `${pct}%`;
      const song = SONGS.find(s => s.year === year);
      if (!song) return;
      setArtwork(song);
      applyDecadeTheme(year);
      // Decade-cross detection · only fire when actually crossing a decade boundary
      const newDecade = decadeOf(year);
      if (newDecade !== lastDecade && Math.abs(year - prevYear) <= 5) {
        flashDecade(newDecade);
        lastDecade = newDecade;
      } else if (newDecade !== lastDecade) {
        // big jump (e.g. clicking a year far away) · still flash but skip the count-up
        lastDecade = newDecade;
      }
      // Throttle text flip so rapid scrubbing doesn't thrash
      if (year !== lastTextYear) { lastTextYear = year; setText(song, year); }
    };

    // Initial position
    setYear(1995, true);

    // ===== AUTO-TOUR MODE · perfect for Instagram screen-records =====
    // Click the ▶ button (or press T) to auto-cycle through 1960 → 2026 over ~24s.
    // Each year holds for 350ms, decade-cross years pause longer for the overlay.
    let tourTimer = null;
    let tourYear = Y_MIN;
    const stopTour = () => {
      clearTimeout(tourTimer);
      tourTimer = null;
      document.body.classList.remove("is-touring");
      const btn = document.getElementById("tourBtn");
      if (btn) btn.textContent = "▶ tour";
    };
    const tickTour = () => {
      if (tourYear > Y_MAX) { stopTour(); return; }
      setYear(tourYear);
      const isDecadeCross = tourYear % 10 === 0 && tourYear > Y_MIN;
      const delay = isDecadeCross ? 1700 : 320;
      tourYear += 1;
      tourTimer = setTimeout(tickTour, delay);
    };
    const startTour = () => {
      if (tourTimer) return stopTour();
      tourYear = Y_MIN;
      lastDecade = decadeOf(Y_MIN); // reset so first decade flashes
      document.body.classList.add("is-touring");
      const btn = document.getElementById("tourBtn");
      if (btn) btn.textContent = "■ stop";
      tickTour();
    };
    // Inject the tour button into the topbar nav
    const navEl = document.querySelector(".nav");
    if (navEl && !document.getElementById("tourBtn")) {
      const tourA = document.createElement("a");
      tourA.id = "tourBtn";
      tourA.href = "#";
      tourA.className = "nav-tour";
      tourA.textContent = "▶ tour";
      tourA.title = "Auto-cycle through 67 years · Instagram-ready";
      tourA.addEventListener("click", (e) => { e.preventDefault(); startTour(); });
      navEl.appendChild(tourA);
    }
    window.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea")) return;
      if (e.key === "t" || e.key === "T") startTour();
      if (e.key === "Escape" && tourTimer) stopTour();
    });

    const yearFromEvent = (clientX) => {
      const r = scrubTrack.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      return Y_MIN + ratio * Y_RANGE;
    };

    let dragging = false, lastY = 0;
    const onDown = e => {
      dragging = true;
      scrubTrack.classList.add("dragging");
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const y = yearFromEvent(cx);
      setYear(y);
      lastY = y;
      e.preventDefault();
    };
    const onMove = e => {
      if (!dragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const y = yearFromEvent(cx);
      setYear(y);
      lastY = y;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      scrubTrack.classList.remove("dragging");
    };
    scrubTrack.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    scrubTrack.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    // Wheel scrub on track
    scrubTrack.addEventListener("wheel", e => {
      e.preventDefault();
      setYear(curYear + (e.deltaY > 0 ? -1 : 1));
    }, { passive: false });

    // Reveal go button uses scrubber year if input empty
    birthGo?.addEventListener("click", () => {
      if (!birthInput.value) triggerReveal(curYear);
    }, { capture: true });

    // Sync typing input back to scrubber
    birthInput?.addEventListener("input", () => {
      const v = parseInt(birthInput.value);
      if (v >= Y_MIN && v <= Y_MAX) setYear(v);
    });

    // Keyboard arrows on track
    scrubTrack.tabIndex = 0;
    scrubTrack.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") { setYear(curYear - 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { setYear(curYear + 1); e.preventDefault(); }
      if (e.key === "Enter") triggerReveal(curYear);
    });
  }

  // ===== COUNT UP =====
  const countUp = (el, target, dur) => {
    if (!el || !target) { if (el) el.textContent = "live"; return; }
    const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = fmtB(Math.round(target * easeOut(t)));
      if (t < 1) requestAnimationFrame(step); else el.textContent = fmtB(target);
    };
    requestAnimationFrame(step);
  };

  // ===== SHARE CARD (Spotify Now Playing style) =====
  const downloadCard = (song) => {
    const canvas = $("#shareCanvas"), ctx = canvas.getContext("2d");
    const W = 1080, H = 1920;
    const [a, b, c] = song.palette;

    // Background: color-matched gradient from album palette
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, a); bg.addColorStop(0.5, b); bg.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, W, H);

    // Album art placeholder (centered square)
    const artSize = 640, artX = (W - artSize) / 2, artY = 360;
    ctx.fillStyle = b; ctx.beginPath(); ctx.roundRect(artX, artY, artSize, artSize, 24); ctx.fill();

    // If art is loaded, draw it
    const img = new Image(); img.crossOrigin = "anonymous";
    const drawText = () => {
      // Song title
      ctx.fillStyle = "#fff"; ctx.font = "italic 600 56px Fraunces, serif"; ctx.textAlign = "center";
      ctx.fillText(song.title, W/2, artY + artSize + 80);
      // Artist
      ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "400 36px Inter, sans-serif";
      ctx.fillText(song.artist, W/2, artY + artSize + 130);
      // Year + streams
      ctx.fillStyle = "#1db954"; ctx.font = "500 28px Inter, sans-serif";
      ctx.fillText(`${song.year}  /  ${fmtB(song.streams)} streams`, W/2, artY + artSize + 190);
      // Genre pill
      const genre = GENRES[song.year] || "";
      if (genre) {
        ctx.fillStyle = "rgba(29,185,84,0.2)"; ctx.font = "500 22px Inter, sans-serif";
        const tw = ctx.measureText(genre.toUpperCase()).width;
        ctx.beginPath(); ctx.roundRect((W-tw-40)/2, artY+artSize+220, tw+40, 38, 19); ctx.fill();
        ctx.fillStyle = "#1ed760"; ctx.fillText(genre.toUpperCase(), W/2, artY+artSize+245);
      }
      // Progress bar
      ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.roundRect(180, artY+artSize+290, W-360, 6, 3); ctx.fill();
      ctx.fillStyle = "#1db954"; ctx.beginPath(); ctx.roundRect(180, artY+artSize+290, (W-360)*0.67, 6, 3); ctx.fill();
      // Branding
      ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "italic 500 28px Fraunces, serif";
      ctx.fillText("echoes", W/2, H - 120);
      ctx.font = "400 18px Inter, sans-serif";
      ctx.fillText("THE MOST-STREAMED SONG OF " + song.year, W/2, H - 80);
      // Download
      const link = document.createElement("a"); link.download = `echoes-${song.year}.png`; link.href = canvas.toDataURL("image/png"); link.click();
    };

    if (song.art) {
      img.onload = () => { ctx.save(); ctx.beginPath(); ctx.roundRect(artX, artY, artSize, artSize, 24); ctx.clip(); ctx.drawImage(img, artX, artY, artSize, artSize); ctx.restore(); drawText(); };
      img.onerror = drawText;
      img.src = song.art;
    } else { drawText(); }
  };

  // ===== HASH ROUTING =====
  const checkHash = () => { const y = parseInt(location.hash.replace("#","")); if (y >= 1960 && y <= 2026) triggerReveal(y); };
  window.addEventListener("hashchange", checkHash);
  setTimeout(checkHash, 200);

  // ===== RANDOM =====
  $("#randomBtn")?.addEventListener("click", () => { const s = SONGS[Math.floor(Math.random()*(SONGS.length-1))]; triggerReveal(s.year); });

  // ===== DECADES =====
  const rail = $("#decadeRail"), splayWrap = $("#splayWrap"), splayEl = $("#yearSplay"), splayHead = $("#splayHead"), splayNav = $("#splayNav"), closeBtn = $("#closeSplay");
  let isOpen = false, curDec = -1;
  const decKeys = ["60s","70s","80s","90s","00s","10s","20s"];

  DECADES.forEach((dec, i) => {
    const card = document.createElement("button"); card.type = "button"; card.className = "dcard"; card.dataset.decade = decKeys[i];
    const num = String(i + 1).padStart(2, "0");
    card.innerHTML = `<span class="dcard-num">${num}</span><div class="dcard-content"><div class="dcard-label">${dec.label.toLowerCase()}</div><div class="dcard-range">${dec.range[0]} → ${dec.range[1]}</div></div>`;
    card.addEventListener("click", () => openDecade(i));
    rail.appendChild(card);
  });

  const openDecade = (idx) => {
    curDec = idx;
    if (!isOpen) {
      isOpen = true;
      // Cascade burst: scatter unpicked cards outward, zoom picked one
      const cards = $$(".dcard", rail);
      cards.forEach((c, i) => {
        c.classList.toggle("picked", i === idx);
        if (i !== idx) {
          const dx = (i - idx) * 60 + (Math.random() * 40 - 20);
          const dy = 80 + Math.random() * 60;
          const rot = (i - idx) * 8 + (Math.random() * 20 - 10);
          c.style.setProperty("--burst-x", dx + "px");
          c.style.setProperty("--burst-y", dy + "px");
          c.style.setProperty("--burst-rot", rot + "deg");
        }
      });
      rail.classList.add("bursting");
      // Overlap: start showing splay while burst is still finishing
      setTimeout(() => {
        rail.style.display = "none";
        rail.classList.remove("bursting");
        showSplay();
      }, 260);
    } else {
      showSplay();
    }
  };
  const showSplay = () => {
    const dec = DECADES[curDec], songs = SONGS.filter(s => s.year >= dec.range[0] && s.year <= dec.range[1]);
    const total = songs.reduce((a,s) => a+(s.streams||0), 0);
    splayHead.innerHTML = `<span>${songs.length} songs</span><span>/</span><strong>${fmtB(total)} streams</strong><span>/</span><span>${dec.label}</span>`;
    splayEl.className = songs.length === 7 ? "splay-grid cols-7" : "splay-grid";
    splayEl.innerHTML = "";
    const npIdx = Math.floor(Math.random() * songs.length);
    songs.forEach((song, i) => {
      const card = document.createElement("button"); card.type = "button"; card.className = "ycard" + (isCrown(song) ? " crown" : "");
      const np = i === npIdx ? `<div class="now-playing"><span></span><span></span><span></span></div>` : "";
      const artTag = song.art ? `<img class="ycard-art" src="${song.art}" alt="" loading="lazy" onerror="this.remove()" />` : "";
      const bgStyle = song.art ? "" : ` style="background:linear-gradient(135deg,${song.palette[0]},${song.palette[1]},${song.palette[2]})"`;
      card.innerHTML = `${np}<div class="ycard-cover"${bgStyle}>${artTag}<div class="ycard-cover-inner"><span class="ycard-cover-year">${song.year}</span>${song.art?"":` <span class="ycard-cover-title">${song.title}</span>`}</div></div><div class="ycard-meta"><span class="ycard-year">${song.year}</span><span class="ycard-title">${song.title}</span><span class="ycard-artist">${song.artist}</span><span class="genre-tag">${GENRES[song.year]||""}</span></div>`;
      card.addEventListener("click", () => openModal(song));
      splayEl.appendChild(card);
      setTimeout(() => card.classList.add("in"), 80 + i * 45);
    });
    splayNav.innerHTML = `<button ${curDec===0?"disabled":""}id="prevD">← ${curDec>0?DECADES[curDec-1].label:""}</button><button ${curDec===DECADES.length-1?"disabled":""}id="nextD">${curDec<DECADES.length-1?DECADES[curDec+1].label:""} →</button>`;
    $("#prevD")?.addEventListener("click", () => openDecade(curDec-1));
    $("#nextD")?.addEventListener("click", () => openDecade(curDec+1));
    splayWrap.hidden = false; closeBtn.hidden = false;
    // Slide-up reveal
    splayWrap.classList.remove("in");
    requestAnimationFrame(() => requestAnimationFrame(() => splayWrap.classList.add("in")));
    // Smooth scroll into view
    setTimeout(() => splayWrap.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };
  const closeSplay = () => {
    if (!isOpen) return;
    splayWrap.classList.remove("in");
    setTimeout(() => {
      splayWrap.hidden = true; closeBtn.hidden = true;
      rail.style.display = "";
      $$(".dcard", rail).forEach(c => { c.classList.remove("picked"); c.style.removeProperty("--burst-x"); c.style.removeProperty("--burst-y"); c.style.removeProperty("--burst-rot"); });
      void rail.offsetWidth;
      rail.classList.remove("fade-out");
      isOpen = false; curDec = -1;
    }, 400);
  };
  closeBtn.addEventListener("click", closeSplay);

  // ===== INDEX =====
  const yearIndex = $("#yearIndex");
  DECADES.forEach(dec => {
    const div = document.createElement("div"); div.className = "decade-divider"; div.textContent = dec.label; yearIndex.appendChild(div);
    SONGS.filter(s => s.year >= dec.range[0] && s.year <= dec.range[1]).forEach(song => {
      const row = document.createElement("button"); row.type = "button"; row.className = "yrow";
      row.innerHTML = `<span class="yrow-year">${song.year}</span><div><div class="yrow-title">${song.title}</div><div class="yrow-artist">${song.artist}</div></div><span class="yrow-genre">${GENRES[song.year]||""}</span><span class="yrow-streams">${fmtB(song.streams)}</span>`;
      row.addEventListener("click", () => openModal(song));
      yearIndex.appendChild(row);
    });
  });

  // ===== MODAL (for index/decade clicks) =====
  const modal = $("#songModal"), modalBody = $("#modalBody"), modalClose = $("#modalClose");
  const openModal = (song) => {
    const [a,b,c] = song.palette;
    const artTag = song.art ? `<img class="modal-art" src="${song.art}" alt="${song.title}" />` : "";
    const bgStyle = song.art ? "" : ` style="background:linear-gradient(135deg,${a},${b},${c})"`;
    const pct = song.streams ? (song.streams/peakStreams)*100 : 0;
    modalBody.innerHTML = `
      <div class="modal-cover-wrap"><div class="modal-cover"${bgStyle} id="modalCover">${artTag}<div class="modal-cover-inner"><div class="modal-cover-year">${song.year} / ${GENRES[song.year]||""}</div><div class="modal-cover-title">${song.title}</div><div class="modal-cover-foot"><span>${song.album}</span><span>${song.artist}</span></div></div></div></div>
      <div class="modal-info">
        <div class="modal-eyebrow">${isCrown(song)?"♛ #1 ALL TIME / ":""}${song.year}</div>
        <h3 class="modal-title">${song.title}</h3>
        <div class="modal-artist">by <strong>${song.artist}</strong></div>
        <div class="modal-meta"><div><div class="modal-meta-label">Album</div><div class="modal-meta-val">${song.album}</div></div><div><div class="modal-meta-label">Streams</div><div class="modal-meta-val" id="mCount">0</div><div class="modal-streams-long" id="mLong">0</div></div></div>
        <p class="modal-note">${song.note}</p>
        <div class="modal-actions"><a class="modal-action primary" href="${spotifyUrl(song)}" target="_blank" rel="noopener">▶ Play on Spotify</a><button class="modal-action" id="mShare">↓ Download card</button><button class="modal-action" id="mCopy">Copy link</button></div>
      </div>`;
    modal.showModal();
    document.body.style.overflow = "hidden";
    history.replaceState(null,"",`#${song.year}`);
    countUp($("#mCount"), song.streams, 1200);
    const mLong = $("#mLong");
    if (mLong && song.streams) { const s=performance.now(); const tick=n=>{const t=Math.min(1,(n-s)/1200); mLong.innerHTML=Math.round(song.streams*easeOut(t)).toLocaleString()+' <span class="still">and still counting</span>'; if(t<1)requestAnimationFrame(tick);}; requestAnimationFrame(tick); }
    else if (mLong) mLong.innerHTML='live <span class="still">and updating</span>';
    // 3D tilt on cover
    const cover = $("#modalCover");
    if (cover) {
      const wrap = cover.parentElement; let raf;
      wrap.addEventListener("mousemove", e => { if(raf)return; raf=requestAnimationFrame(()=>{raf=null;const r=wrap.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-0.5;const y=(e.clientY-r.top)/r.height-0.5;cover.style.transform=`rotateY(${x*16}deg) rotateX(${-y*16}deg)`;});});
      wrap.addEventListener("mouseleave", () => { cover.style.transform = ""; });
    }
    $("#mShare")?.addEventListener("click", () => downloadCard(song));
    $("#mCopy")?.addEventListener("click", () => { navigator.clipboard.writeText(location.origin+location.pathname+`#${song.year}`); const el=$("#mCopy");el.textContent="Copied!";setTimeout(()=>el.textContent="Copy link",1500); });
  };
  const closeModal = () => { modal.close(); document.body.style.overflow = ""; history.replaceState(null,"",location.pathname); };
  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", e => { if(e.target===modal) closeModal(); });

  // ===== KEYBOARD =====
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { if (modal?.open) closeModal(); else if (reveal && !reveal.hidden) closeReveal(); else if (isOpen) closeSplay(); }
    if (e.key === "ArrowLeft" && isOpen && !modal?.open && curDec > 0) openDecade(curDec-1);
    if (e.key === "ArrowRight" && isOpen && !modal?.open && curDec < DECADES.length-1) openDecade(curDec+1);
  });

  // ===== POLISH: magnetic hover, scroll parallax, scroll cue =====
  const sfGo = $(".sf-go");
  if (sfGo) {
    sfGo.addEventListener("mousemove", e => {
      const r = sfGo.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      sfGo.style.transform = `translate(${x}px, ${y - 2}px)`;
    });
    sfGo.addEventListener("mouseleave", () => { sfGo.style.transform = ""; });
  }

  // Scroll parallax on hero layers
  const heroBg = $(".hero-bg"), heroGrid = $(".hero-grid"), heroFloaters = $(".hero-floaters"), heroVinyl = $(".hero-vinyl");
  const heroScroll = $("#heroScroll");
  let lastScroll = 0, parallaxTicking = false;
  window.addEventListener("scroll", () => {
    lastScroll = window.scrollY;
    if (heroScroll) heroScroll.style.opacity = lastScroll > 80 ? "0" : "";
    if (parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(() => {
      parallaxTicking = false;
      if (lastScroll > window.innerHeight) return;
      const p = lastScroll * 0.3;
      if (heroGrid) heroGrid.style.transform = `translateX(-50%) perspective(900px) rotateX(72deg) translateY(${-p * 0.5}px)`;
      if (heroFloaters) heroFloaters.style.transform = `translateY(${-p * 0.6}px)`;
      if (heroVinyl) heroVinyl.style.transform = `translate(-50%,-50%) translateY(${-p * 0.3}px) rotate(${p * 0.4}deg)`;
    });
  }, { passive: true });

  // Scroll cue: jump to decades
  heroScroll?.addEventListener("click", () => {
    $("#decades")?.scrollIntoView({ behavior: "smooth" });
  });

  // ===== EASTER EGG =====
  let vc=0, vt; $("#vinyl")?.addEventListener("click",()=>{vc++;clearTimeout(vt);vt=setTimeout(()=>vc=0,3000);if(vc>=7){vc=0;const o=document.createElement("div");o.className="reveal";o.hidden=false;o.innerHTML=`<button class="reveal-close" onclick="this.parentElement.remove()">✕</button><div class="reveal-card"><div class="reveal-info"><div class="reveal-song">you found the B-side.</div><p class="reveal-note">Built in a single session, vibe-coded with Claude, May 2026. 67 years of music, no label meetings, no A&R. Just the songs that stuck. Share the year someone you love was born.</p></div></div>`;document.body.appendChild(o);requestAnimationFrame(()=>o.classList.add("active"));}});
})();
