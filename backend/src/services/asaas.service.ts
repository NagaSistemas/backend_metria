import axios from 'axios'

const asaasApi = axios.create({
  baseURL: process.env.ASAAS_BASE_URL,
  headers: {
    'access_token': process.env.ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
})

export class AsaasService {
  // Criar cliente
  static async createCustomer(customerData: {
    name: string
    email?: string
    phone?: string
    cpfCnpj?: string
  }) {
    try {
      const response = await asaasApi.post('/customers', customerData)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error.response?.data)
      return { success: false, error: error.response?.data?.errors || 'Erro ao criar cliente' }
    }
  }

  // Criar cobrança
  static async createPayment(paymentData: {
    customer: string
    billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
    value: number
    dueDate: string
    description: string
    externalReference?: string
  }) {
    try {
      const response = await asaasApi.post('/payments', paymentData)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Erro ao criar cobrança:', error.response?.data)
      return { success: false, error: error.response?.data?.errors || 'Erro ao criar cobrança' }
    }
  }

  // Processar pagamento com cartão
  static async processCardPayment(paymentId: string, cardData: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }) {
    try {
      const response = await asaasApi.post(`/payments/${paymentId}/payWithCreditCard`, {
        creditCard: cardData,
        creditCardHolderInfo: {
          name: cardData.holderName,
          email: 'cliente@muzzajazz.com',
          cpfCnpj: '11111111111',
          postalCode: '72800000',
          addressNumber: '123'
        }
      })
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Erro no pagamento:', error.response?.data)
      return { success: false, error: error.response?.data?.errors || 'Erro no pagamento' }
    }
  }

  // Gerar QR Code PIX
  static async generatePixQrCode(paymentId: string) {
    try {
      const response = await asaasApi.get(`/payments/${paymentId}/pixQrCode`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Erro ao gerar PIX:', error.response?.data)
      return { success: false, error: 'Erro ao gerar PIX' }
    }
  }

  // Consultar status do pagamento
  static async getPaymentStatus(paymentId: string) {
    try {
      const response = await asaasApi.get(`/payments/${paymentId}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error('Erro ao consultar pagamento:', error.response?.data)
      return { success: false, error: 'Erro ao consultar pagamento' }
    }
  }

  // Webhook para receber notificações
  static async handleWebhook(webhookData: any) {
    try {
      const { event, payment } = webhookData
      
      console.log(`Webhook recebido: ${event}`, payment)
      
      // Aqui você pode atualizar o status do pedido no banco
      // Exemplo: se payment.status === 'CONFIRMED', marcar pedido como pago
      
      return { success: true, event, payment }
    } catch (error) {
      console.error('Erro no webhook:', error)
      return { success: false, error: 'Erro no webhook' }
    }
  }
}