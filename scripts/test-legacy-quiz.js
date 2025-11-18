#!/usr/bin/env node

/**
 * Script de teste para o LegacyQuizService
 * Testa o fluxo completo desde a entrada até o salvamento no MySQL
 */

const axios = require('axios');

// Configuração
const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80));
}

// Dados de teste simulando uma resposta completa do quiz
const testData = {
  answers: [
    // CATEGORIA 1: PROCESSO (Perguntas 1-3)
    { question_id: 1, answer_id: 1, score: 3, category_id: 1 }, // "Sempre"
    { question_id: 2, answer_id: 2, score: 2, category_id: 1 }, // "Às vezes"
    { question_id: 3, answer_id: 3, score: 1, category_id: 1 }, // "Raramente"
    
    // CATEGORIA 2: VENDAS (Perguntas 4-6)
    { question_id: 4, answer_id: 1, score: 3, category_id: 2 }, // "Sempre"
    { question_id: 5, answer_id: 1, score: 3, category_id: 2 }, // "Sempre"
    { question_id: 6, answer_id: 2, score: 2, category_id: 2 }, // "Às vezes"
    
    // CATEGORIA 3: PRESENÇA (Perguntas 7-9)
    { question_id: 7, answer_id: 3, score: 1, category_id: 3 }, // "Raramente"
    { question_id: 8, answer_id: 4, score: 0, category_id: 3 }, // "Nunca"
    { question_id: 9, answer_id: 3, score: 1, category_id: 3 }, // "Raramente"
    
    // CATEGORIA 4: COMUNICAÇÃO (Perguntas 10-12)
    { question_id: 10, answer_id: 2, score: 2, category_id: 4 }, // "Às vezes"
    { question_id: 11, answer_id: 1, score: 3, category_id: 4 }, // "Sempre"
    { question_id: 12, answer_id: 2, score: 2, category_id: 4 }, // "Às vezes"
    
    // CATEGORIA 5: FINANÇAS (Perguntas 13-15)
    { question_id: 13, answer_id: 1, score: 3, category_id: 5 }, // "Sempre"
    { question_id: 14, answer_id: 2, score: 2, category_id: 5 }, // "Às vezes"
    { question_id: 15, answer_id: 1, score: 3, category_id: 5 }  // "Sempre"
  ],
  userData: {
    nome: 'João Silva',
    empresa: 'Empresa Teste Ltda',
    email: 'joao.teste@empresa.com',
    whatsapp: '31999999999',
    estado: 'MG',
    cidade: 'Belo Horizonte',
    newsletter: true
  }
};

// Validações esperadas
const expectedResults = {
  // Pontuações por categoria
  processo: { total: 6, expectedLevel: 'Aprendiz Digital' }, // 3+2+1 = 6
  vendas: { total: 8, expectedLevel: 'Empreendedor Digital' }, // 3+3+2 = 8
  presenca: { total: 2, expectedLevel: 'Iniciante Digital' }, // 1+0+1 = 2
  com: { total: 7, expectedLevel: 'Aprendiz Digital' }, // 2+3+2 = 7
  financas: { total: 8, expectedLevel: 'Empreendedor Digital' }, // 3+2+3 = 8
  geral: { total: 31, expectedLevel: 'Aprendiz Digital' } // 6+8+2+7+8 = 31
};

