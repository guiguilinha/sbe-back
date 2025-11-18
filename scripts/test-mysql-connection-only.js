#!/usr/bin/env node

/**
 * Script SIMPLES para testar APENAS a conexão MySQL
 */

const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testMySQLConnection() {
  console.log('🧪 TESTE DE CONEXÃO MYSQL\n');
  console.log('='.repeat(60));
  
  // PASSO 1: Ler variáveis do container
  console.log('\n1️⃣ Lendo variáveis do container...');
  let host, port, user, password, database;
  
  try {
    const { stdout } = await execPromise('docker exec maturidade-digital-backend cat .env 2>/dev/null');
    
    const envVars = {};
    stdout.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim();
      }
    });

    host = envVars.REGISTRO_MYSQL_HOST;
    port = envVars.REGISTRO_MYSQL_PORT || '3306';
    user = envVars.REGISTRO_MYSQL_USER;
    password = envVars.REGISTRO_MYSQL_PASSWORD;
    database = envVars.REGISTRO_MYSQL_DATABASE;

    console.log('   ✅ Variáveis lidas:');
    console.log(`      Host: ${host}`);
    console.log(`      Port: ${port}`);
    console.log(`      User: ${user}`);
    console.log(`      Database: ${database}`);
    console.log(`      Password: ${password ? '***' : '❌ NÃO DEFINIDO'}`);

    if (!host || !user || !database) {
      console.log('\n   ❌ Variáveis incompletas!');
      return;
    }

  } catch (error) {
    console.log('   ❌ Erro ao ler variáveis:', error.message);
    return;
  }

  // PASSO 2: Ajustar porta se estiver dentro do Docker
  console.log('\n2️⃣ Ajustando configuração para Docker...');
  const finalPort = (host === 'mysql-quiz' || host.startsWith('172.') || host.includes('mysql-quiz')) ? 3306 : parseInt(port);
  console.log(`   Porta original: ${port}`);
  console.log(`   Porta final: ${finalPort} (${host === 'mysql-quiz' ? 'ajustada para Docker' : 'mantida'})`);

  // PASSO 3: Testar conectividade de rede (nc -zv)
  console.log('\n3️⃣ Testando conectividade de rede...');
  try {
    const { stdout } = await execPromise(
      `docker exec maturidade-digital-backend nc -zv ${host} ${finalPort} 2>&1`,
      { timeout: 5000 }
    );
    
    if (stdout.includes('succeeded') || stdout.includes('open')) {
      console.log(`   ✅ Porta ${finalPort} está aberta em ${host}`);
    } else {
      console.log(`   ⚠️ Resposta inesperada: ${stdout}`);
    }
  } catch (error) {
    console.log(`   ❌ Falha na conexão de rede: ${error.message}`);
    console.log(`   💡 Verifique se o MySQL está rodando e acessível`);
    return;
  }

  // PASSO 4: Testar conexão MySQL real
  console.log('\n4️⃣ Testando conexão MySQL...');
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port: finalPort,
      user,
      password,
      database,
      connectTimeout: 5000
    });

    console.log('   ✅ Conexão MySQL estabelecida!');

    // PASSO 5: Testar query simples
    console.log('\n5️⃣ Testando query SELECT...');
    const [rows] = await connection.execute('SELECT 1 as test, DATABASE() as current_db, USER() as current_user');
    console.log('   ✅ Query executada com sucesso!');
    console.log('   Resultado:', rows[0]);

    // PASSO 6: Verificar se tabela existe
    console.log('\n6️⃣ Verificando se tabela existe...');
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'resposta_teste_maturidade'",
      [database]
    );

    if (tables.length > 0) {
      console.log('   ✅ Tabela "resposta_teste_maturidade" existe!');
      
      // Verificar estrutura
      const [columns] = await connection.execute(
        "SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'resposta_teste_maturidade' ORDER BY ORDINAL_POSITION",
        [database]
      );
      console.log(`   ✅ Tabela tem ${columns.length} colunas`);
      console.log(`   Primeiras 5 colunas: ${columns.slice(0, 5).map(c => c.COLUMN_NAME).join(', ')}...`);
    } else {
      console.log('   ⚠️ Tabela "resposta_teste_maturidade" NÃO existe!');
    }

    await connection.end();
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(60));

  } catch (error) {
    console.log('   ❌ Erro na conexão MySQL:');
    console.log(`      Código: ${error.code}`);
    console.log(`      Mensagem: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n   💡 Problema: Conexão recusada');
      console.log('      - MySQL não está rodando?');
      console.log('      - Porta está correta?');
      console.log(`      - Host "${host}" está acessível do container?`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n   💡 Problema: Acesso negado');
      console.log('      - Usuário ou senha incorretos?');
      console.log(`      - Usuário "${user}" tem permissão?`);
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n   💡 Problema: Banco de dados não existe');
      console.log(`      - Database "${database}" não foi encontrado`);
    }
    
    if (connection) {
      await connection.end();
    }
  }
}

testMySQLConnection().catch(console.error);


