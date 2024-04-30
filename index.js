const apiKey = 'caf581db75977e7248e569b27f32159d';

// Selecting DOM elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');
const searchHistoryContainer = document.getElementById('search-history');

// Utility functions
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Fetch weather data by city name
async function fetchWeather(city) {
  try {
    // Fetch coordinates first
    const coordsResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
    
    if (!coordsResponse.ok) {
      throw new Error('Failed to fetch coordinates');
    }

    const coordsData = await coordsResponse.json();
    if (coordsData.length === 0) {
      throw new Error('City not found');
    }
    
    const { lat, lon } = coordsData[0]; 

    // Then fetch weather using the coordinates
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API responded with status: ${weatherResponse.status}`);
    }
    
    const weatherData = await weatherResponse.json();
    if (!weatherData || !weatherData.current || !weatherData.daily) {
      throw new Error('Weather data is incomplete or not available');
    }

    // Update UI with new data
    displayCurrentWeather(weatherData.current);
    displayForecast(weatherData.daily);
    updateSearchHistory(city);

  } catch (error) {
    console.error('Error fetching weather data:', error);
    // I cant understand why this is not working. The data does pull under the network tag with the web dev tools.
  }
}

// Display the current weather using the first item in the 'list' array
function displayCurrentWeather(data) {
  // Assuming the first item in 'list' is the current weather
  const currentWeatherData = data.list[0];
  if (!currentWeatherData) {
    console.error('No current weather data available');
    return;
  }
  
  const weatherDescription = capitalize(currentWeatherData.weather[0].description);
  currentWeather.innerHTML = `
    <h2>Current Weather for ${data.city.name}:</h2>
    <p>Temperature: ${currentWeatherData.main.temp - 273.15}°C</p>
    <p>${weatherDescription}</p>
    <!-- Add more weather details here as needed -->
  `;
}

// Display the 5-day forecast. You might want to display it differently, as the 'list' contains 3-hourly forecast data for 5 days.
function displayForecast(data) {
  forecast.innerHTML = '<h2>5-Day Forecast:</h2>';
  // 'list' array includes every 3-hour segment, so for daily forecast, we pick one record per day
  for (let i = 0; i < data.list.length; i += 8) { // Skip every 8 items to approximate daily forecast
    const dayWeatherData = data.list[i];
    const date = new Date(dayWeatherData.dt * 1000);
    console.log(dayWeatherData);
    forecast.innerHTML += `
      <div class="forecast-item">
        <p><strong>${date.toDateString()}</strong></p>
        <p>Temperature: ${dayWeatherData.main.temp - 273.15}°C</p>
        <p>${capitalize(dayWeatherData.weather[0].description)}</p>
        <!-- Add more weather details here as needed -->
      </div>
    `;
  }
}


// Update search history in the UI and localStorage
function updateSearchHistory(city) {
  // Add to the search history if it's not already there
  if (!localStorage.getItem(city)) {
    localStorage.setItem(city, true);
    const newHistoryItem = document.createElement('button');
    newHistoryItem.textContent = city;
    newHistoryItem.classList.add('history-item');
    newHistoryItem.addEventListener('click', () => {
      fetchWeather(city);
    });
    searchHistoryContainer.appendChild(newHistoryItem);
  }
}

// Load search history from localStorage and add to the UI
function loadSearchHistory() {
  Object.keys(localStorage).forEach(city => {
    const historyItem = document.createElement('button');
    historyItem.textContent = city;
    historyItem.classList.add('history-item');
    historyItem.addEventListener('click', () => {
      fetchWeather(city);
    });
    searchHistoryContainer.appendChild(historyItem);
  });
}

// Handle search form submission
searchForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const city = searchInput.value;
  fetchWeather(city);
  searchInput.value = ''; // Clear the search input
});

// Load search history when the DOM content is loaded
document.addEventListener('DOMContentLoaded', loadSearchHistory);