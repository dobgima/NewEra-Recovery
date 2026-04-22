import { useEffect, useState } from 'react'
import { LandingPage } from './components/landing/LandingPage'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './components/auth/ResetPasswordPage'
import { TwoFactorVerifyPage } from './components/auth/TwoFactorVerifyPage'
import { AppShell } from './components/layout/AppShell'
import { useAuth } from './hooks/useAuth'
import { useAppData } from './hooks/useAppData'
import { useToast } from './hooks/useToast'
import { ToastMessage } from './components/ui/ToastMessage'
import type { Screen } from './types/screen'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [resetToken, setResetToken] = useState('')
  const [twoFactorToken, setTwoFactorToken] = useState('')
  const { auth, login, register, logout, loadingAuth, forgotPassword, resetPassword, verifyTwoFactorLogin } = useAuth()
  const { data, loading: loadingData } = useAppData(auth?.accessToken)
  const { toast, setToast, clearToast } = useToast()

  useEffect(() => {
    if (auth) {
      setScreen('dashboard')
    }
  }, [auth])

  const handleLogin = async (payload: { email: string; password: string }) => {
    try {
      const response = await login(payload)
      if (response?.requiresTwoFactor && response?.twoFactorToken) {
        setTwoFactorToken(response.twoFactorToken)
        setScreen('2fa-verify')
        setToast({ type: 'info', message: 'Enter the verification code we sent you.' })
      } else {
        setToast({ type: 'success', message: 'Welcome back — your recovery space is ready.' })
      }
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to sign in.' })
    }
  }

  const handleRegister = async (payload: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      await register(payload)
      setToast({ type: 'success', message: 'Account created. Let’s start your recovery journey.' })
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to register.' })
    }
  }
  const handleForgotPassword = async (email: string) => {
    try {
      await forgotPassword(email)
      setToast({ type: 'success', message: 'Password reset instructions have been sent to your email.' })
      setScreen('login')
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to process request.' })
    }
  }

  const handleResetPassword = async (token: string, password: string) => {
    try {
      await resetPassword(token, password)
      setToast({ type: 'success', message: 'Your password has been reset. Please sign in.' })
      setResetToken('')
      setScreen('login')
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to reset password.' })
    }
  }

  const handleTwoFactorVerify = async (token: string, code: string) => {
    try {
      await verifyTwoFactorLogin(token, code)
      setTwoFactorToken('')
      setToast({ type: 'success', message: 'Welcome back — your recovery space is ready.' })
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Invalid code or expired session.' })
    }
  }
  if (!auth) {
    if (screen === 'forgot-password') {
      return (
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <ForgotPasswordPage
            onSubmit={(payload) => handleForgotPassword(payload.email)}
            onBack={() => setScreen('login')}
            loading={loadingAuth}
          />
          <ToastMessage toast={toast} onClose={clearToast} />
        </div>
      )
    }

    if (screen === 'reset-password') {
      return (
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <ResetPasswordPage
            token={resetToken}
            onSubmit={(payload) => handleResetPassword(payload.token, payload.password)}
            onBack={() => setScreen('login')}
            loading={loadingAuth}
          />
          <ToastMessage toast={toast} onClose={clearToast} />
        </div>
      )
    }

    if (screen === '2fa-verify') {
      return (
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <TwoFactorVerifyPage
            twoFactorToken={twoFactorToken}
            method="email"
            onSubmit={(payload) => handleTwoFactorVerify(payload.token, payload.code)}
            onBack={() => {
              setScreen('login')
              setTwoFactorToken('')
            }}
            loading={loadingAuth}
          />
          <ToastMessage toast={toast} onClose={clearToast} />
        </div>
      )
    }

    if (screen === 'login') {
      return (
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <LoginPage
            onSubmit={handleLogin}
            onSwitch={() => setScreen('register')}
            onForgotPassword={() => setScreen('forgot-password')}
            onBack={() => setScreen('landing')}
            loading={loadingAuth}
          />
          <ToastMessage toast={toast} onClose={clearToast} />
        </div>
      )
    }

    if (screen === 'register') {
      return (
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <RegisterPage
            onSubmit={handleRegister}
            onSwitch={() => setScreen('login')}
            onBack={() => setScreen('landing')}
            loading={loadingAuth}
          />
          <ToastMessage toast={toast} onClose={clearToast} />
        </div>
      )
    }

    return (
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <LandingPage onLogin={() => setScreen('login')} onRegister={() => setScreen('register')} />
        <ToastMessage toast={toast} onClose={clearToast} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppShell
        auth={auth}
        current={screen}
        onNavigate={setScreen}
        onLogout={() => {
          logout()
          setScreen('landing')
          setToast({ type: 'info', message: 'You have been signed out.' })
        }}
        loadingData={loadingData}
        data={data}
      />
      <ToastMessage toast={toast} onClose={clearToast} />
    </div>
  )
}
