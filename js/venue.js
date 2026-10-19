document.addEventListener(
  "weddingSectionsLoaded",
  () => {
    const calendarButton =
      document.querySelector(
        "#addToCalendar"
      );

    if (!calendarButton) {
      return;
    }

    const isIOS =
      /iPad|iPhone|iPod/.test(
        navigator.userAgent
      ) ||
      (
        navigator.platform ===
          "MacIntel" &&
        navigator.maxTouchPoints > 1
      );

    const isAndroid =
      /Android/i.test(
        navigator.userAgent
      );

    const googleCalendarUrl = () => {
      const params =
        new URLSearchParams({
          action: "TEMPLATE",

          text:
            "Rex & Trisha's Wedding",

          dates:
            "20261212/20261213",

          location:
            "San Sebastian Parish Church, San Sebastian, Tarlac City, 2300 Tarlac",

          details: [
            "We would love to celebrate our wedding day with you.",
            "",
            "Ceremony:",
            "San Sebastian Parish Church",
            "FH9V+QR9, San Sebastian, Tarlac City, 2300 Tarlac",
            "",
            "Reception:",
            "L. Paras Pavilion",
            "FHCW+8GX, Don Gregorio Avenue, Cor. Calle Fausto, San Sebastian Subdivision, Tarlac City, 2300 Tarlac"
          ].join("\n")
        });

      return (
        "https://calendar.google.com/calendar/render?" +
        params.toString()
      );
    };

    calendarButton.addEventListener(
      "click",
      () => {
        if (isIOS) {
          window.location.href =
            "/assets/rex-trisha-wedding.ics";

          return;
        }

        if (isAndroid) {
          window.location.href =
            googleCalendarUrl();

          return;
        }

        window.location.href =
          "/assets/rex-trisha-wedding.ics";
      }
    );
  }
);