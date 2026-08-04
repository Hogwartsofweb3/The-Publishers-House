import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Shell } from './components/layout/Shell'
import { LoginPage } from './pages/Login'
import { DashboardPage } from './pages/Dashboard'
import { SermonsListPage } from './pages/Sermons/List'
import { SermonFormPage } from './pages/Sermons/Form'
import { EventsListPage } from './pages/Events/List'
import { EventFormPage } from './pages/Events/Form'
import { ArticlesListPage } from './pages/Articles/List'
import { ArticleFormPage } from './pages/Articles/Form'
import { ProgramsListPage } from './pages/Programs/List'
import { ProgramFormPage } from './pages/Programs/Form'
import { LeadershipListPage } from './pages/Leadership/List'
import { LeaderFormPage } from './pages/Leadership/Form'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Shell />}>
              <Route index element={<DashboardPage />} />
              <Route path="sermons" element={<SermonsListPage />} />
              <Route path="sermons/new" element={<SermonFormPage />} />
              <Route path="sermons/:id" element={<SermonFormPage />} />
              <Route path="events" element={<EventsListPage />} />
              <Route path="events/new" element={<EventFormPage />} />
              <Route path="events/:id" element={<EventFormPage />} />
              <Route path="articles" element={<ArticlesListPage />} />
              <Route path="articles/new" element={<ArticleFormPage />} />
              <Route path="articles/:id" element={<ArticleFormPage />} />
              <Route path="programs" element={<ProgramsListPage />} />
              <Route path="programs/new" element={<ProgramFormPage />} />
              <Route path="programs/:id" element={<ProgramFormPage />} />
              <Route path="leadership" element={<LeadershipListPage />} />
              <Route path="leadership/new" element={<LeaderFormPage />} />
              <Route path="leadership/:id" element={<LeaderFormPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
