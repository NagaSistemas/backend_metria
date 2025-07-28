'use client'
import { useState, useEffect } from 'react'

export default function CharlieTrainingAdvanced() {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'personality' | 'files' | 'test'>('knowledge')
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([])
  const [personality, setPersonality] = useState({
    tone: 'Caloroso e sofisticado',
    style: 'Sommelier musical',
    greeting: '🎷 Olá! Sou o Charlie, seu sommelier musical!',
    references: 'Jazz, música, harmonização',
    phrases: ['Invoque a inspiração', 'Aprecie a vida', 'Como uma melodia suave']
  })
  const [newKnowledge, setNewKnowledge] = useState({
    title: '',
    content: '',
    type: 'info',
    tags: ''
  })
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTrainingData()
  }, [])

  const loadTrainingData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/charlie/training')
      const data = await response.json()
      if (data.success) {
        setKnowledgeBase(data.data.knowledgeBase || [])
        if (data.data.personality) {
          setPersonality(prev => ({ ...prev, ...data.data.personality }))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const addKnowledge = async () => {
    if (!newKnowledge.title || !newKnowledge.content) {
      alert('Preencha título e conteúdo')
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/charlie/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKnowledge)
      })

      const data = await response.json()
      if (data.success) {
        setKnowledgeBase(prev => [...prev, data.data])
        setNewKnowledge({ title: '', content: '', type: 'info', tags: '' })
        alert('✅ Conhecimento adicionado!')
      }
    } catch (error) {
      console.error('Erro ao adicionar conhecimento:', error)
    }
  }

  const updatePersonality = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/charlie/personality', {
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

  const testCharlie = async () => {
    if (!testMessage.trim()) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testMessage,
          sessionId: 'admin-test'
        })
      })

      const data = await response.json()
      if (data.success) {
        setTestResponse(data.data.response)
      }
    } catch (error) {
      console.error('Erro no teste:', error)
      setTestResponse('Erro ao testar Charlie')
    }
    setLoading(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simular processamento de arquivo
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setNewKnowledge(prev => ({
        ...prev,
        title: file.name,
        content: content.substring(0, 2000) + '...', // Limitar conteúdo
        type: 'file'
      }))
    }
    reader.readAsText(file)
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
      borderRadius: '20px',
      padding: '30px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(139, 21, 56, 0.3)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          color: '#8B1538',
          fontSize: '2.2rem',
          fontWeight: '700',
          marginBottom: '10px'
        }}>
          🎷 Treinamento Avançado Charlie IA
        </h2>
        <p style={{ color: '#deb887', fontStyle: 'italic' }}>
          Configure sua IA para um atendimento personalizado e único
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        marginBottom: '30px',
        borderBottom: '2px solid rgba(139, 21, 56, 0.3)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'knowledge', label: '📚 Base de Conhecimento', icon: '📚' },
          { id: 'personality', label: '🎭 Personalidade', icon: '🎭' },
          { id: 'files', label: '📄 Upload Arquivos', icon: '📄' },
          { id: 'test', label: '🧪 Testar Charlie', icon: '🧪' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '15px',
              background: activeTab === tab.id ? 
                'linear-gradient(135deg, #8B1538, #A91D47)' : 
                'transparent',
              color: activeTab === tab.id ? '#f5f1eb' : '#deb887',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #d4af37' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Knowledge Base Tab */}
      {activeTab === 'knowledge' && (
        <div>
          {/* Add Knowledge Form */}
          <div style={{
            background: 'rgba(139, 21, 56, 0.1)',
            border: '1px solid rgba(139, 21, 56, 0.3)',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.3rem' }}>
              ➕ Adicionar Conhecimento
            </h3>
            
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="Título do conhecimento"
                  value={newKnowledge.title}
                  onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 21, 56, 0.3)',
                    background: 'rgba(139, 21, 56, 0.1)',
                    color: '#f5f1eb',
                    outline: 'none'
                  }}
                />
                
                <select
                  value={newKnowledge.type}
                  onChange={(e) => setNewKnowledge({...newKnowledge, type: e.target.value})}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 21, 56, 0.3)',
                    background: 'rgba(139, 21, 56, 0.1)',
                    color: '#f5f1eb',
                    outline: 'none'
                  }}
                >
                  <option value="info" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>📋 Informações Gerais</option>
                  <option value="menu" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>🍕 Cardápio</option>
                  <option value="service" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>🎭 Atendimento</option>
                  <option value="policy" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>📜 Políticas</option>
                  <option value="history" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>📚 História</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Tags (separadas por vírgula)"
                value={newKnowledge.tags}
                onChange={(e) => setNewKnowledge({...newKnowledge, tags: e.target.value})}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              />

              <textarea
                placeholder="Conteúdo detalhado que Charlie deve saber..."
                value={newKnowledge.content}
                onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})}
                rows={6}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              onClick={addKnowledge}
              style={{
                background: 'linear-gradient(135deg, #8B1538, #A91D47)',
                color: '#f5f1eb',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '25px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ➕ Adicionar Conhecimento
            </button>
          </div>

          {/* Knowledge List */}
          <div>
            <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.3rem' }}>
              📚 Base de Conhecimento ({knowledgeBase.length} itens)
            </h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {knowledgeBase.map((item, index) => (
                <div key={index} style={{
                  background: 'rgba(139, 21, 56, 0.05)',
                  border: '1px solid rgba(139, 21, 56, 0.2)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h4 style={{ color: '#8B1538', margin: 0, fontSize: '1.1rem' }}>
                      {item.title}
                    </h4>
                    <span style={{
                      background: 'rgba(139, 21, 56, 0.2)',
                      color: '#8B1538',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {item.type}
                    </span>
                  </div>
                  <p style={{ color: '#deb887', lineHeight: '1.5', margin: 0 }}>
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Personality Tab */}
      {activeTab === 'personality' && (
        <div style={{
          background: 'rgba(139, 21, 56, 0.1)',
          border: '1px solid rgba(139, 21, 56, 0.3)',
          borderRadius: '15px',
          padding: '25px'
        }}>
          <h3 style={{ color: '#8B1538', marginBottom: '25px', fontSize: '1.3rem' }}>
            🎭 Configurar Personalidade Charlie
          </h3>

          <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
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
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                Estilo de Atendimento:
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
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
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
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                Frases Características (separadas por vírgula):
              </label>
              <input
                type="text"
                value={personality.phrases.join(', ')}
                onChange={(e) => setPersonality({...personality, phrases: e.target.value.split(', ')})}
                placeholder="Ex: Invoque a inspiração, Aprecie a vida"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            onClick={updatePersonality}
            style={{
              background: 'linear-gradient(135deg, #8B1538, #A91D47)',
              color: '#f5f1eb',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            💾 Salvar Personalidade
          </button>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div>
          <div style={{
            background: 'rgba(139, 21, 56, 0.1)',
            border: '1px solid rgba(139, 21, 56, 0.3)',
            borderRadius: '15px',
            padding: '25px',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.3rem' }}>
              📄 Upload de Arquivos
            </h3>
            
            <div style={{
              border: '2px dashed rgba(139, 21, 56, 0.3)',
              borderRadius: '12px',
              padding: '40px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📁</div>
              <p style={{ color: '#deb887', marginBottom: '20px' }}>
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  cursor: 'pointer'
                }}
              />
            </div>
            
            <div style={{ fontSize: '0.9rem', color: '#deb887', opacity: 0.8 }}>
              Formatos suportados: TXT, PDF, DOC, DOCX<br/>
              Tamanho máximo: 5MB
            </div>
          </div>

          <div style={{
            background: 'rgba(139, 21, 56, 0.1)',
            border: '1px solid rgba(139, 21, 56, 0.3)',
            borderRadius: '15px',
            padding: '25px'
          }}>
            <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.3rem' }}>
              📚 Sugestões de Conteúdo
            </h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {[
                { icon: '🏪', title: 'Informações do Restaurante', desc: 'História, localização, horários, contatos' },
                { icon: '🍕', title: 'Cardápio Detalhado', desc: 'Ingredientes, alergênicos, preparação' },
                { icon: '🎭', title: 'Manual de Atendimento', desc: 'Procedimentos, políticas, padrões' },
                { icon: '🎵', title: 'Cultura Jazz', desc: 'Artistas, história, referências musicais' },
                { icon: '💳', title: 'Políticas de Pagamento', desc: 'Formas de pagamento, políticas de cancelamento' }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  background: 'rgba(139, 21, 56, 0.05)',
                  borderRadius: '10px'
                }}>
                  <div style={{ fontSize: '2rem' }}>{item.icon}</div>
                  <div>
                    <h4 style={{ color: '#8B1538', margin: '0 0 5px 0', fontSize: '1rem' }}>
                      {item.title}
                    </h4>
                    <p style={{ color: '#deb887', margin: 0, fontSize: '0.9rem' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div style={{
          background: 'rgba(139, 21, 56, 0.1)',
          border: '1px solid rgba(139, 21, 56, 0.3)',
          borderRadius: '15px',
          padding: '25px'
        }}>
          <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.3rem' }}>
            🧪 Testar Charlie IA
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
              Mensagem de Teste:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Digite uma mensagem para testar Charlie..."
                onKeyPress={(e) => e.key === 'Enter' && testCharlie()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              />
              <button
                onClick={testCharlie}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #8B1538, #A91D47)',
                  color: '#f5f1eb',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '🔄' : '🧪'} Testar
              </button>
            </div>
          </div>

          {testResponse && (
            <div style={{
              background: 'rgba(139, 21, 56, 0.05)',
              border: '1px solid rgba(139, 21, 56, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: '#8B1538', marginBottom: '10px', fontSize: '1rem' }}>
                🎷 Resposta do Charlie:
              </h4>
              <p style={{ color: '#f5f1eb', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                {testResponse}
              </p>
            </div>
          )}

          <div style={{
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{ color: '#d4af37', marginBottom: '15px', fontSize: '1rem' }}>
              💡 Sugestões de Teste:
            </h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[
                'Oi Charlie, o que você recomenda?',
                'Quero algo vegetariano',
                'Me fale sobre o restaurante',
                'Qual pizza combina com jazz?',
                'Estou com pressa, o que é rápido?'
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setTestMessage(suggestion)}
                  style={{
                    background: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 15px',
                    color: '#d4af37',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}