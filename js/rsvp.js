import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const formatGuestName = fullName => {
  const cleanName = fullName
    .trim()
    .replace(/\s+/g, " ");

  const parts = cleanName.split(" ");

  if (parts.length === 1) {
    return `${parts[0].charAt(0).toUpperCase()}.`;
  }

  const surname = parts.pop();

  const initials = parts
    .map(name => `${name.charAt(0).toUpperCase()}.`)
    .join("");

  return `${initials} ${surname}`;
};

const initRsvpForm = () => {
  const form = document.querySelector("#rsvpForm");

  if (!form) {
    return false;
  }

  if (form.dataset.firebaseInitialized === "true") {
    return true;
  }

  form.dataset.firebaseInitialized = "true";

  const message = form.querySelector("#rsvpMessage");

  const submitButton = form.querySelector(
    'button[type="submit"]'
  );

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const formData = new FormData(form);

    const role = formData.get("role")?.trim();
    const name = formData.get("name")?.trim();
    const attendance = formData.get("attendance");

    if (!role || !name || !attendance) {
      message.textContent =
        "Please complete all fields before submitting.";

      message.classList.remove("is-success");
      message.classList.add("is-error");

      return;
    }

    const originalButtonText =
      submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    message.textContent = "";

    message.classList.remove(
      "is-success",
      "is-error"
    );

    try {
      const batch = writeBatch(db);

      const rsvpRef = doc(
        collection(db, "rsvps")
      );

      batch.set(rsvpRef, {
        role,
        name,
        attendance,
        submittedAt: serverTimestamp()
      });

      if (attendance === "Attending") {
        const attendeeRef = doc(
          collection(db, "publicAttendees")
        );

        const displayName =
          formatGuestName(name);

        batch.set(attendeeRef, {
          displayName,
          role,
          submittedAt: serverTimestamp()
        });
      }

      await batch.commit();

      window.location.href =
        `./thank-you.html?attendance=${encodeURIComponent(attendance)}`;

    } catch (error) {
      console.error(
        "Firebase RSVP error:",
        error
      );

      message.textContent =
        "Something went wrong while sending your RSVP. Please try again.";

      message.classList.add(
        "is-error"
      );

      submitButton.disabled = false;

      submitButton.textContent =
        originalButtonText;
    }
  });

  return true;
};

document.addEventListener(
  "weddingSectionsLoaded",
  initRsvpForm
);

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initRsvpForm
  );
} else {
  initRsvpForm();
}

const rsvpObserver =
  new MutationObserver(() => {
    if (initRsvpForm()) {
      rsvpObserver.disconnect();
    }
  });

rsvpObserver.observe(
  document.body,
  {
    childList: true,
    subtree: true
  }
);