const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
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
        const [locationData] = await geoResponse.json();
        const { lat, lon } = locationData;

        // Weather forecast API
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(apiUrl);
        const weatherData = await response.json();

        // Update the UI with weather data
        updateWeatherDetails(weatherData, cityName);
        updateForecast(weatherData);
        saveSearchHistory(cityName);
        updateSearchHistory();
    } catch (error) {
        console.error("Failed to fetch weather data", error);
    }
}

// Update current weather details
function updateWeatherDetails(weatherData, cityName) {
    const { list } = weatherData;
    const { main, weather } = list[0];
    weatherDetails.innerHTML = `
        <h3>${cityName}</h3>
        <p><strong>Temperature:</strong> ${main.temp} °C</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Weather:</strong> ${weather[0].main} (${weather[0].description})</p>
    `;
}

// Update 5-day forecast
function updateForecast(weatherData) {
    forecastContainer.innerHTML = '';
    for (let i = 0; i < weatherData.list.length; i += 8) { // Every 8th item in the list is a new day
        const { dt_txt, main, weather } = weatherData.list[i];
        const forecastEl = document.createElement('div');
        forecastEl.innerHTML = `
            <h4>${dt_txt.split(' ')[0]}</h4>
            <p>Temp: ${main.temp} °C</p>
            <p>Humidity: ${main.humidity}%</p>
            <p>${weather[0].main} (${weather[0].description})</p>
        `;
        forecastContainer.appendChild(forecastEl);
    }
}

// Save search history to local storage
function saveSearchHistory(cityName) {
    let searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searches.includes(cityName)) {
        searches.push(cityName);
        localStorage.setItem('searchHistory', JSON.stringify(searches));
    }
}

// Update search history in the UI
function updateSearchHistory() {
    historyList.innerHTML = '';
    const searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searches.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => fetchWeather(city));
        historyList.appendChild(li);
    });
}

// Event listeners
searchButton.addEventListener('click', () => {
    const cityName = citySearchInput.value;
    fetchWeather(cityName);
    citySearchInput.value = ''; // Clear input field after search
});

// Initial update of search history on page load
document.addEventListener('DOMContentLoaded', updateSearchHistory);
