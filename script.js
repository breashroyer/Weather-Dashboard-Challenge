const apiKey = '9dfc8d19d0091d936e160eee8eff6064'; // Replace with your actual API key
const searchButton = document.getElementById('search-button');
const citySearchInput = document.getElementById('city-search');
const weatherDetails = document.getElementById('weather-details');
const forecastContainer = document.getElementById('forecast-container');
const historyList = document.getElementById('history-list');

// Function to fetch weather data
async function fetchWeather(cityName) {
    try {
        // Geocoding API to get latitude and longitude
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
        const geoResponse = await fetch(geoUrl);
        const locationData = await geoResponse.json();

        if (!geoResponse.ok) {
            throw new Error(`Error fetching location data: ${geoResponse.statusText}`);
        }

        if (locationData.length === 0) {
            throw new Error('City not found. Please check the city name and try again.');
        }

        const { lat, lon } = locationData[0];

        // Weather forecast API
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching weather data: ${response.statusText}`);
        }
        const weatherData = await response.json();

        // Update the UI with weather data
        updateWeatherDetails(weatherData, cityName);
        updateForecast(weatherData);
        saveSearchHistory(cityName);
        updateSearchHistory();
    } catch (error) {
        console.error("Fetch Error:", error.message);
        displayErrorMessage(error.message); // Display an error message to the user
    }
}

function displayErrorMessage(message) {
    // You can adjust this function to fit how you want to display error messages
    weatherDetails.innerHTML = `<p class="error-message">${message}</p>`;
    forecastContainer.innerHTML = ''; // Clear the forecast container in case of error
}


// Update current weather details
function updateWeatherDetails(weatherData, cityName) {
    const { list } = weatherData;
    const currentWeather = list[0];
    const { main, weather, wind, dt } = currentWeather;
    const weatherIconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;

    // Format the date
    const date = new Date(dt * 1000).toLocaleDateString();

    weatherDetails.innerHTML = `
        <h3>${cityName} (${date})</h3>
        <img src="${weatherIconUrl}" alt="${weather[0].description}" />
        <p><strong>Temperature:</strong> ${main.temp} °C</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind.speed} meter/sec</p>
        <p><strong>Weather:</strong> ${weather[0].main} (${weather[0].description})</p>
    `;
}

// Update 5-day forecast
function updateForecast(weatherData) {
    forecastContainer.innerHTML = '<h4>5-Day Forecast:</h4>';
    // Assuming the API returns data in chronological order, take one data point per day
    for (let i = 0; i < weatherData.list.length; i += 8) { // Skip every 8 intervals (24 hours/3 hours per interval)
        const forecast = weatherData.list[i];
        const { dt, main, weather, wind } = forecast;
        const weatherIconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;
        
        // Format the date
        const date = new Date(dt * 1000).toLocaleDateString();

        const forecastEl = document.createElement('div');
        forecastEl.className = 'forecast-item';
        forecastEl.innerHTML = `
            <h5>${date}</h5>
            <img src="${weatherIconUrl}" alt="${weather[0].description}" />
            <p>Temp: ${main.temp} °C</p>
            <p>Humidity: ${main.humidity}%</p>
            <p>Wind: ${wind.speed} meter/sec</p>
            <p>${weather[0].main} (${weather[0].description})</p>
        `;
        forecastContainer.appendChild(forecastEl);
    }
}


// Save search history to local storage
function saveSearchHistory(cityName) {
    try {
        let searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (!searches.includes(cityName)) {
            searches.unshift(cityName);
            localStorage.setItem('searchHistory', JSON.stringify(searches));
        }
    } catch (error) {
        console.error("Error saving search history:", error);
        // Optionally, inform the user that search history couldn't be saved.
    }
}

// Update search history in the UI
function updateSearchHistory() {
    try {
        const searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
        historyList.innerHTML = '';
        searches.forEach(city => {
            const li = document.createElement('li');
            li.textContent = city;
            li.addEventListener('click', () => fetchWeather(city));
            historyList.appendChild(li);
        });
    } catch (error) {
        console.error("Error updating search history:", error);
        // Optionally, display an error message or clear the history list if corrupted.
    }
}


// Event listeners
searchButton.addEventListener('click', () => {
    try {
        const cityName = citySearchInput.value.trim();
        if (cityName) {
            fetchWeather(cityName);
            citySearchInput.value = ''; // Clear input field after search
        } else {
            throw new Error("Please enter a city name.");
        }
    } catch (error) {
        console.error("Error initiating weather fetch:", error.message);
        displayErrorMessage(error.message);
    }
});


// Initial update of search history on page load
document.addEventListener('DOMContentLoaded', updateSearchHistory);
