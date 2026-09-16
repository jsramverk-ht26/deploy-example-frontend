import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourses } from './api.js'

export default function CourseList() {
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Hämtar kurser…</p>

  // Felhanteringen är med av ett skäl: när CORS saknas i backend misslyckas
  // fetch() i webbläsaren men fungerar i curl. Utan ett synligt felmeddelande
  // ser man bara en tom sida och vet inte varför.
  if (error) {
    return (
      <div className="error">
        <p><strong>Kunde inte hämta kurser:</strong> {error.message}</p>
        <p>
          Öppna webbläsarens konsol. Står det <em>blocked by CORS policy</em> saknar
          backend <code>cors</code>-middleware — se README.
        </p>
      </div>
    )
  }

  return (
    <>
      <p>{courses.length} kurser</p>
      <ul className="courses">
        {courses.map((course) => (
          <li key={course._id}>
            <Link to={`/courses/${course._id}`}>
              <span className="code">{course.courseCode}</span>
              {course.courseName}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
