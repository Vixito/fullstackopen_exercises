import { useState } from 'react'

const App = () => {
    const [persons, setPersons] = useState([
        { name: 'Arto Hellas' }
    ]) 
    const [newName, setNewName] = useState('')
    const addPerson = (event) => {
        event.preventDefault()
        const personObject = {
            name: newName
        }
        setPersons(persons.concat(personObject))
        setNewName('')
    }
    const handleChange = (event) => {
        setNewName(event.target.value)
    }

    return (
        <div>
            <h1>Phonebook</h1>
            <form onSubmit={addPerson}>
                <div>
                    name: <input value={newName} onChange={handleChange}/>
                </div>
                <div>
                    <button type="submit">add</button>
                </div>
            </form>
            <h1>Numbers</h1>
            <ul>
                {persons.map((person) => (
                    <li key={person.name}>{person.name}</li>
                ))}
            </ul>
        </div>
    )
}

export default App