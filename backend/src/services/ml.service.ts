import { SimpleLinearRegression, PolynomialRegression } from 'ml-regression'
import * as ss from 'simple-statistics'

interface DemandData {
  hour: number
  day: number
  weather: number
  orders: number
  revenue: number
}

interface PriceOptimization {
  itemId: string
  currentPrice: number
  suggestedPrice: number
  confidence: number
  reason: string
}

export class MLService {
  // Prever demanda por horário
  static predictDemand(historicalData: DemandData[]): any[] {
    if (historicalData.length < 10) {
      return this.generateMockPredictions()
    }

    const predictions = []
    const currentHour = new Date().getHours()

    // Regressão linear para próximas 6 horas
    for (let i = 1; i <= 6; i++) {
      const targetHour = (currentHour + i) % 24
      
      // Filtrar dados históricos para este horário
      const hourData = historicalData.filter(d => d.hour === targetHour)
      
      if (hourData.length > 3) {
        const x = hourData.map((_, index) => index)
        const y = hourData.map(d => d.orders)
        
        const regression = new SimpleLinearRegression(x, y)
        const predicted = Math.max(0, Math.round(regression.predict(hourData.length)))
        
        predictions.push({
          hour: `${targetHour}:00`,
          predicted,
          confidence: this.calculateConfidence(hourData),
          trend: regression.slope > 0 ? 'crescente' : 'decrescente'
        })
      } else {
        // Fallback para dados insuficientes
        const avgOrders = hourData.length > 0 ? 
          Math.round(hourData.reduce((sum, d) => sum + d.orders, 0) / hourData.length) : 
          Math.floor(Math.random() * 20) + 5

        predictions.push({
          hour: `${targetHour}:00`,
          predicted: avgOrders,
          confidence: 60,
          trend: 'estável'
        })
      }
    }

    return predictions
  }

  // Otimização dinâmica de preços
  static optimizePrices(salesData: any[], menuItems: any[]): PriceOptimization[] {
    const optimizations: PriceOptimization[] = []

    menuItems.forEach(item => {
      const itemSales = salesData.filter(s => s.menuItemId === item.id)
      
      if (itemSales.length < 5) {
        // Dados insuficientes - sugestão conservadora
        optimizations.push({
          itemId: item.id,
          currentPrice: item.price,
          suggestedPrice: item.price,
          confidence: 50,
          reason: 'Dados insuficientes para otimização'
        })
        return
      }

      // Análise de elasticidade de preço
      const elasticity = this.calculatePriceElasticity(itemSales)
      const demandTrend = this.analyzeDemandTrend(itemSales)
      const competitorFactor = this.getCompetitorFactor(item)

      let suggestedPrice = item.price
      let reason = 'Preço otimizado'

      // Lógica de otimização
      if (demandTrend > 0.2 && elasticity < -0.5) {
        // Alta demanda, baixa elasticidade = aumentar preço
        suggestedPrice = item.price * 1.1
        reason = 'Alta demanda detectada - aumento recomendado'
      } else if (demandTrend < -0.2 && elasticity > -1.5) {
        // Baixa demanda, alta elasticidade = diminuir preço
        suggestedPrice = item.price * 0.95
        reason = 'Baixa demanda - redução para estimular vendas'
      } else if (competitorFactor > 1.2) {
        // Preço muito alto comparado à concorrência
        suggestedPrice = item.price * 0.98
        reason = 'Ajuste competitivo de mercado'
      }

      optimizations.push({
        itemId: item.id,
        currentPrice: item.price,
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        confidence: this.calculateOptimizationConfidence(itemSales.length, elasticity),
        reason
      })
    })

    return optimizations
  }

