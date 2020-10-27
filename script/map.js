
"use strict";

const provider =
  "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png";
const copyright =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>';
let map, layergroup;

const maakMarker = function(coords, adres, campusnaam) {
  // console.log(coords)
  const arr_coords = coords.split(",");
  layergroup.clearLayers();
  let marker = L.marker(arr_coords).addTo(layergroup);
  marker.bindPopup(`<h3>${campusnaam}</h3><em>${adres}</em>`);
};


const init = function() {
  console.log("init initiated!");

  map = L.map("mapid").setView([51.0544, 3.7238], 14);
  L.tileLayer(provider, { attribution: copyright }).addTo(map);

};

document.addEventListener("DOMContentLoaded", init);