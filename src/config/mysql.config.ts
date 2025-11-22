import mysql from 'mysql2/promise';

// Função para obter config MySQL (lê variáveis no momento da chamada)
const getMySQLConfig = () => {
  // Limpar host: remover protocolo (http://, https://) e porta se presente
  let host = process.env.REGISTRO_MYSQL_HOST || 'localhost';
  
  // Remover protocolo se presente
  host = host.replace(/^https?:\/\//, '');
  
  // Remover porta se presente no host (ex: localhost:3307 -> localhost)
  const hostParts = host.split(':');
  host = hostParts[0];
  
  const user = process.env.REGISTRO_MYSQL_USER || 'root';
  const password = process.env.REGISTRO_MYSQL_PASSWORD || '';
  const database = process.env.REGISTRO_MYSQL_DATABASE || 'maturidade_digital_db';
  
  // Porta: sempre usar a porta configurada na variável de ambiente, ou padrão 3306
  const port = parseInt(process.env.REGISTRO_MYSQL_PORT || '3306');
  
  const config = {
    host,
    user,
    password,
    database,
    port
  };
  
  console.log('🔗 [MySQL] Config lida do process.env:', {
    'REGISTRO_MYSQL_HOST': process.env.REGISTRO_MYSQL_HOST || 'undefined',
    'REGISTRO_MYSQL_PORT': process.env.REGISTRO_MYSQL_PORT || 'undefined',
    'REGISTRO_MYSQL_USER': process.env.REGISTRO_MYSQL_USER || 'undefined',
    'REGISTRO_MYSQL_DATABASE': process.env.REGISTRO_MYSQL_DATABASE || 'undefined',
    'REGISTRO_MYSQL_PASSWORD': process.env.REGISTRO_MYSQL_PASSWORD ? '***' : 'undefined'
  });
  
  return config;
};

export const createMySQLConnection = () => {
  const mysqlConfig = getMySQLConfig();
  
  console.log('🔗 [MySQL] Criando conexão com:', {
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    database: mysqlConfig.database,
    user: mysqlConfig.user,
    password: mysqlConfig.password ? mysqlConfig.password : 'não definido'
  });
  
  return mysql.createConnection(mysqlConfig);
};