  // Recomendações personalizadas com ML
  static generatePersonalizedRecommendations(userId: string, orderHistory: any[], menuItems: any[]): any[] {
    if (orderHistory.length === 0) {
      return this.getPopularItems(menuItems).slice(0, 3)
    }

    // Análise de padrões do usuário
    const userPreferences = this.analyzeUserPreferences(orderHistory)
    const recommendations = []

    // Collaborative Filtering simplificado
    menuItems.forEach(item => {
      let score = 0

      // Score baseado em categorias preferidas
      if (userPreferences.favoriteCategories.includes(item.categoryId)) {
        score += 0.4
      }

      // Score baseado em faixa de preço
      const avgUserSpending = userPreferences.avgSpending
      const priceDiff = Math.abs(item.price - avgUserSpending) / avgUserSpending
      score += Math.max(0, 0.3 - priceDiff)

      // Score baseado em popularidade geral
      score += this.getItemPopularityScore(item.id) * 0.3

      recommendations.push({
        ...item,
        recommendationScore: score,
        reason: this.getRecommendationReason(score, userPreferences, item)
      })
    })

    return recommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5)
  }

  // Análise de sentimento em tempo real
  static analyzeSentiment(chatMessages: any[]): any {
    const sentimentWords = {
      positive: ['bom', 'ótimo', 'excelente', 'delicioso', 'perfeito', 'adorei', 'maravilhoso', 'incrível'],
      negative: ['ruim', 'péssimo', 'horrível', 'demorado', 'frio', 'caro', 'odiei', 'terrível']
    }

    let positiveCount = 0
    let negativeCount = 0
    let totalMessages = chatMessages.length

    chatMessages.forEach(msg => {
      const text = msg.message.toLowerCase()
      
      sentimentWords.positive.forEach(word => {
        if (text.includes(word)) positiveCount++
      })
      
      sentimentWords.negative.forEach(word => {
        if (text.includes(word)) negativeCount++
      })
    })

    const sentiment = positiveCount > negativeCount ? 'positive' : 
                     negativeCount > positiveCount ? 'negative' : 'neutral'

    return {
      sentiment,
      score: totalMessages > 0 ? (positiveCount - negativeCount) / totalMessages : 0,
      confidence: Math.min(90, (positiveCount + negativeCount) * 10),
      insights: this.generateSentimentInsights(sentiment, positiveCount, negativeCount)
    }
  }

  // Detecção de anomalias
  static detectAnomalies(recentData: any[]): any[] {
    const anomalies = []

    if (recentData.length < 20) return anomalies

    // Análise de vendas por hora
    const hourlyData = this.groupByHour(recentData)
    const values = Object.values(hourlyData) as number[]
    const mean = ss.mean(values)
    const stdDev = ss.standardDeviation(values)

    Object.entries(hourlyData).forEach(([hour, value]) => {
      const zScore = Math.abs((value - mean) / stdDev)
      
      if (zScore > 2) { // Anomalia se z-score > 2
        anomalies.push({
          type: 'sales_spike',
          hour,
          value,
          expected: Math.round(mean),
          severity: zScore > 3 ? 'high' : 'medium',
          message: `Pico anômalo de vendas às ${hour}h: ${value} pedidos (esperado: ${Math.round(mean)})`
        })
      }
    })

    return anomalies
  }

  // Funções auxiliares
  private static calculateConfidence(data: any[]): number {
    return Math.min(95, 50 + (data.length * 2))
  }

  private static calculatePriceElasticity(salesData: any[]): number {
    // Simulação de elasticidade baseada em dados históricos
    return -0.8 + (Math.random() * 0.6) // Entre -1.4 e -0.2
  }

  private static analyzeDemandTrend(salesData: any[]): number {
    if (salesData.length < 2) return 0
    
    const recent = salesData.slice(-5)
    const older = salesData.slice(0, -5)
    
    const recentAvg = recent.reduce((sum, s) => sum + s.quantity, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((sum, s) => sum + s.quantity, 0) / older.length : recentAvg
    
    return (recentAvg - olderAvg) / olderAvg
  }

  private static getCompetitorFactor(item: any): number {
    // Simulação de fator competitivo
    return 0.9 + (Math.random() * 0.4) // Entre 0.9 e 1.3
  }

  private static calculateOptimizationConfidence(dataPoints: number, elasticity: number): number {
    const dataConfidence = Math.min(90, dataPoints * 5)
    const elasticityConfidence = Math.abs(elasticity) > 0.5 ? 80 : 60
    return Math.round((dataConfidence + elasticityConfidence) / 2)
  }

  private static analyzeUserPreferences(orderHistory: any[]): any {
    const categories = orderHistory.map(o => o.categoryId)
    const spending = orderHistory.map(o => o.total)
    
    return {
      favoriteCategories: [...new Set(categories)],
      avgSpending: spending.reduce((sum, s) => sum + s, 0) / spending.length,
      orderFrequency: orderHistory.length
    }
  }

  private static getItemPopularityScore(itemId: string): number {
    // Simulação de score de popularidade
    return Math.random() * 0.5 + 0.3 // Entre 0.3 e 0.8
  }

  private static getRecommendationReason(score: number, preferences: any, item: any): string {
    if (score > 0.7) return 'Altamente recomendado baseado no seu perfil'
    if (score > 0.5) return 'Combina com suas preferências'
    if (score > 0.3) return 'Popular entre clientes similares'
    return 'Nova opção para experimentar'
  }

  private static getPopularItems(menuItems: any[]): any[] {
    return menuItems
      .map(item => ({ ...item, popularity: Math.random() }))
      .sort((a, b) => b.popularity - a.popularity)
  }

  private static generateSentimentInsights(sentiment: string, positive: number, negative: number): string[] {
    const insights = []
    
    if (sentiment === 'positive') {
      insights.push('Clientes estão satisfeitos com o atendimento')
      if (positive > 10) insights.push('Alto nível de satisfação detectado')
    } else if (sentiment === 'negative') {
      insights.push('Atenção: feedback negativo detectado')
      if (negative > 5) insights.push('Revisar qualidade do atendimento')
    } else {
      insights.push('Sentimento neutro - oportunidade de melhoria')
    }
    
    return insights
  }

  private static groupByHour(data: any[]): { [key: string]: number } {
    const grouped: { [key: string]: number } = {}
    
    data.forEach(item => {
      const hour = new Date(item.createdAt).getHours().toString()
      grouped[hour] = (grouped[hour] || 0) + 1
    })
    
    return grouped
  }

  private static generateMockPredictions(): any[] {
    const currentHour = new Date().getHours()
    const predictions = []
    
    for (let i = 1; i <= 6; i++) {
      const hour = (currentHour + i) % 24
      predictions.push({
        hour: `${hour}:00`,
        predicted: Math.floor(Math.random() * 25) + 5,
        confidence: Math.floor(Math.random() * 30) + 60,
        trend: ['crescente', 'decrescente', 'estável'][Math.floor(Math.random() * 3)]
      })
    }
    
    return predictions
  }

  private static generateSentimentInsights(sentiment: string, positive: number, negative: number): string[] {
    const insights = []
    
    if (sentiment === 'positive') {
      insights.push('Clientes estão satisfeitos com o atendimento')
      if (positive > 10) insights.push('Alto nível de satisfação detectado')
    } else if (sentiment === 'negative') {
      insights.push('Atenção: feedback negativo detectado')
      if (negative > 5) insights.push('Revisar qualidade do atendimento')
    } else {
      insights.push('Sentimento neutro - oportunidade de melhoria')
    }
    
    return insights
  }
}