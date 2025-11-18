const WebSocket = require('ws');

console.log('🧪 Testando WebSocket...');

const ws = new WebSocket('ws://localhost:8080/ws');

ws.on('open', () => {
  console.log('✅ Conectado ao WebSocket!');
  
  // Testar inscrição em uma collection
  const subscribeMessage = {
    type: 'subscribe_collection',
    collection: 'home_hero'
  };
  
  console.log('📡 Enviando mensagem de inscrição:', subscribeMessage);
  ws.send(JSON.stringify(subscribeMessage));
  
  // Testar ping
  setTimeout(() => {
    console.log('🏓 Enviando ping...');
    ws.send(JSON.stringify({ type: 'ping' }));
  }, 1000);
  
  // Simular uma atualização após 3 segundos
  setTimeout(() => {
    console.log('🎭 Simulando atualização...');
    // Aqui você pode adicionar lógica para simular uma atualização
  }, 3000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 Mensagem recebida:', message);
    
    if (message.type === 'subscription_confirmed') {
      console.log('✅ Inscrição confirmada!');
    } else if (message.type === 'pong') {
      console.log('🏓 Pong recebido!');
    } else if (message.type === 'collection_update') {
      console.log('🔄 Atualização de collection recebida!');
    }
  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
  }
});

ws.on('close', () => {
  console.log('🔌 Conexão fechada');
});

ws.on('error', (error) => {
  console.error('❌ Erro na conexão:', error);
});

// Fechar conexão após 10 segundos
setTimeout(() => {
  console.log('🔌 Fechando conexão...');
  ws.close();
  process.exit(0);
}, 10000);
