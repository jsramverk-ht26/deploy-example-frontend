import { Routes, Route, Link } from 'react-router-dom'
import CourseList from './CourseList.jsx'
import CourseDetail from './CourseDetail.jsx'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>
          <Link to="/">Kurskatalog</Link>
        </h1>
        <p className="sub">
          React + Vite på GitHub Pages — data från <code>deploy-example-backend</code>
        </p>
      </header>

      <main>
        {/*
          Två routes räcker för kravet "minst lista och visa innehåll".
          /            -> lista alla kurser
          /courses/:id -> visa en kurs
        */}
        <Routes>
          <Route path="/" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Routes>
      </main>

      <footer>
        <a href="https://github.com/jsramverk-ht26/deploy-example-frontend">
          Källkod på GitHub
        </a>
      </footer>
    </div>
  )
}
