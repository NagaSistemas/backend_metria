import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class AIService {
  static async processMessage(message: string, sessionId?: string) {
    try {
      // Salvar interação
      await prisma.chatInteraction.create({
        data: {
          message,
          response: '',
          keywords: this.extractKeywords(message).join(','),
          sessionId
        }
      });

      // Buscar contexto do cardápio
      const menuItems = await prisma.menuItem.findMany({
        where: { active: true },
        include: { category: true }
      });

      // Buscar pedidos recentes para tempo de espera
      const recentOrders = await prisma.order.findMany({
        where: {
          status: { in: ['PENDING', 'PREPARING'] }
        },
        take: 10
      });

      const systemPrompt = this.buildSystemPrompt(menuItems, recentOrders.length);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || 
        "Desculpe, não consegui processar sua mensagem. Tente novamente.";

      // Atualizar com a resposta
      await prisma.chatInteraction.updateMany({
        where: { 
          message,
          sessionId,
          response: ''
        },
        data: { response }
      });

      return response;
    } catch (error) {
      console.error('Erro no AI Service:', error);
      return this.getFallbackResponse(message);
    }
  }

  private static buildSystemPrompt(menuItems: any[], queueLength: number): string {
    const menuText = menuItems.map(item => 
      `${item.name} (${item.category.name}) - R$ ${item.price} - ${item.description}`
    ).join('\n');

    const waitTime = this.calculateWaitTime(queueLength);

    return `Você é o assistente virtual do Muzzajazz, restaurante de jazz em Pirenópolis, GO.

CARDÁPIO ATUAL:
${menuText}

TEMPO DE ESPERA ATUAL: ${waitTime}

INSTRUÇÕES:
- Seja caloroso e use linguagem temática do jazz
- Forneça informações precisas sobre pratos, preços e ingredientes
- Para reservas, direcione para WhatsApp: (62) 99999-8888
- Mencione sempre nossa filosofia: "Aprecie a vida"
- Use emojis musicais (🎷, 🎵, 🎶) nas respostas
- Seja conciso mas informativo

EXEMPLO DE RESPOSTA:
"🎷 Que bom te ver aqui! A Pizza Ella Fitzgerald é nossa especialidade - massa artesanal com ingredientes premium por R$ 50. Tempo de preparo atual: ${waitTime}. Aprecie a vida! 🎵"`;
  }

  private static calculateWaitTime(queueLength: number): string {
    if (queueLength <= 2) return "15-20 minutos";
    if (queueLength <= 5) return "25-30 minutos";
    return "35-40 minutos";
  }

  private static extractKeywords(message: string): string[] {
    const keywords: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Palavras-chave do cardápio
    const menuKeywords = ['pizza', 'entrada', 'vinho', 'cerveja', 'sobremesa'];
    menuKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) keywords.push(keyword);
    });

    // Palavras-chave de ação
    const actionKeywords = ['reserva', 'pedido', 'tempo', 'preço', 'ingredientes'];
    actionKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) keywords.push(keyword);
    });

    return keywords;
  }

  private static getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cardápio') || lowerMessage.includes('menu')) {
      return "🎷 Nosso cardápio tem pizzas artesanais, entradas especiais, vinhos selecionados e muito mais! Que tipo de prato te interessa? 🎵";
    }
    
    if (lowerMessage.includes('reserva')) {
      return "🎷 Para reservas, entre em contato pelo WhatsApp: (62) 99999-8888. Valor: R$ 50 por pessoa. Aprecie a vida! 🎵";
    }
    
    if (lowerMessage.includes('tempo')) {
      return "🎷 O tempo de preparo varia entre 15-30 minutos dependendo do prato e movimento. A boa música faz o tempo passar mais rápido! 🎵";
    }
    
    return "🎷 Olá! Sou o assistente do Muzzajazz. Posso te ajudar com informações sobre cardápio, reservas, tempo de preparo e muito mais. Como posso te ajudar? 🎵";
  }
}