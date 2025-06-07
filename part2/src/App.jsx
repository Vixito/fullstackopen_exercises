import { useState, useEffect } from 'react'
import countriesService from './services/countries'

const Filter = ({ filter, handleFilter }) => {
    return (
        <div>
            find countries <input value={filter} onChange={handleFilter}/>
        </div>
    )
}

const CountryDetail = ({ country }) => {
    if (!country) return null;
    return (
        <div>
            <h2>{country.name.common}</h2>
            <p>Capital: {country.capital?.[0]}</p>
            <p>Area: {country.area}</p>
            <ul>
                {country.languages && Object.values(country.languages).map(language => (
                    <li key={language}>{language}</li>
                ))}
            </ul>
            <img src={country.flags.png} alt={`Flag of ${country.name.common}`} width="100" />
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

    const handleFilter = (event) => {
        setFilter(event.target.value);
    }

    const filteredCountries = countries.filter(country =>
        country.name.common.toLowerCase().includes(filter.toLowerCase())
    );

    const handleShowCountry = (country) => {
        setSelectedCountry(country);
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