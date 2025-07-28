'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../lib/firebase'

export default function EmployeeManagement() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: 'kitchen'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = () => {
    // Simular dados dos funcionários
    const mockEmployees = [
      { id: '1', name: 'João Silva', email: 'joao@muzzajazz.com', role: 'kitchen', createdAt: new Date().toISOString() },
      { id: '2', name: 'Maria Santos', email: 'maria@muzzajazz.com', role: 'admin', createdAt: new Date().toISOString() }
    ]
    setEmployees(mockEmployees)
  }

  const addEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      alert('Preencha todos os campos')
      return
    }

    setLoading(true)
    try {
      await registerUser(newEmployee.email, newEmployee.password, newEmployee.name, newEmployee.role)
      
      const employee = {
        id: Date.now().toString(),
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        createdAt: new Date().toISOString()
      }
      
      setEmployees(prev => [...prev, employee])
      setNewEmployee({ name: '', email: '', password: '', role: 'kitchen' })
      setShowAddForm(false)
      alert('✅ Funcionário cadastrado com sucesso!')
    } catch (error: any) {
      alert(`❌ Erro: ${error.message}`)
    }
    setLoading(false)
  }

  const removeEmployee = (id: string, name: string) => {
    if (confirm(`Remover funcionário ${name}?`)) {
      setEmployees(prev => prev.filter(emp => emp.id !== id))
      alert('✅ Funcionário removido!')
    }
  }

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
            👥 Gestão de Funcionários ({employees.length} membros)
          </h2>
          <p style={{ color: '#deb887', margin: '5px 0 0 0', fontStyle: 'italic' }}>
            Gerencie o acesso da sua equipe aos painéis do sistema
          </p>
        </div>
        
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
          ➕ Novo Funcionário
        </button>
      </div>

      {/* Add Employee Modal */}
      {showAddForm && (
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
            maxWidth: '500px',
            width: '90%',
            border: '1px solid rgba(139, 21, 56, 0.3)'
          }}>
            <h3 style={{ color: '#8B1538', marginBottom: '25px', fontSize: '1.8rem' }}>
              👤 Cadastrar Funcionário
            </h3>
            
            <div style={{ display: 'grid', gap: '20px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                  Nome Completo:
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="Ex: João Silva"
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
                  Email:
                </label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="funcionario@muzzajazz.com"
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
                  Senha Temporária:
                </label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
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

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#8B1538', fontWeight: '600' }}>
                  Função:
                </label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
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
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddForm(false)}
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
                onClick={addEmployee}
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
                {loading ? '⏳ Cadastrando...' : '✅ Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employees List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '25px'
      }}>
        {employees.map(employee => (
          <div key={employee.id} style={{
            background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
            border: '2px solid rgba(139, 21, 56, 0.3)',
            borderRadius: '20px',
            padding: '25px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 21, 56, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          >
            {/* Employee Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B1538, #A91D47)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                color: '#fff'
              }}>
                {employee.role === 'admin' ? '⚙️' : '🍳'}
              </div>
              
              <div style={{
                background: employee.role === 'admin' ? 
                  'linear-gradient(135deg, #8B1538, #A91D47)' : 
                  'linear-gradient(135deg, #cd853f, #daa520)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {employee.role === 'admin' ? '⚙️ Admin' : '🍳 Cozinha'}
              </div>
            </div>

            {/* Employee Info */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#8B1538', 
                fontSize: '1.4rem',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                {employee.name}
              </h3>
              
              <div style={{ color: '#deb887', fontSize: '0.9rem', marginBottom: '8px' }}>
                📧 {employee.email}
              </div>
              
              <div style={{ color: '#deb887', fontSize: '0.8rem', opacity: 0.7 }}>
                📅 Cadastrado em {new Date(employee.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>

            {/* Permissions */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#8B1538', fontSize: '1rem', marginBottom: '10px' }}>
                🔐 Permissões:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {employee.role === 'admin' ? (
                  <>
                    <span style={{
                      background: 'rgba(139, 21, 56, 0.2)',
                      color: '#8B1538',
                      padding: '4px 8px',
                      borderRadius: '10px',
                      fontSize: '0.8rem'
                    }}>
                      ⚙️ Painel Admin
                    </span>
                    <span style={{
                      background: 'rgba(205, 133, 63, 0.2)',
                      color: '#cd853f',
                      padding: '4px 8px',
                      borderRadius: '10px',
                      fontSize: '0.8rem'
                    }}>
                      🍳 Painel Cozinha
                    </span>
                  </>
                ) : (
                  <span style={{
                    background: 'rgba(205, 133, 63, 0.2)',
                    color: '#cd853f',
                    padding: '4px 8px',
                    borderRadius: '10px',
                    fontSize: '0.8rem'
                  }}>
                    🍳 Painel Cozinha
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
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
              
              {employee.email !== user?.email && (
                <button 
                  onClick={() => removeEmployee(employee.id, employee.name)}
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
              )}
            </div>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
          border: '1px solid rgba(139, 21, 56, 0.3)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>👥</div>
          <h3 style={{ color: '#8B1538', marginBottom: '10px', fontSize: '1.8rem' }}>
            Nenhum Funcionário Cadastrado
          </h3>
          <p style={{ color: '#deb887', fontStyle: 'italic' }}>
            Cadastre funcionários para dar acesso aos painéis do sistema
          </p>
        </div>
      )}
    </div>
  )
}