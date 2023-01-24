///// This is current date and time /////
function getCurrentTime() {
  let now = new Date();
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };

  let date = now.toLocaleDateString(undefined, options);
  let time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  let today = document.querySelector("#today-day");
  today.innerHTML = `<div>${date}</div> <div>${time}</div>`;
}

///// This is API call for weather by city or coordinates /////
let currentCity = "";
let currentUnits = "metric";
let apiKey = "197ef3a642b76eef90e131866f74a0a0";

// for today & 5 days
function callApiForCityOrCoordinates(
  searchParameters = "q=new york",
  units = "metric"
) {
  let apiUrlOneDay = `https://api.openweathermap.org/data/2.5/weather?${searchParameters}&appid=${apiKey}&units=${units}`;
  let apiUrlFiveDays = `https://api.openweathermap.org/data/2.5/forecast?${searchParameters}&appid=${apiKey}&units=${units}`;

  axios.get(apiUrlOneDay).then(displayWeather);
  axios.get(apiUrlFiveDays).then(displayWeekWeather);
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
  let descriptionElement = document.querySelector("#weather-description");

  // create variables and asign corresponding data from API response
  let data = response.data;
  let city = data.name;
  let country = data.sys.country;
  let temp = `${Math.round(data.main.temp)}°`;
  let tempFeels = `${Math.round(data.main.feels_like)}°`;
  let humidity = data.main.humidity;
  let wind = `${Math.round(data.wind.speed)}`;
  let sunriseLocalTime = convertUnixToLocalTime(data.sys.sunrise);
  let sunsetLocalTime = convertUnixToLocalTime(data.sys.sunset);
  let mainIcon = data.weather[0].icon;
  let weatherDescription = data.weather[0].main;
  // Here we save the city from the lates search
  currentCity = city;

  // insert collected data into corresponding HTMl elements
  placeElement.innerHTML = `${city}, ${country}`;
  tempElement.innerHTML = temp;
  feelsLikeElement.innerHTML = tempFeels;
  humidityElement.innerHTML = `${humidity}%`;
  let windUnits = currentUnits === "metric" ? "m/sec" : "mph";
  windElement.innerHTML = `${wind} ${windUnits}`;
  sunriseElement.innerHTML = sunriseLocalTime;
  sunsetElement.innerHTML = sunsetLocalTime;
  mainIconElement.setAttribute("src", `./images/${mainIcon}.png`);
  mainIconElement.setAttribute("alt", data.weather[0].description);
  descriptionElement.innerHTML = weatherDescription;

  // Refresh current time
  getCurrentTime();
}

function displayWeekWeather(response) {
  let listOfForecasts = filterWeekForecastFromResponse(response);

  let weekForecastContaner = document.querySelector("#week-forecast-conttaner");
  weekForecastContaner.innerHTML = "";

  listOfForecasts.forEach(function (dayForecast) {
    let date = convertUnixtoLocalDate(dayForecast.dt);
    let icon = `./images/${dayForecast.weather[0].icon}.png`;
    let description = dayForecast.weather[0].description;
    let temp = `${Math.round(dayForecast.main.temp)}°`;
    let dayForecastHtml = `
      <div
        class="col-sm-2 col-xs-12 d-flex align-content-center justify-content-center flex-wrap"
      >
        <div
          class="day-forecast-container d-flex align-content-between justify-content-center flex-wrap"
        >
          <div class="day-forecast mt-3">${date}</div>
          <div class="day-forecast-img mt-3">
            <img
              src="${icon}"
              alt="${description}"
              class="weather-img"
            />
          </div>
          <div class="day-forecast my-3">${temp}</div>
        </div>
      </div>
    `;
    weekForecastContaner.innerHTML += dayForecastHtml;
  });
}

function filterWeekForecastFromResponse(response) {
  let now = new Date();
  let listOfForecasts = [];

  for (item of response.data.list) {
    let dt = item.dt;
    let then = new Date(dt * 1000);
    if (
      then.setHours(00, 00, 00) > now.setHours(00, 00, 00) &&
      item.dt_txt.search("12:00:00") !== -1
    ) {
      listOfForecasts.push(item);
    }
  }

  return listOfForecasts;
}

function convertUnixToLocalTime(timeStamp) {
  let DateObject = new Date(timeStamp * 1000);
  let localTime = DateObject.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return localTime;
}

function convertUnixtoLocalDate(timeStamp) {
  let dateObject = new Date(timeStamp * 1000);
  let day = dateObject.toLocaleDateString(undefined, { weekday: "short" });
  let date = dateObject.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return `${day}</br>${date}`;
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

///// Celsius / Fahrenheit switch /////
let celsiusLink = document.querySelector("#celsius");
let fahrenheitLink = document.querySelector("#fahrenheit");

celsiusLink.addEventListener("click", switchUnits);
fahrenheitLink.addEventListener("click", switchUnits);

function switchUnits(event) {
  let selectedElement = event.target;

  let units = "";
  if (selectedElement === celsiusLink) {
    units = "metric";
    celsiusLink.setAttribute("class", "active");
    fahrenheitLink.removeAttribute("class");
  } else {
    units = "imperial";
    fahrenheitLink.setAttribute("class", "active");
    celsiusLink.removeAttribute("class");
  }

  currentUnits = units;
  callApiForCityOrCoordinates(`q=${currentCity}`, units);
}

// When page loads we get a weather for default city
callApiForCityOrCoordinates();

// When page loads we get current time
getCurrentTime();
