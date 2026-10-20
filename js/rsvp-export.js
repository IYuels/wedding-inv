import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

const downloadButton =
  document.querySelector(
    "#downloadRsvp"
  );

const refreshButton =
  document.querySelector(
    "#refreshRsvp"
  );

const exportMessage =
  document.querySelector(
    "#exportMessage"
  );

const rsvpList =
  document.querySelector(
    "#rsvpList"
  );

const rsvpStats =
  document.querySelector(
    "#rsvpStats"
  );

const ROLE_ORDER = [
  "Parent",
  "Godfather",
  "Godmother",
  "Maid of Honor",
  "Best Man",
  "Bridesmaid",
  "Groomsman",
  "Bearer",
  "Flower Girl",
  "Guest"
];

const STATIC_ATTENDEES = [
  {
    fullName: "R. Espinosa",
    displayName: "R. Espinosa",
    role: "Parent",
    categories: [
      "Parent"
    ],
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "G. Espinosa",
    displayName: "G. Espinosa",
    role: "Parent",
    categories: [
      "Parent"
    ],
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "A. Canlas",
    displayName: "A. Canlas",
    role: "Godfather",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "N. Garcia",
    displayName: "N. Garcia",
    role: "Godfather",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "R. Espinosa Jr.",
    displayName: "R. Espinosa Jr.",
    role: "Godfather",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "M. V. Dizon",
    displayName: "M. V. Dizon",
    role: "Godfather",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "A. A. Paras",
    displayName: "A. A. Paras",
    role: "Godfather",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "A. Duldulao",
    displayName: "A. Duldulao",
    role: "Godfather",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "M. Dayan",
    displayName: "M. Dayan",
    role: "Godfather",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "A. Quiambao",
    displayName: "A. Quiambao",
    role: "Godmother",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "E. Jimenez",
    displayName: "E. Jimenez",
    role: "Godmother",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "V. M. Manlutac",
    displayName: "V. M. Manlutac",
    role: "Godmother",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "A. Moriones",
    displayName: "A. Moriones",
    role: "Godmother",
    categories: [
      "Godmother",
      "Parent"
    ],
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "R. Duldulao",
    displayName: "R. Duldulao",
    role: "Godmother",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "E. Salvatierra",
    displayName: "E. Salvatierra",
    role: "Godmother",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "M. E. Espinosa",
    displayName: "M. E. Espinosa",
    role: "Godmother",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "A. Palara",
    displayName: "A. Palara",
    role: "Maid of Honor",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "G. Arceo Jr.",
    displayName: "G. Arceo Jr.",
    role: "Best Man",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "S. J. Espinosa",
    displayName: "S. J. Espinosa (Bible)",
    role: "Bearer",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "A. J. Zulueta",
    displayName: "A. J. Zulueta (Coin)",
    role: "Bearer",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "L. A. Ronquillo",
    displayName: "L. A. Ronquillo (Herald/Banner)",
    role: "Bearer",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "A. T. Fabros",
    displayName: "A. T. Fabros (Ring)",
    role: "Bearer",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "B. J. Reyes",
    displayName: "B. J. Reyes",
    role: "Flower Girl",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "I. J. Espinosa",
    displayName: "I. J. Espinosa",
    role: "Flower Girl",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "F. E. Tenedero",
    displayName: "F. E. Tenedero",
    role: "Flower Girl",
    attendance: "Static",
    isStatic: true
  },
  {
    fullName: "K. E. Gomez",
    displayName: "K. E. Gomez",
    role: "Flower Girl",
    attendance: "Static",
    isStatic: true
  }
];

let attendees = [];

const attendeeBelongsToRole = (
  attendee,
  role
) => {
  if (
    Array.isArray(
      attendee.categories
    )
  ) {
    return attendee.categories.includes(
      role
    );
  }

  return attendee.role === role;
};

const getRoleIndex = role => {
  const index =
    ROLE_ORDER.indexOf(role);

  return index === -1
    ? 999
    : index;
};

const sortAttendees = list => {
  return [...list].sort(
    (a, b) => {
      const roleDifference =
        getRoleIndex(a.role) -
        getRoleIndex(b.role);

      if (
        roleDifference !== 0
      ) {
        return roleDifference;
      }

      return (
        a.fullName ||
        a.displayName
      ).localeCompare(
        b.fullName ||
        b.displayName
      );
    }
  );
};

