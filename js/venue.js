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

    const weddingEvent = {
      title:
        "Rex & Trisha's Wedding",

      /*
       * UPDATE THESE ONCE
       * YOUR FINAL TIMES ARE SET.
       */
      start:
        "2026-12-12T14:00:00+08:00",

      end:
        "2026-12-12T20:00:00+08:00",

      ceremony:
        "San Sebastian Parish Church",

      ceremonyAddress:
        "FH9V+QR9, San Sebastian, Tarlac City, 2300 Tarlac",

      reception:
        "L. Paras Pavilion",

      receptionAddress:
        "FHCW+8GX, Don Gregorio Avenue, Cor. Calle Fausto, San Sebastian Subdivision, Tarlac City, 2300 Tarlac"
    };

    const formatGoogleDate =
      dateString => {
        const date =
          new Date(
            dateString
          );

        return date
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      };

    const getGoogleCalendarUrl =
      () => {
        const start =
          formatGoogleDate(
            weddingEvent.start
          );

        const end =
          formatGoogleDate(
            weddingEvent.end
          );

        const details = [
          "We would love to celebrate our wedding day with you.",
          "",
          "Ceremony:",
          weddingEvent.ceremony,
          weddingEvent.ceremonyAddress,
          "",
          "Reception:",
          weddingEvent.reception,
          weddingEvent.receptionAddress
        ].join("\n");

        const location = [
          weddingEvent.ceremony,
          weddingEvent.ceremonyAddress
        ].join(", ");

        const params =
          new URLSearchParams({
            action:
              "TEMPLATE",

            text:
              weddingEvent.title,

            dates:
              `${start}/${end}`,

            location,

            details
          });

        return (
          "https://calendar.google.com/calendar/render?" +
          params.toString()
        );
      };

    calendarButton.addEventListener(
      "click",
      () => {
        window.location.href =
          getGoogleCalendarUrl();
      }
    );
  }
);