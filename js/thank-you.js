import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const attendeesList =
  document.querySelector("#attendeesList");

const attendeesTabs =
  document.querySelector("#attendeesTabs");

const thankYouMessage =
  document.querySelector("#thankYouMessage");

const ROLES = [
  "All",
  "Godfather",
  "Godmother",
  "Bridesmaid",
  "Groomsman",
  "Guest"
];

let attendees = [];
let activeRole = "All";

const escapeHtml = value => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const updateThankYouMessage = () => {
  if (!thankYouMessage) {
    return;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const attendance =
    params.get("attendance");

  if (
    attendance ===
    "Not attending"
  ) {
    thankYouMessage.textContent =
      "Thank you for letting us know. Although we will miss having you with us on our special day, your love, prayers, and blessing mean so much to us.";

    return;
  }

  thankYouMessage.textContent =
    "Thank you for saying yes to celebrating this beautiful day with us. Your presence, love, and blessing mean more than words can say, and we cannot wait to share this special moment with you.";
};

const getRoleCount = role => {
  if (role === "All") {
    return attendees.length;
  }

  return attendees.filter(
    attendee =>
      attendee.role === role
  ).length;
};

const renderTabs = () => {
  if (!attendeesTabs) {
    return;
  }

  attendeesTabs.innerHTML = "";

  ROLES.forEach(role => {
    const button =
      document.createElement(
        "button"
      );

    const count =
      getRoleCount(role);

    button.type = "button";

    button.className =
      "attendees-tabs__button";

    if (role === activeRole) {
      button.classList.add(
        "is-active"
      );
    }

    button.setAttribute(
      "role",
      "tab"
    );

    button.setAttribute(
      "aria-selected",
      role === activeRole
        ? "true"
        : "false"
    );

    button.innerHTML = `
      ${escapeHtml(role)}
      <span class="attendees-tabs__count">
        ${count}
      </span>
    `;

    button.addEventListener(
      "click",
      () => {
        activeRole = role;

        renderTabs();

        renderAttendees();
      }
    );

    attendeesTabs.appendChild(
      button
    );
  });
};

const getFilteredAttendees = () => {
  if (activeRole === "All") {
    return attendees;
  }

  return attendees.filter(
    attendee =>
      attendee.role ===
      activeRole
  );
};

const renderAttendees = () => {
  if (!attendeesList) {
    return;
  }

  const filteredAttendees =
    getFilteredAttendees();

  attendeesList.innerHTML = "";

  attendeesList.scrollTop = 0;

  if (
    !filteredAttendees.length
  ) {
    attendeesList.innerHTML = `
      <p class="attendees-list__empty">
        No confirmed ${escapeHtml(activeRole.toLowerCase())} attendees yet.
      </p>
    `;

    return;
  }

  filteredAttendees.forEach(
    (attendee, index) => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "attendees-list__item";

      item.style.animationDelay =
        `${Math.min(index, 8) * 40}ms`;

      item.innerHTML = `
        <span class="attendees-list__name">
          ${escapeHtml(attendee.displayName)}
        </span>

        <span class="attendees-list__role">
          ${escapeHtml(attendee.role)}
        </span>
      `;

      attendeesList.appendChild(
        item
      );
    }
  );
};

const loadAttendees = async () => {
  if (
    !attendeesList ||
    !attendeesTabs
  ) {
    return;
  }

  try {
    const attendeesQuery =
      query(
        collection(
          db,
          "publicAttendees"
        ),
        orderBy(
          "submittedAt",
          "asc"
        )
      );

    const snapshot =
      await getDocs(
        attendeesQuery
      );

    attendees =
      snapshot.docs
        .map(
          documentSnapshot => {
            return {
              id:
                documentSnapshot.id,

              ...documentSnapshot.data()
            };
          }
        )
        .filter(attendee => {
          return (
            attendee.displayName &&
            ROLES.includes(
              attendee.role
            )
          );
        });

    renderTabs();

    renderAttendees();

  } catch (error) {
    console.error(
      "Unable to load attendees:",
      error
    );

    attendeesTabs.innerHTML = "";

    attendeesList.innerHTML = `
      <p class="attendees-list__error">
        We couldn't load the attendee list right now.
      </p>
    `;
  }
};

updateThankYouMessage();

loadAttendees();