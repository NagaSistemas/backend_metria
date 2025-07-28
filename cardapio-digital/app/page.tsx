'use client'
import { useState, useEffect } from 'react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: { name: string }
}

export default function MuzzaJazzMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiHistory, setAiHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')
  const [pixData, setPixData] = useState<any>(null)
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    fetchMenu()
    createParticles()
    createMusicalNotes()
  }, [])

  const fetchMenu = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/menu')
      const data = await response.json()
      if (data.success) {
        setMenu(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar menu:', error)
    }
    setLoading(false)
  }

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id)
      if (existing) {
        return prev.map(p => p.id === item.id ? {...p, quantity: p.quantity + 1} : p)
      }
      return [...prev, {...item, quantity: 1}]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(prev => prev.map(item => 
      item.id === itemId ? {...item, quantity: newQuantity} : item
    ))
  }

  const clearCart = () => {
    setCart([])
  }

  const sendAIMessage = async () => {
    if (!aiMessage.trim()) return
    
    const userMessage = aiMessage
    setAiMessage('')
    
    // Adicionar mensagem do usuário imediatamente
    setAiHistory(prev => [...prev, { 
      message: userMessage, 
      response: '🎷 Pensando...',
      loading: true
    }])
    
    try {
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          sessionId: 'muzza-session',
          menuContext: menu 
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Atualizar última mensagem com resposta real
        setAiHistory(prev => {
          const newHistory = [...prev]
          newHistory[newHistory.length - 1] = {
            message: userMessage,
            response: data.data.response,
            recommendations: data.data.recommendations,
            preferences: data.data.preferences,
            loading: false
          }
          return newHistory
        })
      }
    } catch (error) {
      console.error('Erro no chat IA:', error)
      // Atualizar com erro
      setAiHistory(prev => {
        const newHistory = [...prev]
        newHistory[newHistory.length - 1] = {
          message: userMessage,
          response: '🎷 Desculpe, tive um problema técnico. Mas estou aqui para ajudar! Tente novamente.',
          loading: false
        }
        return newHistory
      })
    }
  }

  const finalizeOrder = async () => {
    if (cart.length === 0) return
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1 // com taxa
    
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total,
          table: 'Mesa Digital',
          customer: 'Cliente Muzza'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setCurrentOrder(data.data)
        setShowCart(false)
        setShowPayment(true)
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
    }
  }

  const processPixPayment = async () => {
    if (!currentOrder) return
    
    setPaymentLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/payments/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: currentOrder.id,
          amount: currentOrder.total,
          customerName: 'Cliente Muzza',
          customerEmail: 'cliente@muzzajazz.com'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setPixData(data.data)
      }
    } catch (error) {
      console.error('Erro PIX:', error)
    }
    setPaymentLoading(false)
  }

  const processCardPayment = async () => {
    if (!currentOrder || !cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      alert('Preencha todos os dados do cartão')
      return
    }
    
    setPaymentLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/payments/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: currentOrder.id,
          amount: currentOrder.total,
          cardData
        })
      })
      
      const data = await response.json()
      if (data.success) {
        if (data.data.status === 'approved') {
          alert('🎷 Pagamento aprovado! Sua experiência está sendo preparada.')
          setCart([])
          setShowPayment(false)
          setCurrentOrder(null)
          setCardData({ number: '', name: '', expiry: '', cvv: '' })
        } else {
          alert('❌ Pagamento recusado. Tente outro cartão.')
        }
      }
    } catch (error) {
      console.error('Erro cartão:', error)
    }
    setPaymentLoading(false)
  }

  // WebSocket para tempo real
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const socket = require('socket.io-client')('http://localhost:3001')
      
      // Pagamentos
      socket.on('paymentApproved', (data: any) => {
        if (data.orderId === currentOrder?.id) {
          alert('🎷 PIX aprovado! Sua experiência está sendo preparada.')
          setCart([])
          setShowPayment(false)
          setCurrentOrder(null)
          setPixData(null)
        }
      })
      
      // Novos itens no menu
      socket.on('menuItemAdded', (newItem: any) => {
        setMenu(prev => [...prev, newItem])
        console.log('➕ Novo item adicionado ao menu:', newItem.name)
      })
      
      // Itens atualizados
      socket.on('menuItemUpdated', (updatedItem: any) => {
        setMenu(prev => prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ))
        console.log('✏️ Item atualizado:', updatedItem.name)
      })
      
      // Atualizações gerais do menu
      socket.on('menuUpdate', (data: any) => {
        console.log('🔄 Atualização do menu:', data.type)
        // Recarregar menu se necessário
        if (data.type === 'major_update') {
          fetchMenu()
        }
      })
      
      return () => socket.disconnect()
    }
  }, [currentOrder])

  const createParticles = () => {
    const particlesContainer = document.createElement('div')
    particlesContainer.className = 'particles'
    particlesContainer.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      pointer-events: none; z-index: 1;
    `
    document.body.appendChild(particlesContainer)
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div')
      particle.style.cssText = `
        position: absolute; width: 3px; height: 3px;
        background: radial-gradient(circle, #d4af37 0%, #b8860b 100%);
        border-radius: 50%; opacity: 0.6; box-shadow: 0 0 6px #d4af37;
        left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 6 + 6}s ease-in-out infinite;
      `
      particlesContainer.appendChild(particle)
    }
  }

  const createMusicalNotes = () => {
    const notes = ['♪', '♫', '♬', '♩', '♯']
    setInterval(() => {
      if (Math.random() > 0.8) {
        const note = document.createElement('div')
        note.innerHTML = notes[Math.floor(Math.random() * notes.length)]
        note.style.cssText = `
          position: fixed; font-size: 1.5rem; color: #cd853f; opacity: 0.4;
          left: ${Math.random() * 100}%; top: 100vh; pointer-events: none; z-index: 2;
          animation: musicFloat ${Math.random() * 8 + 8}s linear forwards;
        `
        document.body.appendChild(note)
        setTimeout(() => note.remove(), 16000)
      }
    }, 3000)
  }

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
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎷</div>
          <div>Invocando a inspiração...</div>
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
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.8; }
        }
        
        @keyframes musicFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes goldGlow {
          from { text-shadow: 0 0 30px rgba(212, 175, 55, 0.5); }
          to { text-shadow: 0 0 50px rgba(212, 175, 55, 0.8), 0 0 80px rgba(255, 215, 0, 0.6); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(205, 133, 63, 0.1) 0%, transparent 50%)
          `,
          position: 'relative',
          textAlign: 'center'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '4.5rem',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 30%, #b8860b 70%, #cd853f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
              marginBottom: '1rem',
              animation: 'goldGlow 4s ease-in-out infinite alternate',
              letterSpacing: '2px'
            }}>
              MUZZA JAZZ
            </h1>
            <p style={{
              fontSize: '1.6rem',
              fontWeight: '300',
              color: '#deb887',
              marginBottom: '2rem',
              fontStyle: 'italic'
            }}>
              Invoque a Inspiração
            </p>
            <p style={{
              fontSize: '1rem',
              color: '#d4af37',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              fontWeight: '500'
            }}>
              Jazz • Floresta • Você
            </p>
          </div>
        </header>

        {/* Menu Section */}
        <section style={{
          padding: '80px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '2.8rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '3rem',
            background: 'linear-gradient(135deg, #d4af37, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Cardápio Musical
          </h2>

          {menu.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 69, 19, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎭</div>
              <h3 style={{ color: '#d4af37', marginBottom: '10px' }}>Preparando a Experiência</h3>
              <p style={{ color: '#deb887' }}>Nossos pratos estão sendo harmonizados com a essência do jazz</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2.5rem'
            }}>
              {menu.map(item => (
                <div key={item.id} style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 69, 19, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.5s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(212, 175, 55, 0.2), 0 0 20px rgba(212, 175, 55, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)'
                }}
                >
                  <div style={{
                    height: '200px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(212, 175, 55, 0.1)',
                    borderRadius: '15px',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    overflow: 'hidden'
                  }}>
                    {item.image && item.image.includes('.png') ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '10px'
                        }}
                      />
                    ) : (
                      <div style={{
                        fontSize: '4rem',
                        color: '#d4af37',
                        textShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
                      }}>
                        {item.image || '🍽️'}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '1.4rem',
                        fontWeight: '600',
                        color: '#f5f1eb',
                        margin: 0,
                        flex: 1
                      }}>
                        {item.name}
                      </h3>
                      <span style={{
                        background: 'rgba(212, 175, 55, 0.2)',
                        color: '#d4af37',
                        padding: '4px 12px',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        marginLeft: '15px',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                      }}>
                        {item.category.name}
                      </span>
                    </div>

                    <p style={{
                      color: '#deb887',
                      lineHeight: '1.7',
                      fontWeight: '300',
                      margin: '0 0 20px 0'
                    }}>
                      {item.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '1.8rem',
                      fontWeight: '700',
                      color: '#d4af37'
                    }}>
                      R$ {item.price.toFixed(2)}
                    </span>

                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%)',
                        color: '#000000',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '25px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.4s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 8px 16px rgba(212, 175, 55, 0.3)'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(212, 175, 55, 0.4)'
                        e.currentTarget.style.filter = 'brightness(1.1)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(212, 175, 55, 0.3)'
                        e.currentTarget.style.filter = 'brightness(1)'
                      }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>



        {/* Floating Buttons */}
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          zIndex: 1000
        }}>
          {/* AI Assistant Button */}
          <button
            onClick={() => setShowAI(true)}
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%)',
              color: '#000',
              border: 'none',
              padding: '18px',
              borderRadius: '50%',
              fontSize: '1.8rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(212, 175, 55, 0.6)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.4)'
            }}
          >
            🎷
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '12px',
              height: '12px',
              background: '#4CAF50',
              borderRadius: '50%',
              border: '2px solid #000',
              animation: 'pulse 2s infinite'
            }} />
          </button>

          {/* Cart Button - Sempre Visível */}
          <button
            onClick={() => setShowCart(true)}
            style={{
              background: 'linear-gradient(135deg, #cd853f 0%, #daa520 50%, #b8860b 100%)',
              color: '#000',
              border: 'none',
              padding: '18px',
              borderRadius: '50%',
              fontSize: '1.8rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(205, 133, 63, 0.4)',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(205, 133, 63, 0.6)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(205, 133, 63, 0.4)'
            }}
          >
            🛒
            {cart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#dc3545',
                color: '#fff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                border: '2px solid #000'
              }}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* AI Assistant Modal */}
        {showAI && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(26, 22, 18, 0.95) 0%, rgba(13, 10, 8, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '80vh',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{
                padding: '25px 30px',
                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{
                    fontFamily: 'Playfair Display, serif',
                    color: '#d4af37',
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    margin: 0
                  }}>
                    🎷 Charlie Jazz IA
                  </h2>
                  <p style={{
                    color: '#deb887',
                    fontSize: '0.9rem',
                    margin: '5px 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    Seu sommelier musical • Online
                  </p>
                </div>
                <button
                  onClick={() => setShowAI(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#deb887',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '5px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                padding: '25px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                {aiHistory.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#deb887'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎭</div>
                    <p style={{ fontStyle: 'italic' }}>
                      Olá! Sou Charlie, seu sommelier musical do Muzza Jazz.<br/>
                      Como posso harmonizar sua experiência gastronômica hoje?
                    </p>
                  </div>
                ) : (
                  aiHistory.map((chat, index) => (
                    <div key={index}>
                      <div style={{
                        background: 'linear-gradient(135deg, #d4af37, #ffd700)',
                        color: '#000',
                        padding: '12px 18px',
                        borderRadius: '20px 20px 5px 20px',
                        marginBottom: '10px',
                        alignSelf: 'flex-end',
                        maxWidth: '80%',
                        marginLeft: 'auto',
                        fontWeight: '500'
                      }}>
                        {chat.message}
                      </div>
                      <div style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        padding: '15px 20px',
                        borderRadius: '20px 20px 20px 5px',
                        maxWidth: '80%',
                        whiteSpace: 'pre-line',
                        lineHeight: '1.6',
                        color: '#f5f1eb'
                      }}>
                        {chat.response}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div style={{
                padding: '25px',
                borderTop: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                gap: '15px'
              }}>
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                  placeholder="Pergunte sobre nossos pratos, harmonizações..."
                  style={{
                    flex: 1,
                    padding: '15px 20px',
                    borderRadius: '25px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#f5f1eb',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={sendAIMessage}
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%)',
                    color: '#000',
                    border: 'none',
                    padding: '15px 25px',
                    borderRadius: '25px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPayment && currentOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(26, 22, 18, 0.95) 0%, rgba(13, 10, 8, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}>
              {/* Header */}
              <div style={{
                padding: '25px 30px',
                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontFamily: 'Playfair Display, serif',
                  color: '#d4af37',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  margin: 0
                }}>
                  💳 Pagamento
                </h2>
                <button
                  onClick={() => setShowPayment(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#deb887',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '5px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '30px' }}>
                {/* Resumo do Pedido */}
                <div style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '15px',
                  padding: '20px',
                  marginBottom: '25px'
                }}>
                  <h3 style={{
                    color: '#d4af37',
                    margin: '0 0 15px 0',
                    fontSize: '1.2rem'
                  }}>
                    🎵 Resumo da Experiência
                  </h3>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: '#f5f1eb'
                  }}>
                    <span>Total:</span>
                    <span style={{ color: '#d4af37' }}>R$ {currentOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Métodos de Pagamento */}
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{
                    color: '#d4af37',
                    marginBottom: '15px',
                    fontSize: '1.2rem'
                  }}>
                    Escolha o método:
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      style={{
                        flex: 1,
                        background: paymentMethod === 'pix' ? 'linear-gradient(135deg, #d4af37, #ffd700)' : 'rgba(212, 175, 55, 0.1)',
                        color: paymentMethod === 'pix' ? '#000' : '#d4af37',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        padding: '15px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      📱 PIX
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('card')}
                      style={{
                        flex: 1,
                        background: paymentMethod === 'card' ? 'linear-gradient(135deg, #d4af37, #ffd700)' : 'rgba(212, 175, 55, 0.1)',
                        color: paymentMethod === 'card' ? '#000' : '#d4af37',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        padding: '15px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      💳 Cartão
                    </button>
                  </div>
                </div>

                {/* PIX */}
                {paymentMethod === 'pix' && (
                  <div>
                    {!pixData ? (
                      <button
                        onClick={processPixPayment}
                        disabled={paymentLoading}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%)',
                          color: '#000',
                          border: 'none',
                          padding: '15px',
                          borderRadius: '25px',
                          fontWeight: '700',
                          fontSize: '1.1rem',
                          cursor: paymentLoading ? 'not-allowed' : 'pointer',
                          opacity: paymentLoading ? 0.7 : 1
                        }}
                      >
                        {paymentLoading ? 'Gerando PIX...' : '📱 Gerar PIX'}
                      </button>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          background: '#fff',
                          padding: '20px',
                          borderRadius: '15px',
                          marginBottom: '20px',
                          display: 'inline-block'
                        }}>
                          <img src={pixData.qrCode} alt="QR Code PIX" style={{ width: '200px', height: '200px' }} />
                        </div>
                        
                        <p style={{ color: '#deb887', marginBottom: '15px', fontStyle: 'italic' }}>
                          Escaneie o QR Code ou copie o código PIX
                        </p>
                        
                        <div style={{
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '10px',
                          padding: '15px',
                          marginBottom: '15px',
                          wordBreak: 'break-all',
                          fontSize: '0.8rem',
                          color: '#f5f1eb'
                        }}>
                          {pixData.pixCode}
                        </div>
                        
                        <button
                          onClick={() => navigator.clipboard.writeText(pixData.pixCode)}
                          style={{
                            background: 'rgba(212, 175, 55, 0.2)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '20px',
                            color: '#d4af37',
                            padding: '10px 20px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          📋 Copiar Código
                        </button>
                        
                        <p style={{ color: '#deb887', fontSize: '0.8rem', marginTop: '15px' }}>
                          Aguardando pagamento... (aprovação automática em 5s para demo)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Cartão */}
                {paymentMethod === 'card' && (
                  <div>
                    <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                      <input
                        type="text"
                        placeholder="Número do cartão"
                        value={cardData.number}
                        onChange={(e) => setCardData({...cardData, number: e.target.value})}
                        maxLength={19}
                        style={{
                          padding: '15px',
                          borderRadius: '10px',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          background: 'rgba(212, 175, 55, 0.1)',
                          color: '#f5f1eb',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                      
                      <input
                        type="text"
                        placeholder="Nome no cartão"
                        value={cardData.name}
                        onChange={(e) => setCardData({...cardData, name: e.target.value})}
                        style={{
                          padding: '15px',
                          borderRadius: '10px',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          background: 'rgba(212, 175, 55, 0.1)',
                          color: '#f5f1eb',
                          fontSize: '1rem',
                          outline: 'none'
                        }}
                      />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                          maxLength={5}
                          style={{
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            background: 'rgba(212, 175, 55, 0.1)',
                            color: '#f5f1eb',
                            fontSize: '1rem',
                            outline: 'none'
                          }}
                        />
                        
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                          maxLength={4}
                          style={{
                            padding: '15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            background: 'rgba(212, 175, 55, 0.1)',
                            color: '#f5f1eb',
                            fontSize: '1rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={processCardPayment}
                      disabled={paymentLoading}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%)',
                        color: '#000',
                        border: 'none',
                        padding: '15px',
                        borderRadius: '25px',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        cursor: paymentLoading ? 'not-allowed' : 'pointer',
                        opacity: paymentLoading ? 0.7 : 1
                      }}
                    >
                      {paymentLoading ? 'Processando...' : '💳 Pagar com Cartão'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(26, 22, 18, 0.95) 0%, rgba(13, 10, 8, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}>
              {/* Header */}
              <div style={{
                padding: '25px 30px',
                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontFamily: 'Playfair Display, serif',
                  color: '#d4af37',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  margin: 0
                }}>
                  🛒 Sua Experiência
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#deb887',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '5px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '30px' }}>
                {cart.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 0',
                    color: '#deb887'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎭</div>
                    <p style={{ fontStyle: 'italic' }}>
                      Sua experiência gastronômica aguarda ser composta
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div style={{ marginBottom: '25px' }}>
                      {cart.map(item => (
                        <div key={item.id} style={{
                          background: 'rgba(212, 175, 55, 0.05)',
                          border: '1px solid rgba(212, 175, 55, 0.2)',
                          borderRadius: '15px',
                          padding: '20px',
                          marginBottom: '15px',
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '15px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                marginBottom: '8px'
                              }}>
                                <div style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: 'rgba(212, 175, 55, 0.1)',
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
                                    <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: 'rgba(212, 175, 55, 0.1)',
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
                            <span style={{ fontSize: '1.2rem' }}>{item.image || '🍽️'}</span>
                          )}
                        </div>
                                  )}
                                </div>
                                <div>
                                  <h4 style={{
                                    fontFamily: 'Playfair Display, serif',
                                    color: '#f5f1eb',
                                    margin: 0,
                                    fontSize: '1.2rem',
                                    fontWeight: '600'
                                  }}>
                                    {item.name}
                                  </h4>
                                  <p style={{
                                    color: '#deb887',
                                    fontSize: '0.85rem',
                                    margin: '4px 0 0 0',
                                    opacity: 0.8
                                  }}>
                                    {item.category.name}
                                  </p>
                                </div>
                              </div>
                              <div style={{
                                color: '#d4af37',
                                fontSize: '1.1rem',
                                fontWeight: '600'
                              }}>
                                R$ {item.price.toFixed(2)} cada
                              </div>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              style={{
                                background: 'rgba(220, 53, 69, 0.2)',
                                border: '1px solid rgba(220, 53, 69, 0.3)',
                                borderRadius: '8px',
                                color: '#dc3545',
                                padding: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(220, 53, 69, 0.3)'
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(220, 53, 69, 0.2)'
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              background: 'rgba(212, 175, 55, 0.1)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              borderRadius: '25px',
                              padding: '8px 16px'
                            }}>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#d4af37',
                                  fontSize: '1.2rem',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: '50%',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = 'none'
                                }}
                              >
                                −
                              </button>
                              
                              <span style={{
                                color: '#f5f1eb',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                minWidth: '30px',
                                textAlign: 'center'
                              }}>
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#d4af37',
                                  fontSize: '1.2rem',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: '50%',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.background = 'none'
                                }}
                              >
                                +
                              </button>
                            </div>
                            
                            {/* Item Total */}
                            <div style={{
                              color: '#d4af37',
                              fontWeight: '700',
                              fontSize: '1.3rem'
                            }}>
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Clear Cart Button */}
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                      <button
                        onClick={clearCart}
                        style={{
                          background: 'rgba(220, 53, 69, 0.1)',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          borderRadius: '20px',
                          color: '#dc3545',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(220, 53, 69, 0.2)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)'
                        }}
                      >
                        🗑️ Limpar Carrinho
                      </button>
                    </div>

                    {/* Order Summary */}
                    <div style={{
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '15px',
                      padding: '20px',
                      marginBottom: '25px'
                    }}>
                      <h3 style={{
                        fontFamily: 'Playfair Display, serif',
                        color: '#d4af37',
                        margin: '0 0 15px 0',
                        fontSize: '1.3rem'
                      }}>
                        🎵 Resumo da Experiência
                      </h3>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        color: '#deb887'
                      }}>
                        <span>Itens ({cart.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                        <span>R$ {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '15px',
                        color: '#deb887',
                        fontSize: '0.9rem'
                      }}>
                        <span>Taxa de serviço (10%):</span>
                        <span>R$ {(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.1).toFixed(2)}</span>
                      </div>
                      
                      <div style={{
                        borderTop: '2px solid rgba(212, 175, 55, 0.3)',
                        paddingTop: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#f5f1eb'
                      }}>
                        <span>Total:</span>
                        <span style={{ color: '#d4af37' }}>
                          R$ {(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.1).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={finalizeOrder}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b8860b 100%)',
                        color: '#000',
                        border: 'none',
                        padding: '18px',
                        borderRadius: '30px',
                        fontWeight: '700',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        marginTop: '30px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        boxShadow: '0 10px 20px rgba(212, 175, 55, 0.3)',
                        transition: 'all 0.4s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(212, 175, 55, 0.4)'
                        e.currentTarget.style.filter = 'brightness(1.1)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(212, 175, 55, 0.3)'
                        e.currentTarget.style.filter = 'brightness(1)'
                      }}
                    >
                      🎷 Finalizar Experiência
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}


      </div>
    </>
  )
}