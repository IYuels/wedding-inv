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
      title: "Rex & Trisha's Wedding",

      start:
        "YYYY-MM-DDTHH:MM:SS",

      end:
        "YYYY-MM-DDTHH:MM:SS",

      location:
        "Venue Name, Full Address",

      description:
        "Join us as we celebrate the wedding of Rex and Trisha."
    };

    const formatCalendarDate =
      dateString => {
        const date =
          new Date(dateString);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return null;
        }

        return date
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      };

    calendarButton.addEventListener(
      "click",
      () => {
        const start =
          formatCalendarDate(
            weddingEvent.start
          );

        const end =
          formatCalendarDate(
            weddingEvent.end
          );

        if (!start || !end) {
          console.warn(
            "Please update the wedding date and time in venue.js."
          );

          return;
        }

        const escapeIcs = value => {
          return String(value)
            .replace(/\\/g, "\\\\")
            .replace(/\n/g, "\\n")
            .replace(/,/g, "\\,")
            .replace(/;/g, "\\;");
        };

        const icsContent = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Rex and Trisha Wedding//EN",
          "CALSCALE:GREGORIAN",
          "BEGIN:VEVENT",
          `DTSTART:${start}`,
          `DTEND:${end}`,
          `SUMMARY:${escapeIcs(
            weddingEvent.title
          )}`,
          `LOCATION:${escapeIcs(
            weddingEvent.location
          )}`,
          `DESCRIPTION:${escapeIcs(
            weddingEvent.description
          )}`,
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

        URL.revokeObjectURL(
          url
        );
      }
    );
  }
);