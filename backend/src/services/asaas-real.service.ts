import axios from 'axios'

class AsaasRealService {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = process.env.ASAAS_API_KEY || ''
    this.baseURL = process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3'
  }

  private getHeaders() {
    return {
      'access_token': this.apiKey,
      'Content-Type': 'application/json'
    }
  }

  async createCustomer(customerData: any) {
    try {
      const response = await axios.post(`${this.baseURL}/customers`, {
        name: customerData.name,
        email: customerData.email,
        cpfCnpj: customerData.cpfCnpj
      }, {
        headers: this.getHeaders()
      })

      return response.data
    } catch (error: any) {
      console.error('Erro ao criar cliente Asaas:', error.response?.data)
      throw error
    }
  }

  async createPixPayment(paymentData: any) {
    try {
      const response = await axios.post(`${this.baseURL}/payments`, {
        customer: paymentData.customerId,
        billingType: 'PIX',
        value: paymentData.amount,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Pedido Muzzajazz #${paymentData.orderId}`,
        externalReference: paymentData.orderId
      }, {
        headers: this.getHeaders()
      })

      return response.data
    } catch (error: any) {
      console.error('Erro ao criar PIX Asaas:', error.response?.data)
      throw error
    }
  }

  async createCardPayment(paymentData: any) {
    try {
      const response = await axios.post(`${this.baseURL}/payments`, {
        customer: paymentData.customerId,
        billingType: 'CREDIT_CARD',
        value: paymentData.amount,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Pedido Muzzajazz #${paymentData.orderId}`,
        externalReference: paymentData.orderId,
        creditCard: {
          holderName: paymentData.cardData.name,
          number: paymentData.cardData.number.replace(/\s/g, ''),
          expiryMonth: paymentData.cardData.expiry.split('/')[0],
          expiryYear: `20${paymentData.cardData.expiry.split('/')[1]}`,
          ccv: paymentData.cardData.cvv
        },
        creditCardHolderInfo: {
          name: paymentData.cardData.name,
          email: paymentData.customerEmail,
          cpfCnpj: paymentData.customerCpf,
          postalCode: '72800000',
          addressNumber: '123'
        }
      }, {
        headers: this.getHeaders()
      })

      return response.data
    } catch (error: any) {
      console.error('Erro ao criar pagamento cartão Asaas:', error.response?.data)
      throw error
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/payments/${paymentId}`, {
        headers: this.getHeaders()
      })

      return response.data
    } catch (error: any) {
      console.error('Erro ao consultar pagamento Asaas:', error.response?.data)
      throw error
    }
  }

  async getPixQrCode(paymentId: string) {
    try {
      const response = await axios.get(`${this.baseURL}/payments/${paymentId}/pixQrCode`, {
        headers: this.getHeaders()
      })

      return response.data
    } catch (error: any) {
      console.error('Erro ao obter QR Code PIX:', error.response?.data)
      throw error
    }
  }
}

export default new AsaasRealService()