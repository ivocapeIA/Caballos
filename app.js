(function () {
  const doors = document.getElementById("doors");
  const viewport = document.getElementById("viewport");
  const thumbs = document.getElementById("thumbs");
  const caption = document.getElementById("caption");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    doors.classList.add("is-open");
  } else {
    doors.addEventListener("click", () => doors.classList.add("is-open"));
  }

  let items = MEDIA.slice();
  let index = 0;
  let filter = "all";

  function visible() {
    if (filter === "all") return items;
    if (filter === "photo" || filter === "video") {
      return items.filter((m) => m.type === filter);
    }
    return items.filter((m) => m.tag === filter);
  }

  function dropMissing(src) {
    items = items.filter((m) => m.src !== src && m.poster !== src);
    draw();
  }

  function draw() {
    const list = visible();
    if (!list.length) {
      viewport.innerHTML = "";
      thumbs.innerHTML = "";
      caption.textContent = "Todavía se están preparando estos videos.";
      return;
    }
    if (index >= list.length) index = 0;

    viewport.innerHTML = "";
    thumbs.innerHTML = "";

    const current = list[index];
    const slide = document.createElement("div");
    slide.className = "slide is-active" + (current.type === "photo" ? " is-photo" : " is-video");
    if (current.crop === "hug") slide.classList.add("crop-hug");

    if (current.type === "video") {
      const video = document.createElement("video");
      video.src = current.src;
      video.controls = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.preload = "auto";
      if (current.poster) video.poster = current.poster;
      video.addEventListener("error", () => dropMissing(current.src));
      slide.appendChild(video);
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "video";
      slide.appendChild(badge);
    } else {
      const img = document.createElement("img");
      img.src = current.src;
      img.alt = current.caption;
      img.addEventListener("error", () => dropMissing(current.src));
      slide.appendChild(img);
    }
    viewport.appendChild(slide);

    list.forEach((item, i) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      if (i === index) thumb.classList.add("is-on");
      const tImg = document.createElement("img");
      tImg.src = item.type === "video" ? item.poster || item.src : item.src;
      tImg.alt = "";
      thumb.appendChild(tImg);
      thumb.addEventListener("click", () => go(i));
      thumbs.appendChild(thumb);
    });

    caption.textContent = current.caption;
  }

  function go(i) {
    const list = visible();
    if (!list.length) return;
    index = (i + list.length) % list.length;
    draw();
  }

  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));

  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      document.querySelectorAll(".filter").forEach((b) => b.classList.toggle("is-on", b === btn));
      index = 0;
      draw();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  });

  let startX = null;
  viewport.addEventListener("touchstart", (e) => {
    if (e.target.closest("video")) {
      startX = null;
      return;
    }
    startX = e.changedTouches[0].clientX;
  }, { passive: true });
  viewport.addEventListener("touchend", (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  });

  draw();
  bootDust(reduce);
})();

function bootDust(reduce) {
  const canvas = document.getElementById("dust");
  if (!canvas || reduce) return;
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  const motes = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function spawn() {
    motes.length = 0;
    const n = Math.min(70, Math.floor((w * h) / 22000));
    for (let i = 0; i < n; i++) {
      motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        s: Math.random() * 0.35 + 0.08,
        a: Math.random() * 0.35 + 0.08,
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    motes.forEach((m) => {
      m.y -= m.s;
      m.x += Math.sin(m.y * 0.01) * 0.2;
      if (m.y < -4) {
        m.y = h + 4;
        m.x = Math.random() * w;
      }
      ctx.fillStyle = `rgba(205, 184, 146, ${m.a})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => {
    resize();
    spawn();
  });
  resize();
  spawn();
  tick();
}
