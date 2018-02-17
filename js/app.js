const cl = console.log;

let weather = document.getElementById('btn-weather');
let inputSearch = document.getElementById('place-search');
let temperatureLabel = document.getElementById('temperature');
let timezoneLabel = document.getElementById('timezone');
let summaryLabel = document.getElementById('summary');
let humidityLabel = document.getElementById('humidity');
let precipProbabilityLabel = document.getElementById('precipProbability');

let WEATHER = ((window, document) => {
  // https://api.darksky.net/forecast/[key]/[latitude],[longitude],[time]
  let host = 'https://api.darksky.net/forecast/';
  let key = 'bcfb332dbff54b0b470a2c8cbad6e360';
  let time = null;

  let temperature = null;
  let timezone = null;
  let summary = null;
  let humidity = null;
  let precipProbability = null;

  const getData = data => {
    temperature = data.currently.temperature;
    timezone = data.timezone;
    summary = data.currently.summary;
    humidity = data.currently.humidity;
    precipProbability = data.currently.precipProbability;

    return {
      temperature: temperature,
      timezone: timezone,
      summary: summary,
      humidity: humidity,
      precipProbability: precipProbability
    };
  };

  const pushData = obj => {
    temperatureLabel.innerHTML = obj.temperature + '&deg;';
    timezoneLabel.innerText = obj.timezone;
    summaryLabel.innerText = obj.summary;
    humidityLabel.innerText = obj.humidity;
    precipProbabilityLabel.innerText = obj.precipProbability;
  };

  const successCallback = function() {
    let data = JSON.parse(this.responseText);
    
    pushData(getData(data));

 /*    temperature = data.currently.temperature;
    timezone = data.timezone;
    summary = data.currently.summary;
    humidity = data.currently.humidity;
    precipProbability = data.currently.precipProbability; */

    /* temperatureLabel.innerHTML = temperature + '&deg;';
    timezoneLabel.innerText = timezone;
    summaryLabel.innerText = summary;
    humidityLabel.innerText = humidity;
    precipProbabilityLabel.innerText = precipProbability; */
  };

  const errorCallback = () => {
    cl('Ocurrio un error!!!');
  };

  const search = ({ lat, lng }) => {
    let XHR = new XMLHttpRequest();
    let uri = `${host}/${key}/${lat},${lng}?lang=es&units=si`;
    let proxy = 'https://cors-anywhere.herokuapp.com/';

    XHR.open('GET', proxy + uri);

    XHR.onload = successCallback;
    XHR.onerror = errorCallback;
    XHR.send();
  };

  return {
    search: search
  };
})(window, document);

let GMAP = ((window, document) => {
  let map = null;
  let marker = null;
  let laboratoria = {
    lat: -12.145552,
    lng: -77.022321
  };
  let currentPos = {
    lat: null,
    lng: null
  };

  // level zoom
  // 1: World
  // 5: Landmass / continent
  // 10: City
  // 15: Streets
  // 20: Buildings

  const paintMarker = () => {
    // para borrar el marker anterior
    marker.setMap(null);

    marker = new google.maps.Marker({
      position: currentPos,
    });

    map.setCenter(currentPos);

    // To add the marker to the map, call setMap();
    marker.setMap(map);

    WEATHER.search(currentPos);
  };

  const initMap = () => {
    map = new google.maps.Map(document.getElementById('map'), {
      center: laboratoria,
      zoom: 15
    });

    marker = new google.maps.Marker({
      position: laboratoria,
    });

    // To add the marker to the map, call setMap();
    marker.setMap(map);

    map.addListener('click', event => {
      currentPos.lat = event.latLng.lat();
      currentPos.lng = event.latLng.lng();

      paintMarker();
    });

    let place = new google.maps.places.Autocomplete(inputSearch);

    place.addListener('place_changed', () => {
      let data = place.getPlace();

      currentPos.lat = data.geometry.location.lat();
      currentPos.lng = data.geometry.location.lng();

      paintMarker();
    });
  };

  const successCallback = position => {
    currentPos.lat = position.coords.latitude;
    currentPos.lng = position.coords.longitude;

    paintMarker();
  };

  const errorCallback = () => {
    cl('Ocurrio un error!!!');
  };

  const searchCurrenPosition = () => {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  };

  return {
    initMap: initMap,
    searchCurrenPosition: searchCurrenPosition,
    currentPosition: currentPos
  };
})(window, document);

function initMap() {
  GMAP.initMap();
  GMAP.searchCurrenPosition();
}

weather.addEventListener('click', () => {
  GMAP.searchCurrenPosition();
  WEATHER.search(GMAP.currentPosition);
});
