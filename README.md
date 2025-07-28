# 🎷 **MUZZAJAZZ - SISTEMA COMPLETO**

## **Cardápio Digital Premium com IA para Restaurante de Jazz**

### 🌟 **Visão Geral**
Sistema completo de cardápio digital com inteligência artificial, desenvolvido especificamente para o Muzzajazz - restaurante de jazz em Pirenópolis, GO. Combina tecnologia de ponta com a elegância e sofisticação do jazz.

---

## 🚀 **Funcionalidades Principais**

### 📱 **Cardápio Digital Premium**
- Interface elegante com branding Muzza Jazz
- Filtros inteligentes por categoria
- Busca avançada de pratos
- Carrinho de compras completo
- Imagens reais dos pratos

### 🤖 **Charlie IA - Sommelier Musical**
- Assistente IA especializado em jazz e gastronomia
- Recomendações personalizadas
- Análise de preferências do cliente
- Sugestões baseadas no horário
- Treinamento customizável pelo admin

### 💳 **Sistema de Pagamentos**
- PIX instantâneo com QR Code
- Cartão de crédito
- Processamento em tempo real
- Comprovantes automáticos

### 🍳 **Painel Cozinha Profissional**
- Pedidos em tempo real via WebSocket
- Priorização automática por tempo
- Status visual por cores
- Notificações sonoras
- Interface otimizada para produção

### ⚙️ **Painel Administrativo**
- Dashboard com analytics em tempo real
- Gestão completa do menu
- Relatórios de vendas
- Treinamento da IA Charlie
- Controle de usuários

---

## 🏗️ **Arquitetura Técnica**

### **Backend (Node.js + TypeScript)**
```
backend/
├── src/
│   ├── server.ts           # Servidor principal
│   ├── config/             # Configurações
│   ├── services/           # Lógica de negócio
│   └── middleware/         # Middlewares
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   └── migrations/         # Migrações
└── package.json
```

### **Frontend (Next.js 14 + TypeScript)**
```
cardapio-digital/
├── app/
│   ├── page.tsx           # Cardápio principal
│   ├── admin/             # Painel administrativo
│   ├── kitchen/           # Painel da cozinha
│   └── globals.css        # Estilos globais
├── components/
│   ├── ui/                # Componentes reutilizáveis
│   ├── CharlieAI.tsx      # IA Assistant
│   └── CharlieTraining.tsx # Treinamento IA
├── lib/
│   └── design-system.ts   # Sistema de design
└── public/
    ├── EllaFitzgerald.png # Imagem pizza
    └── NinaSimone.png     # Imagem pizza
```

---

## 🛠️ **Stack Tecnológica**

### **Backend**
- **Node.js** + **Express** - API REST
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Socket.io** - WebSocket para tempo real
- **OpenAI** - IA conversacional

### **Frontend**
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Design System** - Componentes reutilizáveis
- **PWA** - Progressive Web App
- **Socket.io Client** - Tempo real

---

## 🎨 **Design System Muzza Jazz**

### **Paleta de Cores**
- **Dourado**: `#d4af37` (Cardápio)
- **Cobre**: `#cd853f` (Cozinha)
- **Burgundy**: `#8B1538` (Admin)
- **Neutros**: Tons escuros elegantes

### **Tipografia**
- **Headings**: Playfair Display (serif)
- **Body**: Montserrat (sans-serif)
- **Hierarquia**: 6 tamanhos responsivos

### **Componentes**
- **Button**: 5 variantes, 3 tamanhos
- **Card**: 4 estilos com hover effects
- **Input**: Totalmente customizável

---

## 📦 **Instalação e Execução**

### **1. Pré-requisitos**
```bash
Node.js 18+
npm ou yarn
```

### **2. Instalação**
```bash
git clone <repo-url>
cd muzzajazz-system
npm install
```

### **3. Configuração**

**Backend (.env):**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="muzzajazz-super-secret-key"
OPENAI_API_KEY="sua-chave-openai"
PORT=3001
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### **4. Execução**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

---

## 🌐 **URLs do Sistema**

| Interface | URL | Descrição |
|-----------|-----|-----------|
| **Cardápio** | http://localhost:3000 | Interface do cliente |
| **Cozinha** | http://localhost:3000/kitchen | Painel da cozinha |
| **Admin** | http://localhost:3000/admin | Painel administrativo |
| **API** | http://localhost:3001 | Backend REST API |

---

## 🎯 **Funcionalidades por Interface**

### 🍽️ **Cardápio (Cliente)**
- Menu premium com filtros
- Charlie IA para recomendações
- Carrinho de compras completo
- Pagamentos PIX e cartão
- Experiência imersiva

### 🍳 **Cozinha**
- Pedidos em tempo real
- Priorização por urgência
- Status visual claro
- Notificações sonoras
- Interface otimizada

### ⚙️ **Admin**
- Dashboard analytics
- Gestão de menu
- Treinamento Charlie IA
- Relatórios de vendas
- Controle total

---

## 🤖 **Charlie IA - Recursos**

### **Capacidades**
- Recomendações personalizadas
- Análise de preferências
- Sugestões por horário
- Conhecimento sobre jazz
- Linguagem natural

### **Treinamento**
- Base de conhecimento customizável
- Personalidade configurável
- Prompts específicos
- Análise de performance
- Melhoria contínua

---

## 💳 **Sistema de Pagamentos**

### **PIX**
- QR Code automático
- Código copiável
- Aprovação em tempo real
- Notificações via WebSocket

### **Cartão**
- Formulário seguro
- Validação em tempo real
- Taxa de aprovação 90%
- Feedback imediato

---

## 📊 **Analytics e Relatórios**

### **Métricas**
- Vendas por período
- Ticket médio
- Itens mais vendidos
- Performance por horário

### **Exportação**
- Relatórios PDF
- Dados Excel/CSV
- Gráficos visuais
- Análise de tendências

---

## 🔧 **Desenvolvimento**

### **Scripts Disponíveis**
```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Iniciar produção
npm run install:all  # Instalar dependências
```

### **Estrutura de Commits**
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração

---

## 🎷 **Filosofia Muzza Jazz**

> *"Invoque a Inspiração"*

O sistema foi desenvolvido com a essência do jazz em mente:
- **Improvisação**: Flexibilidade e adaptabilidade
- **Harmonia**: Integração perfeita entre componentes
- **Ritmo**: Performance otimizada
- **Elegância**: Design sofisticado
- **Paixão**: Experiência envolvente

---

## 📞 **Suporte**

- **Restaurante**: Muzzajazz - Pirenópolis, GO
- **Filosofia**: "Aprecie a vida"
- **Sistema**: Desenvolvido com paixão pelo jazz

---

*🎷 Sistema desenvolvido com tecnologia de ponta e alma jazzística! 🎵*