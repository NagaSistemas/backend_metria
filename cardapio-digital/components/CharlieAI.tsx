'use client'
import { useState, useEffect, useRef } from 'react'

interface CharlieAIProps {
  isOpen: boolean
  onClose: () => void
  menuItems: any[]
  onAddToCart: (item: any) => void
}

export default function CharlieAI({ isOpen, onClose, menuItems, onAddToCart }: CharlieAIProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addWelcomeMessage()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addWelcomeMessage = () => {
    const welcomeMsg = {
      type: 'ai',
      content: `🎷 Olá! Sou o Charlie, seu sommelier musical do Muzzajazz!

Como um verdadeiro conhecedor de jazz e gastronomia, estou aqui para criar a harmonia perfeita entre seus gostos e nossos pratos artesanais.

💡 Posso ajudar com:
• Recomendações personalizadas
• Sugestões baseadas no horário
• Harmonização de sabores
• Informações nutricionais

O que você gostaria de saborear hoje? 🎵`,
      timestamp: new Date()
    }
    setMessages([welcomeMsg])
    generateSmartRecommendations()
  }

  const generateSmartRecommendations = () => {
    const currentHour = new Date().getHours()
    let recs = []

    if (currentHour >= 18 && currentHour < 20) {
      // Início da noite - entradas
      recs = menuItems.filter(item => 
        item.name.toLowerCase().includes('entrada') || 
        item.category.name.toLowerCase().includes('entrada')
      ).slice(0, 2)
    } else if (currentHour >= 20 && currentHour < 22) {
      // Horário nobre - pratos principais
      recs = menuItems.filter(item => 
        item.name.toLowerCase().includes('pizza') ||
        item.category.name.toLowerCase().includes('pizza')
      ).slice(0, 2)
    } else {
      // Geral - mais populares
      recs = menuItems.slice(0, 2)
    }

    setRecommendations(recs)
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: 'user-session',
          menuContext: menuItems,
          currentHour: new Date().getHours()
        })
      })

      const data = await response.json()
      
      setTimeout(() => {
        const aiMessage = {
          type: 'ai',
          content: data.success ? data.data.response : '🎷 Desculpe, houve um problema. Vamos tentar novamente?',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
        
        // Gerar novas recomendações baseadas na conversa
        if (inputMessage.toLowerCase().includes('pizza') || inputMessage.toLowerCase().includes('recomend')) {
          generateContextualRecommendations(inputMessage)
        }
      }, 1500)

    } catch (error) {
      setIsTyping(false)
      const errorMessage = {
        type: 'ai',
        content: '🎷 Ops! Parece que houve uma dissonância na comunicação. Vamos tentar de novo? 🎵',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const generateContextualRecommendations = (userInput: string) => {
    let contextRecs = []

    if (userInput.toLowerCase().includes('vegetarian') || userInput.toLowerCase().includes('vegano')) {
      contextRecs = menuItems.filter(item => 
        !item.description.toLowerCase().includes('bacon') &&
        !item.description.toLowerCase().includes('carne')
      ).slice(0, 2)
    } else if (userInput.toLowerCase().includes('picante') || userInput.toLowerCase().includes('spicy')) {
      contextRecs = menuItems.filter(item => 
        item.description.toLowerCase().includes('pimenta') ||
        item.description.toLowerCase().includes('picante')
      ).slice(0, 2)
    } else {
      contextRecs = menuItems.slice(0, 2)
    }

    setRecommendations(contextRecs)
  }

  const quickActions = [
    { text: "Recomende algo especial", icon: "⭐" },
    { text: "O que combina com vinho?", icon: "🍷" },
    { text: "Opções vegetarianas", icon: "🥗" },
    { text: "Pratos para compartilhar", icon: "👥" }
  ]

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.95)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '25px',
        width: '100%',
        maxWidth: '800px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid #D4AF37',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#000'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '2.5rem' }}>🤖</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                Charlie IA
              </h2>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                Sommelier Musical • Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: '#000'
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {messages.map((message, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '15px 20px',
                borderRadius: message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                backgroundColor: message.type === 'user' ? '#D4AF37' : '#333',
                color: message.type === 'user' ? '#000' : '#fff',
                whiteSpace: 'pre-line',
                lineHeight: '1.5'
              }}>
                {message.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '15px 20px',
                borderRadius: '20px 20px 20px 5px',
                backgroundColor: '#333',
                color: '#D4AF37'
              }}>
                🎷 Charlie está digitando...
              </div>
            </div>
          )}

          {/* Recomendações */}
          {recommendations.length > 0 && (
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '15px',
              padding: '20px',
              border: '1px solid #D4AF37'
            }}>
              <h4 style={{ color: '#D4AF37', marginBottom: '15px', fontSize: '1.1rem' }}>
                🎯 Recomendações Personalizadas
              </h4>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {recommendations.map(item => (
                  <div key={item.id} style={{
                    backgroundColor: '#1a1a1a',
                    borderRadius: '10px',
                    padding: '15px',
                    border: '1px solid #444',
                    flex: '1',
                    minWidth: '200px'
                  }}>
                    <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '10px' }}>
                      {item.image}
                    </div>
                    <h5 style={{ color: '#D4AF37', margin: '0 0 5px 0', fontSize: '1rem' }}>
                      {item.name}
                    </h5>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '0 0 10px 0' }}>
                      R$ {item.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => onAddToCart(item)}
                      style={{
                        width: '100%',
                        backgroundColor: '#D4AF37',
                        color: '#000',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Adicionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '15px'
          }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(action.text)}
                style={{
                  backgroundColor: '#333',
                  color: '#D4AF37',
                  border: '1px solid #D4AF37',
                  padding: '8px 12px',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {action.icon} {action.text}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua mensagem para o Charlie..."
              style={{
                flex: 1,
                padding: '15px 20px',
                borderRadius: '25px',
                border: '2px solid #333',
                backgroundColor: '#2a2a2a',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              style={{
                backgroundColor: '#D4AF37',
                color: '#000',
                border: 'none',
                padding: '15px 25px',
                borderRadius: '25px',
                fontWeight: 'bold',
                cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                opacity: inputMessage.trim() && !isTyping ? 1 : 0.5
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}