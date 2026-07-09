import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NovoAtendimento from './pages/NovoAtendimento'
import MonitorMedico from './pages/MonitorMedico'
import MonitorPaciente from './pages/MonitorPaciente'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NovoAtendimento />} />
        <Route path="/atendimento/:id/medico" element={<MonitorMedico />} />
        <Route path="/atendimento/:id/paciente" element={<MonitorPaciente />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
