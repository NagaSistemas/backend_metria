'use client'
import { useState, useEffect } from 'react'

export default function ReportsAdvanced() {
  const [reportData, setReportData] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeView, setActiveView] = useState<'overview' | 'sales' | 'products' | 'performance'>('overview')

  const loadReportData = async () => {
    setLoading(true)
    try {
      const [reportRes, analyticsRes, ordersRes] = await Promise.all([
        fetch('https://backendmetria-production.up.railway.app/api/admin/reports/data?type=sales'),
        fetch('https://backendmetria-production.up.railway.app/api/admin/analytics'),
        fetch('https://backendmetria-production.up.railway.app/api/admin/orders')
      ])
      
      const [reportData, analyticsData, ordersData] = await Promise.all([
        reportRes.json(),
        analyticsRes.json(),
        ordersRes.json()
      ])
      
      if (reportData.success) setReportData(reportData.data)
      if (analyticsData.success) setAnalytics(analyticsData.data)
      if (ordersData.success) setOrders(ordersData.data.orders || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadReportData()
  }, [])

  const exportToPDF = () => {
    if (!analytics) return
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Muzzajazz - Dashboard Completo</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
              .card { padding: 20px; border: 2px solid #8B1538; border-radius: 10px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎷 MUZZAJAZZ - DASHBOARD COMPLETO</h1>
            </div>
            <div class="grid">
              <div class="card">
                <h3>Hoje: ${analytics.today.orders} pedidos</h3>
                <p>R$ ${analytics.today.revenue.toFixed(2)}</p>
              </div>
              <div class="card">
                <h3>Semana: ${analytics.week.orders} pedidos</h3>
                <p>R$ ${analytics.week.revenue.toFixed(2)}</p>
              </div>
              <div class="card">
                <h3>Mês: ${analytics.month.orders} pedidos</h3>
                <p>R$ ${analytics.month.revenue.toFixed(2)}</p>
              </div>
              <div class="card">
                <h3>Ticket Médio</h3>
                <p>R$ ${analytics.today.avgTicket.toFixed(2)}</p>
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
      <div style={{
        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
        padding: '40px',
        borderRadius: '20px',
        marginBottom: '30px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>📊</div>
        <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>
          PARTITURAS ANALÍTICAS
        </h2>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Dashboards detalhados do Muzzajazz
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
        border: '1px solid rgba(139, 21, 56, 0.3)',
        borderRadius: '20px',
        marginBottom: '30px',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(139, 21, 56, 0.3)' }}>
          {[
            { id: 'overview', label: '📊 Visão Geral' },
            { id: 'sales', label: '💰 Vendas' },
            { id: 'products', label: '🍕 Produtos' },
            { id: 'performance', label: '⚡ Performance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              style={{
                flex: 1,
                padding: '20px',
                background: activeView === tab.id ? 
                  'linear-gradient(135deg, #8B1538, #A91D47)' : 
                  'transparent',
                color: activeView === tab.id ? '#f5f1eb' : '#deb887',
                border: 'none',
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
        
        <div style={{ padding: '25px' }}>
          <button
            onClick={exportToPDF}
            disabled={!analytics || loading}
            style={{
              background: 'linear-gradient(135deg, #f44336, #d32f2f)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: analytics && !loading ? 'pointer' : 'not-allowed',
              opacity: analytics && !loading ? 1 : 0.5,
              marginRight: '15px'
            }}
          >
            📄 Exportar PDF
          </button>

          <button
            onClick={loadReportData}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #8B1538, #A91D47)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            🔄 {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏳</div>
          <div>Carregando dashboards...</div>
        </div>
      ) : (
        <div>
          {/* Overview Tab */}
          {activeView === 'overview' && analytics && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {[
                  { label: 'Hoje', value: analytics.today.orders, subValue: `R$ ${analytics.today.revenue.toFixed(2)}`, color: '#2196F3', icon: '📅' },
                  { label: 'Semana', value: analytics.week.orders, subValue: `R$ ${analytics.week.revenue.toFixed(2)}`, color: '#4CAF50', icon: '📆' },
                  { label: 'Mês', value: analytics.month.orders, subValue: `R$ ${analytics.month.revenue.toFixed(2)}`, color: '#FF9800', icon: '📅' },
                  { label: 'Ticket Médio', value: `R$ ${analytics.today.avgTicket.toFixed(2)}`, subValue: 'Por pedido', color: '#9C27B0', icon: '🎯' }
                ].map((kpi, index) => (
                  <div key={index} style={{
                    background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                    border: `2px solid ${kpi.color}60`,
                    borderRadius: '20px',
                    padding: '25px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{kpi.icon}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: kpi.color, marginBottom: '5px' }}>
                      {kpi.value}
                    </div>
                    <div style={{ opacity: 0.8, marginBottom: '5px' }}>{kpi.label}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>{kpi.subValue}</div>
                  </div>
                ))}
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                border: '1px solid rgba(139, 21, 56, 0.3)',
                borderRadius: '20px',
                padding: '25px'
              }}>
                <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.5rem' }}>
                  🏆 Top 5 Composições
                </h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {analytics.topItems?.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      background: 'rgba(139, 21, 56, 0.1)',
                      borderRadius: '10px',
                      border: index === 0 ? '2px solid #d4af37' : '1px solid rgba(139, 21, 56, 0.3)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '2.5rem' }}>{item.image || '🍕'}</div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#f5f1eb', fontSize: '1.1rem' }}>{item.name}</div>
                          <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>#{index + 1} mais executado</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          {item.quantity || 0}
                        </div>
                        <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>execuções</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Sales Tab */}
          {activeView === 'sales' && reportData && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                border: '2px solid #2196F3',
                borderRadius: '20px',
                padding: '25px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📊</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3', marginBottom: '5px' }}>
                  {reportData.summary?.totalOrders || 0}
                </div>
                <div style={{ opacity: 0.8 }}>Total de Apresentações</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                border: '2px solid #4CAF50',
                borderRadius: '20px',
                padding: '25px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💰</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50', marginBottom: '5px' }}>
                  R$ {reportData.summary?.totalRevenue?.toFixed(2) || '0.00'}
                </div>
                <div style={{ opacity: 0.8 }}>Receita da Temporada</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                border: '2px solid #FF9800',
                borderRadius: '20px',
                padding: '25px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎯</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800', marginBottom: '5px' }}>
                  R$ {reportData.summary?.avgTicket?.toFixed(2) || '0.00'}
                </div>
                <div style={{ opacity: 0.8 }}>Valor Médio por Show</div>
              </div>
            </div>
          )}
          
          {/* Products Tab */}
          {activeView === 'products' && analytics && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
              border: '1px solid rgba(139, 21, 56, 0.3)',
              borderRadius: '20px',
              padding: '25px'
            }}>
              <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.5rem' }}>
                🍕 Análise do Repertório
              </h3>
              <div style={{ display: 'grid', gap: '15px' }}>
                {analytics.topItems?.map((item: any, index: number) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    background: 'rgba(139, 21, 56, 0.1)',
                    borderRadius: '15px',
                    border: '1px solid rgba(139, 21, 56, 0.3)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ fontSize: '3rem' }}>{item.image || '🍕'}</div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#f5f1eb', fontSize: '1.2rem' }}>{item.name}</div>
                        <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Composição #{index + 1}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '1.3rem' }}>
                        {item.quantity || 0} execuções
                      </div>
                      <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Performance</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Performance Tab */}
          {activeView === 'performance' && orders && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {[
                  { label: 'Pedidos Pendentes', value: orders.filter(o => o.status === 'PENDING').length, color: '#FF6B35', icon: '⏳' },
                  { label: 'Em Preparo', value: orders.filter(o => o.status === 'PREPARING').length, color: '#cd853f', icon: '🍳' },
                  { label: 'Prontos', value: orders.filter(o => o.status === 'READY').length, color: '#d4af37', icon: '✅' },
                  { label: 'Entregues', value: orders.filter(o => o.status === 'DELIVERED').length, color: '#4CAF50', icon: '🚚' }
                ].map((stat, index) => (
                  <div key={index} style={{
                    background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                    border: `2px solid ${stat.color}60`,
                    borderRadius: '20px',
                    padding: '25px',
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
              
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 21, 56, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%)',
                border: '1px solid rgba(139, 21, 56, 0.3)',
                borderRadius: '20px',
                padding: '25px'
              }}>
                <h3 style={{ color: '#8B1538', marginBottom: '20px', fontSize: '1.5rem' }}>
                  🕰️ Últimas Apresentações
                </h3>
                <div style={{ display: 'grid', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                  {orders.slice(0, 10).map((order: any, index: number) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      background: 'rgba(139, 21, 56, 0.1)',
                      borderRadius: '10px',
                      border: '1px solid rgba(139, 21, 56, 0.3)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#f5f1eb' }}>#{order.id.slice(-4)}</div>
                        <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>{order.table} • {order.customer}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>R$ {order.total.toFixed(2)}</div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: order.status === 'DELIVERED' ? '#4CAF50' : 
                                order.status === 'READY' ? '#d4af37' : 
                                order.status === 'PREPARING' ? '#cd853f' : '#FF6B35'
                        }}>
                          {order.status === 'DELIVERED' ? '✅ Entregue' : 
                           order.status === 'READY' ? '🍽️ Pronto' : 
                           order.status === 'PREPARING' ? '🍳 Preparando' : '⏳ Pendente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}