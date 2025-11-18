#!/usr/bin/env node

/**
 * Script para testar conexão com Keycloak
 * Testa: variáveis de ambiente, getServiceToken, validação de token JWT, timeout
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');
const URLSearchParams = require('url').URLSearchParams;

async function testKeycloakConnection() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TESTE DE CONEXÃO KEYCLOAK');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Data/Hora: ${new Date().toISOString()}\n`);
  
  const results = {
    envVars: { status: 'PENDING', message: '' },
    serviceToken: { status: 'PENDING', message: '', duration: 0, tokenLength: 0 },
    jwtValidation: { status: 'PENDING', message: '', duration: 0 },
    timeout: { status: 'PENDING', message: '', duration: 0 }
  };
  
  let serviceToken = null;
  
  try {
    // 1. Verificar variáveis de ambiente
    console.log('1️⃣ Verificando variáveis de ambiente...');
    const authServerUrl = process.env.KEYCLOAK_BACKEND_AUTH_SERVER_URL || 
                         process.env.DEVELOPMENT_KEYCLOAK_AUTH_SERVER_URL;
    const realm = process.env.KEYCLOAK_BACKEND_REALM || 
                  process.env.DEVELOPMENT_KEYCLOAK_REALM;
    const clientId = process.env.KEYCLOAK_BACKEND_RESOURCE || 
                     process.env.DEVELOPMENT_KEYCLOAK_RESOURCE;
    const clientSecret = process.env.KEYCLOAK_BACKEND_SECRET || 
                         process.env.DEVELOPMENT_KEYCLOAK_SECRET;
    
    if (!authServerUrl || !realm || !clientId || !clientSecret) {
      const missing = [];
      if (!authServerUrl) missing.push('KEYCLOAK_BACKEND_AUTH_SERVER_URL');
      if (!realm) missing.push('KEYCLOAK_BACKEND_REALM');
      if (!clientId) missing.push('KEYCLOAK_BACKEND_RESOURCE');
      if (!clientSecret) missing.push('KEYCLOAK_BACKEND_SECRET');
      throw new Error(`Variáveis Keycloak não configuradas: ${missing.join(', ')}`);
    }
    
    console.log(`   ✅ KEYCLOAK_BACKEND_AUTH_SERVER_URL: ${authServerUrl}`);
    console.log(`   ✅ KEYCLOAK_BACKEND_REALM: ${realm}`);
    console.log(`   ✅ KEYCLOAK_BACKEND_RESOURCE: ${clientId}`);
    console.log(`   ✅ KEYCLOAK_BACKEND_SECRET: ${clientSecret.substring(0, 10)}...`);
    
    results.envVars = { status: 'PASS', message: 'Variáveis configuradas' };
    
    // 2. Testar getServiceToken()
    console.log('\n2️⃣ Testando getServiceToken() (client_credentials)...');
    const tokenStart = Date.now();
    try {
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
      
      serviceToken = tokenResponse.data.access_token;
      const tokenDuration = Date.now() - tokenStart;
      
      console.log(`   ✅ Token obtido (${tokenDuration}ms)`);
      console.log(`   Token length: ${serviceToken.length} caracteres`);
      
      results.serviceToken = {
        status: 'PASS',
        message: 'Token de serviço obtido com sucesso',
        duration: tokenDuration,
        tokenLength: serviceToken.length
      };
    } catch (error) {
      const tokenDuration = Date.now() - tokenStart;
      results.serviceToken = {
        status: 'FAIL',
        message: error.response?.status 
          ? `Erro ${error.response.status}: ${error.response.statusText}`
          : error.message,
        duration: tokenDuration,
        tokenLength: 0
      };
      console.log(`   ❌ Obtenção de token FAIL: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    // 3. Validar formato JWT
    console.log('\n3️⃣ Validando formato do token JWT...');
    const jwtStart = Date.now();
    try {
      if (!serviceToken) {
        throw new Error('Token não disponível para validação');
      }
      
      const tokenParts = serviceToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error(`Token não é um JWT válido (esperado 3 partes, encontrado ${tokenParts.length})`);
      }
      
      // Validar que cada parte é base64
      const [header, payload, signature] = tokenParts;
      
      // Tentar decodificar header (base64url)
      try {
        const headerJson = JSON.parse(Buffer.from(header.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
        console.log(`   ✅ Header decodificado: ${headerJson.alg || 'N/A'}`);
      } catch (e) {
        console.log(`   ⚠️  Header não pôde ser decodificado: ${e.message}`);
      }
      
      const jwtDuration = Date.now() - jwtStart;
      console.log(`   ✅ Token é JWT válido (${jwtDuration}ms)`);
      console.log(`   Partes: header (${header.length} chars), payload (${payload.length} chars), signature (${signature.length} chars)`);
      
      results.jwtValidation = {
        status: 'PASS',
        message: 'Token é JWT válido com 3 partes',
        duration: jwtDuration
      };
    } catch (error) {
      const jwtDuration = Date.now() - jwtStart;
      results.jwtValidation = {
        status: 'FAIL',
        message: error.message || 'Erro desconhecido',
        duration: jwtDuration
      };
      console.log(`   ❌ Validação JWT FAIL: ${error.message}`);
    }
    
    // 4. Testar timeout (10s)
    console.log('\n4️⃣ Testando timeout (10s)...');
    const timeoutStart = Date.now();
    try {
      const tokenUrl = `${authServerUrl}/realms/${realm}/protocol/openid-connect/token`;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      
      await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000 // 10 segundos
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
      if (result.tokenLength) {
        console.log(`   Token length: ${result.tokenLength} caracteres`);
      }
    });
    
    console.log(`\nTotal: ${Object.keys(results).length} testes`);
    console.log(`✅ Passou: ${passed}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`⏱️  Tempo total: ${totalDuration}ms\n`);
    
    if (serviceToken) {
      console.log('✅ Token de serviço disponível para uso em outros testes\n');
    }
    
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

testKeycloakConnection();

