'use client'
import { useState, useEffect } from 'react'
import { AuthProvider } from '../../context/AuthContext'
import AdminProtection from '../../components/AdminProtection'
import CharlieTrainingAdvanced from '../../components/CharlieTrainingAdvanced'
import MenuManagement from '../../components/MenuManagement'
import ReportsAdvanced from '../../components/ReportsAdvanced'
import TablesManagement from '../../components/TablesManagement'
import EmployeeManagement from '../../components/EmployeeManagement'
import { useAuth } from '../../context/AuthContext'

function AdminContent() {
  const { user, logout } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [menu, setMenu] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'charlie' | 'reports' | 'employees'>('menu')
  const [loading, setLoading] = useState(true)
  const [ordersData, setOrdersData] = useState<any>(null)
  const [trainingData, setTrainingData] = useState<any>(null)

  useEffect(() => {
    loadData()
    createParticles()
    
    // WebSocket para tempo real
    if (typeof window !== 'undefined') {
      const socket = require('socket.io-client')('http://localhost:3001')
      
      // Novos pedidos
      socket.on('newOrder', (order: any) => {
        console.log('🆕 Novo pedido no admin:', order.id.slice(-4))
        // Recarregar analytics
        loadData()
      })
      
      // Atualizações de pedidos
      socket.on('orderUpdate', (order: any) => {
        console.log('🔄 Pedido atualizado no admin:', order.id.slice(-4))
        loadData()
      })
      
      // Atualizações gerais do admin
      socket.on('adminUpdate', (data: any) => {
        console.log('⚙️ Admin update:', data.type)
        
        if (data.type === 'menu_item_added') {
          setMenu(prev => [...prev, data.data])
        } else if (data.type === 'menu_item_updated') {
          setMenu(prev => prev.map(item => 
            item.id === data.data.id ? data.data : item
          ))
        } else if (data.type === 'order_status_changed') {
          // Recarregar dados para atualizar estatísticas
          loadData()
        }
      })
      
      return () => socket.disconnect()
    }
  }, [])

  const loadData = async () => {
    try {
      const [analyticsRes, menuRes, categoriesRes, ordersRes, trainingRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/analytics'),
        fetch('http://localhost:3001/api/menu'),
        fetch('http://localhost:3001/api/admin/categories'),
        fetch('http://localhost:3001/api/admin/orders'),
        fetch('http://localhost:3001/api/admin/charlie/training')
      ])

      const analyticsData = await analyticsRes.json()
      const menuData = await menuRes.json()
      const categoriesData = await categoriesRes.json()
      const ordersDataRes = await ordersRes.json()
      const trainingDataRes = await trainingRes.json()

      if (analyticsData.success) setAnalytics(analyticsData.data)
      if (menuData.success) setMenu(menuData.data)
      if (categoriesData.success) setCategories(categoriesData.data)
      if (ordersDataRes.success) setOrdersData(ordersDataRes.data)
      if (trainingDataRes.success) setTrainingData(trainingDataRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setLoading(false)
  }

  const toggleMenuItem = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active })
      })

      if (response.ok) {
        setMenu(prev => prev.map(item => 
          item.id === id ? { ...item, active: !active } : item
        ))
        console.log(`✏️ Item ${!active ? 'ativado' : 'desativado'}:`, id)
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
    }
  }

  const createParticles = () => {
    const particlesContainer = document.createElement('div')
    particlesContainer.className = 'particles'
    particlesContainer.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      pointer-events: none; z-index: 1;
    `
    document.body.appendChild(particlesContainer)
    
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div')
      particle.style.cssText = `
        position: absolute; width: 3px; height: 3px;
        background: radial-gradient(circle, #8B1538 0%, #641E16 100%);
        border-radius: 50%; opacity: 0.5; box-shadow: 0 0 6px #8B1538;
        left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 6 + 6}s ease-in-out infinite;
      `
      particlesContainer.appendChild(particle)
    }
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
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚙️</div>
          <div>Carregando painel administrativo...</div>
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
          50% { transform: translateY(-25px) rotate(180deg); opacity: 0.7; }
        }
        
        @keyframes goldGlow {
          from { text-shadow: 0 0 20px rgba(139, 21, 56, 0.5); }
          to { text-shadow: 0 0 40px rgba(139, 21, 56, 0.8), 0 0 60px rgba(212, 175, 55, 0.6); }
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
            radial-gradient(circle at 30% 20%, rgba(139, 21, 56, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)
          `,
          borderBottom: '1px solid rgba(139, 21, 56, 0.3)',
          position: 'relative'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '3.5rem',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #8B1538 0%, #A91D47 30%, #641E16 70%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 20px rgba(139, 21, 56, 0.5)',
              marginBottom: '1rem',
              animation: 'goldGlow 4s ease-in-out infinite alternate',
              letterSpacing: '2px'
            }}>
              ⚙️ ADMIN MUZZA
            </h1>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: '300',
              color: '#deb887',
              fontStyle: 'italic'
            }}>
              Maestria na Gestão da Experiência
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
                  background: 'rgba(212, 175, 55, 0.2)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  color: '#d4af37'
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

        {/* Navigation Tabs */}
        <nav style={{
          background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
          borderBottom: '1px solid rgba(139, 21, 56, 0.3)',
          padding: '0 20px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            overflowX: 'auto'
          }}>
            {[

              { id: 'menu', label: '🍕 Repertório', icon: '🍕' },
              { id: 'tables', label: '🪑 Mesas', icon: '🪑' },
              { id: 'employees', label: '👥 Funcionários', icon: '👥' },
              { id: 'charlie', label: '🎷 Charlie IA', icon: '🎷' },
              { id: 'reports', label: '📊 Partituras', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: '1',
                  minWidth: '150px',
                  padding: '20px',
                  background: activeTab === tab.id ? 
                    'linear-gradient(135deg, #8B1538, #A91D47)' : 
                    'transparent',
                  color: activeTab === tab.id ? '#f5f1eb' : '#deb887',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #d4af37' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Montserrat, sans-serif'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'rgba(139, 21, 56, 0.2)'
                    e.currentTarget.style.color = '#f5f1eb'
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#deb887'
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main style={{
          padding: '40px 20px',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>


          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div>
              <MenuManagement />
            </div>
          )}

          {/* Menu Tab Old */}
          {false && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <h2 style={{ 
                  fontFamily: 'Playfair Display, serif',
                  color: '#8B1538', 
                  fontSize: '2.2rem',
                  fontWeight: '700'
                }}>
                  🍕 Repertório Musical ({menu.length} composições)
                </h2>
                <button style={{
                  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}>
                  ➕ Nova Criação
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '25px'
              }}>
                {menu.map(item => (
                  <div key={item.id} style={{
                    background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                    border: `2px solid ${item.active ? '#4CAF50' : '#666'}60`,
                    borderRadius: '20px',
                    padding: '25px',
                    backdropFilter: 'blur(10px)',
                    opacity: item.active ? 1 : 0.6,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = `0 8px 20px ${item.active ? '#4CAF50' : '#666'}30`
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        background: 'rgba(139, 21, 56, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.image && item.image.includes('.png') ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '2rem' }}>🍕</span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleMenuItem(item.id, item.active)}
                        style={{
                          background: item.active ? 
                            'linear-gradient(135deg, #4CAF50, #45a049)' : 
                            'linear-gradient(135deg, #666, #555)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '15px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {item.active ? '✅ Ativo' : '❌ Inativo'}
                      </button>
                    </div>

                    <h3 style={{ 
                      fontFamily: 'Playfair Display, serif',
                      color: '#8B1538', 
                      marginBottom: '10px', 
                      fontSize: '1.3rem',
                      fontWeight: '600'
                    }}>
                      {item.name}
                    </h3>
                    
                    <p style={{ 
                      opacity: 0.8, 
                      marginBottom: '15px', 
                      fontSize: '0.9rem', 
                      lineHeight: '1.4',
                      color: '#deb887'
                    }}>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ 
                        color: '#d4af37', 
                        fontWeight: 'bold', 
                        fontSize: '1.4rem',
                        textShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
                      }}>
                        R$ {item.price.toFixed(2)}
                      </span>
                      <span style={{
                        background: 'rgba(139, 21, 56, 0.2)',
                        color: '#8B1538',
                        padding: '5px 10px',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {item.category.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        ✏️ Editar
                      </button>
                      <button style={{
                        background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Tabs Placeholder */}
          {/* Charlie Training Tab */}
          {activeTab === 'charlie' && (
            <div>
              <CharlieTrainingAdvanced />
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <ReportsAdvanced />
            </div>
          )}

          {/* Tables Tab */}
          {activeTab === 'tables' && (
            <div>
              <TablesManagement />
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div>
              <EmployeeManagement />
            </div>
          )}

          {/* Other Tabs Placeholder */}
          {false && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
              border: '1px solid rgba(139, 21, 56, 0.3)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
                {activeTab === 'orders' ? '📋' : '📊'}
              </div>
              <h2 style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#8B1538', 
                marginBottom: '10px',
                fontSize: '2rem'
              }}>
                {activeTab === 'orders' ? 'Apresentações' : 'Partituras'}
              </h2>
              <p style={{ color: '#deb887', fontStyle: 'italic' }}>
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default function MuzzaAdmin() {
  return (
    <AuthProvider>
      <AdminProtection>
        <AdminContent />
      </AdminProtection>
    </AuthProvider>
  )
}