#!/bin/bash

echo "🎷 Configurando Sistema Muzzajazz..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_color() {
    printf "${1}${2}${NC}\n"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_color $RED "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_color $YELLOW "⚠️  Docker não encontrado. Instalação manual será necessária."
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

print_color $BLUE "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

print_color $BLUE "📦 Instalando dependências do frontend..."
cd frontend
npm install
cd ..

print_color $BLUE "⚙️  Configurando variáveis de ambiente..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_color $YELLOW "📝 Arquivo .env criado. Configure suas variáveis antes de continuar."
fi

if [ ! -f backend/.env ]; then
    cp .env.example backend/.env
fi

if [ ! -f frontend/.env.local ]; then
    cp .env.example frontend/.env.local
fi

if [ "$DOCKER_AVAILABLE" = true ]; then
    print_color $BLUE "🐳 Iniciando banco de dados com Docker..."
    docker-compose up -d postgres redis
    
    print_color $BLUE "⏳ Aguardando banco de dados..."
    sleep 10
    
    print_color $BLUE "🗄️  Executando migrações do banco..."
    cd backend
    npx prisma migrate dev --name init
    npx prisma generate
    cd ..
else
    print_color $YELLOW "⚠️  Configure manualmente o PostgreSQL e execute:"
    print_color $YELLOW "   cd backend && npx prisma migrate dev && npx prisma generate"
fi

print_color $GREEN "✅ Configuração concluída!"
print_color $BLUE "🚀 Para iniciar o sistema:"
print_color $BLUE "   Backend:  cd backend && npm run dev"
print_color $BLUE "   Frontend: cd frontend && npm run dev"
print_color $BLUE ""
print_color $BLUE "🌐 URLs:"
print_color $BLUE "   Cliente:  http://localhost:3000"
print_color $BLUE "   Admin:    http://localhost:3000/admin"
print_color $BLUE "   Cozinha:  http://localhost:3000/kitchen"
print_color $BLUE "   API:      http://localhost:3001"
print_color $BLUE ""
print_color $GREEN "🎷 Muzzajazz está pronto para funcionar!"