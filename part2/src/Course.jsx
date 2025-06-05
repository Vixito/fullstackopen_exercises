const Course = ({ course }) => {
  const totalExercises = course.parts.reduce((sum, part) => sum + part.exercises, 0);
  console.log(course);
  return (
    <div>
      <h2>{course.name}</h2>
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

export default Course;