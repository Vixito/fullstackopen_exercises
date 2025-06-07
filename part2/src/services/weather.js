import axios from 'axios'

const api_key = import.meta.env.VITE_WEATHER_API_KEY

const getWeather = (capital) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${capital}&APPID=${api_key}&units=metric`;
    return axios.get(url).then(res => res.data);
}

export default { getWeather }