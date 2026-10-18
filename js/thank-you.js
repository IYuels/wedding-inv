import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const STATIC_ATTENDEES = [
  {
    displayName: "A. Canlas",
    role: "Godfather",
    isStatic: true
  },
  {
    displayName: "N. Garcia",
    role: "Godfather",
    isStatic: true
  },
  {
    displayName: "R. Espinosa Jr.",
    role: "Godfather",
    isStatic: true
  },
  {
    displayName: "M. V. Dizon",
    role: "Godfather",
    isStatic: true
  },
  {
    displayName: "A. A. Paras",
    role: "Godfather",
    isStatic: true
  },
  {
    displayName: "A. Duldulao",
    role: "Godfather",
    isStatic: true
  },
  {
    displayName: "M. Dayan.",
    role: "Godfather",
    isStatic: true
  },
  {
    displayName: "A. Quiambao",
    role: "Godmother",
    isStatic: true
  },
  {
    displayName: "E. Jimenez",
    role: "Godmother",
    isStatic: true
  },
  {
    displayName: "V. M. Manlutac",
    role: "Godmother",
    isStatic: true
  },
  {
    displayName: "A. Moriones",
    role: "Godmother",
    isStatic: true
  },
  {
    displayName: "R. Duldulao",
    role: "Godmother",
    isStatic: true
  },
  {
    displayName: "E. Salvatierra",
    role: "Godmother",
    isStatic: true
  },
  {
    displayName: "M. E. Espinosa",
    role: "Godmother",
    isStatic: true
  },
  {
    displayName: "S. J. Espinosa (Bible)",
    role: "Bearer",
    isStatic: true
  },
  {
    displayName: "A. J. Zulueta (Coin)",
    role: "Bearer",
    isStatic: true
  },
  {
    displayName: "L. A. Ronquillo (Herald/Banner)",
    role: "Bearer",
    isStatic: true
  },
  {
    displayName: "A. T. Fabros (Ring)",
    role: "Bearer",
    isStatic: true
  },
  {
    displayName: "B. J. Reyes",
    role: "Flower Girl",
    isStatic: true
  },
  {
    displayName: "I. J. Espinosa",
    role: "Flower Girl",
    isStatic: true
  },
  {
    displayName: "F. E. Tenedero",
    role: "Flower Girl",
    isStatic: true
  },
  {
    displayName: "K. E. Gomez",
    role: "Flower Girl",
    isStatic: true
  },
  {
    displayName: "A. Palara",
    role: "Maid of Honor",
    isStatic: true
  },
  {
    displayName: "G. Arceo Jr.",
    role: "Best Man",
    isStatic: true
  }
];

const ROLE_TABS = [
  {
    label: "All",
    value: "All"
  },
  {
    label: "Godfather",
    value: "Godfather"
  },
  {
    label: "Godmother",
    value: "Godmother"
  },
  {
    label: "Maid of Honor",
    value: "Maid of Honor"
  },
  {
    label: "Best Man",
    value: "Best Man"
  },
  {
    label: "Bridesmaid",
    value: "Bridesmaid"
  },
  {
    label: "Groomsman",
    value: "Groomsman"
  },
  {
    label: "Guest",
    value: "Guest"
  },
  {
    label: "Bearers",
    value: "Bearer"
  },
  {
    label: "Flower Girls",
    value: "Flower Girl"
  }
];

const FIREBASE_ROLES = [
  "Godfather",
  "Godmother",
  "Bridesmaid",
  "Groomsman",
  "Guest"
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const attendeesList =
  document.querySelector("#attendeesList");

const attendeesTabs =
  document.querySelector("#attendeesTabs");

const thankYouMessage =
  document.querySelector("#thankYouMessage");

const weddingAudio =
  document.querySelector("#weddingAudio");

let attendees = [];
let activeRole = "All";

const startWeddingAudio = async () => {
  if (!weddingAudio) {
    return;
  }

  weddingAudio.volume = 0.5;

  try {
    await weddingAudio.play();
  } catch {
    const startAudio = async () => {
      try {
        await weddingAudio.play();
      } catch (error) {
        console.warn(
          "Wedding audio could not start:",
          error
        );
      }
    };

    document.addEventListener(
      "click",
      startAudio,
      {
        once: true
      }
    );

    document.addEventListener(
      "touchstart",
      startAudio,
      {
        once: true
      }
    );
  }
};

const updateThankYouMessage = () => {
  if (!thankYouMessage) {
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

  ROLE_TABS.forEach(tab => {
    const button =
      document.createElement(
        "button"
      );

    button.type = "button";

    button.className =
      "attendees-tabs__button";

    if (
      tab.value === activeRole
    ) {
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
      tab.value === activeRole
        ? "true"
        : "false"
    );

    const label =
      document.createElement(
        "span"
      );

    label.textContent =
      tab.label;

    const count =
      document.createElement(
        "span"
      );

    count.className =
      "attendees-tabs__count";

    count.textContent =
      getRoleCount(
        tab.value
      );

    button.appendChild(
      label
    );

    button.appendChild(
      count
    );

    button.addEventListener(
      "click",
      () => {
        activeRole =
          tab.value;

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
  if (
    activeRole === "All"
  ) {
    return attendees;
  }

  return attendees.filter(
    attendee =>
      attendee.role === activeRole
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
        No confirmed attendees yet.
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

      const name =
        document.createElement(
          "span"
        );

      name.className =
        "attendees-list__name";

      name.textContent =
        attendee.displayName;

      const role =
        document.createElement(
          "span"
        );

      role.className =
        "attendees-list__role";

      role.textContent =
        attendee.role;

      item.appendChild(name);
      item.appendChild(role);

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

    const firebaseAttendees =
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
            FIREBASE_ROLES.includes(
              attendee.role
            )
          );
        });

    attendees = [
      ...firebaseAttendees,
      ...STATIC_ATTENDEES
    ];

    renderTabs();
    renderAttendees();

  } catch (error) {
    console.error(
      "Unable to load Firebase attendees:",
      error
    );

    attendees = [
      ...STATIC_ATTENDEES
    ];

    renderTabs();
    renderAttendees();
  }
};

updateThankYouMessage();

startWeddingAudio();

loadAttendees();