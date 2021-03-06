"use strict";

// Form validatie

let submit, email;


//#region *** Global Functions ***

let capacityLow = 50, capacityMed = 200;

const getCapacityColor = function (availableSpace) {
  if (availableSpace <= capacityLow) {
    return "u-space-left--small";
  } else if (availableSpace <= capacityMed) {
    return "u-space-left--medium";
  } else {
    return "u-space-left--large";
  }
};

const getCapacityIcon = function (availableSpace) {
  if (availableSpace <= capacityLow) {
    return redIcon;
  } else if (availableSpace <= capacityMed) {
    return orangeIcon;
  } else {
    return greenIcon;
  }
};

//#endregion

//#region *** Map Visualisation ***

var greenIcon, orangeIcon, redIcon;

const provider =
  "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png";
const copyright =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>';
let map, layergroup;

const maakMarker = function (parkingObject) {
  const colorClass = getCapacityColor(parkingObject.placesLeft),
    arr_coords = parkingObject.coord;
  layergroup.clearLayers();
  let marker = L.marker(arr_coords, {
    icon: getCapacityIcon(parkingObject.placesLeft),
  }).addTo(layergroup);
  marker.bindPopup(
    `<div class="c-marker-content c-marker-content__places-left ${colorClass}">${
      parkingObject.placesLeft
    } places left</div><div class="c-marker-content c-marker-content__name">${
      parkingObject.name
    }</div><div class="c-marker-content c-marker-content__details">${
      parkingObject.address
    }</div><div class="c-marker-content c-marker-content__details">last update: ${parkingObject.updateTime}</div>`
  );
};

const initMap = function () {
  map = L.map("mapid").setView([51.0544, 3.7238], 13);
  L.tileLayer(provider, { attribution: copyright }).addTo(map);

  // Custom Icons

  greenIcon = L.icon({
    iconUrl: "./img/location_green.svg",
    iconSize: [50, 50], // size of the icon
    popupAnchor: [0, -16], // point from which the popup should open relative to the iconAnchor
  });

  orangeIcon = L.icon({
    iconUrl: "./img/location_orange.svg",
    iconSize: [50, 50], // size of the icon
    popupAnchor: [0, -16], // point from which the popup should open relative to the iconAnchor
  });

  redIcon = L.icon({
    iconUrl: "./img/location_red.svg",
    iconSize: [50, 50], // size of the icon
    popupAnchor: [0, -16], // point from which the popup should open relative to the iconAnchor
  });
};

const showPointers = function (records) {
  for (const record of records) {
    layergroup = L.layerGroup().addTo(map);
    const parkingObject = {
      coord: record.fields.geo_location,
      address: record.fields.address,
      name: record.fields.name,
      placesLeft: record.fields.availablecapacity,
      updateTime: record.fields.lastupdate,
    };
    maakMarker(parkingObject);
  }
};

const getMap = async function () {
  let endpoint = `https://data.stad.gent/api/records/1.0/search/?dataset=bezetting-parkeergarages-real-time&q=&rows=100&facet=description`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    showPointers(data.records);
  } catch (error) {
    console.error("An error occured, we handled it.", error);
  }
};

//#endregion

//#region *** Table Visualisation ***
const showTable = function (records) {
  let htmlTable = `<tr class="c-table__table-row c-table_table-row--header">
  <th class="c-table__table-header c-table__col--md">Parking</th>
  <th
    class="c-table__table-header c-table__col--sm u-text-align--right"
  >
    Places left
  </th>
</tr>`;
  records.sort((a, b) => (a.fields.name > b.fields.name ? 1 : -1));
  for (const record of records) {
    const colorClass = getCapacityColor(record.fields.availablecapacity);
    htmlTable += ` <tr class="c-table__table-row">
    <td class="c-table__table-data u-pr__md c-table__col--md" >${record.fields.name}</td>
    <td class="c-table__table-data u-text-align--right c-table__col--sm ${colorClass}">${record.fields.availablecapacity}</td>
  </tr>`;
  }
  document.querySelector(".c-table").innerHTML = htmlTable;
};

const getTable = async function () {
  let endpoint = `https://data.stad.gent/api/records/1.0/search/?dataset=bezetting-parkeergarages-real-time&q=&rows=100&facet=description`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    showTable(data.records);
  } catch (error) {
    console.error("An error occured, we handled it.", error);
  }
};

//#endregion

//#region *** Event Listeners ***

const listenToToggle = function () {
  const mapInput = document.querySelector(".js-option-map"),
    tableInput = document.querySelector(".js-option-table"),
    inputs = document.querySelectorAll(".js-option"),
    dataContainer = document.querySelector(".c-data-container");
  for (const input of inputs) {
    input.addEventListener("change", function () {
      if (mapInput.checked) {
        dataContainer.classList.remove("c-table--visible");
        getMap();
      }
      if (tableInput.checked) {
        dataContainer.classList.add("c-table--visible");
        getTable();
      }
    });
  }
};

const doubleCheckEmail = function () {
  if (IsValidEmail(email.value) && !isEmpty(email.value)) {
    email.classList.remove("c-custom-input__email--invalid");
    email.removeEventListener("input", doubleCheckEmail);
  } else {
    email.classList.add("c-custom-input__email--invalid");
  }
};

const IsValidEmail = function (emailInput) {
  const regexEmail = RegExp(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  );
  return regexEmail.test(emailInput);
};

const isEmpty = function (fieldValue) {
  return !fieldValue || !fieldValue.length;
};

const enableEventListeners = function () {
  email = document.querySelector(".js-email");
  submit = document.querySelector(".js-submit");

  email.addEventListener("blur", function () {
    if (!IsValidEmail(email.value) || isEmpty(email.value)) {
      email.classList.add("c-custom-input__email--invalid");
      email.addEventListener("input", doubleCheckEmail);
    } else {
      email.removeEventListener("input", doubleCheckEmail);
    }
  });

  submit.addEventListener("click", function () {
    if (!IsValidEmail(email.value)) {
      email.classList.add("c-custom-input__email--invalid");
      email.addEventListener("input", doubleCheckEmail);
    } else {
      email.removeEventListener("input", doubleCheckEmail);
    }
  });
};

//#endregion

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".is-app")) {
    initMap();
    getMap();
    listenToToggle();
  }

  if (document.querySelector(".is-landingspagina")) {
    enableEventListeners();
  }
});
