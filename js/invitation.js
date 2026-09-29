document.addEventListener("weddingSectionsLoaded", () => {
  const audio = document.querySelector("#weddingAudio");
  const musicDisc = document.querySelector("#musicDisc");

  if (audio && musicDisc) {
    const updateMusicState = () => {
      const paused = audio.paused;

      musicDisc.classList.toggle("is-paused", paused);

      musicDisc.setAttribute(
        "aria-label",
        paused ? "Play wedding music" : "Pause wedding music"
      );
    };

    musicDisc.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
        } catch (error) {
          console.warn("Audio playback failed:", error);
        }
      } else {
        audio.pause();
      }

      updateMusicState();
    });

    audio.addEventListener("play", updateMusicState);
    audio.addEventListener("pause", updateMusicState);

    updateMusicState();
  }

  const weddingDate = new Date("2026-12-12T15:00:00+08:00");

  const daysElement = document.querySelector("[data-days]");
  const hoursElement = document.querySelector("[data-hours]");
  const minutesElement = document.querySelector("[data-minutes]");
  const secondsElement = document.querySelector("[data-seconds]");

  if (
    !daysElement ||
    !hoursElement ||
    !minutesElement ||
    !secondsElement
  ) {
    return;
  }

  const pad = value => String(value).padStart(2, "0");

  const updateCountdown = () => {
    const now = new Date();
    const distance = weddingDate.getTime() - now.getTime();

    if (distance <= 0) {
      daysElement.textContent = "00";
      hoursElement.textContent = "00";
      minutesElement.textContent = "00";
      secondsElement.textContent = "00";
      return;
    }

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);

    daysElement.textContent = pad(days);
    hoursElement.textContent = pad(hours);
    minutesElement.textContent = pad(minutes);
    secondsElement.textContent = pad(seconds);
  };

  updateCountdown();

  window.setInterval(updateCountdown, 1000);
});