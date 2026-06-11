import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import FAQPage from './pages/FAQPage'
import AskQuestionPage from './pages/AskQuestionPage'
import CommunityPage from './pages/CommunityPage'
import QuestionDetailPage from './pages/QuestionDetailPage'
import AuthPage from './pages/AuthPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/"              element={<FAQPage />} />
                <Route path="/auth"          element={<AuthPage />} />
                <Route path="/ask"           element={<ProtectedRoute><AskQuestionPage /></ProtectedRoute>} />
                <Route path="/community"     element={<CommunityPage />} />
                <Route path="/community/:id" element={<QuestionDetailPage />} />
                <Route path="/leaderboard"   element={<LeaderboardPage />} />
                <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
