document.addEventListener("DOMContentLoaded", async () => {
  const intro = document.querySelector("#intro");
  const introTrigger = document.querySelector("#introTrigger");
  const audio = document.querySelector("#weddingAudio");
  const weddingPage = document.querySelector("#weddingPage");

  const sections = [
    {
      target: "#invitationSection",
      file: "./sections/invitation.html"
    },
    {
      target: "#dressCodeSection",
      file: "./sections/dress-code.html"
    },
    {
      target: "#rsvpSection",
      file: "./sections/rsvp.html"
    }
  ];

  let sectionsLoaded = false;
  let opened = false;

  const loadSections = async () => {
    try {
      for (const section of sections) {
        const target = document.querySelector(section.target);

        if (!target) {
          throw new Error(
            `Target not found: ${section.target}`
          );
        }

        const response = await fetch(section.file);

        if (!response.ok) {
          throw new Error(
            `Failed to load ${section.file}: ${response.status}`
          );
        }

        const html = await response.text();

        target.innerHTML = html;
      }

      sectionsLoaded = true;

      document.dispatchEvent(
        new CustomEvent("weddingSectionsLoaded")
      );
    } catch (error) {
      console.error(
        "Wedding sections failed to load:",
        error
      );

      weddingPage.innerHTML = `
        <div
          style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:40px;
            text-align:center;
          "
        >
          <div>
            <h2>Unable to load invitation</h2>
            <p>Please refresh the page and try again.</p>
          </div>
        </div>
      `;

      sectionsLoaded = true;
    }
  };

  await loadSections();

  const openInvitation = () => {
    if (opened || !sectionsLoaded) {
      return;
    }

    opened = true;

    introTrigger.disabled = true;

    intro.classList.add("is-opening");

    if (audio) {
      audio.play().catch(error => {
        console.warn(
          "Audio could not start:",
          error
        );
      });
    }

    window.setTimeout(() => {
      document.body.classList.add(
        "invitation-revealing"
      );
    }, 450);

    window.setTimeout(() => {
      document.body.classList.add(
        "invitation-opened"
      );

      document.body.classList.remove(
        "is-locked"
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
      });
    }, 1150);

    window.setTimeout(() => {
      intro.classList.add("is-hidden");
    }, 1400);

    window.setTimeout(() => {
      intro.style.display = "none";

      document.body.classList.remove(
        "invitation-revealing"
      );
    }, 2300);
  };

  introTrigger.addEventListener(
    "click",
    openInvitation
  );
});