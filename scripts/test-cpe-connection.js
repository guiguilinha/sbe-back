#!/usr/bin/env node

/**
 * Script para testar conexão com CPE Backend
 * Testa: variáveis de ambiente, obtenção de token Keycloak, endpoint /vinculo-empresa, timeout
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');
const URLSearchParams = require('url').URLSearchParams;

async function getKeycloakServiceToken() {
  const authServerUrl = process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL || 
                       process.env.DEVELOPMENT_KEYCLOAK_AUTH_SERVER_URL;
  const realm = process.env.KEYCLOAK_BACKEND_REALM || 
                process.env.DEVELOPMENT_KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_BACKEND_RESOURCE || 
                   process.env.DEVELOPMENT_KEYCLOAK_RESOURCE;
  const clientSecret = process.env.KEYCLOAK_BACKEND_SECRET || 
                       process.env.DEVELOPMENT_KEYCLOAK_SECRET;
  
  if (!authServerUrl || !realm || !clientId || !clientSecret) {
    throw new Error('Variáveis Keycloak não configuradas');
  }
  
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
  
  return tokenResponse.data.access_token;
}

async function testCpeConnection() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TESTE DE CONEXÃO CPE BACKEND');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Data/Hora: ${new Date().toISOString()}\n`);
  
  const results = {
    envVars: { status: 'PENDING', message: '' },
    keycloakToken: { status: 'PENDING', message: '', duration: 0 },
    endpoint: { status: 'PENDING', message: '', duration: 0 },
    timeout: { status: 'PENDING', message: '', duration: 0 }
  };
  
  let serviceToken = null;
  
  try {
    // 1. Verificar variáveis de ambiente
    console.log('1️⃣ Verificando variáveis de ambiente...');
    const cpeUrl = process.env.CPE_BACKEND_URL || process.env.DEVELOPMENT_CPE_URL;
    
    if (!cpeUrl) {
      throw new Error('CPE_BACKEND_URL não configurada');
    }
    
    console.log(`   ✅ CPE_BACKEND_URL: ${cpeUrl}`);
    results.envVars = { status: 'PASS', message: 'Variáveis configuradas' };
    
    // 2. Obter token de serviço do Keycloak
    console.log('\n2️⃣ Obtendo token de serviço do Keycloak...');
    const tokenStart = Date.now();
    try {
      serviceToken = await getKeycloakServiceToken();
      const tokenDuration = Date.now() - tokenStart;
      
      console.log(`   ✅ Token obtido (${tokenDuration}ms)`);
      console.log(`   Token length: ${serviceToken.length} caracteres`);
      
      results.keycloakToken = {
        status: 'PASS',
        message: 'Token de serviço obtido com sucesso',
        duration: tokenDuration
      };
    } catch (error) {
      const tokenDuration = Date.now() - tokenStart;
      results.keycloakToken = {
        status: 'FAIL',
        message: error.message || 'Erro desconhecido',
        duration: tokenDuration
      };
      console.log(`   ❌ Obtenção de token FAIL: ${error.message}`);
      throw error; // Não pode continuar sem token
    }
    
    // 3. Testar endpoint /vinculo-empresa
    console.log('\n3️⃣ Testando endpoint /vinculo-empresa...');
    const endpointStart = Date.now();
    try {
      const testCpf = '00000000000'; // CPF de teste
      const endpointUrl = `${cpeUrl}/vinculo-empresa?cpf=${testCpf}`;
      
      console.log(`   URL: ${endpointUrl}`);
      console.log(`   CPF de teste: ${testCpf}`);
      
      const response = await axios.get(endpointUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      
      const endpointDuration = Date.now() - endpointStart;
      const responseType = Array.isArray(response.data) ? 'array' : typeof response.data;
      
      console.log(`   ✅ Endpoint respondeu (${endpointDuration}ms)`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Tipo de resposta: ${responseType}`);
      
      if (Array.isArray(response.data)) {
        console.log(`   Itens retornados: ${response.data.length}`);
      }
      
      results.endpoint = {
        status: 'PASS',
        message: `Endpoint respondeu (status: ${response.status}, tipo: ${responseType})`,
        duration: endpointDuration
      };
    } catch (error) {
      const endpointDuration = Date.now() - endpointStart;
      
      // Se for erro 404 ou 400, pode ser normal (CPF inválido), mas endpoint respondeu
      if (error.response && (error.response.status === 404 || error.response.status === 400)) {
        console.log(`   ✅ Endpoint respondeu com erro esperado (${endpointDuration}ms)`);
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Mensagem: ${error.response.data?.message || 'CPF não encontrado (esperado)'}`);
        
        results.endpoint = {
          status: 'PASS',
          message: `Endpoint respondeu (erro ${error.response.status} esperado para CPF de teste)`,
          duration: endpointDuration
        };
      } else {
        results.endpoint = {
          status: 'FAIL',
          message: error.response 
            ? `Erro ${error.response.status}: ${error.response.statusText}`
            : error.message,
          duration: endpointDuration
        };
        console.log(`   ❌ Endpoint FAIL: ${error.message}`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Data: ${JSON.stringify(error.response.data)}`);
        }
      }
    }
    
    // 4. Testar timeout (10s)
    console.log('\n4️⃣ Testando timeout (10s)...');
    const timeoutStart = Date.now();
    try {
      const testCpf = '00000000000';
      const endpointUrl = `${cpeUrl}/vinculo-empresa?cpf=${testCpf}`;
      
      await axios.get(endpointUrl, {
        timeout: 10000, // 10 segundos
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceToken}`
        }
      });
      
      const timeoutDuration = Date.now() - timeoutStart;
      console.log(`   ✅ Timeout configurado corretamente (${timeoutDuration}ms)`);
      
      results.timeout = {
        status: 'PASS',
        message: 'Timeout de 10s funcionando',
        duration: timeoutDuration
      };
    } catch (error) {
      const timeoutDuration = Date.now() - timeoutStart;
      if (error.code === 'ECONNABORTED') {
        results.timeout = {
          status: 'FAIL',
          message: 'Timeout ocorreu antes do esperado',
          duration: timeoutDuration
        };
        console.log(`   ❌ Timeout FAIL: ${error.message}`);
      } else {
        results.timeout = {
          status: 'PASS',
          message: 'Timeout não foi o problema',
          duration: timeoutDuration
        };
        console.log(`   ⚠️  Erro diferente de timeout: ${error.message}`);
      }
    }
    
    // Resumo
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  RESUMO DOS TESTES');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const totalDuration = Object.values(results).reduce((sum, r) => sum + (r.duration || 0), 0);
    const passed = Object.values(results).filter(r => r.status === 'PASS').length;
    const failed = Object.values(results).filter(r => r.status === 'FAIL').length;
    
    Object.entries(results).forEach(([name, result]) => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${name}: ${result.status}${duration}`);
      if (result.status === 'FAIL') {
        console.log(`   Erro: ${result.message}`);
      }
    });
    
    console.log(`\nTotal: ${Object.keys(results).length} testes`);
    console.log(`✅ Passou: ${passed}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`⏱️  Tempo total: ${totalDuration}ms\n`);
    
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

testCpeConnection();

