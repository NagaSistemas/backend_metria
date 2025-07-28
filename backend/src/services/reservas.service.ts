import axios from 'axios'

export class ReservasService {
  // Verificar disponibilidade de mesa
  static async checkAvailability(date: string, time: string, people: number) {
    try {
      // Simular verificação de disponibilidade
      const reservations = await this.getReservationsForDate(date)
      const timeSlot = `${time}:00`
      
      // Mesas disponíveis (simulação)
      const totalTables = {
        2: 4, // 4 mesas para 2 pessoas
        4: 6, // 6 mesas para 4 pessoas  
        6: 3, // 3 mesas para 6 pessoas
        8: 2  // 2 mesas para 8 pessoas
      }
      
      const tableSize = people <= 2 ? 2 : people <= 4 ? 4 : people <= 6 ? 6 : 8
      const occupiedTables = reservations.filter(r => 
        r.time === timeSlot && r.tableSize === tableSize
      ).length
      
      const available = totalTables[tableSize as keyof typeof totalTables] - occupiedTables
      
      return {
        success: true,
        available: available > 0,
        availableTables: Math.max(0, available),
        suggestedTimes: available > 0 ? [] : this.getSuggestedTimes(date, tableSize)
      }
    } catch (error) {
      return { success: false, error: 'Erro ao verificar disponibilidade' }
    }
  }
  
  // Criar reserva
  static async createReservation(reservationData: {
    name: string
    phone: string
    email?: string
    date: string
    time: string
    people: number
    notes?: string
  }) {
    try {
      // Verificar disponibilidade primeiro
      const availability = await this.checkAvailability(
        reservationData.date, 
        reservationData.time, 
        reservationData.people
      )
      
      if (!availability.available) {
        return { 
          success: false, 
          error: 'Horário não disponível',
          suggestedTimes: availability.suggestedTimes
        }
      }
      
      // Simular criação da reserva (aqui você salvaria no banco)
      const reservation = {
        id: `RES-${Date.now()}`,
        ...reservationData,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      }
      
      // Enviar WhatsApp de confirmação
      await this.sendWhatsAppConfirmation(reservation)
      
      return { success: true, data: reservation }
    } catch (error) {
      return { success: false, error: 'Erro ao criar reserva' }
    }
  }
  
  // Enviar confirmação via WhatsApp
  static async sendWhatsAppConfirmation(reservation: any) {
    try {
      const { WhatsAppService } = require('./whatsapp.service')
      return await WhatsAppService.sendReservationConfirmation(reservation.phone, reservation)
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error)
      return { success: false }
    }
  }
  
  // Buscar reservas por data
  private static async getReservationsForDate(date: string) {
    // Simular busca no banco
    return [
      { time: '19:00:00', tableSize: 4, people: 4 },
      { time: '20:00:00', tableSize: 2, people: 2 },
      { time: '21:00:00', tableSize: 6, people: 6 }
    ]
  }
  
  // Sugerir horários alternativos
  private static getSuggestedTimes(date: string, tableSize: number) {
    const times = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00']
    
    // Simular horários disponíveis
    return times.filter(() => Math.random() > 0.5).slice(0, 3)
  }
  
  // Listar reservas do dia
  static async getTodayReservations() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Simular reservas do dia
      const reservations = [
        {
          id: 'RES-001',
          name: 'João Silva',
          phone: '(62) 99999-1111',
          time: '19:00',
          people: 4,
          status: 'CONFIRMED'
        },
        {
          id: 'RES-002', 
          name: 'Maria Santos',
          phone: '(62) 99999-2222',
          time: '20:30',
          people: 2,
          status: 'CONFIRMED'
        }
      ]
      
      return { success: true, data: reservations }
    } catch (error) {
      return { success: false, error: 'Erro ao buscar reservas' }
    }
  }
}