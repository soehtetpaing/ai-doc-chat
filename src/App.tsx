import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./shared/libs/query-client"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { LoginPage } from "./features/auth/login"
import { RegisterPage } from "./features/auth/register"
import { ProtectedRoute } from "./core/auth/auth.route"
import { DashboardPage } from "./core/dashboard"


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
