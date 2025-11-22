# Configuração da API Meta Sebrae

Este documento descreve as variáveis de ambiente necessárias para integrar com a API Meta Sebrae.

## Variáveis de Ambiente Obrigatórias

```env
# URL base da API Meta Sebrae
META_SEBRAE_URL=https://api.partner.sebraemg.com.br/v1
# ou
META_SEBRAE_API_URL=https://api.partner.sebraemg.com.br/v1

# API Key (JWT token)
META_SEBRAE_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
# ou
META_SEBRAE_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Variáveis de Ambiente Opcionais (com valores padrão)

```env
# Timeout da requisição (em ms, padrão: 30000)
META_SEBRAE_TIMEOUT=30000

# Credencial (padrão: "maturidadedigital")
META_SEBRAE_CREDENTIAL=maturidadedigital

# Código do projeto (padrão: "829f8355-6d5c-47de-beb8-f2c0184e2f34")
META_SEBRAE_COD_PROJETO=829f8355-6d5c-47de-beb8-f2c0184e2f34

# Código da ação (padrão: "421588")
META_SEBRAE_COD_ACAO=421588

# ID da origem (padrão: 36)
META_SEBRAE_ORIGIN_ID=36

# Código do meio de atendimento (padrão: 11)
META_SEBRAE_COD_MEIO_ATENDIMENTO=11

# Código da categoria (padrão: 19)
META_SEBRAE_COD_CATEGORIA=19

# ID do tema (padrão: 10101)
META_SEBRAE_THEME_ID=10101
```

## Variáveis de Ambiente por Ambiente

### Desenvolvimento
```env
DEVELOPMENT_META_API_URL=https://dev.api.partner.sebraemg.com.br/v1
DEVELOPMENT_META_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Produção
```env
PRODUCTION_META_API_URL=https://api.partner.sebraemg.com.br/v1
PRODUCTION_META_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Estrutura de Dados Enviados

A API Meta Sebrae recebe um array de interações no formato:

```json
[
  {
    "company": "12345678000190",
    "nome": "Nome do Usuário",
    "date_hour_start": "2025-11-22T21:00:00.000Z",
    "date_hour_end": "2025-11-22T22:00:00.000Z",
    "carga_horaria": "1",
    "theme_id": 10101,
    "code_integration": "2025-11-22T21:00:00.000Z",
    "type": "APLICATIVO",
    "title": "Maturidade Digital",
    "description": "Diagnóstico preenchido pelo usuário Nome do Usuário",
    "credential": "maturidadedigital",
    "cod_projeto": "829f8355-6d5c-47de-beb8-f2c0184e2f34",
    "cod_acao": "421588",
    "instrumento": "Diagnóstico",
    "nome_realizacao": "Atendimento Remoto",
    "tipo_realizacao": "PRT",
    "origin_id": 36,
    "cod_meio_atendimento": 11,
    "cod_categoria": 19,
    "orientacao_cliente": "orientacao"
  }
]
```

## Endpoints Utilizados

- **POST /interaction**: Registra interação de diagnóstico
- **POST /company/link**: Vincula empresa no Sebrae (endpoint pode precisar ser ajustado conforme documentação real)

## Notas Importantes

1. O serviço **não bloqueia** o salvamento no Directus se a API Meta Sebrae falhar
2. O vínculo de empresa é tentado antes de registrar a interação, mas também não bloqueia se falhar
3. Todos os erros são logados mas não interrompem o fluxo principal
4. O CNPJ é enviado sem formatação (apenas números)
5. O código de integração usa o timestamp ISO do diagnóstico como identificador único

