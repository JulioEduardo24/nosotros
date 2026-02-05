'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser, loginUser } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result

      if (isSignUp) {
        result = await registerUser(email, password)
      } else {
        result = await loginUser(email, password)
      }

      if (!result.success) {
        setError(result.error)
        return
      }

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(result.user))

      // Ir al dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-purple-700 mb-2">
            Nosotros
          </h1>
          <p className="text-gray-600"></p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-500 transition"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:outline-none focus:border-purple-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-purple-600 hover:text-purple-700 font-medium transition"
            >
              {isSignUp
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Registrarse'}
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-purple-400">Hecho con 💜 para nosotros</p>
        </div>
      </div>
    </div>
  )
}