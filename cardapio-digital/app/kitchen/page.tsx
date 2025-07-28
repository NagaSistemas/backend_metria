'use client'
import { useState, useEffect } from 'react'
import { AuthProvider } from '../../context/AuthContext'
import KitchenProtection from '../../components/KitchenProtection'
import { useAuth } from '../../context/AuthContext'

function KitchenContent() {
  const { user, logout } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [stats, setStats] = useState({ pending: 0, preparing: 0, ready: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    createParticles()
    
    // Socket para tempo real
    if (typeof window !== 'undefined') {
      const socket = require('socket.io-client')('http://localhost:3001')
      
      // Novos pedidos
      socket.on('newOrder', (order: any) => {
        setOrders(prev => [order, ...prev])
        playNotificationSound()
        console.log('🆕 Novo pedido recebido na cozinha:', order.id.slice(-4))
      })
      
      // Atualizações de status
      socket.on('orderStatusUpdate', (data: any) => {
        setOrders(prev => prev.map(order => 
          order.id === data.orderId ? { ...order, status: data.status } : order
        ))
        console.log(`🔄 Status atualizado: ${data.orderId.slice(-4)} -> ${data.status}`)
      })
      
      // Atualizações específicas da cozinha
      socket.on('kitchenUpdate', (data: any) => {
        if (data.type === 'status_changed') {
          playActionSound()
        }
        console.log('🍳 Atualização cozinha:', data.type)
      })
      
      return () => socket.disconnect()
    }
  }, [])

  useEffect(() => {
    updateStats()
  }, [orders])

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orders')
      const data = await response.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    }
    setLoading(false)
  }

  const updateStats = () => {
    const pending = orders.filter(o => o.status === 'PENDING').length
    const preparing = orders.filter(o => o.status === 'PREPARING').length
    const ready = orders.filter(o => o.status === 'READY').length
    setStats({ pending, preparing, ready })
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ))
        playActionSound()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      audio.play()
    } catch (e) {}
  }

  const playActionSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      audio.play()
    } catch (e) {}
  }

  const createParticles = () => {
    const particlesContainer = document.createElement('div')
    particlesContainer.className = 'particles'
    particlesContainer.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      pointer-events: none; z-index: 1;
    `
    document.body.appendChild(particlesContainer)
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div')
      particle.style.cssText = `
        position: absolute; width: 3px; height: 3px;
        background: radial-gradient(circle, #cd853f 0%, #b8860b 100%);
        border-radius: 50%; opacity: 0.4; box-shadow: 0 0 6px #cd853f;
        left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 6 + 6}s ease-in-out infinite;
      `
      particlesContainer.appendChild(particle)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FF6B35'
      case 'PREPARING': return '#cd853f'
      case 'READY': return '#d4af37'
      case 'DELIVERED': return '#4CAF50'
      default: return '#FF6B35'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳ Aguardando'
      case 'PREPARING': return '🍳 Preparando'
      case 'READY': return '✅ Pronto'
      case 'DELIVERED': return '🚚 Entregue'
      default: return '⏳ Aguardando'
    }
  }

  const getPriorityLevel = (order: any) => {
    const createdTime = new Date(order.createdAt).getTime()
    const now = new Date().getTime()
    const minutesAgo = (now - createdTime) / (1000 * 60)
    
    if (minutesAgo > 30) return 'high'
    if (minutesAgo > 15) return 'medium'
    return 'normal'
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif',
        background: 'radial-gradient(ellipse at center, #1a1612 0%, #0d0a08 70%, #000000 100%)',
        color: '#f5f1eb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🍳</div>
          <div>Carregando cozinha...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Montserrat:wght@300;400;500;600&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
        }
        
        @keyframes goldGlow {
          from { text-shadow: 0 0 20px rgba(205, 133, 63, 0.5); }
          to { text-shadow: 0 0 40px rgba(205, 133, 63, 0.8), 0 0 60px rgba(212, 175, 55, 0.6); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif',
        background: 'radial-gradient(ellipse at center, #1a1612 0%, #0d0a08 70%, #000000 100%)',
        color: '#f5f1eb',
        overflowX: 'hidden'
      }}>
        {/* Header */}
        <header style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: `
            radial-gradient(circle at 30% 20%, rgba(205, 133, 63, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(184, 134, 11, 0.1) 0%, transparent 50%)
          `,
          borderBottom: '1px solid rgba(205, 133, 63, 0.3)',
          position: 'relative'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '3.5rem',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #cd853f 0%, #daa520 30%, #b8860b 70%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 20px rgba(205, 133, 63, 0.5)',
              marginBottom: '1rem',
              animation: 'goldGlow 4s ease-in-out infinite alternate',
              letterSpacing: '2px'
            }}>
              🍳 COZINHA MUZZA
            </h1>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: '300',
              color: '#deb887',
              fontStyle: 'italic'
            }}>
              Onde a Magia Gastronômica Acontece
            </p>
            {user && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                marginTop: '20px'
              }}>
                <div style={{
                  background: 'rgba(205, 133, 63, 0.2)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  color: '#cd853f'
                }}>
                  👤 {user.name} • {user.role}
                </div>
                <button
                  onClick={logout}
                  style={{
                    background: 'rgba(244, 67, 54, 0.2)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: '20px',
                    color: '#f44336',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Stats Dashboard */}
        <section style={{
          padding: '40px 20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '25px',
            marginBottom: '40px'
          }}>
            {[
              { label: 'Aguardando', value: stats.pending, color: '#FF6B35', icon: '⏳' },
              { label: 'Preparando', value: stats.preparing, color: '#cd853f', icon: '🍳' },
              { label: 'Prontos', value: stats.ready, color: '#d4af37', icon: '✅' },
              { label: 'Total Hoje', value: orders.length, color: '#4CAF50', icon: '📊' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'linear-gradient(135deg, rgba(205, 133, 63, 0.1) 0%, rgba(139, 69, 19, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%)',
                border: `1px solid ${stat.color}40`,
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'
                e.currentTarget.style.boxShadow = `0 10px 20px ${stat.color}30`
                e.currentTarget.style.borderColor = `${stat.color}80`
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = `${stat.color}40`
              }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{stat.icon}</div>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold', 
                  color: stat.color, 
                  marginBottom: '10px',
                  textShadow: `0 0 10px ${stat.color}50`
                }}>
                  {stat.value}
                </div>
                <div style={{ opacity: 0.8, fontSize: '1rem', fontWeight: '500' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Orders Grid */}
        <main style={{ 
          padding: '0 20px 40px', 
          maxWidth: '1400px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          {orders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'linear-gradient(135deg, rgba(205, 133, 63, 0.1) 0%, rgba(139, 69, 19, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%)',
              border: '1px solid rgba(205, 133, 63, 0.3)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎷</div>
              <h2 style={{ 
                color: '#cd853f', 
                marginBottom: '10px',
                fontFamily: 'Playfair Display, serif',
                fontSize: '2rem'
              }}>
                Aguardando Pedidos
              </h2>
              <p style={{ color: '#deb887', fontStyle: 'italic' }}>
                A cozinha está pronta para criar experiências gastronômicas únicas
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '25px'
            }}>
              {orders
                .filter(order => order.status !== 'DELIVERED')
                .sort((a, b) => {
                  const statusPriority = { 'PENDING': 3, 'PREPARING': 2, 'READY': 1 }
                  if (statusPriority[a.status] !== statusPriority[b.status]) {
                    return statusPriority[b.status] - statusPriority[a.status]
                  }
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                })
                .map(order => {
                  const priority = getPriorityLevel(order)
                  const statusColor = getStatusColor(order.status)
                  
                  return (
                    <div key={order.id} style={{
                      background: 'linear-gradient(135deg, rgba(205, 133, 63, 0.1) 0%, rgba(139, 69, 19, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%)',
                      border: `2px solid ${statusColor}60`,
                      borderRadius: '20px',
                      padding: '25px',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      boxShadow: priority === 'high' ? `0 0 20px ${statusColor}40` : 'none'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = `0 8px 25px ${statusColor}40`
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = priority === 'high' ? `0 0 20px ${statusColor}40` : 'none'
                    }}
                    >
                      {/* Priority Indicator */}
                      {priority !== 'normal' && (
                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          backgroundColor: priority === 'high' ? '#FF4757' : '#FFA502',
                          color: '#fff',
                          padding: '5px 10px',
                          borderRadius: '15px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          animation: priority === 'high' ? 'pulse 1s infinite' : 'none'
                        }}>
                          {priority === 'high' ? '🚨 URGENTE' : '⚠️ ATENÇÃO'}
                        </div>
                      )}

                      {/* Status Badge */}
                      <div style={{
                        background: `linear-gradient(135deg, ${statusColor}, ${statusColor}CC)`,
                        color: '#fff',
                        padding: '12px 20px',
                        borderRadius: '25px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        textAlign: 'center',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}>
                        {getStatusText(order.status)}
                      </div>

                      {/* Order Info */}
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                          fontFamily: 'Playfair Display, serif',
                          color: '#cd853f',
                          margin: '0 0 10px 0',
                          fontSize: '1.4rem',
                          fontWeight: '700'
                        }}>
                          Pedido #{order.id.slice(-4)}
                        </h3>
                        <div style={{ 
                          display: 'flex', 
                          gap: '20px', 
                          fontSize: '0.9rem', 
                          color: '#deb887',
                          marginBottom: '10px',
                          flexWrap: 'wrap'
                        }}>
                          <span>🍽️ {order.table || 'Balcão'}</span>
                          <span>👤 {order.customer || 'Cliente'}</span>
                          <span>💰 R$ {order.total.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, color: '#deb887' }}>
                          📅 {new Date(order.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ 
                          color: '#cd853f', 
                          marginBottom: '15px', 
                          fontSize: '1.1rem',
                          fontWeight: '600'
                        }}>
                          🎵 Composição do Pedido:
                        </h4>
                        {order.items.map((item: any, index: number) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '15px',
                            background: 'rgba(205, 133, 63, 0.1)',
                            border: '1px solid rgba(205, 133, 63, 0.3)',
                            borderRadius: '15px',
                            marginBottom: '10px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(205, 133, 63, 0.2)'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(205, 133, 63, 0.1)'
                          }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: 'bold', 
                                fontSize: '1rem', 
                                marginBottom: '5px',
                                color: '#f5f1eb'
                              }}>
                                {item.menuItem.image && item.menuItem.image.includes('.png') ? (
                                  <img 
                                    src={item.menuItem.image} 
                                    alt={item.menuItem.name}
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '50%',
                                      marginRight: '10px',
                                      verticalAlign: 'middle'
                                    }}
                                  />
                                ) : (
                                  <span style={{ marginRight: '10px' }}>🍕</span>
                                )}
                                {item.menuItem.name}
                              </div>
                              <div style={{ fontSize: '0.8rem', opacity: 0.8, color: '#deb887' }}>
                                {item.menuItem.description}
                              </div>
                            </div>
                            <div style={{
                              background: 'linear-gradient(135deg, #cd853f, #d4af37)',
                              color: '#000',
                              padding: '8px 15px',
                              borderRadius: '20px',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              textShadow: 'none'
                            }}>
                              {item.quantity}x
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #cd853f, #daa520)',
                              color: '#000',
                              border: 'none',
                              padding: '15px',
                              borderRadius: '25px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              transition: 'all 0.3s ease',
                              textShadow: 'none'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 8px 16px rgba(205, 133, 63, 0.4)'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          >
                            🍳 Iniciar Preparo
                          </button>
                        )}
                        
                        {order.status === 'PREPARING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #d4af37, #ffd700)',
                              color: '#000',
                              border: 'none',
                              padding: '15px',
                              borderRadius: '25px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              transition: 'all 0.3s ease',
                              textShadow: 'none'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 8px 16px rgba(212, 175, 55, 0.4)'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          >
                            ✅ Marcar Pronto
                          </button>
                        )}
                        
                        {order.status === 'READY' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            style={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                              color: '#fff',
                              border: 'none',
                              padding: '15px',
                              borderRadius: '25px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.boxShadow = '0 8px 16px rgba(76, 175, 80, 0.4)'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)'
                              e.currentTarget.style.boxShadow = 'none'
                            }}
                          >
                            🚚 Entregar
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default function MuzzaKitchen() {
  return (
    <AuthProvider>
      <KitchenProtection>
        <KitchenContent />
      </KitchenProtection>
    </AuthProvider>
  )
}