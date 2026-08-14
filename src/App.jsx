import { useState } from 'react';
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])

  async function handleSearch() {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY

    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`)

      if (!res.ok) {
        if (res.status === 404) {
          alert('City not found. Try a different spelling.')
        } else {
          alert('Something went wrong with fetching the weather.')
        }
        return
      }

      const data = await res.json()

      setWeather({
        city: data.name,
        temperature: data.main.temp,
        condition: data.weather[0].description,
        icon: data.weather[0].icon,
      })

      fetchForecast(city)

    } catch (error) {
      console.error(error)
      alert('Network error. Please try again')
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY

        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`
          )
          if (!res.ok) {
            alert('Could not fetch weather for your location')
            return
          }

          const data = await res.json()

          setWeather({
            city: data.name,
            temperature: data.main.temp,
            condition: data.weather[0].description,
            icon: data.weather[0].icon,
          })

          fetchForecast(data.name)

        } catch (error) {
          console.error(error)
          alert('Network error. Please try again')
        }
      },
      (error) => {
        console.error(error)
        alert('Location access denied or unavailable')
      }
    )
  }

  async function fetchForecast(cityName){
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY

    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=imperial`)

      if (!res.ok) return

      const data = await res.json()

      const dailyMap = {}

      data.list.forEach((entry) => {
        const date = entry.dt_txt.split(' ')[0]
        const hour = entry.dt_txt.split(' ')[1]
        
        if(hour === '12:00:00'){
          dailyMap[date] = {
            day: new Date(entry.dt_txt).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: entry.main.temp,
            icon: entry.weather[0].icon,
          }
        }
      })
      setForecast(Object.values(dailyMap))
    } catch (error) {
      console.error(error)
    }
  }

  /*
  const fakeWeather = {
    city: 'Edison',
    temperature: 72,
    condition: 'clear sky',
    icon: '01d',
  }

  const fakeForecast = [
    { day: 'Mon', temp: 70, icon: '01d' },
    { day: 'Tue', temp: 65, icon: '10d' },
    { day: 'Wed', temp: 68, icon: '02d' },
    { day: 'Thu', temp: 72, icon: '01d' },
    { day: 'Fri', temp: 75, icon: '01d' },
  ]
  */

  return (
    <div className="app">
      <h1>Weather App</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter a city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleUseLocation}>Use My Location</button>
      </div>

      {weather && (
        <div className="weather-card">
          <h2>{weather.city}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.condition}
          />
          <p className="temperature">{Math.round(weather.temperature)}°F</p>
          <p className="condition">{weather.condition}</p>
        </div>
      )}

      <div className="forecast">
        {forecast.map((day, index) => (
          <div className="forecast-day" key={index}>
            <p>{day.day}</p>
            <img
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt=""
            />
            <p>{Math.round(day.temp)}°F</p>
          </div>
        ))}
      </div>

      <footer className = "app-footer">
        <p>Built by Urvi Akhouri</p>
        <p>
          This project was built for the PM Accelerator technical assesment. <a href="https://www.linkedin.com/school/pmaccelerator/" target="_blank" rel="noopener noreferrer">Product Manager Accelerator</a> is a program designed to support PM professionals through every stage of their careers. From students...to Directors...our program has helped...hundreds...fulfill their career aspirations.
        </p>
      </footer>
    </div>
  )
}

export default App