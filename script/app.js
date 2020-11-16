"use strict";

//#region *** Global Functions ***

const getCapacityColor = function (availableSpace) {
  if (availableSpace <= 50) {
    return "u-space-left--small";
  } else if (availableSpace <= 150) {
    return "u-space-left--medium";
  } else {
    return "u-space-left--large";
  }
};

//#endregion

//#region *** Map Visualisation ***

const provider =
  "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png";
const copyright =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>';
let map, layergroup;

const maakMarker = function (coords, adres, name, placesLeft, lastUpdate) {
  // console.log(coords)
  const lastUpdateTime = new Date(lastUpdate);
  lastUpdateTime.setHours(lastUpdateTime.getHours() - 2);
  const colorClass = getCapacityColor(placesLeft);
  const arr_coords = coords;
  layergroup.clearLayers();
  let marker = L.marker(arr_coords).addTo(layergroup);
  marker.bindPopup(
    `<p class="c-marker__content c-marker__content--places ${colorClass}">${placesLeft} places left</p><p class="c-marker__content c-marker__content--address">${name}</p><p class="c-marker__content">${adres}</p><p class="c-marker__content c-marker__content--update-time">Last update: ${lastUpdateTime.toLocaleTimeString()}</p>`
  );
};

const initMap = function () {
  console.log("init initiated!");
  map = L.map("mapid").setView([51.0544, 3.7238], 13);
  L.tileLayer(provider, { attribution: copyright }).addTo(map);
};

const showPointers = function (records) {
  for (const record of records) {
    layergroup = L.layerGroup().addTo(map);
    maakMarker(
      record.fields.geo_location,
      record.fields.address,
      record.fields.name,
      record.fields.availablecapacity,
      record.fields.lastupdate
    );
  }
};

const getMap = async function () {
  let endpoint = `https://data.stad.gent/api/records/1.0/search/?dataset=bezetting-parkeergarages-real-time&q=&rows=100&facet=description`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    console.log(data);
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
    console.log(data);
    showTable(data.records);
  } catch (error) {
    console.error("An error occured, we handled it.", error);
  }
};

//#endregion

const listenToToggle = function () {
  const mapInput = document.querySelector(".c-toggle-option__input--map"),
    tableInput = document.querySelector(".c-toggle-option__input--table"),
    inputs = document.querySelectorAll(".c-toggle-option__input"),
    map = document.querySelector(".c-map"),
    table = document.querySelector(".c-table");
  for (const input of inputs) {
    input.addEventListener("change", function () {
      if (mapInput.checked) {
        console.log("show map");
        table.classList.add("u-hide-accessible");
        map.classList.remove("u-hide-accessible");
        getMap();
      }
      if (tableInput.checked) {
        console.log("show table");
        table.classList.remove("u-hide-accessible");
        map.classList.add("u-hide-accessible");
        getTable();
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", function () {
  initMap();
  getMap();
  listenToToggle();
});
