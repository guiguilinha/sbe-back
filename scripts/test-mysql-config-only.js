#!/usr/bin/env node

// Testa APENAS a configuração MySQL
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mysql = require('mysql2/promise');

// Função idêntica ao mysql.config.ts
const getMySQLConfig = () => {
  const host = process.env.REGISTRO_MYSQL_HOST || process.env.DEVELOPMENT_REGISTRO_MYSQL_HOST || 'localhost';
  const user = process.env.REGISTRO_MYSQL_USER || process.env.DEVELOPMENT_REGISTRO_MYSQL_USER || 'root';
  const password = process.env.REGISTRO_MYSQL_PASSWORD || process.env.DEVELOPMENT_REGISTRO_MYSQL_PASSWORD || '';
  const database = process.env.REGISTRO_MYSQL_DATABASE || process.env.DEVELOPMENT_REGISTRO_MYSQL_DATABASE || 'maturidade_digital_db';
  
  let port = parseInt(process.env.REGISTRO_MYSQL_PORT || process.env.DEVELOPMENT_REGISTRO_MYSQL_PORT || '3306');
  if (host === 'mysql-quiz' || host.startsWith('172.') || host.includes('mysql-quiz')) {
    port = 3306;
  }
  
  const config = {
    host,
    user,
    password,
    database,
    port
  };
  
  console.log('🔗 [MySQL] Config lida do process.env:');
  console.log(JSON.stringify({
    'REGISTRO_MYSQL_HOST': process.env.REGISTRO_MYSQL_HOST || 'undefined',
    'REGISTRO_MYSQL_PORT': process.env.REGISTRO_MYSQL_PORT || 'undefined',
    'REGISTRO_MYSQL_USER': process.env.REGISTRO_MYSQL_USER || 'undefined',
    'REGISTRO_MYSQL_DATABASE': process.env.REGISTRO_MYSQL_DATABASE || 'undefined',
    'REGISTRO_MYSQL_PASSWORD': process.env.REGISTRO_MYSQL_PASSWORD ? '***' : 'undefined'
  }, null, 2));
  
  return config;
};

async function testConnection() {
  console.log('\n📋 Testando configuração MySQL...\n');
  
  const mysqlConfig = getMySQLConfig();
  
  console.log('\n🔗 [MySQL] Criando conexão com:');
  console.log(JSON.stringify({
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    database: mysqlConfig.database,
    user: mysqlConfig.user,
    password: mysqlConfig.password ? '***' : 'não definido'
  }, null, 2));
  
  try {
    console.log('\n⏳ Tentando conectar...');
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conexão estabelecida com sucesso!');
    
    const [rows] = await connection.execute('SELECT 1 as test, DATABASE() as db, USER() as user');
    console.log('\n📊 Teste de query:');
    console.log(JSON.stringify(rows[0], null, 2));
    
    await connection.end();
    console.log('\n✅ Conexão encerrada');
    
  } catch (error) {
    console.log('\n❌ ERRO na conexão:');
    console.log(`   Código: ${error.code}`);
    console.log(`   Mensagem: ${error.message}`);
    if (error.errno) {
      console.log(`   Errno: ${error.errno}`);
    }
    process.exit(1);
  }
}

testConnection();


