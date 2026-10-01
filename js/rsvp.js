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

const invitationConfigs = {
  "/godfather-godmother": {
    message:
      "We would be honored to have you as one of our godparents. Your presence, guidance, and blessing would mean so much to us as we begin this new chapter together.",
    roles: [
      "Godfather",
      "Godmother"
    ]
  },

  "/bridesmaid": {
    message:
      "We would be so happy to have you stand beside us as one of our bridesmaids. Your love, support, and presence would make our wedding day even more special.",
    roles: [
      "Bridesmaid"
    ]
  },

  "/groomsmen": {
    message:
      "We would be honored to have you stand beside us as one of our groomsmen. Your friendship, support, and presence would mean so much to us on our special day.",
    roles: [
      "Groomsman"
    ]
  },

  "/guest": {
    message:
      "We would be delighted to celebrate our wedding day with you. Your presence would make this special moment even more meaningful to us.",
    roles: [
      "Guest"
    ]
  }
};

const getInvitationType = () => {
  let path = window.location.pathname;

  if (path.length > 1) {
    path = path.replace(/\/$/, "");
  }

  return invitationConfigs[path]
    ? path
    : "/godfather-godmother";
};

const getInvitationConfig = () => {
  return invitationConfigs[
    getInvitationType()
  ];
};

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

const setupInvitationType = form => {
  const config =
    getInvitationConfig();

  const intro =
    document.querySelector(
      "#rsvpIntro"
    );

  const roleSelect =
    form.querySelector(
      "#guestRole"
    );

  if (intro) {
    intro.textContent =
      config.message;
  }

  if (!roleSelect) {
    return;
  }

  roleSelect.innerHTML = "";

  if (config.roles.length > 1) {
    const defaultOption =
      document.createElement(
        "option"
      );

    defaultOption.value = "";

    defaultOption.textContent =
      "Select your role";

    roleSelect.appendChild(
      defaultOption
    );
  }

  config.roles.forEach(role => {
    const option =
      document.createElement(
        "option"
      );

    option.value = role;
    option.textContent = role;

    roleSelect.appendChild(
      option
    );
  });

  if (config.roles.length === 1) {
    roleSelect.value =
      config.roles[0];

    roleSelect
      .closest(".form-field")
      ?.classList.add(
        "is-single-role"
      );
  }
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

  setupInvitationType(form);

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

      const config =
        getInvitationConfig();

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
        !config.roles.includes(role)
      ) {
        showError(
          message,
          "Please select a valid role."
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

        const invitationType =
          getInvitationType()
            .replace("/", "");

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

            if (
              attendance ===
              "Attending"
            ) {
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

              transaction.set(
                rsvpRef,
                {
                  role,
                  name,
                  attendance,
                  invitationType,
                  submittedAt:
                    serverTimestamp()
                }
              );

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

            if (
              attendance ===
              "Not attending"
            ) {
              const declinedRef =
                doc(
                  db,
                  "declinedRsvps",
                  nameHash
                );

              transaction.set(
                declinedRef,
                {
                  role,
                  name,
                  attendance,
                  invitationType,
                  submittedAt:
                    serverTimestamp()
                }
              );
            }
          }
        );

        if (
          attendance ===
          "Attending"
        ) {
          window.location.href =
            "/thank-you";

          return;
        }

        window.location.href =
          "/sections/declined";

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