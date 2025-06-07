import { useState, useEffect } from 'react'
import countriesService from './services/countries'
import weatherService from './services/weather'

const Filter = ({ filter, handleFilter }) => {
    return (
        <div>
            find countries <input value={filter} onChange={handleFilter}/>
        </div>
    )
}

const Weather = ({ capital }) => {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        if (!capital) return;
        weatherService.getWeather(capital)
            .then(data => {
                console.log('Weather data:', data);
                setWeather(data);
            })
            .catch((err) => {
                console.error('Error fetching weather:', err);
                setWeather(null)
            });
    }, [capital]);

    if (!weather) return <div>Loading weather...</div>;

    return (
        <div>
            <h3>Weather in {capital}</h3>
            <div>Temperature: {weather.main.temp} °C</div>
            <div>Weather: {weather.weather[0].description}</div>
            <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="weather icon" />
            <div>Wind: {weather.wind.speed} m/s</div>
        </div>
    );
}

const CountryDetail = ({ country }) => {
    if (!country) return null;
    const capital = country.capital?.[0];
    return (
        <div>
            <h2>{country.name.common}</h2>
            <p>Capital: {capital}</p>
            <p>Area: {country.area}</p>
            <ul>
                {country.languages && Object.values(country.languages).map(language => (
                    <li key={language}>{language}</li>
                ))}
            </ul>
            <img src={country.flags.png} alt={`Flag of ${country.name.common}`} width="100" />
            {capital && <Weather capital={capital} />}
        </div>
    );
}

const CountriesList = ({ countries, handleShowCountry }) => {
    if (countries.length > 10) {
        return <div>Too many matches, specify another filter</div>
    } else if (countries.length === 1) {
        return <CountryDetail country={countries[0]}/>
    } else {
        return (
            <ul>
                {countries.map(country => (
                    <li key={country.cca3}>
                        {country.name.common} {' '}
                        <button onClick={() => handleShowCountry(country)}>show</button>
                    </li>
                ))}
            </ul>
        );
    }
}

const App = () => {
    const [filter, setFilter] = useState('');
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);

    useEffect(() => {
        countriesService.getAll()
            .then(data => {
                setCountries(data);
            })
            .catch(error => {
                console.error('Error fetching countries:', error);
            });
    }, [])

    const filteredCountries = countries.filter(country =>
        country.name.common.toLowerCase().includes(filter.toLowerCase())
    );

    const handleFilter = (event) => {
        setFilter(event.target.value);
    }

    const handleShowCountry = (country) => {
        setSelectedCountry(country);
        setFilter(country.name.common);
    }

    return (
        <div>
            <Filter filter={filter} handleFilter={handleFilter}/>
            {filter && !selectedCountry && (
                <CountriesList countries={filteredCountries} handleShowCountry={handleShowCountry} />
            )}
            {selectedCountry && (
                <CountryDetail country={selectedCountry} />
            )}
        </div>
    )
}

export default App