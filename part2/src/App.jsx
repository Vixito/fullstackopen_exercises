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

const Numbers = ({ persons, filter, handleDelete }) => {
    const personsToShow = filter
        ? persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
        : persons;
    return (
        <ul>
            {personsToShow.map((person) => (
                <li key={person.name}>{person.name} {person.number} {' '}
                    <button onClick={() => handleDelete(person)}>
                        delete
                    </button>
                </li>
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
    const handleDelete = (person) => {
        if (window.confirm(`Delete ${person.name}?`)) {
            personsService
                .remove(person.id)
                .then(() => {
                    setPersons(persons.filter(p => p.id !== person.id))
                })
                .catch(error => {
                    console.error('Error deleting person:', error);
                    alert('Failed to delete person. Please try again.');
                });
        }
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
            <Numbers persons={persons} filter={filter} handleDelete={handleDelete}/>
        </div>
    )
}

export default App