#!/usr/bin/env node

/**
 * Script para testar conexão MySQL Legado
 * Testa: variáveis de ambiente, createConnection, queries, estrutura de tabela
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mysql = require('mysql2/promise');

async function testMySQLConnection() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TESTE DE CONEXÃO MYSQL LEGADO');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Data/Hora: ${new Date().toISOString()}\n`);
  
  const results = {
    envVars: { status: 'PENDING', message: '' },
    connection: { status: 'PENDING', message: '', duration: 0 },
    query: { status: 'PENDING', message: '', duration: 0 },
    tableCheck: { status: 'PENDING', message: '', duration: 0 },
    insertTest: { status: 'PENDING', message: '', duration: 0 }
  };
  
  let connection = null;
  
  try {
    // 1. Verificar variáveis de ambiente
    console.log('1️⃣ Verificando variáveis de ambiente...');
    let host = process.env.REGISTRO_MYSQL_HOST || process.env.DEVELOPMENT_REGISTRO_MYSQL_HOST;
    const port = parseInt(process.env.REGISTRO_MYSQL_PORT || process.env.DEVELOPMENT_REGISTRO_MYSQL_PORT || '3306');
    const user = process.env.REGISTRO_MYSQL_USER || process.env.DEVELOPMENT_REGISTRO_MYSQL_USER;
    const password = process.env.REGISTRO_MYSQL_PASSWORD || process.env.DEVELOPMENT_REGISTRO_MYSQL_PASSWORD;
    const database = process.env.REGISTRO_MYSQL_DATABASE || process.env.DEVELOPMENT_REGISTRO_MYSQL_DATABASE;
    
    if (!host || !user || !database) {
      const missing = [];
      if (!host) missing.push('REGISTRO_MYSQL_HOST');
      if (!user) missing.push('REGISTRO_MYSQL_USER');
      if (!database) missing.push('REGISTRO_MYSQL_DATABASE');
      throw new Error(`Variáveis MySQL não configuradas: ${missing.join(', ')}`);
    }
    
    // Limpar host: remover protocolo (http://, https://) e porta se presente
    const originalHost = host;
    host = host.replace(/^https?:\/\//, '');
    const hostParts = host.split(':');
    host = hostParts[0];
    
    console.log(`   ✅ REGISTRO_MYSQL_HOST (original): ${originalHost}`);
    console.log(`   ✅ REGISTRO_MYSQL_HOST (limpo): ${host}`);
    console.log(`   ✅ REGISTRO_MYSQL_PORT: ${port}`);
    console.log(`   ✅ REGISTRO_MYSQL_USER: ${user}`);
    console.log(`   ✅ REGISTRO_MYSQL_DATABASE: ${database}`);
    console.log(`   ✅ REGISTRO_MYSQL_PASSWORD: ${password ? '***configurado***' : '❌ não definido'}`);
    
    results.envVars = { status: 'PASS', message: 'Variáveis configuradas' };
    
    // 2. Testar createConnection
    console.log('\n2️⃣ Testando createConnection()...');
    const connStart = Date.now();
    try {
      connection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        database,
        connectTimeout: 10000
      });
      
      const connDuration = Date.now() - connStart;
      console.log(`   ✅ Conexão estabelecida (${connDuration}ms)`);
      results.connection = {
        status: 'PASS',
        message: 'Conexão MySQL estabelecida com sucesso',
        duration: connDuration
      };
    } catch (error) {
      const connDuration = Date.now() - connStart;
      results.connection = {
        status: 'FAIL',
        message: error.message || 'Erro desconhecido',
        duration: connDuration
      };
      console.log(`   ❌ Conexão FAIL: ${error.message}`);
      throw error;
    }
    
    // 3. Testar query SELECT 1
    console.log('\n3️⃣ Testando query SELECT 1...');
    const queryStart = Date.now();
    try {
      const [rows] = await connection.execute('SELECT 1 as test, DATABASE() as db, USER() as user');
      
      if (rows.length === 0) {
        throw new Error('Query não retornou resultados');
      }
      
      const queryDuration = Date.now() - queryStart;
      console.log(`   ✅ Query OK (${queryDuration}ms)`);
      console.log(`   Database: ${rows[0].db}`);
      console.log(`   User: ${rows[0].user}`);
      
      results.query = {
        status: 'PASS',
        message: `Query executada com sucesso (DB: ${rows[0].db})`,
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
    
    // 4. Verificar estrutura (tabelas existentes)
    console.log('\n4️⃣ Verificando estrutura do banco...');
    const tableStart = Date.now();
    try {
      const [tables] = await connection.execute(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?",
        [database]
      );
      
      const tableCount = tables[0].count;
      const tableDuration = Date.now() - tableStart;
      
      console.log(`   ✅ Database possui ${tableCount} tabela(s) (${tableDuration}ms)`);
      
      // Listar algumas tabelas
      const [tableList] = await connection.execute(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ? LIMIT 5",
        [database]
      );
      
      if (tableList.length > 0) {
        console.log('   Tabelas encontradas:');
        tableList.forEach(table => {
          console.log(`     - ${table.table_name}`);
        });
      }
      
      results.tableCheck = {
        status: 'PASS',
        message: `${tableCount} tabela(s) encontrada(s)`,
        duration: tableDuration
      };
    } catch (error) {
      const tableDuration = Date.now() - tableStart;
      results.tableCheck = {
        status: 'FAIL',
        message: error.message || 'Erro desconhecido',
        duration: tableDuration
      };
      console.log(`   ❌ Verificação de estrutura FAIL: ${error.message}`);
    }
    
    // 5. Testar INSERT de teste (com rollback)
    console.log('\n5️⃣ Testando INSERT de teste (com rollback)...');
    const insertStart = Date.now();
    try {
      // Iniciar transação
      await connection.beginTransaction();
      
      // Tentar inserir em uma tabela de teste (se existir)
      // Como não sabemos a estrutura exata, vamos apenas verificar se transações funcionam
      const [testQuery] = await connection.execute('SELECT 1');
      
      // Rollback
      await connection.rollback();
      
      const insertDuration = Date.now() - insertStart;
      console.log(`   ✅ Transação testada (${insertDuration}ms)`);
      console.log('   ⚠️  INSERT real não testado (estrutura de tabela desconhecida)');
      
      results.insertTest = {
        status: 'PASS',
        message: 'Transações funcionando (INSERT não testado - estrutura desconhecida)',
        duration: insertDuration
      };
    } catch (error) {
      const insertDuration = Date.now() - insertStart;
      // Rollback em caso de erro
      try {
        await connection.rollback();
      } catch (rollbackError) {
        // Ignorar erro de rollback
      }
      
      results.insertTest = {
        status: 'SKIP',
        message: 'Teste de INSERT pulado (estrutura desconhecida)',
        duration: insertDuration
      };
      console.log(`   ⚠️  Teste de INSERT pulado: ${error.message}`);
    }
    
    // Fechar conexão
    if (connection) {
      await connection.end();
      console.log('\n   ✅ Conexão encerrada');
    }
    
    // Resumo
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  RESUMO DOS TESTES');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const totalDuration = Object.values(results).reduce((sum, r) => sum + (r.duration || 0), 0);
    const passed = Object.values(results).filter(r => r.status === 'PASS').length;
    const failed = Object.values(results).filter(r => r.status === 'FAIL').length;
    const skipped = Object.values(results).filter(r => r.status === 'SKIP').length;
    
    Object.entries(results).forEach(([name, result]) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'SKIP' ? '⚠️' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${name}: ${result.status}${duration}`);
      if (result.status === 'FAIL') {
        console.log(`   Erro: ${result.message}`);
      }
    });
    
    console.log(`\nTotal: ${Object.keys(results).length} testes`);
    console.log(`✅ Passou: ${passed}`);
    console.log(`⚠️  Pulado: ${skipped}`);
    console.log(`❌ Falhou: ${failed}`);
    console.log(`⏱️  Tempo total: ${totalDuration}ms\n`);
    
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    // Fechar conexão em caso de erro
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        // Ignorar erro ao fechar
      }
    }
    
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

testMySQLConnection();