const getCollectionData =
  async (
    collectionName,
    attendance
  ) => {
    const snapshot =
      await getDocs(
        collection(
          db,
          collectionName
        )
      );

    return snapshot.docs.map(
      documentSnapshot => {
        const data =
          documentSnapshot.data();

        return {
          id:
            documentSnapshot.id,

          fullName:
            data.name ||
            "Unknown",

          displayName:
            data.name ||
            "Unknown",

          role:
            data.role ||
            "Guest",

          attendance,

          collectionName,

          submittedAt:
            data.submittedAt,

          isStatic:
            false
        };
      }
    );
  };

const getStatusClass =
  attendance => {
    if (
      attendance === "Attending"
    ) {
      return "attending";
    }

    if (
      attendance === "Not sure"
    ) {
      return "unsure";
    }

    if (
      attendance === "Not attending"
    ) {
      return "declined";
    }

    return "static";
  };

const renderStats = () => {
  if (!rsvpStats) {
    return;
  }

  const firebaseResponses =
    attendees.filter(
      attendee =>
        !attendee.isStatic
    );

  const attending =
    firebaseResponses.filter(
      attendee =>
        attendee.attendance ===
        "Attending"
    ).length;

  const unsure =
    firebaseResponses.filter(
      attendee =>
        attendee.attendance ===
        "Not sure"
    ).length;

  const declined =
    firebaseResponses.filter(
      attendee =>
        attendee.attendance ===
        "Not attending"
    ).length;

  rsvpStats.innerHTML = "";

  const stats = [
    `Responses: ${firebaseResponses.length}`,
    `Attending: ${attending}`,
    `Not sure: ${unsure}`,
    `Declined: ${declined}`
  ];

  stats.forEach(value => {
    const stat =
      document.createElement(
        "span"
      );

    stat.className =
      "rsvp-stat";

    stat.textContent =
      value;

    rsvpStats.appendChild(
      stat
    );
  });
};

const renderList = () => {
  if (!rsvpList) {
    return;
  }

  rsvpList.innerHTML = "";

  if (!attendees.length) {
    rsvpList.innerHTML = `
      <p class="rsvp-list__empty">
        No RSVP records found.
      </p>
    `;

    return;
  }

  ROLE_ORDER.forEach(roleName => {
    const roleAttendees =
      attendees.filter(
        attendee =>
          attendeeBelongsToRole(
            attendee,
            roleName
          )
      );

    if (
      !roleAttendees.length
    ) {
      return;
    }

    const group =
      document.createElement(
        "section"
      );

    group.className =
      "rsvp-list__group";

    const title =
      document.createElement(
        "h2"
      );

    title.className =
      "rsvp-list__group-title";

    title.textContent =
      `${roleName} (${roleAttendees.length})`;

    group.appendChild(
      title
    );

    roleAttendees.forEach(
      attendee => {
        const item =
          document.createElement(
            "div"
          );

        item.className =
          "rsvp-list__item";

        const name =
          document.createElement(
            "span"
          );

        name.className =
          "rsvp-list__name";

        name.textContent =
          attendee.fullName ||
          attendee.displayName;

        const role =
          document.createElement(
            "span"
          );

        role.className =
          "rsvp-list__role";

        role.textContent =
          roleName;

        const status =
          document.createElement(
            "span"
          );

        status.className =
          `rsvp-list__status rsvp-list__status--${getStatusClass(
            attendee.attendance
          )}`;

        status.textContent =
          attendee.attendance;

        const source =
          document.createElement(
            "span"
          );

        source.className =
          "rsvp-list__source";

        source.textContent =
          attendee.isStatic
            ? "Static"
            : "RSVP";

        const action =
          document.createElement(
            "div"
          );

        if (
          attendee.isStatic
        ) {
          const staticLabel =
            document.createElement(
              "span"
            );

          staticLabel.className =
            "rsvp-list__source";

          staticLabel.textContent =
            "Edit JS";

          action.appendChild(
            staticLabel
          );
        } else {
          const deleteButton =
            document.createElement(
              "button"
            );

          deleteButton.type =
            "button";

          deleteButton.className =
            "delete-button";

          deleteButton.textContent =
            "Delete";

          deleteButton.addEventListener(
            "click",
            () => {
              deleteAttendee(
                attendee,
                deleteButton
              );
            }
          );

          action.appendChild(
            deleteButton
          );
        }

        item.appendChild(
          name
        );

        item.appendChild(
          role
        );

        item.appendChild(
          status
        );

        item.appendChild(
          source
        );

        item.appendChild(
          action
        );

        group.appendChild(
          item
        );
      }
    );

    rsvpList.appendChild(
      group
    );
  });

  renderStats();
};

