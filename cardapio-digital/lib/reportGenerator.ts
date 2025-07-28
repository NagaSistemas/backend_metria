import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

interface ReportData {
  period: string
  totalOrders: number
  totalRevenue: number
  avgTicket: number
  topItems: Array<{ name: string; quantity: number; revenue: number }>
  hourlyData: Array<{ hour: string; orders: number; revenue: number }>
  chatStats: { interactions: number; satisfaction: number }
  growth: number
}

export class ReportGenerator {
  // Gerar relatório PDF
  static async generatePDF(data: ReportData, chartElement?: HTMLElement) {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Header
    pdf.setFillColor(212, 175, 55)
    pdf.rect(0, 0, pageWidth, 30, 'F')
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('🎷 MUZZAJAZZ - RELATÓRIO ANALYTICS', 20, 20)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(12)
    pdf.text(`Período: ${data.period}`, 20, 25)
    
    // Métricas principais
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('📊 MÉTRICAS PRINCIPAIS', 20, 45)
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    
    const metrics = [
      `Total de Pedidos: ${data.totalOrders}`,
      `Faturamento Total: R$ ${data.totalRevenue.toFixed(2)}`,
      `Ticket Médio: R$ ${data.avgTicket.toFixed(2)}`,
      `Crescimento: ${data.growth > 0 ? '+' : ''}${data.growth.toFixed(1)}%`,
      `Interações IA: ${data.chatStats.interactions}`,
      `Satisfação IA: ${data.chatStats.satisfaction}%`
    ]
    
    metrics.forEach((metric, index) => {
      pdf.text(metric, 20, 55 + (index * 8))
    })
    
    // Top itens
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('🏆 TOP ITENS MAIS VENDIDOS', 20, 110)
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    
    data.topItems.slice(0, 5).forEach((item, index) => {
      pdf.text(`${index + 1}. ${item.name}`, 25, 125 + (index * 8))
      pdf.text(`${item.quantity} vendidos`, 120, 125 + (index * 8))
      pdf.text(`R$ ${item.revenue.toFixed(2)}`, 160, 125 + (index * 8))
    })
    
    // Footer
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, 20, pageHeight - 10)
    pdf.text('🎵 "Aprecie a vida como uma boa música" - Muzzajazz', 20, pageHeight - 5)
    
    // Download
    pdf.save(`muzzajazz-relatorio-${new Date().toISOString().split('T')[0]}.pdf`)
  }
  
  // Gerar planilha Excel
  static generateExcel(data: ReportData) {
    const workbook = XLSX.utils.book_new()
    
    // Aba 1: Resumo
    const summaryData = [
      ['🎷 MUZZAJAZZ - RELATÓRIO ANALYTICS'],
      [''],
      ['Período', data.period],
      [''],
      ['MÉTRICAS PRINCIPAIS'],
      ['Total de Pedidos', data.totalOrders],
      ['Faturamento Total', `R$ ${data.totalRevenue.toFixed(2)}`],
      ['Ticket Médio', `R$ ${data.avgTicket.toFixed(2)}`],
      ['Crescimento', `${data.growth.toFixed(1)}%`],
      ['Interações IA', data.chatStats.interactions],
      ['Satisfação IA', `${data.chatStats.satisfaction}%`],
      [''],
      ['TOP ITENS'],
      ['Item', 'Quantidade', 'Faturamento'],
      ...data.topItems.map(item => [item.name, item.quantity, `R$ ${item.revenue.toFixed(2)}`])
    ]
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo')
    
    // Aba 2: Dados por Horário
    const hourlySheet = XLSX.utils.json_to_sheet(data.hourlyData.map(h => ({
      'Horário': h.hour,
      'Pedidos': h.orders,
      'Faturamento': `R$ ${h.revenue.toFixed(2)}`
    })))
    XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Por Horário')
    
    // Download
    XLSX.writeFile(workbook, `muzzajazz-dados-${new Date().toISOString().split('T')[0]}.xlsx`)
  }
  
  // Gerar insights automáticos
  static generateInsights(data: ReportData): string[] {
    const insights: string[] = []
    
    if (data.growth > 10) {
      insights.push(`🚀 Crescimento de ${data.growth.toFixed(1)}% indica expansão sólida.`)
    } else if (data.growth < 0) {
      insights.push(`⚠️ Crescimento negativo. Revisar estratégias.`)
    }
    
    if (data.avgTicket > 60) {
      insights.push(`💰 Ticket médio alto (R$ ${data.avgTicket.toFixed(2)}). Clientes premium.`)
    }
    
    const peakHour = data.hourlyData.reduce((max, current) => 
      current.orders > max.orders ? current : max
    )
    insights.push(`⏰ Pico às ${peakHour.hour} com ${peakHour.orders} pedidos.`)
    
    if (data.chatStats.satisfaction > 90) {
      insights.push(`🤖 IA Charlie excelente (${data.chatStats.satisfaction}%).`)
    }
    
    return insights
  }
  
  // Dados de exemplo
  static generateSampleData(): ReportData {
    return {
      period: 'Últimos 7 dias',
      totalOrders: 247,
      totalRevenue: 18420.50,
      avgTicket: 74.60,
      growth: 12.5,
      chatStats: { interactions: 156, satisfaction: 94 },
      topItems: [
        { name: 'Pizza Ella Fitzgerald', quantity: 89, revenue: 4450.00 },
        { name: 'Pizza Nina Simone', quantity: 67, revenue: 3551.00 },
        { name: 'Pizza Elis Regina', quantity: 45, revenue: 2385.00 }
      ],
      hourlyData: Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        orders: Math.floor(Math.random() * 20) + (hour >= 18 && hour <= 22 ? 15 : 0),
        revenue: Math.floor(Math.random() * 1500) + (hour >= 18 && hour <= 22 ? 800 : 0)
      }))
    }
  }
}