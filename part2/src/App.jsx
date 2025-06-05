import { useState } from 'react'

const App = () => {
    const [persons, setPersons] = useState([
        { name: 'Arto Hellas', number: '040-123456' }
    ]);
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');
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

    return (
        <div>
            <h1>Phonebook</h1>
            <form onSubmit={addPerson}>
                <div>
                    name: <input value={newName} onChange={handleName}/><br/>
                    number: <input value={newNumber} onChange={handleNumber}/>
                </div>
                <div>
                    <button type="submit">add</button>
                </div>
            </form>
            <h1>Numbers</h1>
            <ul>
                {persons.map((person) => (
                    <li key={person.name}>{person.name} {person.number}</li>
                ))}
            </ul>
        </div>
    )
}

export default App