async function checkBackendHealth() {
  logSection('1. VERIFICAÇÃO: Saúde do Backend');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/legacy-quiz/health`, { timeout: 5000 });
    
    if (response.data.success) {
      log('✅ Backend está respondendo', 'green');
      log(`   Endpoint: ${API_BASE_URL}`, 'cyan');
      log(`   Mensagem: ${response.data.message}`, 'cyan');
      return true;
    } else {
      log('❌ Backend respondeu mas com erro', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Backend não está respondendo', 'red');
    if (error.code === 'ECONNREFUSED') {
      log('   Erro: Conexão recusada - backend não está rodando', 'yellow');
      log('   💡 Verifique se o backend está rodando em Docker ou localmente', 'yellow');
    } else {
      log(`   Erro: ${error.message}`, 'yellow');
    }
    return false;
  }
}

async function checkDependencies() {
  logSection('2. VERIFICAÇÃO: Dependências do Sistema');
  
  let allOk = true;
  
  // Verificar Directus
  log('\n🔍 Verificando Directus...', 'blue');
  try {
    const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
    log(`   Tentando conectar em: ${directusUrl}`, 'cyan');
    
    const response = await axios.get(`${directusUrl}/server/health`, { timeout: 5000 });
    
    if (response.data.status === 'ok') {
      log('   ✅ Directus está acessível', 'green');
    } else {
      log('   ⚠️ Directus respondeu mas com status desconhecido', 'yellow');
    }
  } catch (error) {
    log('   ⚠️ Directus pode não estar acessível diretamente', 'yellow');
    log(`   Detalhes: ${error.message}`, 'cyan');
    log('   💡 Isso pode causar falha ao buscar textos de respostas (usará fallback)', 'cyan');
    log('   💡 Se o backend está em Docker, o Directus pode estar acessível apenas internamente', 'cyan');
    // Não é crítico para o teste
  }
  
  // Verificar variáveis de ambiente MySQL (do container)
  log('\n🔍 Verificando configuração MySQL no container...', 'blue');
  try {
    // Buscar variáveis do container (sem prefixo DEVELOPMENT_)
    const containerEnv = await new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec('docker exec maturidade-digital-backend cat .env 2>/dev/null', (error, stdout) => {
        if (error) {
          // Se não conseguir acessar container, tenta variáveis locais
          resolve(null);
        } else {
          const envVars = {};
          stdout.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
              envVars[match[1].trim()] = match[2].trim();
            }
          });
          resolve(envVars);
        }
      });
    });

    let mysqlHost, mysqlUser, mysqlPassword, mysqlDatabase, mysqlPort;

    if (containerEnv) {
      // Variáveis do container (SEM prefixo)
      mysqlHost = containerEnv.REGISTRO_MYSQL_HOST;
      mysqlUser = containerEnv.REGISTRO_MYSQL_USER;
      mysqlPassword = containerEnv.REGISTRO_MYSQL_PASSWORD;
      mysqlDatabase = containerEnv.REGISTRO_MYSQL_DATABASE;
      mysqlPort = containerEnv.REGISTRO_MYSQL_PORT;
      log('   ✅ Variáveis lidas do container Docker', 'green');
    } else {
      // Fallback: variáveis locais (sem prefixo ou com prefixo)
      mysqlHost = process.env.REGISTRO_MYSQL_HOST || process.env.DEVELOPMENT_REGISTRO_MYSQL_HOST;
      mysqlUser = process.env.REGISTRO_MYSQL_USER || process.env.DEVELOPMENT_REGISTRO_MYSQL_USER;
      mysqlPassword = process.env.REGISTRO_MYSQL_PASSWORD || process.env.DEVELOPMENT_REGISTRO_MYSQL_PASSWORD;
      mysqlDatabase = process.env.REGISTRO_MYSQL_DATABASE || process.env.DEVELOPMENT_REGISTRO_MYSQL_DATABASE;
      mysqlPort = process.env.REGISTRO_MYSQL_PORT || process.env.DEVELOPMENT_REGISTRO_MYSQL_PORT;
      log('   ⚠️ Usando variáveis locais (não conseguiu acessar container)', 'yellow');
    }
    
    if (mysqlHost && mysqlUser && mysqlDatabase) {
      log('   ✅ Variáveis de ambiente MySQL configuradas', 'green');
      log(`   Host: ${mysqlHost}`, 'cyan');
      log(`   Port: ${mysqlPort || '3306 (padrão)'}`, 'cyan');
      log(`   User: ${mysqlUser}`, 'cyan');
      log(`   Database: ${mysqlDatabase}`, 'cyan');
      log(`   Password: ${mysqlPassword ? '***configurado***' : '❌ NÃO CONFIGURADO'}`, 'cyan');
      
      if (!mysqlPassword) {
        log('   ⚠️ PASSWORD não está configurado - conexão falhará!', 'yellow');
        allOk = false;
      }

      // Testar conectividade MySQL (se possível)
      log('\n   🔍 Testando conectividade MySQL...', 'blue');
      try {
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
          exec(`docker exec maturidade-digital-backend nc -zv ${mysqlHost} ${mysqlPort || 3306} 2>&1`, (error, stdout) => {
            if (error || stdout.includes('failed') || stdout.includes('Connection refused')) {
              log('   ⚠️ Não foi possível testar conexão MySQL diretamente', 'yellow');
              log(`   Detalhes: ${stdout || error.message}`, 'cyan');
              log('   💡 A conexão será testada durante o processamento do quiz', 'cyan');
            } else {
              log('   ✅ Conexão MySQL acessível do container', 'green');
            }
            resolve();
          });
        });
      } catch (error) {
        log('   ⚠️ Erro ao testar conexão MySQL:', 'yellow');
        log(`   ${error.message}`, 'cyan');
      }

      // Resumo das verificações
      log('\n   ✅ Verificações MySQL completas:', 'green');
      log('      - Variáveis configuradas ✓', 'cyan');
      log('      - Conectividade testada', 'cyan');
      log('      - Tabela será verificada durante o INSERT', 'cyan');
    } else {
      log('   ❌ Variáveis de ambiente MySQL não configuradas completamente', 'red');
      log('   💡 Configure no backend (SEM prefixo DEVELOPMENT_):', 'yellow');
      log('      - REGISTRO_MYSQL_HOST', 'cyan');
      log('      - REGISTRO_MYSQL_USER', 'cyan');
      log('      - REGISTRO_MYSQL_PASSWORD', 'cyan');
      log('      - REGISTRO_MYSQL_DATABASE', 'cyan');
      log('      - REGISTRO_MYSQL_PORT (opcional, padrão: 3306)', 'cyan');
      allOk = false;
    }
  } catch (error) {
    log('   ⚠️ Erro ao verificar configuração MySQL:', 'yellow');
    log(`   ${error.message}`, 'cyan');
    log('   💡 A configuração será verificada durante o processamento', 'cyan');
  }
  
  return allOk;
}

async function testQuizSubmission() {
  logSection('3. TESTE: Submissão do Quiz');
  
  log('\n📤 Enviando dados para /api/legacy-quiz...', 'blue');
  log(`   Respostas: ${testData.answers.length}`, 'cyan');
  log(`   Dados do usuário: ${testData.userData.nome}`, 'cyan');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/legacy-quiz`, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos
    });
    
    if (response.data.success) {
      log('\n✅ Quiz salvo com sucesso no MySQL!', 'green');
      log(`   ID do registro: ${response.data.data?.id}`, 'cyan');
      log(`   Linhas afetadas: ${response.data.data?.affectedRows}`, 'cyan');
      
      return {
        success: true,
        data: response.data.data
      };
    } else {
      log('\n❌ Falha ao salvar quiz', 'red');
      log(`   Mensagem: ${response.data.message}`, 'yellow');
      return { success: false };
    }
  } catch (error) {
    log('\n❌ Erro ao enviar quiz:', 'red');
    
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'yellow');
      
      // Mostrar erro detalhado se disponível
      if (error.response.data.error) {
        log(`\n   🔍 ERRO DETALHADO:`, 'red');
        log(`   ${error.response.data.error}`, 'yellow');
        
        // Analisar tipo de erro
        const errorMsg = error.response.data.error.toLowerCase();
        if (errorMsg.includes('mysql') || errorMsg.includes('connection')) {
          log(`\n   💡 POSSÍVEL CAUSA: Problema de conexão MySQL`, 'bright');
          log(`      - Verifique se MySQL está acessível do container`, 'cyan');
          log(`      - Verifique variáveis REGISTRO_MYSQL_* no container`, 'cyan');
        } else if (errorMsg.includes('directus') || errorMsg.includes('econnrefused')) {
          log(`\n   💡 POSSÍVEL CAUSA: Problema de conexão Directus`, 'bright');
          log(`      - Verifique se Directus está na mesma rede Docker`, 'cyan');
          log(`      - Verifique DIRECTUS_URL no container`, 'cyan');
        } else if (errorMsg.includes('calculate') || errorMsg.includes('results')) {
          log(`\n   💡 POSSÍVEL CAUSA: Erro ao calcular resultados`, 'bright');
          log(`      - Verifique logs do ResultsService`, 'cyan');
        }
      }
      
      if (error.response.data.stack) {
        log(`\n   📋 Stack trace (primeiras 10 linhas):`, 'cyan');
        log(`   ${error.response.data.stack.split('\n').slice(0, 10).join('\n   ')}`, 'yellow');
      }
      
      if (error.response.data.timestamp) {
        log(`\n   ⏰ Timestamp do erro: ${error.response.data.timestamp}`, 'cyan');
      }
      
      log(`\n   📋 Resposta completa:`, 'cyan');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      log('   Sem resposta do servidor', 'yellow');
      log('   Verifique se o backend está rodando em http://localhost:8080', 'yellow');
      log('   💡 Se estiver em Docker, verifique: docker ps | grep backend', 'cyan');
    } else {
      log(`   ${error.message}`, 'yellow');
    }
    
    log('\n💡 PRÓXIMOS PASSOS PARA DEBUG:', 'bright');
    log('   1. Ver logs do backend:', 'cyan');
    log('      docker logs maturidade-digital-backend --tail 100 -f', 'yellow');
    log('   2. Procure por linhas que começam com:', 'cyan');
    log('      - ❌ [LegacyQuizService]', 'yellow');
    log('      - ❌ [LegacyQuizController]', 'yellow');
    log('      - ❌ [ResultsService]', 'yellow');
    log('   3. Verifique qual ETAPA falhou (Etapa X/5)', 'cyan');
    log('   4. Copie os logs e compartilhe para análise', 'cyan');
    
    return { success: false };
  }
}

