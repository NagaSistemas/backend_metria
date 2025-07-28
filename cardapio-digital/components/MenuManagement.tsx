'use client'
import { useState, useEffect } from 'react'

export default function MenuManagement() {
  const [menu, setMenu] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '🍕'
  })
  const [newCategory, setNewCategory] = useState('')
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
    
    // WebSocket para tempo real
    if (typeof window !== 'undefined') {
      const socket = require('socket.io-client')('http://localhost:3001')
      
      // Nova categoria criada
      socket.on('categoryAdded', (newCategory: any) => {
        setCategories(prev => [...prev, newCategory])
        console.log('📂 Nova categoria recebida:', newCategory.name)
      })
      
      return () => socket.disconnect()
    }
  }, [])

  const loadData = async () => {
    try {
      const [menuRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:3001/api/menu'),
        fetch('http://localhost:3001/api/admin/categories')
      ])

      const menuData = await menuRes.json()
      const categoriesData = await categoriesRes.json()

      if (menuData.success) setMenu(menuData.data)
      if (categoriesData.success) setCategories(categoriesData.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const addCategory = async () => {
    if (!newCategory.trim()) return

    try {
      const response = await fetch('http://localhost:3001/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })

      const data = await response.json()
      if (data.success) {
        setCategories(prev => [...prev, data.data])
        setNewCategory('')
        setShowCategoryForm(false)
        alert('✅ Categoria adicionada!')
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error)
    }
  }

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.price || !newItem.categoryId) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      })

      const data = await response.json()
      if (data.success) {
        setMenu(prev => [...prev, data.data])
        setNewItem({ name: '', description: '', price: '', categoryId: '', image: '🍕' })
        setShowAddForm(false)
        alert('✅ Prato adicionado ao repertório!')
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
    }
    setLoading(false)
  }

  const updateMenuItem = async () => {
    if (!editingItem) return

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/admin/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      })

      const data = await response.json()
      if (data.success) {
        setMenu(prev => prev.map(item => 
          item.id === editingItem.id ? data.data : item
        ))
        setEditingItem(null)
        alert('✅ Prato atualizado!')
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
    }
    setLoading(false)
  }

  const toggleItemStatus = async (id: string, active: boolean) => {
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
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const deleteMenuItem = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover "${name}" do repertório?`)) return

    try {
      const response = await fetch(`http://localhost:3001/api/admin/menu/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMenu(prev => prev.filter(item => item.id !== id))
        alert('✅ Prato removido do repertório!')
      }
    } catch (error) {
      console.error('Erro ao remover item:', error)
    }
  }

  const emojis = ['🍕', '🍝', '🥗', '🍖', '🍗', '🧀', '🥖', '🍷', '🍺', '☕', '🍰', '🍮', '🥤', '🍔', '🌮']

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h2 style={{ 
            fontFamily: 'Playfair Display, serif',
            color: '#8B1538', 
            fontSize: '2.2rem',
            fontWeight: '700',
            margin: 0
          }}>
            🍕 Repertório Musical ({menu.length} composições)
          </h2>
          <p style={{ color: '#deb887', margin: '5px 0 0 0', fontStyle: 'italic' }}>
            Gerencie o cardápio gastronômico do Muzzajazz
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCategoryForm(true)}
            style={{
              background: 'linear-gradient(135deg, #d4af37, #ffd700)',
              color: '#000',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            📂 Nova Categoria
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'linear-gradient(135deg, #8B1538, #A91D47)',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ➕ Nova Composição
          </button>
        </div>
      </div>

      {/* Add Category Modal */}
      {showCategoryForm && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.95) 0%, rgba(13, 10, 8, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid rgba(139, 21, 56, 0.3)'
          }}>
            <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.5rem' }}>
              📂 Nova Categoria
            </h3>
            
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nome da categoria"
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid rgba(139, 21, 56, 0.3)',
                background: 'rgba(139, 21, 56, 0.1)',
                color: '#f5f1eb',
                outline: 'none',
                marginBottom: '20px'
              }}
            />
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCategoryForm(false)}
                style={{
                  background: '#666',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={addCategory}
                style={{
                  background: 'linear-gradient(135deg, #8B1538, #A91D47)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {(showAddForm || editingItem) && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.95) 0%, rgba(13, 10, 8, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid rgba(139, 21, 56, 0.3)'
          }}>
            <h3 style={{ color: '#8B1538', marginBottom: '25px', fontSize: '1.8rem' }}>
              {editingItem ? '✏️ Editar Composição' : '🎵 Nova Composição'}
            </h3>
            
            <div style={{ display: 'grid', gap: '20px', marginBottom: '25px' }}>
              {/* Nome */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                  Nome do Prato:
                </label>
                <input
                  type="text"
                  value={editingItem ? editingItem.name : newItem.name}
                  onChange={(e) => editingItem ? 
                    setEditingItem({...editingItem, name: e.target.value}) :
                    setNewItem({...newItem, name: e.target.value})
                  }
                  placeholder="Ex: Pizza Ella Fitzgerald"
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

              {/* Descrição */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                  Descrição:
                </label>
                <textarea
                  value={editingItem ? editingItem.description : newItem.description}
                  onChange={(e) => editingItem ? 
                    setEditingItem({...editingItem, description: e.target.value}) :
                    setNewItem({...newItem, description: e.target.value})
                  }
                  placeholder="Ingredientes e preparação..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 21, 56, 0.3)',
                    background: 'rgba(139, 21, 56, 0.1)',
                    color: '#f5f1eb',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Preço e Categoria */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                    Preço (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem ? editingItem.price : newItem.price}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, price: e.target.value}) :
                      setNewItem({...newItem, price: e.target.value})
                    }
                    placeholder="0.00"
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

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                    Categoria:
                  </label>
                  <select
                    value={editingItem ? editingItem.categoryId : newItem.categoryId}
                    onChange={(e) => editingItem ? 
                      setEditingItem({...editingItem, categoryId: e.target.value}) :
                      setNewItem({...newItem, categoryId: e.target.value})
                    }
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
                    <option value="" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>Selecione...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} style={{ background: '#2a2a2a', color: '#f5f1eb' }}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Emoji */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                  Ícone do Prato:
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => editingItem ? 
                        setEditingItem({...editingItem, image: emoji}) :
                        setNewItem({...newItem, image: emoji})
                      }
                      style={{
                        background: (editingItem ? editingItem.image : newItem.image) === emoji ? 
                          'rgba(139, 21, 56, 0.3)' : 'rgba(139, 21, 56, 0.1)',
                        border: '1px solid rgba(139, 21, 56, 0.3)',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingItem(null)
                }}
                style={{
                  background: '#666',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={editingItem ? updateMenuItem : addMenuItem}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #8B1538, #A91D47)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳' : editingItem ? '💾 Salvar' : '➕ Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
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
                  <span style={{ fontSize: '2rem' }}>{item.image || '🍕'}</span>
                )}
              </div>
              <button
                onClick={() => toggleItemStatus(item.id, item.active)}
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
              <button 
                onClick={() => setEditingItem(item)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                ✏️ Editar
              </button>
              <button 
                onClick={() => deleteMenuItem(item.id, item.name)}
                style={{
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {menu.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
          border: '1px solid rgba(139, 21, 56, 0.3)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🎵</div>
          <h3 style={{ color: '#8B1538', marginBottom: '10px', fontSize: '1.8rem' }}>
            Repertório Vazio
          </h3>
          <p style={{ color: '#deb887', fontStyle: 'italic' }}>
            Adicione suas primeiras composições gastronômicas
          </p>
        </div>
      )}
    </div>
  )
}