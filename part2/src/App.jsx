const Course = ({ course }) => {
  const totalExercises = course.parts.reduce((sum, part) => sum + part.exercises, 0);
  // Parte 2.3 ya hecha, aunque lo haya hecho en la parte 2.2
  return (
    <div>
      <h1>{course.name}</h1>
      <ul>
        {course.parts.map(part => (
          <li key={part.name}>
            {part.name} {part.exercises}
          </li>
        ))}
      </ul>
      <p>
        <strong>Total of {totalExercises} exercises</strong>
      </p>
    </div>
  )
}

const App = () => {
  const course = {
    id: 1,
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamentals of React',
        exercises: 10
      },
      {
        name: 'Using props to pass data',
        exercises: 7
      },
      {
        name: 'State of a component',
        exercises: 14
      }
    ]
  }

  return <Course course={course}/>
}

export default App
