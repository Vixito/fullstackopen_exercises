import { useState, useEffect } from 'react'
import personsService from './services/persons'

const Filter = ({ filter, handleFilter }) => {
    return (
        <div>
            Filter shown with<input className="filterInput" value={filter} onChange={handleFilter}/>
        </div>
    )
}

const Form = ({ newName, newNumber, handleName, handleNumber, addPerson }) => {
    return (
        <form onSubmit={addPerson}>
            <div className="formHeader">
                <h2>Add a new</h2>
                <div className="formInputs">
                    <div className="inputRow">
                        <label htmlFor="name">Name:</label>
                        <input className="nameInput" id="name" value={newName} onChange={handleName}/><br/>
                    </div>
                    <div className="inputRow">
                        <label htmlFor="number">Number:</label>
                        <input className="numberInput" id="number" value={newNumber} onChange={handleNumber}/>
                    </div>
                </div>
            </div>
            <button className="addButton" type="submit">Add</button>
        </form>
    )
}

const Numbers = ({ persons, filter, handleDelete }) => {
    const personsToShow = filter
        ? persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))
        : persons;
    return (
        <ul>
            <li className="personRow personHeader">
                <span>#</span>
                <span>Name</span>
                <span>Number</span>
                <span>Action</span>
            </li>
            {personsToShow.map((person) => (
                <li className="personRow" key={person.name}>
                    <span className="personId">{person.id}</span>
                    <span className="personName">{person.name}</span>
                    <span className="personNumber">{person.number}</span>
                    <span className="personActions">
                        <button className="deleteButton" onClick={() => handleDelete(person)}>
                            Delete
                        </button>
                    </span>
                </li>
            ))}
        </ul>
    )
}

const Notification = ({ message }) => {
    if (!message) {
        return null;
    } else if (message.startsWith('Error:')) {
        return (
            <div className="error">
                {message}
            </div>
        );
    } else {
        return (
            <div className="success">
                {message}
            </div>
        );
    }
}

const Footer = () => {
    return (
        <div className="footer">
            <p>Created and developed by <strong>Vixis</strong> - 2025</p>
        </div>
    )
}

const App = () => {
    const [persons, setPersons] = useState(null);
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [filter, setFilter] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        personsService
            .getAll()
            .then(initialPersons => {
                setPersons(initialPersons);
            })
            .catch(error => {
                console.error('Error fetching persons:', error);
                setNotificationMessage('Error: error fetching phonebook data');
                setTimeout(() => {
                    setNotificationMessage('');
                }, 5000);
            });
    }, [])

    const addPerson = (event) => {
        event.preventDefault()
        const existingPerson = persons.find(person => person.name === newName);
        if (existingPerson) {
            if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
                const updatedPerson = { ...existingPerson, number: newNumber }
                personsService
                    .update(existingPerson.id, updatedPerson)
                    .then(returnedPerson => {
                        setNotificationMessage(`Updated ${returnedPerson.name}'s number`);
                        setTimeout(() => {
                            setNotificationMessage('');
                        }, 5000);
                        setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedPerson))
                        setNewName('')
                        setNewNumber('')
                    })
                    .catch(error => {
                        console.error('Error updating person:', error)
                        setNotificationMessage(`Error: ${error.response.data.error}`);
                        setTimeout(() => {
                            setNotificationMessage('');
                        }, 5000);
                        setPersons(persons.filter(p => p.id !== existingPerson.id)) // Remove the person if update fails
                    })
            }
            return;
        }
        const personObject = {
            name: newName,
            number: newNumber,
            id: persons.length > 0 ? String(Math.max(...persons.map(p => Number(p.id))) + 1) : "1"
        }
        personsService
            .create(personObject)
            .then(response => {
                setNotificationMessage(`Added ${response.name}`);
                setTimeout(() => {
                    setNotificationMessage('');
                }, 5000);
                setPersons(persons.concat(response))
                setNewName('')
                setNewNumber('')
            })
            .catch(error => {
                console.error('Error adding person:', error);
                setNotificationMessage(`Error: ${error.response.data.error}`);
                setTimeout(() => {
                    setNotificationMessage('');
                }, 5000);
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
                    setNotificationMessage(`Information of ${person.name} has already been removed from server`);
                    setTimeout(() => {
                        setNotificationMessage('');
                    }, 5000);
                })
                .catch(error => {
                    console.error('Error deleting person:', error);
                    setNotificationMessage(`Error: ${error.response.data.error}`);
                    setTimeout(() => {
                        setNotificationMessage('');
                    }, 5000);
                    setPersons(persons.filter(p => p.id !== person.id)) // Remove the person if delete fails
                });
        }
    }

    return (
        <div>
            <h1>Phonebook</h1>
            <div className="nav">
                <Filter filter={filter} handleFilter={handleFilter}/>
                <Notification message={notificationMessage}/>
            </div>
            <Form
                newName={newName}
                newNumber={newNumber}
                handleName={handleName}
                handleNumber={handleNumber}
                addPerson={addPerson}
            />
            <h2>List</h2>
            { !persons 
                ? <div className="loading">Loading...</div> 
                : <Numbers persons={persons} filter={filter} handleDelete={handleDelete}/>
            }
            <Footer/>
        </div>
    )
}

export default App