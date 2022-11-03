///// This is current date and time /////
function getCurrentTime() {
  let now = new Date();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let day = days[now.getDay()];
  let time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let today = document.querySelector("#today-day");
  today.innerHTML = `${day} ${time}`;
}

///// This is API call for weather by city or coordinates /////
function callApiForCityOrCoordinates(searchParameters = "q=new york") {
  let apiKey = "197ef3a642b76eef90e131866f74a0a0";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?${searchParameters}&appid=${apiKey}&units=metric`;

  axios.get(apiUrl).then(displayWeather);
}

// Here we get data from response and insert into corresponding elements
function displayWeather(response) {
  // create variables and asign corresponding HTML elements
  let placeElement = document.querySelector("#current-location");
  let tempElement = document.querySelector("#current-temp");
  let feelsLikeElement = document.querySelector("#real-feel");
  let humidityElement = document.querySelector("#humidity");
  let windElement = document.querySelector("#wind");
  let sunriseElement = document.querySelector("#sunrise");
  let sunsetElement = document.querySelector("#sunset");
  let mainIconElement = document.querySelector("#main-icon");

  // create variables and asign corresponding data from API response
  let data = response.data;

  celsiusTemp = data.main.temp;

  let city = data.name;
  let country = data.sys.country;
  let temp = `${Math.round(celsiusTemp)}°`;
  let tempFeels = `${Math.round(data.main.feels_like)}°`;
  let humidity = data.main.humidity;
  let wind = `${Math.round(data.wind.speed)}`;
  let sunriseLocalTime = convertUnixtoLocalTime(data.sys.sunrise);
  let sunsetLocalTime = convertUnixtoLocalTime(data.sys.sunset);
  let mainIcon = data.weather[0].icon.replace("n", "d");

  // insert collected data into corresponding HTMl elements
  placeElement.innerHTML = `${city}, ${country}`;
  tempElement.innerHTML = temp;
  feelsLikeElement.innerHTML = tempFeels;
  humidityElement.innerHTML = `${humidity}%`;
  windElement.innerHTML = `${wind} meter/sec`;
  sunriseElement.innerHTML = sunriseLocalTime;
  sunsetElement.innerHTML = sunsetLocalTime;
  mainIconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${mainIcon}@2x.png`
  );
  mainIconElement.setAttribute("alt", data.weather[0].description);

  // Refresh current time
  getCurrentTime();
}

function convertUnixtoLocalTime(timeStamp) {
  let DateObject = new Date(timeStamp * 1000);
  let localTime = DateObject.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return localTime;
}

///// Search weather by city /////

// Event listeners for search button and enter
let searchInput = document.querySelector("#search-input");
let searchCityButton = document.querySelector("#button-addon2");

searchCityButton.addEventListener("click", searchWeatherForCity);
searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchWeatherForCity();
  }
});

function searchWeatherForCity() {
  let searchValue = searchInput.value;
  let searchParameters = `q=${searchValue}`;
  searchInput.value = "";

  callApiForCityOrCoordinates(searchParameters);
}

///// Search weather for current location /////
let button = document.querySelector("#current-location-button");
button.addEventListener("click", function () {
  navigator.geolocation.getCurrentPosition(getWeatherForCoordinates);
});

function getWeatherForCoordinates(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let searchParameters = `lat=${lat}&lon=${lon}`;
  callApiForCityOrCoordinates(searchParameters);
}

// Celsius / Fahrenheit switch
function switchToFahrenheit(event) {
  event.preventDefault();
  let currentTemp = document.querySelector("#current-temp");

  celsiusLink.classList.remove("active");
  fahrenheitLink.classList.add("active");
  let fahrenheitTemp = (celsiusTemp * 9) / 5 + 32;
  currentTemp.innerHTML = `${Math.round(fahrenheitTemp)}°`;
}

function switchToCelsius(event) {
  event.preventDefault();

  celsiusLink.classList.add("active");
  fahrenheitLink.classList.remove("active");
  let currentTemp = document.querySelector("#current-temp");
  currentTemp.innerHTML = `${Math.round(celsiusTemp)}°`;
}

let celsiusTemp = null;

let celsiusLink = document.querySelector("#celsius");
let fahrenheitLink = document.querySelector("#fahrenheit");

celsiusLink.addEventListener("click", switchToCelsius);
fahrenheitLink.addEventListener("click", switchToFahrenheit);

// When page loads we get a weather for default city
callApiForCityOrCoordinates();

// When page loads we get current time
getCurrentTime();
