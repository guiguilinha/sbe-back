#!/usr/bin/env node

/**
 * Script principal para testar todas as conexões do sistema
 * Testa: Directus, MySQL Legado, Keycloak e CPE Backend
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');
const mysql = require('mysql2/promise');
const URLSearchParams = require('url').URLSearchParams;

const results = {
  directus: { status: 'PENDING', message: '', duration: 0 },
  mysql: { status: 'PENDING', message: '', duration: 0 },
  keycloak: { status: 'PENDING', message: '', duration: 0 },
  cpe: { status: 'PENDING', message: '', duration: 0 }
};

async function testDirectusConnection() {
  const startTime = Date.now();
  console.log('\n📊 Testando conexão Directus...');
  
  try {
    const directusUrl = process.env.DIRECTUS_URL || process.env.DEVELOPMENT_DIRECTUS_URL;
    const directusToken = process.env.DIRECTUS_TOKEN || process.env.DEVELOPMENT_DIRECTUS_TOKEN;
    
    if (!directusUrl) {
      throw new Error('DIRECTUS_URL não configurada');
    }
    
    if (!directusToken) {
      throw new Error('DIRECTUS_TOKEN não configurada');
    }
    
    console.log(`   URL: ${directusUrl}`);
    console.log(`   Token: ${directusToken.substring(0, 20)}...`);
    
    // 1. Health check
    console.log('   Testando health check...');
    const healthResponse = await axios.get(`${directusUrl}/server/health`, {
      timeout: 5000
    });
    
    if (healthResponse.data.status !== 'ok') {
      throw new Error(`Health check retornou status: ${healthResponse.data.status}`);
    }
    console.log('   ✅ Health check OK');
    
    // 2. Testar autenticação com token
    console.log('   Testando autenticação...');
    const authResponse = await axios.get(`${directusUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`
      },
      timeout: 5000
    });
    
    if (!authResponse.data.data) {
      throw new Error('Autenticação falhou - dados do usuário não retornados');
    }
    console.log('   ✅ Autenticação OK');
    
    // 3. Testar query simples
    console.log('   Testando query em collection users...');
    const queryResponse = await axios.get(`${directusUrl}/items/users?limit=1`, {
      headers: {
        'Authorization': `Bearer ${directusToken}`
      },
      timeout: 10000
    });
    
    console.log(`   ✅ Query OK (${queryResponse.data.data?.length || 0} registros encontrados)`);
    
    const duration = Date.now() - startTime;
    results.directus = {
      status: 'PASS',
      message: 'Conexão Directus funcionando corretamente',
      duration
    };
    console.log(`   ✅ Directus: PASS (${duration}ms)`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    results.directus = {
      status: 'FAIL',
      message: error.message || 'Erro desconhecido',
      duration
    };
    console.log(`   ❌ Directus: FAIL - ${error.message}`);
  }
}

async function testMySQLConnection() {
  const startTime = Date.now();
  console.log('\n💾 Testando conexão MySQL Legado...');
  
  try {
    const host = process.env.REGISTRO_MYSQL_HOST || process.env.DEVELOPMENT_REGISTRO_MYSQL_HOST;
    const port = parseInt(process.env.REGISTRO_MYSQL_PORT || process.env.DEVELOPMENT_REGISTRO_MYSQL_PORT || '3306');
    const user = process.env.REGISTRO_MYSQL_USER || process.env.DEVELOPMENT_REGISTRO_MYSQL_USER;
    const password = process.env.REGISTRO_MYSQL_PASSWORD || process.env.DEVELOPMENT_REGISTRO_MYSQL_PASSWORD;
    const database = process.env.REGISTRO_MYSQL_DATABASE || process.env.DEVELOPMENT_REGISTRO_MYSQL_DATABASE;
    
    if (!host || !user || !database) {
      throw new Error('Variáveis MySQL não configuradas completamente');
    }
    
    console.log(`   Host: ${host}:${port}`);
    console.log(`   Database: ${database}`);
    console.log(`   User: ${user}`);
    
    // 1. Criar conexão
    console.log('   Criando conexão...');
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 10000
    });
    
    console.log('   ✅ Conexão estabelecida');
    
    // 2. Testar query
    console.log('   Testando query SELECT 1...');
    const [rows] = await connection.execute('SELECT 1 as test, DATABASE() as db, USER() as user');
    
    if (rows.length === 0) {
      throw new Error('Query não retornou resultados');
    }
    
    console.log(`   ✅ Query OK (DB: ${rows[0].db}, User: ${rows[0].user})`);
    
    // 3. Verificar se tabela existe (opcional)
    console.log('   Verificando estrutura...');
    const [tables] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?",
      [database]
    );
    
    console.log(`   ✅ Database possui ${tables[0].count} tabelas`);
    
    await connection.end();
    
    const duration = Date.now() - startTime;
    results.mysql = {
      status: 'PASS',
      message: 'Conexão MySQL funcionando corretamente',
      duration
    };
    console.log(`   ✅ MySQL: PASS (${duration}ms)`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    results.mysql = {
      status: 'FAIL',
      message: error.message || 'Erro desconhecido',
      duration
    };
    console.log(`   ❌ MySQL: FAIL - ${error.message}`);
  }
}

async function testKeycloakConnection() {
  const startTime = Date.now();
  console.log('\n🔐 Testando conexão Keycloak...');
  
  try {
    // Verificar variáveis de ambiente
    const authServerUrl = process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL || 
                         process.env.DEVELOPMENT_KEYCLOAK_AUTH_SERVER_URL;
    const realm = process.env.KEYCLOAK_BACKEND_REALM || 
                  process.env.DEVELOPMENT_KEYCLOAK_REALM;
    const clientId = process.env.KEYCLOAK_BACKEND_RESOURCE || 
                     process.env.DEVELOPMENT_KEYCLOAK_RESOURCE;
    const clientSecret = process.env.KEYCLOAK_BACKEND_SECRET || 
                         process.env.DEVELOPMENT_KEYCLOAK_SECRET;
    
    if (!authServerUrl || !realm || !clientId || !clientSecret) {
      throw new Error('Variáveis Keycloak não configuradas completamente');
    }
    
    console.log(`   Auth Server: ${authServerUrl}`);
    console.log(`   Realm: ${realm}`);
    console.log(`   Client ID: ${clientId}`);
    
    // 1. Obter token de serviço via client_credentials
    console.log('   Obtendo token de serviço...');
    const tokenUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    
    const tokenResponse = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });
    
    if (!tokenResponse.data.access_token) {
      throw new Error('Token de acesso não encontrado na resposta');
    }
    
    const serviceToken = tokenResponse.data.access_token;
    
    // 2. Validar formato JWT
    console.log('   Validando formato do token...');
    const tokenParts = serviceToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Token não é um JWT válido (deve ter 3 partes)');
    }
    
    console.log(`   ✅ Token obtido (${serviceToken.length} caracteres)`);
    console.log('   ✅ Token é JWT válido');
    
    const duration = Date.now() - startTime;
    results.keycloak = {
      status: 'PASS',
      message: 'Conexão Keycloak funcionando corretamente',
      duration,
      tokenLength: serviceToken.length
    };
    console.log(`   ✅ Keycloak: PASS (${duration}ms)`);
    
    return serviceToken; // Retornar token para uso no teste CPE
    
  } catch (error) {
    const duration = Date.now() - startTime;
    results.keycloak = {
      status: 'FAIL',
      message: error.message || 'Erro desconhecido',
      duration
    };
    console.log(`   ❌ Keycloak: FAIL - ${error.message}`);
    return null;
  }
}

async function testCpeConnection(serviceToken) {
  const startTime = Date.now();
  console.log('\n🏢 Testando conexão CPE Backend...');
  
  try {
    if (!serviceToken) {
      throw new Error('Token de serviço do Keycloak não disponível');
    }
    
    const cpeUrl = process.env.CPE_BACKEND_URL || process.env.DEVELOPMENT_CPE_URL;
    
    if (!cpeUrl) {
      throw new Error('CPE_BACKEND_URL não configurada');
    }
    
    console.log(`   URL: ${cpeUrl}`);
    
    // 1. Testar endpoint com CPF de teste
    console.log('   Testando endpoint /vinculo-empresa...');
    const testCpf = '00000000000'; // CPF de teste
    const endpointUrl = `${cpeUrl}/vinculo-empresa?cpf=${testCpf}`;
    
    const response = await axios.get(endpointUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceToken}`
      }
    });
    
    // A resposta pode ser array vazio ou erro, mas o importante é que o endpoint respondeu
    const responseType = Array.isArray(response.data) ? 'array' : typeof response.data;
    console.log(`   ✅ Endpoint respondeu (status: ${response.status}, tipo: ${responseType})`);
    
    const duration = Date.now() - startTime;
    results.cpe = {
      status: 'PASS',
      message: 'Conexão CPE Backend funcionando corretamente',
      duration
    };
    console.log(`   ✅ CPE: PASS (${duration}ms)`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    // Se for erro 404 ou 400, pode ser normal (CPF inválido), mas endpoint respondeu
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      results.cpe = {
        status: 'PASS',
        message: 'Endpoint respondeu (erro esperado para CPF de teste)',
        duration
      };
      console.log(`   ✅ CPE: PASS (${duration}ms) - Endpoint respondeu com erro esperado`);
    } else {
      results.cpe = {
        status: 'FAIL',
        message: error.message || 'Erro desconhecido',
        duration
      };
      console.log(`   ❌ CPE: FAIL - ${error.message}`);
    }
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TESTE DE CONEXÕES - Sistema de Maturidade Digital');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Data/Hora: ${new Date().toISOString()}\n`);
  
  // Executar testes em sequência
  await testDirectusConnection();
  await testMySQLConnection();
  const serviceToken = await testKeycloakConnection();
  await testCpeConnection(serviceToken);
  
  // Resumo final
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════════════');
  
  const totalDuration = Object.values(results).reduce((sum, r) => sum + r.duration, 0);
  const passed = Object.values(results).filter(r => r.status === 'PASS').length;
  const failed = Object.values(results).filter(r => r.status === 'FAIL').length;
  
  console.log(`\nTotal de testes: ${Object.keys(results).length}`);
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`⏱️  Tempo total: ${totalDuration}ms\n`);
  
  Object.entries(results).forEach(([name, result]) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${name.toUpperCase()}: ${result.status} (${result.duration}ms)`);
    if (result.status === 'FAIL') {
      console.log(`   Erro: ${result.message}`);
    }
  });
  
  console.log('\n═══════════════════════════════════════════════════════\n');
  
  // Retornar código de saída apropriado
  process.exit(failed > 0 ? 1 : 0);
}

// Executar testes
runAllTests().catch(error => {
  console.error('\n❌ Erro fatal ao executar testes:', error);
  process.exit(1);
});

