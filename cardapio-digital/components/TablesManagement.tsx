'use client'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function TablesManagement() {
  const [tables, setTables] = useState<any[]>([])
  const [newTable, setNewTable] = useState({ number: '', capacity: '4', location: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    const mockTables = []
    
    // Gerar 15 mesas
    for (let i = 1; i <= 15; i++) {
      const number = i.toString().padStart(2, '0')
      const capacity = i <= 5 ? 2 : i <= 10 ? 4 : 6
      const location = i <= 8 ? 'Área Principal' : i <= 12 ? 'Área VIP' : 'Terraço'
      
      const qrCode = await generateQRCode(number)
      
      mockTables.push({
        id: i.toString(),
        number,
        capacity,
        location,
        qrCode
      })
    }
    
    setTables(mockTables)
  }

  const generateQRCode = async (tableNumber: string) => {
    try {
      const url = `${window.location.origin}?mesa=${tableNumber}`
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrCodeDataURL
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
      return ''
    }
  }

  const addTable = async () => {
    if (!newTable.number) {
      alert('Número da mesa é obrigatório')
      return
    }

    const qrCode = await generateQRCode(newTable.number)
    
    const table = {
      id: Date.now().toString(),
      number: newTable.number,
      capacity: parseInt(newTable.capacity),
      location: newTable.location || 'Área Principal',
      qrCode
    }

    setTables(prev => [...prev, table])
    setNewTable({ number: '', capacity: '4', location: '' })
    setShowAddForm(false)
    alert('✅ Mesa adicionada!')
  }

  const deleteTable = (id: string, number: string) => {
    if (confirm(`Remover Mesa ${number}?`)) {
      setTables(prev => prev.filter(t => t.id !== id))
    }
  }

  const downloadQR = (table: any) => {
    const link = document.createElement('a')
    link.download = `mesa-${table.number}-qr.png`
    link.href = table.qrCode
    link.click()
  }

  const printQR = (table: any) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Mesa ${table.number}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                margin: 40px;
                background: #f5f5f5;
              }
              .qr-container {
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                display: inline-block;
              }
              .header {
                color: #8B1538;
                margin-bottom: 20px;
              }
              .table-info {
                margin: 20px 0;
                color: #666;
              }
              .instructions {
                margin-top: 30px;
                font-size: 14px;
                color: #888;
                max-width: 300px;
                margin-left: auto;
                margin-right: auto;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="header">
                <h1>🎷 MUZZAJAZZ</h1>
                <h2>Mesa ${table.number}</h2>
              </div>
              
              <img src="${table.qrCode}" alt="QR Code Mesa ${table.number}" style="width: 200px; height: 200px; border: 2px solid #8B1538; border-radius: 10px;">
              
              <div class="table-info">
                <p><strong>Capacidade:</strong> ${table.capacity} pessoas</p>
                <p><strong>Localização:</strong> ${table.location}</p>
              </div>
              
              <div class="instructions">
                <p><strong>Como usar:</strong></p>
                <p>1. Escaneie o QR Code com seu celular</p>
                <p>2. Acesse nosso cardápio digital</p>
                <p>3. Faça seu pedido diretamente</p>
                <p>4. Aprecie a experiência Muzzajazz!</p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
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
            🪑 Gestão de Mesas ({tables.length} mesas)
          </h2>
          <p style={{ color: '#deb887', margin: '5px 0 0 0', fontStyle: 'italic' }}>
            Gerencie QR Codes para acesso direto ao cardápio
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
          ➕ Nova Mesa
        </button>
      </div>

      {/* Add Table Modal */}
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
            maxWidth: '400px',
            width: '90%',
            border: '1px solid rgba(139, 21, 56, 0.3)'
          }}>
            <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.5rem' }}>
              🪑 Nova Mesa
            </h3>
            
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Número da mesa (ex: 01, 02...)"
                value={newTable.number}
                onChange={(e) => setNewTable({...newTable, number: e.target.value})}
                style={{
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              />
              
              <select
                value={newTable.capacity}
                onChange={(e) => setNewTable({...newTable, capacity: e.target.value})}
                style={{
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              >
                <option value="2" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>2 pessoas</option>
                <option value="4" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>4 pessoas</option>
                <option value="6" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>6 pessoas</option>
                <option value="8" style={{ background: '#2a2a2a', color: '#f5f1eb' }}>8 pessoas</option>
              </select>
              
              <input
                type="text"
                placeholder="Localização (ex: Área Principal, VIP...)"
                value={newTable.location}
                onChange={(e) => setNewTable({...newTable, location: e.target.value})}
                style={{
                  padding: '15px',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 21, 56, 0.3)',
                  background: 'rgba(139, 21, 56, 0.1)',
                  color: '#f5f1eb',
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddForm(false)}
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
                onClick={addTable}
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

      {/* Tables Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '25px'
      }}>
        {tables.map(table => (
          <div key={table.id} style={{
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
            {/* Table Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ 
                fontFamily: 'Playfair Display, serif',
                color: '#8B1538', 
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: 0
              }}>
                🪑 Mesa {table.number}
              </h3>
              <button
                onClick={() => deleteTable(table.id, table.number)}
                style={{
                  background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                🗑️
              </button>
            </div>

            {/* Table Info */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                <span style={{ color: '#deb887' }}>👥 {table.capacity} pessoas</span>
                <span style={{ color: '#deb887' }}>📍 {table.location}</span>
              </div>
            </div>

            {/* QR Code */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                background: '#fff',
                padding: '15px',
                borderRadius: '15px',
                display: 'inline-block',
                border: '2px solid #8B1538'
              }}>
                <img 
                  src={table.qrCode} 
                  alt={`QR Code Mesa ${table.number}`}
                  style={{ width: '150px', height: '150px' }}
                />
              </div>
              <p style={{ color: '#deb887', fontSize: '0.9rem', margin: '10px 0 0 0', fontStyle: 'italic' }}>
                Escaneie para acessar o cardápio
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => downloadQR(table)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                💾 Download
              </button>
              
              <button
                onClick={() => printQR(table)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                🖨️ Imprimir
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
          border: '1px solid rgba(139, 21, 56, 0.3)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🪑</div>
          <h3 style={{ color: '#8B1538', marginBottom: '10px', fontSize: '1.8rem' }}>
            Nenhuma Mesa Cadastrada
          </h3>
          <p style={{ color: '#deb887', fontStyle: 'italic' }}>
            Adicione mesas para gerar QR Codes de acesso ao cardápio
          </p>
        </div>
      )}
    </div>
  )
}