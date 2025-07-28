import twilio from 'twilio'

// Configuração simples: SID + Auth Token
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export class WhatsAppService {
  // Enviar mensagem simples
  static async sendMessage(to: string, message: string) {
    try {
      // Limpar e formatar número
      const cleanPhone = to.replace(/\D/g, '')
      const formattedPhone = cleanPhone.startsWith('55') ? 
        `whatsapp:+${cleanPhone}` : 
        `whatsapp:+55${cleanPhone}`
      
      console.log('Enviando WhatsApp para:', formattedPhone)
      
      const result = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: formattedPhone,
        body: message
      })
      
      console.log('WhatsApp enviado com sucesso:', result.sid)
      return { success: true, messageId: result.sid }
    } catch (error: any) {
      console.error('Erro WhatsApp:', error)
      return { 
        success: false, 
        error: error.message || 'Erro desconhecido',
        code: error.code,
        status: error.status
      }
    }
  }

  // Enviar confirmação de reserva
  static async sendReservationConfirmation(phone: string, reservation: any) {
    const message = `🎷 *MUZZAJAZZ - Reserva Confirmada*

📅 *Data:* ${new Date(reservation.date).toLocaleDateString('pt-BR')}
🕐 *Horário:* ${reservation.time}
👥 *Pessoas:* ${reservation.people}
👤 *Nome:* ${reservation.name}

✅ Sua reserva foi confirmada!

📍 *Endereço:* Rua do Jazz, 123 - Pirenópolis, GO
📞 *Contato:* (62) 99999-8888

🎵 "Aprecie a vida como uma boa música"

_Chegue 15 minutos antes do horário._`

    return this.sendMessage(phone, message)
  }

  // Enviar status do pedido
  static async sendOrderStatus(phone: string, order: any, status: string) {
    const statusMessages = {
      CONFIRMED: '✅ Pedido confirmado! Estamos preparando com carinho.',
      PREPARING: '👨‍🍳 Seu pedido está sendo preparado pela nossa equipe.',
      READY: '🍕 Pedido pronto! Pode vir buscar ou aguardar a entrega.',
      DELIVERED: '🚚 Pedido entregue! Aprecie a vida! 🎵'
    }

    const message = `🎷 *MUZZAJAZZ - Status do Pedido*

📋 *Pedido:* #${order.id.slice(-4)}
💰 *Total:* R$ ${order.total.toFixed(2)}

${statusMessages[status as keyof typeof statusMessages] || 'Status atualizado!'}

📞 Dúvidas? (62) 99999-8888`

    return this.sendMessage(phone, message)
  }

  // Bot automático para mensagens recebidas
  static async processIncomingMessage(from: string, body: string) {
    const phone = from.replace('whatsapp:+55', '')
    const message = body.toLowerCase().trim()

    // Respostas automáticas
    if (message.includes('cardapio') || message.includes('menu')) {
      return this.sendMessage(phone, `🎷 *CARDÁPIO MUZZAJAZZ*

🍕 *Pizzas Artesanais:*
• Pizza Ella Fitzgerald - R$ 50,00
• Pizza Nina Simone - R$ 53,00

🥗 *Entradas:*
• Bruschetta Jazz - R$ 25,00
• Tábua de Frios - R$ 45,00

🍷 *Bebidas:*
• Vinho da Casa - R$ 35,00
• Cerveja Artesanal - R$ 12,00

📱 *Faça seu pedido online:*
${process.env.FRONTEND_URL}

🎵 Aprecie a vida!`)
    }

    if (message.includes('reserva')) {
      return this.sendMessage(phone, `📅 *RESERVAS MUZZAJAZZ*

Para fazer sua reserva:
1. Acesse: ${process.env.FRONTEND_URL}
2. Clique no botão de reserva 📅
3. Escolha data, horário e número de pessoas

💰 *Valor:* R$ 50 por pessoa
🕐 *Horário:* Ter-Dom das 18h às 00h

📞 *Ou ligue:* (62) 99999-8888

🎷 Te esperamos para uma noite especial!`)
    }

    if (message.includes('horario') || message.includes('funcionamento')) {
      return this.sendMessage(phone, `🕐 *HORÁRIO DE FUNCIONAMENTO*

📅 *Terça a Domingo:* 18h às 00h
❌ *Segunda:* Fechado

📍 *Endereço:*
Rua do Jazz, 123 - Pirenópolis, GO

📞 *Contato:* (62) 99999-8888

🎵 "Aprecie a vida como uma boa música"`)
    }

    if (message.includes('ola') || message.includes('oi') || message === 'menu') {
      return this.sendMessage(phone, `🎷 *Olá! Bem-vindo ao MUZZAJAZZ!*

Como posso ajudar você hoje?

📋 Digite *cardapio* - Ver nosso menu
📅 Digite *reserva* - Fazer reserva
🕐 Digite *horario* - Horário de funcionamento
📞 Digite *contato* - Falar com atendente

🎵 Aprecie a vida como uma boa música!`)
    }

    // Resposta padrão
    return this.sendMessage(phone, `🎷 *MUZZAJAZZ*

Não entendi sua mensagem. Digite uma das opções:

📋 *cardapio* - Ver menu completo
📅 *reserva* - Fazer reserva
🕐 *horario* - Horário funcionamento
📞 *contato* - Falar com atendente

🎵 Estamos aqui para ajudar!`)
  }

  // Enviar promoções/marketing
  static async sendPromotion(phones: string[], promotion: any) {
    const message = `🎷 *PROMOÇÃO ESPECIAL MUZZAJAZZ*

${promotion.title}

${promotion.description}

💰 *Desconto:* ${promotion.discount}
📅 *Válido até:* ${promotion.validUntil}

📱 *Peça já:* ${process.env.FRONTEND_URL}

🎵 Aprecie a vida com sabor!`

    const results = []
    for (const phone of phones) {
      const result = await this.sendMessage(phone, message)
      results.push({ phone, ...result })
      
      // Delay entre mensagens para evitar spam
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return results
  }

  // Lembrete de reserva
  static async sendReservationReminder(phone: string, reservation: any) {
    const message = `🎷 *LEMBRETE - MUZZAJAZZ*

📅 Sua reserva é hoje às ${reservation.time}!

👤 *Nome:* ${reservation.name}
👥 *Pessoas:* ${reservation.people}
📍 *Local:* Rua do Jazz, 123 - Pirenópolis

⏰ *Chegue 15 minutos antes*

📞 Precisa alterar? (62) 99999-8888

🎵 Te esperamos para uma noite especial!`

    return this.sendMessage(phone, message)
  }
}