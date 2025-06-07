import { useState, useEffect } from 'react'
import countriesService from './services/countries'

const Filter = ({ filter, handleFilter }) => {
    return (
        <div>
            find countries <input value={filter} onChange={handleFilter}/>
        </div>
    )
}

const CountriesList = ({ countries }) => {
    if (countries.length > 10) {
        return <div>Too many matches, specify another filter</div>
    } else if (countries.length === 1) {
        const country = countries[0];
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
    } else {
        return (
            <ul>
                {countries.map(country => (
                    <li key={country.cca3}>
                        {country.name.common}
                    </li>
                ))}
            </ul>
        );
    }
}

const App = () => {
    const [filter, setFilter] = useState('');
    const [countries, setCountries] = useState([]);

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

    return (
        <div>
            <Filter filter={filter} handleFilter={handleFilter}/>
            {filter && <CountriesList countries={filteredCountries} />}
        </div>
    )
}

export default App