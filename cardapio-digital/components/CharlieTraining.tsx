'use client'
import { useState, useEffect } from 'react'

export default function CharlieTraining() {
  const [trainingData, setTrainingData] = useState<any>(null)
  const [activeSection, setActiveSection] = useState<'knowledge' | 'personality' | 'stats'>('knowledge')
  const [newKnowledge, setNewKnowledge] = useState({ type: 'info', title: '', content: '' })
  const [personality, setPersonality] = useState({ tone: '', style: '', greeting: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrainingData()
  }, [])

  const loadTrainingData = async () => {
    try {
      const response = await fetch('https://backendmetria-production.up.railway.app/api/admin/charlie/training')
      const data = await response.json()
      
      if (data.success) {
        setTrainingData(data.data)
        setPersonality(data.data.personality)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de treinamento:', error)
    }
    setLoading(false)
  }

  const addKnowledge = async () => {
    if (!newKnowledge.title || !newKnowledge.content) {
      alert('Preencha título e conteúdo')
      return
    }

    try {
      const response = await fetch('https://backendmetria-production.up.railway.app/api/admin/charlie/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKnowledge)
      })

      const data = await response.json()
      if (data.success) {
        setTrainingData(prev => ({
          ...prev,
          knowledgeBase: [...prev.knowledgeBase, data.data]
        }))
        setNewKnowledge({ type: 'info', title: '', content: '' })
        alert('✅ Conhecimento adicionado!')
      }
    } catch (error) {
      console.error('Erro ao adicionar conhecimento:', error)
    }
  }

  const updatePersonality = async () => {
    try {
      const response = await fetch('https://backendmetria-production.up.railway.app/api/admin/charlie/personality', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personality)
      })

      const data = await response.json()
      if (data.success) {
        alert('✅ Personalidade atualizada!')
      }
    } catch (error) {
      console.error('Erro ao atualizar personalidade:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return '📋'
      case 'menu': return '🍕'
      case 'behavior': return '🎭'
      default: return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return '#2196F3'
      case 'menu': return '#4CAF50'
      case 'behavior': return '#FF9800'
      default: return '#666'
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🤖</div>
        <div>Carregando dados de treinamento...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50, #45A049)',
        padding: '30px',
        borderRadius: '20px',
        marginBottom: '30px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🤖</div>
        <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>
          TREINAMENTO CHARLIE IA
        </h2>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '1.1rem' }}>
          Configure conhecimento e personalidade da IA
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '2px solid #333' }}>
        {[
          { id: 'knowledge', label: '📚 Base de Conhecimento', icon: '📚' },
          { id: 'personality', label: '🎭 Personalidade', icon: '🎭' },
          { id: 'stats', label: '📊 Estatísticas', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            style={{
              flex: 1,
              padding: '15px',
              backgroundColor: activeSection === tab.id ? '#4CAF50' : 'transparent',
              color: activeSection === tab.id ? '#fff' : '#ccc',
              border: 'none',
              borderBottom: activeSection === tab.id ? '3px solid #4CAF50' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Knowledge Base */}
      {activeSection === 'knowledge' && (
        <div>
          {/* Add New Knowledge */}
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '25px',
            borderRadius: '15px',
            border: '2px solid #4CAF50',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#4CAF50', marginBottom: '20px' }}>
              ➕ Adicionar Novo Conhecimento
            </h3>
            
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4CAF50' }}>
                  Tipo:
                </label>
                <select
                  value={newKnowledge.type}
                  onChange={(e) => setNewKnowledge({...newKnowledge, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #555',
                    backgroundColor: '#333',
                    color: '#fff'
                  }}
                >
                  <option value="info">📋 Informações Gerais</option>
                  <option value="menu">🍕 Cardápio</option>
                  <option value="behavior">🎭 Comportamento</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4CAF50' }}>
                  Título:
                </label>
                <input
                  type="text"
                  value={newKnowledge.title}
                  onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                  placeholder="Ex: Horário de funcionamento"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #555',
                    backgroundColor: '#333',
                    color: '#fff'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#4CAF50' }}>
                  Conteúdo:
                </label>
                <textarea
                  value={newKnowledge.content}
                  onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                  placeholder="Descreva o conhecimento que a Charlie deve ter..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #555',
                    backgroundColor: '#333',
                    color: '#fff',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <button
              onClick={addKnowledge}
              style={{
                backgroundColor: '#4CAF50',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ➕ Adicionar Conhecimento
            </button>
          </div>

          {/* Knowledge List */}
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '25px',
            borderRadius: '15px',
            border: '2px solid #333'
          }}>
            <h3 style={{ color: '#4CAF50', marginBottom: '20px' }}>
              📚 Base de Conhecimento Atual ({trainingData?.knowledgeBase?.length || 0} itens)
            </h3>

            <div style={{ display: 'grid', gap: '15px' }}>
              {trainingData?.knowledgeBase?.map((item: any) => (
                <div key={item.id} style={{
                  backgroundColor: '#2a2a2a',
                  padding: '20px',
                  borderRadius: '10px',
                  border: `2px solid ${getTypeColor(item.type)}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(item.type)}</span>
                      <h4 style={{ color: getTypeColor(item.type), margin: 0, fontSize: '1.1rem' }}>
                        {item.title}
                      </h4>
                    </div>
                    <button style={{
                      backgroundColor: '#f44336',
                      color: '#fff',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}>
                      🗑️
                    </button>
                  </div>
                  <p style={{ margin: 0, lineHeight: '1.5', opacity: 0.9 }}>
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Personality */}
      {activeSection === 'personality' && (
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '15px',
          border: '2px solid #4CAF50'
        }}>
          <h3 style={{ color: '#4CAF50', marginBottom: '25px' }}>
            🎭 Configurar Personalidade da Charlie
          </h3>

          <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#4CAF50' }}>
                Tom de Voz:
              </label>
              <input
                type="text"
                value={personality.tone}
                onChange={(e) => setPersonality({...personality, tone: e.target.value})}
                placeholder="Ex: Caloroso e sofisticado"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #555',
                  backgroundColor: '#333',
                  color: '#fff'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#4CAF50' }}>
                Estilo:
              </label>
              <input
                type="text"
                value={personality.style}
                onChange={(e) => setPersonality({...personality, style: e.target.value})}
                placeholder="Ex: Sommelier musical"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #555',
                  backgroundColor: '#333',
                  color: '#fff'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#4CAF50' }}>
                Saudação Padrão:
              </label>
              <textarea
                value={personality.greeting}
                onChange={(e) => setPersonality({...personality, greeting: e.target.value})}
                placeholder="Ex: 🎷 Olá! Sou o Charlie, seu sommelier musical!"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #555',
                  backgroundColor: '#333',
                  color: '#fff',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <button
            onClick={updatePersonality}
            style={{
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            💾 Salvar Personalidade
          </button>
        </div>
      )}

      {/* Stats */}
      {activeSection === 'stats' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '25px'
          }}>
            {[
              { label: 'Total Interações', value: trainingData?.stats?.totalInteractions || 0, icon: '💬', color: '#2196F3' },
              { label: 'Tempo Resposta Médio', value: trainingData?.stats?.avgResponseTime || '0s', icon: '⚡', color: '#FF9800' },
              { label: 'Taxa Satisfação', value: trainingData?.stats?.satisfactionRate || '0%', icon: '😊', color: '#4CAF50' },
              { label: 'Base Conhecimento', value: `${trainingData?.knowledgeBase?.length || 0} itens`, icon: '📚', color: '#9C27B0' }
            ].map((stat, index) => (
              <div key={index} style={{
                backgroundColor: '#1a1a1a',
                padding: '25px',
                borderRadius: '15px',
                border: `2px solid ${stat.color}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{stat.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '5px' }}>
                  {stat.value}
                </div>
                <div style={{ opacity: 0.8 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}