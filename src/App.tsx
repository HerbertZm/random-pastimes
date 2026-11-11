import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PinGate } from './components/PinGate'
import { AbilitiesProvider } from './context/AbilitiesContext'
import { AdminPage } from './pages/AdminPage'
import { PlayPage } from './pages/PlayPage'

function App() {
  return (
    <AbilitiesProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<PlayPage />} />
            <Route
              path="spaceship"
              element={<PinGate>{(lock) => <AdminPage onLock={lock} />}</PinGate>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AbilitiesProvider>
  )
}

export default App
