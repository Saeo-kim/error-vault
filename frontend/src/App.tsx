import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorDetailPage from './pages/ErrorDetailPage'
import ErrorFormPage from './pages/ErrorFormPage'
import ErrorListPage from './pages/ErrorListPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ErrorListPage />} />
        <Route path="/errors/new" element={<ErrorFormPage mode="create" />} />
        <Route path="/errors/:id" element={<ErrorDetailPage />} />
        <Route path="/errors/:id/edit" element={<ErrorFormPage mode="edit" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
