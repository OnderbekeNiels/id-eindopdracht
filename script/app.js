"use strict";

const provider =
  "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png";
const copyright =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>';
let map, layergroup;

const maakMarker = function (coords, adres, placesLeft, lastUpdate) {
  // console.log(coords)
  const lastUpdateTime = new Date(lastUpdate)
  let colorClass;
  if(placesLeft <= 50){
    colorClass = "u-space-left--small" ;
  }
  else if(placesLeft <= 150){
    colorClass = "u-space-left--medium";
  }
  else{
    colorClass = "u-space-left--large";
  }
  const arr_coords = coords;
  layergroup.clearLayers();
  let marker = L.marker(arr_coords).addTo(layergroup);
  marker.bindPopup(`<p class="c-marker__content c-marker__content--places ${colorClass}">${placesLeft} places left</p><p class="c-marker__content c-marker__content--address">${adres}</p><p class="c-marker__content c-marker__content--update-time">Last update: ${lastUpdateTime.toLocaleTimeString()}</p>`);
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
      record.fields.availablecapacity,
      record.fields.lastupdate
    );

  }
};

const listenToToggle = function(){
    const mapInput = document.querySelector(".c-toggle-option__input--map")
    ,tableInput = document.querySelector(".c-toggle-option__input--table")
    ,inputs = document.querySelectorAll(".c-toggle-option__input"), map = document.querySelector(".c-map"), table = document.querySelector(".c-table");
    for(const input of inputs){
      input.addEventListener("change",function(){
        if(mapInput.checked)
        {
          console.log("show map");
          table.classList.add("o-hide-accessible");
          map.classList.remove("o-hide-accessible");
        }
        if(tableInput.checked){
          console.log("show table");
          table.classList.remove("o-hide-accessible");
          map.classList.add("o-hide-accessible");
        }
        
      })
    }
}

const getAPI = async function () {
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

document.addEventListener("DOMContentLoaded", function () {
  initMap();
  getAPI();
  listenToToggle();
});
