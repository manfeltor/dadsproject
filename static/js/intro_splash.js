// intro_splash.js (isolated, no dependencies)
(function () {
  const SPLASH_ID = "splashIntro";
  const splash = document.getElementById(SPLASH_ID);
  if (!splash) return;

  // Timing (tweakable)
  const ANIM_START_DELAY = 40;     // slight delay so CSS can apply
  const VISIBLE_MS = 1500;          // approx 1s feel
  const FADE_MS = 280;             // must match CSS transition

  let done = false;

  function finish() {
    if (done) return;
    done = true;

    splash.classList.add("is-fading");

    // Remove from DOM after fade so it never blocks clicks
    window.setTimeout(() => {
      if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
    }, FADE_MS + 30);
  }

  // Allow click/tap to skip
  splash.addEventListener("click", finish, { passive: true });

  // Start animation
  window.setTimeout(() => {
    splash.classList.add("is-animating");
  }, ANIM_START_DELAY);

  // Auto finish
  window.setTimeout(finish, VISIBLE_MS);
})();
