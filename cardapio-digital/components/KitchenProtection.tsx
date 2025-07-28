'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'

interface KitchenProtectionProps {
  children: React.ReactNode
}

export default function KitchenProtection({ children }: KitchenProtectionProps) {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true)
    }
  }, [user, loading])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1a1612 0%, #0d0a08 70%, #000000 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#f5f1eb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🍳</div>
          <div>Verificando acesso...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1a1612 0%, #0d0a08 70%, #000000 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#f5f1eb'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔐</div>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            color: '#cd853f',
            fontSize: '2rem',
            marginBottom: '15px'
          }}>
            Acesso da Cozinha
          </h2>
          <p style={{ color: '#deb887', marginBottom: '30px', fontStyle: 'italic' }}>
            Esta área é para a equipe da cozinha do Muzzajazz
          </p>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              background: 'linear-gradient(135deg, #cd853f, #daa520)',
              color: '#000',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔑 Fazer Login
          </button>
        </div>

        <LoginModal 
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          mode="login"
          onToggleMode={() => {}}
        />
      </div>
    )
  }

  if (user.role !== 'kitchen' && user.role !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #1a1612 0%, #0d0a08 70%, #000000 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#f5f1eb'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⛔</div>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            color: '#f44336',
            fontSize: '2rem',
            marginBottom: '15px'
          }}>
            Acesso Negado
          </h2>
          <p style={{ color: '#deb887', marginBottom: '30px', fontStyle: 'italic' }}>
            Você não tem permissão para acessar a cozinha
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'linear-gradient(135deg, #d4af37, #ffd700)',
              color: '#000',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🏠 Voltar ao Cardápio
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}