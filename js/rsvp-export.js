import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app =
  initializeApp(
    firebaseConfig
  );

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
    displayName:
      "R. Espinosa",
    role:
      "Parent",
    isStatic:
      true
  },
  {
    displayName:
      "G. Espinosa",
    role:
      "Parent",
    isStatic:
      true
  },
  {
    displayName:
      "A. Moriones",
    role:
      "Parent",
    isStatic:
      true
  },
  {
    displayName:
      "A. Palara",
    role:
      "Maid of Honor",
    isStatic:
      true
  },
  {
    displayName:
      "G. Arceo Jr.",
    role:
      "Best Man",
    isStatic:
      true
  },
  {
    displayName:
      "S. J. Espinosa (Bible)",
    role:
      "Bearer",
    isStatic:
      true
  },
  {
    displayName:
      "A. J. Zulueta (Coin)",
    role:
      "Bearer",
    isStatic:
      true
  },
  {
    displayName:
      "L. A. Ronquillo (Herald/Banner)",
    role:
      "Bearer",
    isStatic:
      true
  },
  {
    displayName:
      "A. T. Fabros (Ring)",
    role:
      "Bearer",
    isStatic:
      true
  },
  {
    displayName:
      "B. J. Reyes",
    role:
      "Flower Girl",
    isStatic:
      true
  },
  {
    displayName:
      "I. J. Espinosa",
    role:
      "Flower Girl",
    isStatic:
      true
  },
  {
    displayName:
      "F. E. Tenedero",
    role:
      "Flower Girl",
    isStatic:
      true
  },
  {
    displayName:
      "K. E. Gomez",
    role:
      "Flower Girl",
    isStatic:
      true
  }
];

let attendees = [];

const getRoleIndex =
  role => {
    const index =
      ROLE_ORDER.indexOf(
        role
      );

    return index === -1
      ? 999
      : index;
  };

const sortAttendees =
  list => {
    return [...list].sort(
      (a, b) => {
        const roleDifference =
          getRoleIndex(
            a.role
          ) -
          getRoleIndex(
            b.role
          );

        if (
          roleDifference !== 0
        ) {
          return roleDifference;
        }

        return a.displayName.localeCompare(
          b.displayName
        );
      }
    );
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

const renderList = () => {
  if (!rsvpList) {
    return;
  }

  rsvpList.innerHTML = "";

  if (!attendees.length) {
    rsvpList.innerHTML = `
      <p class="rsvp-list__empty">
        No attendees found.
      </p>
    `;

    return;
  }

  ROLE_ORDER.forEach(
    role => {
      const roleAttendees =
        attendees.filter(
          attendee =>
            attendee.role === role
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
        "rsvp-list__role";

      const title =
        document.createElement(
          "h2"
        );

      title.className =
        "rsvp-list__role-title";

      title.textContent =
        `${role} (${roleAttendees.length})`;

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
            attendee.displayName;

          const roleElement =
            document.createElement(
              "span"
            );

          roleElement.textContent =
            attendee.role;

          const source =
            document.createElement(
              "span"
            );

          source.className =
            "rsvp-list__source";

          source.textContent =
            attendee.isStatic
              ? "Static"
              : "Firebase";

          const action =
            document.createElement(
              "div"
            );

          if (
            attendee.isStatic
          ) {
            const staticText =
              document.createElement(
                "span"
              );

            staticText.className =
              "rsvp-list__source";

            staticText.textContent =
              "Edit JS";

            action.appendChild(
              staticText
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
            roleElement
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
    }
  );
};

const loadAttendees =
  async () => {
    if (rsvpList) {
      rsvpList.innerHTML = `
        <p class="rsvp-list__loading">
          Loading RSVP list...
        </p>
      `;
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
        snapshot.docs.map(
          documentSnapshot => {
            const data =
              documentSnapshot.data();

            return {
              id:
                documentSnapshot.id,

              displayName:
                data.displayName,

              role:
                data.role,

              isStatic:
                false
            };
          }
        );

      attendees =
        sortAttendees([
          ...firebaseAttendees,
          ...STATIC_ATTENDEES
        ]);

      renderList();

      exportMessage.textContent =
        `${firebaseAttendees.length} confirmed RSVP responses found.`;

    } catch (error) {
      console.error(
        "Unable to load RSVP list:",
        error
      );

      exportMessage.textContent =
        "Unable to load RSVP list.";

      attendees =
        sortAttendees(
          STATIC_ATTENDEES
        );

      renderList();
    }
  };

const deleteAttendee =
  async (
    attendee,
    button
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${attendee.displayName} from the RSVP list?\n\nThis will also allow this person to submit their RSVP again.`
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
          "rsvps",
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
            !(
              !currentAttendee.isStatic &&
              currentAttendee.id ===
                attendee.id
            )
        );

      renderList();

      exportMessage.textContent =
        `${attendee.displayName} was removed from the RSVP list.`;

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

const createCsv = () => {
  const rows = [
    [
      "Role",
      "Name",
      "Source"
    ]
  ];

  attendees.forEach(
    attendee => {
      rows.push([
        attendee.role,
        attendee.displayName,
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

  URL.revokeObjectURL(
    url
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