'use client'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register'
  onToggleMode: () => void
}

export default function LoginModal({ isOpen, onClose, mode, onToggleMode }: LoginModalProps) {
  const { login, register } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'kitchen'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
      } else {
        await register(formData.email, formData.password, formData.name, formData.role)
      }
      onClose()
      setFormData({ email: '', password: '', name: '', role: 'client' })
    } catch (error: any) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.95) 0%, rgba(13, 10, 8, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '90%',
        border: '1px solid rgba(139, 21, 56, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎷</div>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            color: '#8B1538',
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: 0
          }}>
            {mode === 'login' ? 'Entrar no Muzzajazz' : 'Criar Conta'}
          </h2>
          <p style={{ color: '#deb887', margin: '10px 0 0 0', fontStyle: 'italic' }}>
            {mode === 'login' ? 'Acesse sua conta' : 'Junte-se à experiência'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                Nome:
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
              Email:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid rgba(139, 21, 56, 0.3)',
                background: 'rgba(139, 21, 56, 0.1)',
                color: '#f5f1eb',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
              Senha:
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid rgba(139, 21, 56, 0.3)',
                background: 'rgba(139, 21, 56, 0.1)',
                color: '#f5f1eb',
                outline: 'none'
              }}
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                Tipo de Conta:
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              >
                <option value="kitchen" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>🍳 Cozinha</option>
                <option value="admin" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>⚙️ Administrador</option>
              </select>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(244, 67, 54, 0.2)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              color: '#f44336',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #8B1538, #A91D47)',
              color: '#fff',
              border: 'none',
              padding: '15px',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '20px'
            }}
          >
            {loading ? '⏳ Processando...' : mode === 'login' ? '🎷 Entrar' : '✨ Criar Conta'}
          </button>
        </form>

        {/* Toggle Mode */}
        {mode !== 'login' || onToggleMode.toString() !== '() => {}' ? (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={onToggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#d4af37',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9rem'
              }}
            >
              {mode === 'login' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
            </button>
          </div>
        ) : null}

        {/* Close */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: '#666',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}