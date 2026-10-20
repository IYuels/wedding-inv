const initVenueCalendar = () => {
  const calendarButton =
    document.querySelector(
      "#addToCalendar"
    );

  if (!calendarButton) {
    return;
  }

  if (
    calendarButton.dataset.initialized ===
    "true"
  ) {
    return;
  }

  calendarButton.dataset.initialized =
    "true";

  const weddingEvent = {
    title:
      "Rex & Trisha's Wedding",

    start:
      "20261213T093000",

    end:
      "20261213T200000",

    timeZone:
      "Asia/Manila",

    ceremony:
      "San Sebastian Parish Church",

    ceremonyAddress:
      "FH9V+QR9, San Sebastian, Tarlac City, 2300 Tarlac",

    reception:
      "L. Paras Pavilion",

    receptionAddress:
      "FHCW+8GX, Don Gregorio Avenue, Cor. Calle Fausto, San Sebastian Subdivision, Tarlac City, 2300 Tarlac"
  };

  const getGoogleCalendarUrl =
    () => {
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
            `${weddingEvent.start}/${weddingEvent.end}`,

          ctz:
            weddingEvent.timeZone,

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
};

const loadThankYouVenue = async () => {
  const venueSection =
    document.querySelector(
      "#venueSection"
    );

  if (!venueSection) {
    return;
  }

  if (
    venueSection.innerHTML.trim()
  ) {
    initVenueCalendar();
    return;
  }

  try {
    const response =
      await fetch(
        "/sections/venue.html"
      );

    if (!response.ok) {
      throw new Error(
        `Failed to load venue: ${response.status}`
      );
    }

    const html =
      await response.text();

    venueSection.innerHTML =
      html;

    initVenueCalendar();

  } catch (error) {
    console.error(
      "Unable to load venue section:",
      error
    );
  }
};

document.addEventListener(
  "weddingSectionsLoaded",
  initVenueCalendar
);

document.addEventListener(
  "DOMContentLoaded",
  () => {
    if (
      document.body.classList.contains(
        "thank-you-page"
      )
    ) {
      loadThankYouVenue();
      return;
    }

    initVenueCalendar();
  }
);