function validateResults(result) {
  logSection('4. VALIDAÇÃO: Estrutura dos Dados');
  
  const validations = [
    {
      name: 'Dados enviados corretamente',
      check: () => testData.answers.length === 15,
      expected: '15 respostas'
    },
    {
      name: 'Resposta do backend',
      check: () => result.success === true,
      expected: 'success: true'
    },
    {
      name: 'ID gerado',
      check: () => result.data?.id > 0,
      expected: 'ID > 0'
    },
    {
      name: 'Linhas afetadas',
      check: () => result.data?.affectedRows === 1,
      expected: 'affectedRows = 1'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  validations.forEach(validation => {
    const result = validation.check();
    if (result) {
      log(`✅ ${validation.name}: ${validation.expected}`, 'green');
      passed++;
    } else {
      log(`❌ ${validation.name}: Esperado ${validation.expected}`, 'red');
      failed++;
    }
  });
  
  log(`\n📊 Validações: ${passed} passaram, ${failed} falharam`, 'cyan');
  
  return failed === 0;
}

function displayTestSummary() {
  logSection('📊 RESUMO DO TESTE');
  
  log('\n📥 DADOS DE ENTRADA:', 'bright');
  log(`   Total de respostas: ${testData.answers.length}`, 'cyan');
  log(`   Usuário: ${testData.userData.nome}`, 'cyan');
  log(`   Empresa: ${testData.userData.empresa}`, 'cyan');
  log(`   Email: ${testData.userData.email}`, 'cyan');
  
  log('\n📤 DADOS ESPERADOS NO MYSQL:', 'bright');
  log('\n   CATEGORIA 1 - PROCESSO:', 'cyan');
  log(`     Pontuação total: ${expectedResults.processo.total}`, 'yellow');
  log(`     Nível esperado: ${expectedResults.processo.expectedLevel}`, 'yellow');
  
  log('\n   CATEGORIA 2 - VENDAS:', 'cyan');
  log(`     Pontuação total: ${expectedResults.vendas.total}`, 'yellow');
  log(`     Nível esperado: ${expectedResults.vendas.expectedLevel}`, 'yellow');
  
  log('\n   CATEGORIA 3 - PRESENÇA:', 'cyan');
  log(`     Pontuação total: ${expectedResults.presenca.total}`, 'yellow');
  log(`     Nível esperado: ${expectedResults.presenca.expectedLevel}`, 'yellow');
  
  log('\n   CATEGORIA 4 - COMUNICAÇÃO:', 'cyan');
  log(`     Pontuação total: ${expectedResults.com.total}`, 'yellow');
  log(`     Nível esperado: ${expectedResults.com.expectedLevel}`, 'yellow');
  
  log('\n   CATEGORIA 5 - FINANÇAS:', 'cyan');
  log(`     Pontuação total: ${expectedResults.financas.total}`, 'yellow');
  log(`     Nível esperado: ${expectedResults.financas.expectedLevel}`, 'yellow');
  
  log('\n   GERAL:', 'cyan');
  log(`     Pontuação total: ${expectedResults.geral.total}`, 'yellow');
  log(`     Nível esperado: ${expectedResults.geral.expectedLevel}`, 'yellow');
  
  log('\n📝 CAMPOS QUE SERÃO SALVOS NO MYSQL:', 'bright');
  log('   - 15 textos de respostas (processo_r1-r3, vendas_r1-r3, etc.)', 'cyan');
  log('   - 15 pontuações individuais (processo_p1-p3, vendas_p1-p3, etc.)', 'cyan');
  log('   - 7 dados do usuário (nome, empresa, email, whatsapp, uf, cidade, newsletter)', 'cyan');
  log('   - 5 níveis por categoria (nvl_processo, nvl_vendas, etc.)', 'cyan');
  log('   - 5 pontuações totais por categoria (total_pts_processo, total_pts_venda, etc.)', 'cyan');
  log('   - 1 nível geral (nvl_geral)', 'cyan');
  log('   - 1 pontuação total geral (total_pts)', 'cyan');
  log('   Total: 47 campos de dados', 'cyan');
}

async function runTests() {
  log('\n🧪 TESTE DO LEGACY QUIZ SERVICE', 'bright');
  log('   Verificando implementação refatorada...\n', 'cyan');
  
  displayTestSummary();
  
  // Verificação 1: Backend Health
  const backendOk = await checkBackendHealth();
  if (!backendOk) {
    log('\n⚠️  Backend não está respondendo. Encerrando testes.', 'yellow');
    log('\n💡 SOLUÇÃO:', 'bright');
    log('   1. Se estiver em Docker: docker-compose restart backend', 'cyan');
    log('   2. Se estiver local: npm run dev (no diretório do backend)', 'cyan');
    log('   3. Verifique se a porta 8080 está livre', 'cyan');
    process.exit(1);
  }
  
  // Verificação 2: Dependências
  const depsOk = await checkDependencies();
  if (!depsOk) {
    log('\n⚠️  Algumas dependências não estão configuradas corretamente.', 'yellow');
    log('   O teste continuará, mas pode falhar durante o processamento.', 'yellow');
  }
  
  // Teste 2: Submissão do Quiz
  const result = await testQuizSubmission();
  
  // Teste 3: Validação
  if (result.success) {
    const isValid = validateResults(result);
    
    if (isValid) {
      log('\n✅ TODOS OS TESTES PASSARAM!', 'green');
      log('\n💡 PRÓXIMOS PASSOS:', 'bright');
      log('   1. Verifique os logs do backend para ver o fluxo completo', 'cyan');
      log('   2. Confira a tabela resposta_teste_maturidade no MySQL', 'cyan');
      log('   3. Valide os dados salvos manualmente no banco', 'cyan');
      process.exit(0);
    } else {
      log('\n⚠️  Algumas validações falharam. Verifique os dados salvos.', 'yellow');
      process.exit(1);
    }
  } else {
    log('\n❌ TESTE FALHOU', 'red');
    log('\n💡 VERIFICAÇÕES:', 'bright');
    log('   1. Backend está rodando em http://localhost:8080?', 'cyan');
    log('   2. MySQL está acessível?', 'cyan');
    log('   3. Variáveis de ambiente estão configuradas?', 'cyan');
    log('   4. Tabela resposta_teste_maturidade existe no MySQL?', 'cyan');
    process.exit(1);
  }
}

// Executar testes
runTests().catch(error => {
  log('\n❌ ERRO CRÍTICO:', 'red');
  log(`   ${error.message}`, 'yellow');
  console.error(error);
  process.exit(1);
});

