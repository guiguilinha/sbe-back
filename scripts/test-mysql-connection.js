#!/usr/bin/env node

/**
 * Script para testar conexão MySQL do container
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testMySQLConnection() {
  console.log('🔍 Testando conexão MySQL do container...\n');

  // 1. Ler variáveis do container
  console.log('1️⃣ Lendo variáveis do container...');
  try {
    const { stdout } = await execPromise('docker exec maturidade-digital-backend cat .env 2>/dev/null');
    
    const envVars = {};
    stdout.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim();
      }
    });

    const host = envVars.REGISTRO_MYSQL_HOST;
    const port = envVars.REGISTRO_MYSQL_PORT || '3306';
    const user = envVars.REGISTRO_MYSQL_USER;
    const database = envVars.REGISTRO_MYSQL_DATABASE;
    const password = envVars.REGISTRO_MYSQL_PASSWORD;

    console.log('   Variáveis encontradas:');
    console.log(`   - Host: ${host || '❌ não definido'}`);
    console.log(`   - Port: ${port || '❌ não definido'}`);
    console.log(`   - User: ${user || '❌ não definido'}`);
    console.log(`   - Database: ${database || '❌ não definido'}`);
    console.log(`   - Password: ${password ? '***configurado***' : '❌ não definido'}\n`);

    if (!host || !user || !database) {
      console.log('❌ Variáveis MySQL incompletas no container');
      return;
    }

    // 2. Testar conectividade
    console.log('2️⃣ Testando conectividade de rede...');
    try {
      const { stdout: ncOut } = await execPromise(
        `docker exec maturidade-digital-backend nc -zv ${host} ${port} 2>&1`,
        { timeout: 5000 }
      );
      
      if (ncOut.includes('succeeded') || ncOut.includes('open')) {
        console.log(`   ✅ Conexão de rede OK: ${host}:${port}`);
      } else {
        console.log(`   ⚠️ Resposta inesperada: ${ncOut}`);
      }
    } catch (error) {
      console.log(`   ❌ Falha na conexão de rede: ${error.message}`);
      console.log(`   💡 Verifique se o MySQL está acessível de dentro do Docker`);
    }

    // 3. Testar conexão MySQL (se tiver mysql client no container)
    console.log('\n3️⃣ Testando conexão MySQL...');
    try {
      const mysqlTest = `mysql -h ${host} -P ${port} -u ${user} -p${password} -e "SELECT 1" ${database} 2>&1`;
      const { stdout: mysqlOut } = await execPromise(
        `docker exec maturidade-digital-backend sh -c "${mysqlTest}"`
      );
      console.log('   ✅ Conexão MySQL bem-sucedida!');
    } catch (error) {
      console.log('   ⚠️ Não foi possível testar conexão MySQL direta');
      console.log(`   (Pode ser normal se mysql client não estiver instalado no container)`);
    }

    // 4. Verificar tabela (via backend endpoint se possível)
    console.log('\n4️⃣ Verificando estrutura...');
    console.log('   💡 A existência da tabela será verificada durante o INSERT');

  } catch (error) {
    console.error('❌ Erro ao acessar container:', error.message);
    console.log('\n💡 Verifique se:');
    console.log('   - Container está rodando: docker ps | grep backend');
    console.log('   - Container se chama: maturidade-digital-backend');
  }
}

testMySQLConnection().catch(console.error);

