#!/bin/bash

# Script helper para executar teste do Legacy Quiz Service

echo "🧪 TESTE DO LEGACY QUIZ SERVICE"
echo "================================"
echo ""

# Verificar se backend está rodando
echo "1️⃣ Verificando se o backend está rodando..."
if curl -s http://localhost:8080/api/legacy-quiz/health > /dev/null 2>&1; then
    echo "   ✅ Backend está rodando"
else
    echo "   ❌ Backend não está respondendo em http://localhost:8080"
    echo "   💡 Inicie o backend primeiro: npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ Executando teste completo..."
echo ""

# Executar script de teste
node scripts/test-legacy-quiz.js

# Código de saída do script
EXIT_CODE=$?

echo ""
echo "================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ TESTE CONCLUÍDO COM SUCESSO!"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Verifique os logs do backend"
    echo "   2. Confira a tabela resposta_teste_maturidade no MySQL"
    echo "   3. Valide os dados manualmente"
else
    echo "❌ TESTE FALHOU"
    echo ""
    echo "💡 Verifique:"
    echo "   1. Backend está rodando?"
    echo "   2. MySQL está acessível?"
    echo "   3. Variáveis de ambiente estão configuradas?"
    echo "   4. Tabela resposta_teste_maturidade existe?"
fi

exit $EXIT_CODE

