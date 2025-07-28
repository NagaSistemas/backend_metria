import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface CharlieContext {
  menuItems: any[]
  currentHour: number
  sessionId: string
  userPreferences?: any
}

class CharlieAIService {
  private basePersonality = `
🎷 Você é Charlie, o sommelier musical do Muzzajazz em Pirenópolis, GO.

PERSONALIDADE:
- Caloroso, sofisticado e apaixonado por jazz
- Use referências musicais naturalmente
- Seja poético mas prático
- Sempre termine com uma sugestão musical

CONHECIMENTO MUZZAJAZZ:
- Restaurante de jazz em Pirenópolis, GO
- Filosofia: "Invoque a Inspiração" e "Aprecie a vida"
- Horário: Ter-Dom 18h-00h
- Especialidade: Pizzas artesanais inspiradas em divas do jazz
- Ambiente: Floresta + Jazz + Gastronomia

PIZZAS ESPECIAIS:
- Ella Fitzgerald: Mozzarella de búfala, manjericão fresco (R$ 50,00)
- Nina Simone: Bacon defumado, gorgonzola DOP (R$ 53,00)

ESTILO DE RESPOSTA:
- Use emojis musicais (🎷, 🎵, 🎭, 🎹)
- Seja conciso mas envolvente
- Faça recomendações baseadas no horário
- Sugira harmonizações
- Termine com uma frase musical inspiradora
`

  async generateResponse(message: string, context: CharlieContext): Promise<string> {
    try {
      const timeContext = this.getTimeContext(context.currentHour)
      const menuContext = this.formatMenuContext(context.menuItems)
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `${this.basePersonality}

CONTEXTO ATUAL:
${timeContext}

MENU DISPONÍVEL:
${menuContext}

INSTRUÇÕES:
- Responda em português brasileiro
- Seja natural e conversacional
- Faça recomendações específicas do menu
- Use o contexto do horário para sugestões
- Máximo 200 palavras
- Sempre inclua uma sugestão musical no final`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })

      return completion.choices[0]?.message?.content || this.getFallbackResponse()
    } catch (error) {
      console.error('Charlie AI Error:', error)
      return this.getFallbackResponse()
    }
  }

  private getTimeContext(hour: number): string {
    if (hour >= 18 && hour < 20) {
      return "🌅 INÍCIO DA NOITE: Momento perfeito para entradas e drinks de abertura"
    } else if (hour >= 20 && hour < 22) {
      return "🌙 HORÁRIO NOBRE: Ideal para pratos principais e experiências completas"
    } else if (hour >= 22 && hour <= 23) {
      return "🌃 FINAL DA NOITE: Perfeito para sobremesas e drinks especiais"
    } else {
      return "🎷 EXPERIÊNCIA MUZZA: Sempre o momento certo para boa música e sabores"
    }
  }

  private formatMenuContext(menuItems: any[]): string {
    if (!menuItems || menuItems.length === 0) {
      return "Menu em preparação..."
    }

    return menuItems.map(item => 
      `• ${item.name} - R$ ${item.price.toFixed(2)}\n  ${item.description}`
    ).join('\n\n')
  }

  private getFallbackResponse(): string {
    const responses = [
      "🎷 Que tal experimentar nossa Pizza Ella Fitzgerald? Uma composição perfeita de mozzarella de búfala e manjericão fresco, como uma melodia suave ao paladar. 🎵",
      "🎭 A Pizza Nina Simone é uma sinfonia de sabores! Bacon defumado e gorgonzola DOP criam uma harmonia única. Como diria a própria Nina: 'Feeling good!' 🎹",
      "🎵 No Muzzajazz, cada prato é uma nota musical. Que tal deixar eu criar uma playlist gastronômica personalizada para você? 🎷"
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  async analyzePreferences(message: string): Promise<any> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Analise a mensagem do cliente e extraia preferências em JSON:
{
  "dietary": ["vegetariano", "vegano", "sem_gluten", "sem_lactose"],
  "flavors": ["doce", "salgado", "picante", "suave"],
  "mood": ["romântico", "casual", "celebração", "negócios"],
  "budget": "baixo|médio|alto"
}

Retorne apenas o JSON, sem explicações.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      })

      const response = completion.choices[0]?.message?.content
      try {
        return JSON.parse(response || '{}')
      } catch {
        return {}
      }
    } catch (error) {
      console.error('Preference analysis error:', error)
      return {}
    }
  }

  getSmartRecommendations(menuItems: any[], currentHour: number, preferences?: any): any[] {
    if (!menuItems || menuItems.length === 0) return []

    let recommendations = [...menuItems]

    // Filtrar por horário
    if (currentHour >= 18 && currentHour < 20) {
      // Início da noite - priorizar entradas
      recommendations = recommendations.sort((a, b) => {
        const aIsStarter = a.category.name.toLowerCase().includes('entrada')
        const bIsStarter = b.category.name.toLowerCase().includes('entrada')
        if (aIsStarter && !bIsStarter) return -1
        if (!aIsStarter && bIsStarter) return 1
        return 0
      })
    } else if (currentHour >= 20 && currentHour < 22) {
      // Horário nobre - priorizar pratos principais
      recommendations = recommendations.sort((a, b) => {
        const aIsMain = a.category.name.toLowerCase().includes('pizza')
        const bIsMain = b.category.name.toLowerCase().includes('pizza')
        if (aIsMain && !bIsMain) return -1
        if (!aIsMain && bIsMain) return 1
        return 0
      })
    }

    // Aplicar preferências se disponíveis
    if (preferences?.dietary?.includes('vegetariano')) {
      recommendations = recommendations.filter(item => 
        !item.description.toLowerCase().includes('bacon') &&
        !item.description.toLowerCase().includes('carne')
      )
    }

    return recommendations.slice(0, 3)
  }
}

export default new CharlieAIService()