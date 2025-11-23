import mysql from 'mysql2/promise';

// Função para obter config MySQL
const getMySQLConfig = () => {
  const host = process.env.REGISTRO_MYSQL_HOST || 'localhost';
  const user = process.env.REGISTRO_MYSQL_USER || 'root';
  const password = process.env.REGISTRO_MYSQL_PASSWORD || '';
  const database = process.env.REGISTRO_MYSQL_DATABASE || 'maturidade_digital_db';
  const port = parseInt(process.env.REGISTRO_MYSQL_PORT || '3306', 10);

  // Tratamento básico para host que possa vir com protocolo ou porta (embora idealmente deva vir limpo)
  const cleanHost = host.replace(/^https?:\/\//, '').split(':')[0];

  const config = {
    host: cleanHost,
    user,
    password,
    database,
    port
  };

  return config;
};

export const createMySQLConnection = () => {
  const mysqlConfig = getMySQLConfig();

  // Log apenas em desenvolvimento ou se explicitamente solicitado
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 [MySQL] Conectando a:', {
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      database: mysqlConfig.database,
      user: mysqlConfig.user
    });
  }

  return mysql.createConnection(mysqlConfig);
};

