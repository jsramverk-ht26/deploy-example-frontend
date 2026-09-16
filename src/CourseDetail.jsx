import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourse } from './api.js'

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCourse(id).then(setCourse).catch(setError)
  }, [id])

  if (error) return <p className="error">Kunde inte hämta kursen: {error.message}</p>
  if (!course) return <p>Hämtar kurs…</p>

  return (
    <article>
      <Link to="/">&larr; Tillbaka</Link>

      <h2>{course.courseName}</h2>

      <dl>
        <dt>Kurskod</dt><dd>{course.courseCode}</dd>
        <dt>Poäng</dt><dd>{course.points}</dd>
        <dt>Termin</dt><dd>{course.term}</dd>
        <dt>Program</dt><dd>{course.programmeOccasionName}</dd>
        <dt>Antal studenter</dt><dd>{course.students}</dd>
      </dl>
    </article>
  )
}
