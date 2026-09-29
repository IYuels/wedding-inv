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

const attendeesList = document.querySelector("#attendeesList");
const pagination = document.querySelector("#attendeesPagination");
const prevButton = document.querySelector("#prevPage");
const nextButton = document.querySelector("#nextPage");
const pageCount = document.querySelector("#pageCount");

const ITEMS_PER_PAGE = 7;

let attendees = [];
let currentPage = 1;

const escapeHtml = value => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const getTotalPages = () => {
  return Math.ceil(attendees.length / ITEMS_PER_PAGE);
};

const renderAttendees = () => {
  const totalPages = getTotalPages();

  if (!attendees.length) {
    attendeesList.innerHTML = `
      <p class="attendees-list__empty">
        Our guest list will appear here soon.
      </p>
    `;

    pagination.hidden = true;

    return;
  }

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex =
    startIndex + ITEMS_PER_PAGE;

  const currentAttendees =
    attendees.slice(startIndex, endIndex);

  attendeesList.innerHTML = "";

  currentAttendees.forEach(
    (attendee, index) => {
      const item =
        document.createElement("div");

      item.className =
        "attendees-list__item";

      item.style.animationDelay =
        `${index * 50}ms`;

      item.innerHTML = `
        <span class="attendees-list__name">
          ${escapeHtml(attendee.displayName)}
        </span>

        <span class="attendees-list__role">
          ${escapeHtml(attendee.role)}
        </span>
      `;

      attendeesList.appendChild(item);
    }
  );

  pageCount.textContent =
    `${String(currentPage).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`;

  prevButton.disabled =
    currentPage === 1;

  nextButton.disabled =
    currentPage === totalPages;

  pagination.hidden =
    totalPages <= 1;
};

const goToPage = page => {
  const totalPages = getTotalPages();

  if (
    page < 1 ||
    page > totalPages ||
    page === currentPage
  ) {
    return;
  }

  currentPage = page;

  renderAttendees();
};

prevButton.addEventListener(
  "click",
  () => {
    goToPage(currentPage - 1);
  }
);

nextButton.addEventListener(
  "click",
  () => {
    goToPage(currentPage + 1);
  }
);

const loadAttendees = async () => {
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
      await getDocs(attendeesQuery);

    attendees = snapshot.docs.map(
      documentSnapshot => {
        return documentSnapshot.data();
      }
    );

    currentPage = 1;

    renderAttendees();

  } catch (error) {
    console.error(
      "Unable to load attendees:",
      error
    );

    attendeesList.innerHTML = `
      <p class="attendees-list__error">
        We couldn't load the attendee list right now.
      </p>
    `;

    pagination.hidden = true;
  }
};

loadAttendees();