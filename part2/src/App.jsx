import { useState } from 'react'

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
    const [persons, setPersons] = useState([
        { name: 'Arto Hellas', number: '040-123456', id: 1 },
        { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
        { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
        { name: 'Mary Poppendieck', number: '39-23-6423122', id: 4 }
    ]);
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [filter, setFilter] = useState('');
    const addPerson = (event) => {
        event.preventDefault()
        if (persons.some(person => person.name === newName)) {
            alert(`${newName} is already added to phonebook`)
            return
        }
        const personObject = {
            name: newName,
            number: newNumber
        }
        setPersons(persons.concat(personObject))
        setNewName('')
        setNewNumber('')
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