import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  doc,
  collection,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cleanGuestName = fullName => {
  return fullName
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeGuestName = fullName => {
  return cleanGuestName(fullName)
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const hasAtLeastTwoWords = fullName => {
  const words = cleanGuestName(fullName)
    .split(" ")
    .filter(Boolean);

  return words.length >= 2;
};

const hashName = async fullName => {
  const normalizedName =
    normalizeGuestName(fullName);

  const encoded =
    new TextEncoder().encode(
      normalizedName
    );

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      encoded
    );

  return Array.from(
    new Uint8Array(hashBuffer)
  )
    .map(byte =>
      byte
        .toString(16)
        .padStart(2, "0")
    )
    .join("");
};

const formatGuestName = fullName => {
  const cleanName =
    cleanGuestName(fullName);

  const parts =
    cleanName.split(" ");

  const surname =
    parts.pop();

  const initials =
    parts
      .map(part => {
        return `${part
          .charAt(0)
          .toUpperCase()}.`;
      })
      .join("");

  return `${initials} ${surname}`;
};

const showError = (
  messageElement,
  text
) => {
  messageElement.textContent = text;

  messageElement.classList.remove(
    "is-success"
  );

  messageElement.classList.add(
    "is-error"
  );
};

const initRsvpForm = () => {
  const form =
    document.querySelector(
      "#rsvpForm"
    );

  if (!form) {
    return false;
  }

  if (
    form.dataset.firebaseInitialized ===
    "true"
  ) {
    return true;
  }

  form.dataset.firebaseInitialized =
    "true";

  const message =
    form.querySelector(
      "#rsvpMessage"
    );

  const nameInput =
    form.querySelector(
      "#guestName"
    );

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  form.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const formData =
        new FormData(form);

      const role =
        formData
          .get("role")
          ?.trim();

      const rawName =
        formData
          .get("name")
          ?.trim();

      const attendance =
        formData.get(
          "attendance"
        );

      if (
        !role ||
        !rawName ||
        !attendance
      ) {
        showError(
          message,
          "Please complete all fields before submitting."
        );

        return;
      }

      if (
        !hasAtLeastTwoWords(
          rawName
        )
      ) {
        showError(
          message,
          "Please enter at least your first name and surname."
        );

        nameInput.focus();

        return;
      }

      const name =
        cleanGuestName(
          rawName
        );

      const originalButtonText =
        submitButton.textContent;

      submitButton.disabled = true;

      submitButton.textContent =
        "Checking...";

      message.textContent = "";

      message.classList.remove(
        "is-success",
        "is-error"
      );

      try {
        const nameHash =
          await hashName(name);

        const nameLockRef =
          doc(
            db,
            "rsvpNames",
            nameHash
          );

        const rsvpRef =
          doc(
            db,
            "rsvps",
            nameHash
          );

        const attendeeRef =
          doc(
            db,
            "publicAttendees",
            nameHash
          );

        submitButton.textContent =
          "Submitting...";

        await runTransaction(
          db,
          async transaction => {
            const nameLockSnapshot =
              await transaction.get(
                nameLockRef
              );

            if (
              nameLockSnapshot.exists()
            ) {
              throw new Error(
                "DUPLICATE_NAME"
              );
            }

            transaction.set(
              nameLockRef,
              {
                createdAt:
                  serverTimestamp()
              }
            );

            transaction.set(
              rsvpRef,
              {
                role,
                name,
                attendance,
                submittedAt:
                  serverTimestamp()
              }
            );

            if (
              attendance ===
              "Attending"
            ) {
              transaction.set(
                attendeeRef,
                {
                  displayName:
                    formatGuestName(
                      name
                    ),
                  role,
                  submittedAt:
                    serverTimestamp()
                }
              );
            }
          }
        );

        window.location.href =
          `./thank-you.html?attendance=${encodeURIComponent(attendance)}`;

      } catch (error) {
        console.error(
          "Firebase RSVP error:",
          error
        );

        if (
          error.message ===
          "DUPLICATE_NAME"
        ) {
          showError(
            message,
            "This name is already in the RSVP list."
          );

          nameInput.focus();
        } else {
          showError(
            message,
            "Something went wrong while sending your RSVP. Please try again."
          );
        }

        submitButton.disabled =
          false;

        submitButton.textContent =
          originalButtonText;
      }
    }
  );

  return true;
};

document.addEventListener(
  "weddingSectionsLoaded",
  initRsvpForm
);

if (
  document.readyState ===
  "loading"
) {
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