const loadAttendees = async () => {
  if (!rsvpList) {
    return;
  }

  rsvpList.innerHTML = `
    <p class="rsvp-list__loading">
      Loading RSVP list...
    </p>
  `;

  exportMessage.textContent =
    "";

  try {
    const [
      attending,
      unsure,
      declined
    ] = await Promise.all([
      getCollectionData(
        "rsvps",
        "Attending"
      ),

      getCollectionData(
        "unsureRsvps",
        "Not sure"
      ),

      getCollectionData(
        "declinedRsvps",
        "Not attending"
      )
    ]);

    attendees =
      sortAttendees([
        ...attending,
        ...unsure,
        ...declined,
        ...STATIC_ATTENDEES
      ]);

    renderList();

    const responseCount =
      attending.length +
      unsure.length +
      declined.length;

    exportMessage.textContent =
      `${responseCount} RSVP responses loaded.`;

  } catch (error) {
    console.error(
      "Unable to load RSVP data:",
      error
    );

    attendees =
      sortAttendees(
        STATIC_ATTENDEES
      );

    renderList();

    exportMessage.textContent =
      "Unable to load RSVP responses.";
  }
};

const deleteAttendee =
  async (
    attendee,
    button
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${attendee.fullName}?\n\nThis removes their RSVP and allows the same name to submit again.`
      );

    if (!confirmed) {
      return;
    }

    button.disabled =
      true;

    button.textContent =
      "Deleting...";

    try {
      const batch =
        writeBatch(db);

      /*
       * Delete every possible RSVP
       * record with this name hash.
       * Non-existing documents are fine.
       */

      batch.delete(
        doc(
          db,
          "rsvps",
          attendee.id
        )
      );

      batch.delete(
        doc(
          db,
          "unsureRsvps",
          attendee.id
        )
      );

      batch.delete(
        doc(
          db,
          "declinedRsvps",
          attendee.id
        )
      );

      batch.delete(
        doc(
          db,
          "publicAttendees",
          attendee.id
        )
      );

      batch.delete(
        doc(
          db,
          "rsvpNames",
          attendee.id
        )
      );

      await batch.commit();

      attendees =
        attendees.filter(
          currentAttendee =>
            currentAttendee.isStatic ||
            currentAttendee.id !==
              attendee.id
        );

      renderList();

      exportMessage.textContent =
        `${attendee.fullName} was deleted successfully.`;

    } catch (error) {
      console.error(
        "Unable to delete RSVP:",
        error
      );

      exportMessage.textContent =
        "Unable to delete this RSVP.";

      button.disabled =
        false;

      button.textContent =
        "Delete";
    }
  };

const escapeCsv = value => {
  const text =
    String(
      value ?? ""
    );

  return `"${text.replaceAll(
    '"',
    '""'
  )}"`;
};

const createCsv = () => {
  const rows = [
    [
      "Full Name",
      "Primary Role",
      "Categories",
      "Response",
      "Source"
    ]
  ];

  attendees.forEach(
    attendee => {
      const categories =
        Array.isArray(
          attendee.categories
        )
          ? attendee.categories.join(
              ", "
            )
          : attendee.role;

      rows.push([
        attendee.fullName ||
          attendee.displayName,

        attendee.role,

        categories,

        attendee.attendance,

        attendee.isStatic
          ? "Static"
          : "RSVP"
      ]);
    }
  );

  return rows
    .map(row =>
      row
        .map(
          escapeCsv
        )
        .join(",")
    )
    .join("\r\n");
};

const downloadCsv = () => {
  if (!attendees.length) {
    exportMessage.textContent =
      "There is no RSVP data to download.";

    return;
  }

  const csv =
    createCsv();

  const blob =
    new Blob(
      [
        "\uFEFF",
        csv
      ],
      {
        type:
          "text/csv;charset=utf-8"
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

  link.href =
    url;

  link.download =
    "rex-trisha-rsvp-list.csv";

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.setTimeout(
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    1000
  );
};

downloadButton.addEventListener(
  "click",
  downloadCsv
);

refreshButton.addEventListener(
  "click",
  loadAttendees
);

loadAttendees();