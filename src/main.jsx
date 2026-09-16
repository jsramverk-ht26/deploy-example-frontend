import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      basename talar om för react-router att appen ligger i en underkatalog.
      import.meta.env.BASE_URL kommer från `base` i vite.config.js, så de
      två kan inte hamna i otakt.
    */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
