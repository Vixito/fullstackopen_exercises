import { useState, useEffect } from 'react'
import personsService from './services/persons'

const Filter = ({ filter, handleFilter }) => {
    return (
        <div>
            filter shown with <input value={filter} onChange={handleFilter}/>
        </div>
    )
}

const Form = ({ newName, newNumber, handleName, handleNumber, addPerson }) => {
    return (
        <form onSubmit={addPerson}>
            <div>
                <h2>Add a new</h2>
                name: <input value={newName} onChange={handleName}/><br/>
                number: <input value={newNumber} onChange={handleNumber}/>
            </div>
            <div>
                <button type="submit">add</button>
            </div>
        </form>
    )
}

const Numbers = ({ persons, filter }) => {
    const personsToShow = filter
        ? persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
        : persons;
    return (
        <ul>
            {personsToShow.map((person) => (
                <li key={person.name}>{person.name} {person.number}</li>
            ))}
        </ul>
    )
}

const App = () => {
    const [persons, setPersons] = useState([]);
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        personsService
            .getAll()
            .then(initialPersons => {
                setPersons(initialPersons);
            })
            .catch(error => {
                console.error('Error fetching persons:', error);
                alert('Failed to fetch persons. Please try again later.');
            });
    }, [])

    const addPerson = (event) => {
        event.preventDefault()
        if (persons.some(person => person.name === newName)) {
            alert(`${newName} is already added to phonebook`)
            return
        }
        const personObject = {
            name: newName,
            number: newNumber,
            id: persons.length > 0 ? String(Math.max(...persons.map(p => Number(p.id))) + 1) : "1"
        }
        personsService
            .create(personObject)
            .then(response => {
                setPersons(persons.concat(response))
                setNewName('')
                setNewNumber('')
            })
            .catch(error => {
                console.error('Error adding person:', error);
                alert('Failed to add person. Please try again.');
            });
    }
    const handleName = (event) => {
        setNewName(event.target.value)
    }
    const handleNumber = (event) => {
        setNewNumber(event.target.value)
    }
    const handleFilter = (event) => {
        setFilter(event.target.value)
    }

    return (
        <div>
            <h1>Phonebook</h1>
            <Filter filter={filter} handleFilter={handleFilter}/>
            <Form
                newName={newName}
                newNumber={newNumber}
                handleName={handleName}
                handleNumber={handleNumber}
                addPerson={addPerson}
            />
            <h2>Numbers</h2>
            <Numbers persons={persons} filter={filter}/>
        </div>
    )
}

export default App