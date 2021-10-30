//function to call weather API
var histDisplay = document.querySelector("#hist-display");
var weatherForecast = document.querySelector("#weather-display");
var currentWeather = document.querySelector("#current-day");
var histArray = [];

function loadHistory() {
  var loadHist = localStorage.getItem("histArray");

  if (!loadHist) {
      return false;
  }

  // If loadHist is not empty, we parse it from localstorage and print the history buttons.
  histArray = JSON.parse(loadHist);
  histArray.forEach(element => {
    var button = document.createElement("button");
    button.innerHTML = element;
    button.className = 'button';
    button.type = 'submit';
    button.id = 'history';
    button.setAttribute("name", element);
    histDisplay.appendChild(button);
  });
}

function saveSearch(city) {
  var button = document.createElement("button");
  button.innerHTML = city;
  button.className = 'button';
  button.type = 'submit';
  button.id = 'history';
  button.setAttribute("name", city);

  histDisplay.appendChild(button);
  histArray.push(city);
  localStorage.setItem("histArray", JSON.stringify(histArray));
  console.log(histArray);
}

// This function is called and queries a forecast search based on the button name clicked in 
// the history list. 
function checkButtonId(event) {
  if (event.target.id === "history") {
    searchCity(event.target.name);
  }
}


function searchCity(cityName) {

  if (!cityName) {
    var searchTerm = document.querySelector("#searchTerm").value;
    console.log('entered if');
  }
  else {
    var searchTerm = cityName;
    console.log('entered else');
  }

  if (!searchTerm) {
    window.alert('Please enter the name of a city');
    return;
  }
  event.preventDefault();

  // Make a `fetch` request concatenating that search term to the query URL for weather forecast
  fetch(
    'https://api.openweathermap.org/data/2.5/forecast?q=' + searchTerm + '&units=imperial&appid=8e2a4447de15a5d804cf8a7d25a93eca'
  )

    // Converts the response to JSON
    .then(function (response) {
      // console.log(response);
      return response.json();
    })

    .then(function (response) {
      console.log(response);
      // Here, we verify if the response is okay. 200 means it's successful.
      // This conditional says: If it is not successful, alert the user with response.message (city not found),
      // otherwise, we take it to be successful and save the search term to history. But we must also check if 
      // the cityName parameter is empty, since this is the variable used by function "checkButtonId" to search
      // for results based on the name of the button clicked, where the button clicked is inside the history list.
      if (response.cod !== '200') {
        window.alert(response.message);
        return;
      }
      else {
        // Only save if the cityName variable is empty, because cityName is a variable being used for button
        // listeners ONLY in the history list to recall a previous search. We don't want to create another button
        // by mistake for each time we hit a history button to recall a previous search! Also check if the searchTerm
        // already exists in history. We don't want multiple buttons for the same city.
        if (!cityName && !histArray.includes(searchTerm)) {
          saveSearch(searchTerm);
        }

      }

      var datesArray = [];
      weatherForecast.innerHTML = "";

      // /use jQuery to bring weather data from the API to the 5-day forecast cards 
      for (let day = 0; day <= 5; day++) {
        var date = moment().add(day, "days").format("M/D/YYYY").toString()
        datesArray.push(date);
      }
      console.log(datesArray);

      // This is the code block for the current day. It retrieves information from the response at the zeroth (0 element)
      // and posts it to the html div element for current day weather. I have chosen to enclose this block in curly braces
      // to make the variables local, so that we can avoid any confusion with the for loop, just to play it safe!
      {
        currentWeather.innerHTML = "";
        var dateEl = document.createElement("p");
        var tempEl = document.createElement("p");
        var windEl = document.createElement("p");
        var HumidityEl = document.createElement("p");
        var iconEl = document.createElement("img");

        dateEl.className = "current-date";
        tempEl.className = "current-temp";
        windEl.className = "current-wind";
        HumidityEl.className = "current-hum";        

        dateEl.textContent = searchTerm + " " + datesArray[0];
        tempEl.textContent = "Temp: " + response.list[0].main.temp + " °F";
        windEl.textContent = "Wind: " + response.list[0].wind.speed + " mph";
        HumidityEl.textContent = "Humidity: " + response.list[0].main.humidity + "%";
        iconEl.setAttribute("src", "http://openweathermap.org/img/w/" + response.list[0].weather[0].icon + ".png");

        currentWeather.appendChild(dateEl);
        currentWeather.appendChild(iconEl);
        currentWeather.appendChild(tempEl);
        currentWeather.appendChild(windEl);
        currentWeather.appendChild(HumidityEl);
      }

      // This is the code block for the 5 day forecast. The response returned gives an array of 40 elements.
      // The first element is the most current report of today's weather, which was just printed by the code
      // block above. The next 5 days are given by the following indices: 7, 15, 23, 31, 39 (index 0 to 39 = 40)
      for (let index = 7; index <= 40; index += 8) {
        var dateEl = document.createElement("p");
        var tempEl = document.createElement("p");
        var windEl = document.createElement("p");
        var HumidityEl = document.createElement("p");
        var iconEl = document.createElement("img");
        var card = document.createElement("div");


        dateEl.className = "weather-item";
        tempEl.className = "weather-item";
        windEl.className = "weather-item";
        HumidityEl.className = "weather-item";
        card.className = "card";
        card.style = "width: 10rem;";

        dateEl.textContent = datesArray[(index + 1) / 8];
        tempEl.textContent = "Temp: " + response.list[index].main.temp + " °F";
        windEl.textContent = "Wind: " + response.list[index].wind.speed + " mph";
        HumidityEl.textContent = "Humidity: " + response.list[index].main.humidity + "%";
        iconEl.setAttribute("src", "http://openweathermap.org/img/w/" + response.list[index].weather[0].icon + ".png");

        card.appendChild(dateEl);
        card.appendChild(iconEl);
        card.appendChild(tempEl);
        card.appendChild(windEl);
        card.appendChild(HumidityEl);
        weatherForecast.appendChild(card);
      }
    });
};

loadHistory();
histDisplay.addEventListener("click", checkButtonId);
