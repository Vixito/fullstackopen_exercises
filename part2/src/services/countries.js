import axios from 'axios';
const baseUrl = 'https://studies.cs.helsinki.fi/restcountries/api/';

const getAll = () => {
    return axios.get(`${baseUrl}/all`)
        .then(response => response.data)
        .catch(error => {
            console.error('Error fetching countries:', error);
            throw error;
        });
}

const getByName = (name) => {
    return axios.get(`${baseUrl}/name/${name}`)
        .then(response => response.data)
        .catch(error => {
            console.error(`Error fetching country with name ${name}:`, error);
            throw error;
        });
}

export default {getAll, getByName};