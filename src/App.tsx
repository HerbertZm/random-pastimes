import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { MappingsProvider } from './context/MappingsContext'
import { AdminPage } from './pages/AdminPage'
import { UserPage } from './pages/UserPage'

function App() {
  return (
    <MappingsProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<UserPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MappingsProvider>
  )
}

export default App
