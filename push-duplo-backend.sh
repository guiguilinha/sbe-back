#!/bin/bash

echo "Ì∫Ä Iniciando push duplo do Backend..."
echo ""

echo "Ì≥§ Push para GitHub..."
git push github merge-sebrae-frontend
if [ $? -eq 0 ]; then
    echo "‚úÖ GitHub: Push realizado com sucesso!"
else
    echo "‚ùå GitHub: Erro no push"
    exit 1
fi

echo ""
echo "Ì≥§ Push para Sebrae Backend..."
git push sebrae-backend merge-sebrae-frontend
if [ $? -eq 0 ]; then
    echo "‚úÖ Sebrae Backend: Push realizado com sucesso!"
else
    echo "‚ùå Sebrae Backend: Erro no push"
    exit 1
fi

echo ""
echo "Ìæâ Push duplo do Backend conclu√≠do com sucesso!"
echo "Ì≥ä Reposit√≥rios atualizados:"
echo "   - GitHub: https://github.com/guiguilinha/digital.git"
echo "   - Sebrae Backend: https://git.sebraemg.com.br/maturidade_digital/maturidade_digital_backend.git"
