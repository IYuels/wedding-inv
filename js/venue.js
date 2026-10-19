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

    const escapeIcs = value => {
      return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    };

    calendarButton.addEventListener(
      "click",
      () => {
        const title =
          "Rex & Trisha's Wedding";

        const location =
          "San Sebastian Parish Church, Tarlac City, Tarlac / L. Paras Pavilion, Tarlac City, Tarlac";

        const description = [
          "Join us as we celebrate the wedding of Rex and Trisha.",
          "",
          "Ceremony:",
          "San Sebastian Parish Church",
          "FH9V+QR9, San Sebastian, Tarlac City, 2300 Tarlac",
          "",
          "Reception:",
          "L. Paras Pavilion",
          "FHCW+8GX, Don Gregorio Avenue, Cor. Calle Fausto, San Sebastian Subdivision, Tarlac City, 2300 Tarlac"
        ].join("\n");

        const icsContent = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Rex and Trisha Wedding//EN",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          "BEGIN:VEVENT",
          "UID:rex-trisha-wedding-20261212",
          "DTSTAMP:20261020T000000Z",
          "DTSTART;VALUE=DATE:20261212",
          "DTEND;VALUE=DATE:20261213",
          `SUMMARY:${escapeIcs(title)}`,
          `LOCATION:${escapeIcs(location)}`,
          `DESCRIPTION:${escapeIcs(description)}`,
          "STATUS:CONFIRMED",
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\r\n");

        const blob =
          new Blob(
            [icsContent],
            {
              type:
                "text/calendar;charset=utf-8"
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          "rex-and-trisha-wedding.ics";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.setTimeout(() => {
          URL.revokeObjectURL(
            url
          );
        }, 1000);
      }
    );
  }
);