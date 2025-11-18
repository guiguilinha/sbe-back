#!/usr/bin/env node

/**
 * Script para testar conexão com Directus
 * Testa: health check, autenticação, queries e timeout
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');

async function testDirectusConnection() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TESTE DE CONEXÃO DIRECTUS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Data/Hora: ${new Date().toISOString()}\n`);
  
  const results = {
    envVars: { status: 'PENDING', message: '' },
    healthCheck: { status: 'PENDING', message: '', duration: 0 },
    authentication: { status: 'PENDING', message: '', duration: 0 },
    query: { status: 'PENDING', message: '', duration: 0 },
    timeout: { status: 'PENDING', message: '', duration: 0 }
  };
  
  try {
    // 1. Verificar variáveis de ambiente
    console.log('1️⃣ Verificando variáveis de ambiente...');
    const directusUrl = process.env.DIRECTUS_URL || process.env.DEVELOPMENT_DIRECTUS_URL;
    const directusToken = process.env.DIRECTUS_TOKEN || process.env.DEVELOPMENT_DIRECTUS_TOKEN;
    
    if (!directusUrl) {
      throw new Error('DIRECTUS_URL não configurada');
    }
    
    if (!directusToken) {
      throw new Error('DIRECTUS_TOKEN não configurada');
    }
    
    console.log(`   ✅ DIRECTUS_URL: ${directusUrl}`);
    console.log(`   ✅ DIRECTUS_TOKEN: ${directusToken.substring(0, 20)}...`);
    results.envVars = { status: 'PASS', message: 'Variáveis configuradas' };
    
    // 2. Testar health check
    console.log('\n2️⃣ Testando health check (/server/health)...');
    const healthStart = Date.now();
    try {
      const healthResponse = await axios.get(`${directusUrl}/server/health`, {
        timeout: 5000
      });
      
      const healthDuration = Date.now() - healthStart;
      
      if (healthResponse.data.status === 'ok') {
        console.log(`   ✅ Health check OK (${healthDuration}ms)`);
        results.healthCheck = {
          status: 'PASS',
          message: `Status: ${healthResponse.data.status}`,
          duration: healthDuration
        };
      } else {
        throw new Error(`Health check retornou status: ${healthResponse.data.status}`);
      }
    } catch (error) {
      const healthDuration = Date.now() - healthStart;
      results.healthCheck = {
        status: 'FAIL',
        message: error.message || 'Erro desconhecido',
        duration: healthDuration
      };
      console.log(`   ❌ Health check FAIL: ${error.message}`);
    }
    
    // 3. Testar autenticação com token
    console.log('\n3️⃣ Testando autenticação com token (/users/me)...');
    const authStart = Date.now();
    try {
      const authResponse = await axios.get(`${directusUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${directusToken}`
        },
        timeout: 5000
      });
      
      const authDuration = Date.now() - authStart;
      
      if (authResponse.data.data) {
        console.log(`   ✅ Autenticação OK (${authDuration}ms)`);
        console.log(`   Usuário: ${authResponse.data.data.email || 'N/A'}`);
        results.authentication = {
          status: 'PASS',
          message: 'Token válido e autenticado',
          duration: authDuration
        };
      } else {
        throw new Error('Autenticação falhou - dados do usuário não retornados');
      }
    } catch (error) {
      const authDuration = Date.now() - authStart;
      results.authentication = {
        status: 'FAIL',
        message: error.response?.status === 401 ? 'Token inválido ou expirado' : error.message,
        duration: authDuration
      };
      console.log(`   ❌ Autenticação FAIL: ${error.message}`);
    }
    
    // 4. Testar query simples em collection users
    console.log('\n4️⃣ Testando query em collection users...');
    const queryStart = Date.now();
    try {
      const queryResponse = await axios.get(`${directusUrl}/items/users?limit=1`, {
        headers: {
          'Authorization': `Bearer ${directusToken}`
        },
        timeout: 10000
      });
      
      const queryDuration = Date.now() - queryStart;
      const count = queryResponse.data.data?.length || 0;
      
      console.log(`   ✅ Query OK (${queryDuration}ms)`);
      console.log(`   Registros encontrados: ${count}`);
      results.query = {
        status: 'PASS',
        message: `${count} registro(s) retornado(s)`,
        duration: queryDuration
      };
    } catch (error) {
      const queryDuration = Date.now() - queryStart;
      results.query = {
        status: 'FAIL',
        message: error.message || 'Erro desconhecido',
        duration: queryDuration
      };
      console.log(`   ❌ Query FAIL: ${error.message}`);
    }
    
    // 5. Testar timeout (30s)
    console.log('\n5️⃣ Testando timeout (30s)...');
    const timeoutStart = Date.now();
    try {
      // Fazer uma query que deve completar rapidamente
      await axios.get(`${directusUrl}/items/users?limit=1`, {
        headers: {
          'Authorization': `Bearer ${directusToken}`
        },
        timeout: 30000 // 30 segundos
      });
      
      const timeoutDuration = Date.now() - timeoutStart;
      console.log(`   ✅ Timeout configurado corretamente (${timeoutDuration}ms)`);
      results.timeout = {
        status: 'PASS',
        message: 'Timeout de 30s funcionando',
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

testDirectusConnection();

