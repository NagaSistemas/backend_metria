import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ClientInfo {
  id: string;
  name?: string;
  phone?: string;
  history?: Array<{
    content: string;
    isFromClient: boolean;
    timestamp: Date;
  }>;
  preferences?: {
    favoriteItems?: string[];
    dietaryRestrictions?: string[];
    orderHistory?: any[];
  };
}

interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  emotion?: string;
}

interface IntentAnalysis {
  primaryIntent: string;
  confidence: number;
  entities: Record<string, string>;
  urgency?: 'low' | 'medium' | 'high';
}

export class AIAgentService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }
    
    this.openai = new OpenAI({ apiKey });
  }

  async processMessage(message: string, clientInfo: ClientInfo): Promise<string> {
    try {
      // Análise avançada de sentimento e intenção
      const [sentiment, intent] = await Promise.all([
        this.analyzeSentimentAdvanced(message),
        this.analyzeIntentAdvanced(message)
      ]);

      // Buscar contexto personalizado
      const [menuContext, personalizedRecommendations] = await Promise.all([
        this.getMenuContext(),
        this.getPersonalizedRecommendations(clientInfo, intent)
      ]);
      
      // Histórico da conversa
      const conversationHistory = clientInfo.history?.slice(-5).map(msg => ({
        role: msg.isFromClient ? 'user' as const : 'assistant' as const,
        content: msg.content
      })) || [];

      const systemPrompt = this.buildAdvancedSystemPrompt(
        sentiment, 
        intent, 
        menuContext, 
        personalizedRecommendations,
        clientInfo
      );

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      let response = completion.choices[0].message.content || 
        'Desculpe, não consegui processar sua mensagem. Tente novamente.';

      // Adicionar recomendações personalizadas se apropriado
      if (intent.primaryIntent.includes('cardápio') || intent.primaryIntent.includes('recomendação')) {
        response += this.addPersonalizedSuggestions(personalizedRecommendations);
      }

      // Salvar interação com dados avançados
      await this.saveAdvancedInteraction(clientInfo.id, message, response, sentiment, intent);

      return response;
    } catch (error) {
      console.error('Erro no AI Agent:', error);
      return this.getIntelligentFallbackResponse(message, clientInfo);
    }
  }

  private async analyzeSentimentAdvanced(message: string): Promise<SentimentAnalysis> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analise o sentimento da mensagem e retorne JSON com: sentiment (positive/negative/neutral), confidence (0-1), keywords (array), emotion (joy/anger/sadness/fear/surprise/neutral).'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      return { sentiment: 'neutral', confidence: 0.5, keywords: [], emotion: 'neutral' };
    }
  }

  private async analyzeIntentAdvanced(message: string): Promise<IntentAnalysis> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analise a intenção da mensagem e retorne JSON com: primaryIntent (string), confidence (0-1), entities (objeto), urgency (low/medium/high).'
          },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      return { primaryIntent: 'unknown', confidence: 0.5, entities: {}, urgency: 'low' };
    }
  }

  private async getMenuContext(): Promise<string> {
    try {
      const menuItems = await prisma.menuItem.findMany({
        where: { active: true },
        include: { category: true }
      });

      const menuText = menuItems.map(item => 
        `${item.name} - R$ ${item.price} - ${item.description} (Categoria: ${item.category?.name || 'Geral'})`
      ).join('\n');

      return menuText.length > 0 ? 
        `\nCardápio disponível:\n${menuText}` : '';
    } catch (error) {
      return '';
    }
  }

  private async getPersonalizedRecommendations(clientInfo: ClientInfo, intent: IntentAnalysis): Promise<string[]> {
    // Simulação de recomendações baseadas em histórico
    const recommendations = [];
    
    if (clientInfo.preferences?.favoriteItems?.length) {
      recommendations.push(`Baseado no seu histórico, você adora ${clientInfo.preferences.favoriteItems[0]}!`);
    }
    
    if (intent.primaryIntent.includes('pizza')) {
      recommendations.push('Nossa Pizza Ella Fitzgerald está sendo muito elogiada hoje!');
    }
    
    if (intent.urgency === 'high') {
      recommendations.push('Para algo rápido, recomendo nossas entradas que ficam prontas em 8 minutos.');
    }
    
    return recommendations;
  }

  private buildAdvancedSystemPrompt(
    sentiment: SentimentAnalysis,
    intent: IntentAnalysis,
    menuContext: string,
    recommendations: string[],
    clientInfo: ClientInfo
  ): string {
    const emotionResponse = this.getEmotionResponse(sentiment.emotion || 'neutral');
    const urgencyResponse = this.getUrgencyResponse(intent.urgency || 'low');
    
    return `Você é o assistente virtual avançado do Muzzajazz, restaurante de jazz em Pirenópolis, GO.

INFORMAÇÕES DO RESTAURANTE:
- Nome: Muzzajazz
- Localização: Centro Histórico de Pirenópolis, GO
- Especialidade: Pizzas artesanais e jazz ao vivo
- Filosofia: "Aprecie a vida"
- Horário: Ter-Dom 18h-00h
- Reservas: R$ 50 por pessoa via WhatsApp (62) 99999-8888

PERSONALIDADE AVANÇADA:
- Use linguagem temática do jazz (🎷, 🎵, ♪)
- Seja caloroso, empático e inteligente
- Adapte-se ao humor do cliente: ${emotionResponse}
- Responda com urgência: ${urgencyResponse}
- Use emojis musicais nas respostas

CONTEXTO DO CLIENTE:
- Nome: ${clientInfo.name || 'Cliente'}
- Sentimento: ${sentiment.sentiment} (${sentiment.confidence.toFixed(2)})
- Emoção detectada: ${sentiment.emotion}
- Intenção: ${intent.primaryIntent}
- Urgência: ${intent.urgency}
${menuContext}

RECOMENDAÇÕES PERSONALIZADAS:
${recommendations.join('\n')}

INSTRUÇÕES AVANÇADAS:
- Respostas empáticas e contextualizadas
- Para reservas, direcione ao WhatsApp com entusiasmo
- Para pedidos, explique processo e tempo estimado
- Se sentimento negativo, seja extra empático e ofereça soluções
- Use dados do histórico para personalizar
- Sempre termine com uma nota musical temática
- Seja proativo em sugestões baseadas no contexto`;
  }

  private getEmotionResponse(emotion: string): string {
    const responses = {
      joy: 'Seja ainda mais entusiástico e celebre junto',
      anger: 'Seja calmo, empático e focado em soluções',
      sadness: 'Seja gentil, acolhedor e tente alegrar',
      fear: 'Seja tranquilizador e confiante',
      surprise: 'Seja informativo e esclarecedor',
      neutral: 'Mantenha tom amigável e profissional'
    };
    return responses[emotion as keyof typeof responses] || responses.neutral;
  }

  private getUrgencyResponse(urgency: string): string {
    const responses = {
      high: 'Responda rapidamente, seja direto e eficiente',
      medium: 'Equilibre informação com agilidade',
      low: 'Pode ser mais detalhado e conversacional'
    };
    return responses[urgency as keyof typeof responses] || responses.low;
  }

  private addPersonalizedSuggestions(recommendations: string[]): string {
    if (recommendations.length === 0) return '';
    
    return `\n\n💡 *Sugestões personalizadas para você:*\n${recommendations.map(r => `• ${r}`).join('\n')}`;
  }

  private async saveAdvancedInteraction(
    clientId: string,
    message: string,
    response: string,
    sentiment: SentimentAnalysis,
    intent: IntentAnalysis
  ): Promise<void> {
    try {
      await prisma.chatInteraction.create({
        data: {
          message,
          response,
          keywords: `${sentiment.keywords.join(',')},${sentiment.emotion},${intent.urgency}`,
          sessionId: clientId
        }
      });
    } catch (error) {
      console.error('Erro ao salvar interação:', error);
    }
  }

  private getIntelligentFallbackResponse(message: string, clientInfo: ClientInfo): string {
    const lowerMessage = message.toLowerCase();
    const clientName = clientInfo.name ? `, ${clientInfo.name}` : '';
    
    if (lowerMessage.includes('cardápio') || lowerMessage.includes('menu')) {
      return `🎷 Olá${clientName}! Nosso cardápio tem pizzas artesanais inspiradas em grandes nomes do jazz! Nossa Pizza Ella Fitzgerald está sendo muito elogiada hoje. Que tipo de sabor te interessa? 🎵`;
    }
    
    if (lowerMessage.includes('reserva')) {
      return `🎷 Para reservas${clientName}, entre em contato pelo WhatsApp: (62) 99999-8888. Valor: R$ 50 por pessoa. Garanta sua mesa para uma noite inesquecível! Aprecie a vida! 🎵`;
    }
    
    if (lowerMessage.includes('horário')) {
      return `🎷 Funcionamos de Terça a Domingo, das 18h às 00h${clientName}. Venha sentir a magia do jazz ao vivo! 🎵`;
    }
    
    if (lowerMessage.includes('preço') || lowerMessage.includes('valor')) {
      return `🎷 Nossos preços variam de R$ 40 a R$ 65${clientName}. Pizzas artesanais a partir de R$ 50. Cada centavo vale pela experiência única! 🎵`;
    }
    
    return `🎷 Olá${clientName}! Sou o assistente inteligente do Muzzajazz. Posso te ajudar com cardápio, reservas, horários, preços e muito mais. Como posso tornar sua experiência especial hoje? 🎵`;
  }
}