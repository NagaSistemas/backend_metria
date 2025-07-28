#!/bin/bash

echo "🎷 INICIANDO SISTEMA MUZZAJAZZ UNIFICADO"
echo "========================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto muzzajazz-system"
    exit 1
fi

# Iniciar backend
log "🚀 Iniciando Backend (Porta 3001)..."
cd backend
if [ ! -d "node_modules" ]; then
    log "📦 Instalando dependências do backend..."
    npm install
fi

# Verificar banco de dados
if [ ! -f "prisma/dev.db" ]; then
    log "🗄️ Criando banco de dados..."
    npx prisma db push
fi

# Iniciar backend em background
npm run dev &
BACKEND_PID=$!
log "✅ Backend iniciado (PID: $BACKEND_PID)"

cd ..

# Aguardar backend inicializar
sleep 3

# Iniciar frontend
log "🎨 Iniciando Frontend Unificado (Porta 3000)..."
cd cardapio-digital

if [ ! -d "node_modules" ]; then
    log "📦 Instalando dependências do frontend..."
    npm install
fi

# Iniciar frontend em background
npm run dev &
FRONTEND_PID=$!
log "✅ Frontend iniciado (PID: $FRONTEND_PID)"

cd ..

# Aguardar inicialização completa
sleep 5

echo ""
log "🎉 SISTEMA MUZZAJAZZ INICIADO COM SUCESSO!"
echo ""
echo -e "${BLUE}📱 URLs Disponíveis:${NC}"
echo -e "   🍕 Cardápio:     ${GREEN}http://localhost:3000${NC}"
echo -e "   ⚙️  Admin:        ${GREEN}http://localhost:3000/admin${NC}"
echo -e "   🍳 Cozinha:      ${GREEN}http://localhost:3000/kitchen${NC}"
echo -e "   🔧 API:          ${GREEN}http://localhost:3001${NC}"
echo ""
echo -e "${YELLOW}💡 Funcionalidades Ativas:${NC}"
echo "   ✅ PWA Instalável"
echo "   ✅ Gamificação Jazz Master"
echo "   ✅ Analytics Premium com IA"
echo "   ✅ WhatsApp Business"
echo "   ✅ IA Charlie Conversacional"
echo "   ✅ Assistente de Voz"
echo "   ✅ Realidade Aumentada"
echo "   ✅ Multi-Restaurante Enterprise"
echo "   ✅ Sistema de Reservas"
echo "   ✅ Pagamentos Asaas"
echo ""
echo -e "${GREEN}🎷 Aprecie a vida como uma boa música!${NC}"
echo ""

# Função para cleanup ao sair
cleanup() {
    echo ""
    log "🛑 Parando sistema..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    log "✅ Sistema parado com sucesso!"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Manter script rodando
log "⌨️  Pressione Ctrl+C para parar o sistema"
wait