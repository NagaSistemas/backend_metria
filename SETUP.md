# 🚀 Setup Rápido - Muzzajazz

## ⚡ Instalação Express (5 minutos)

### 1. **Pré-requisitos**
```bash
# Verificar Node.js (v18+)
node --version

# Verificar npm
npm --version
```

### 2. **Clone e Instale**
```bash
# Clone o projeto
git clone <repo-url>
cd muzzajazz-system

# Backend
cd backend
npm install --legacy-peer-deps
npx prisma migrate dev --name init

# Frontend (novo terminal)
cd ../frontend
npm install --legacy-peer-deps
```

### 3. **Configuração**
```bash
# Backend - copie e configure
cp .env.example .env
# Edite o .env com sua chave OpenAI

# Frontend - copie e configure
cp .env.local.example .env.local
```

### 4. **Executar**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. **Acessar**
- **Sistema**: http://localhost:3000
- **API**: http://localhost:3001

## 🔧 Configuração Detalhada

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="muzzajazz-super-secret-key"
OPENAI_API_KEY="sua-chave-openai-aqui"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

## 🎯 Primeiros Passos

### 1. **Testar Chatbot**
- Vá para http://localhost:3000/menu
- Clique no botão 🤖
- Converse sobre cardápio

### 2. **Acessar Admin**
- Vá para http://localhost:3000/admin
- Explore relatórios e configurações

### 3. **Instalar PWA**
- Recarregue a página
- Clique em "Instalar App"

### 4. **Testar Notificações**
- Clique no botão 🔔
- Permita notificações

## 🐛 Solução de Problemas

### Porta em Uso
```bash
# Matar processos
pkill -f tsx
pkill -f "next dev"

# Ou mudar porta no .env
PORT=3004
```

### Erro de Dependências
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Banco de Dados
```bash
# Resetar banco
cd backend
rm dev.db
npx prisma migrate dev --name init
```

## 📱 URLs Importantes

- **Home**: http://localhost:3000
- **Cardápio**: http://localhost:3000/menu
- **Admin**: http://localhost:3000/admin
- **Cozinha**: http://localhost:3000/kitchen
- **Config IA**: http://localhost:3000/admin/ai-config
- **Relatórios**: http://localhost:3000/admin/reports
- **Usuários**: http://localhost:3000/admin/users

## ✅ Checklist de Funcionamento

- [ ] Backend rodando na porta 3003
- [ ] Frontend rodando na porta 3000
- [ ] Chatbot respondendo
- [ ] PWA instalável
- [ ] Notificações funcionando
- [ ] Admin acessível
- [ ] Analytics carregando

## 🎷 Pronto para usar!

O sistema está configurado e funcionando. Explore todas as funcionalidades! 🎵✨