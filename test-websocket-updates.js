const WebSocket = require('ws');

console.log('🧪 Testando WebSocket com atualizações simuladas...');

const ws = new WebSocket('ws://localhost:8080/ws');

ws.on('open', () => {
  console.log('✅ Conectado ao WebSocket!');
  
  // Inscrever em várias collections
  const collections = ['home_hero', 'home_benefits', 'quiz_questions'];
  
  collections.forEach(collection => {
    const subscribeMessage = {
      type: 'subscribe_collection',
      collection: collection
    };
    
    console.log(`📡 Inscrevendo na collection: ${collection}`);
    ws.send(JSON.stringify(subscribeMessage));
  });
  
  // Simular atualizações após 2 segundos
  setTimeout(() => {
    console.log('\n🎭 Simulando atualizações...');
    
    // Simular atualização do home_hero
    console.log('📝 Simulando atualização do home_hero...');
    fetch('http://localhost:8080/api/homepage/simulate-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection: 'home_hero',
        data: {
          title: 'Título Atualizado via WebSocket',
          subtitle: 'Subtítulo atualizado em tempo real',
          timestamp: new Date().toISOString()
        }
      })
    }).then(response => response.json())
      .then(data => console.log('✅ Resposta da simulação:', data))
      .catch(error => console.error('❌ Erro na simulação:', error));
      
  }, 2000);
  
  // Simular mais atualizações
  setTimeout(() => {
    console.log('📝 Simulando atualização do home_benefits...');
    fetch('http://localhost:8080/api/homepage/simulate-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection: 'home_benefits',
        data: {
          benefits: [
            { title: 'Benefício 1 Atualizado', description: 'Descrição atualizada' },
            { title: 'Benefício 2 Atualizado', description: 'Descrição atualizada' }
          ],
          timestamp: new Date().toISOString()
        }
      })
    }).then(response => response.json())
      .then(data => console.log('✅ Resposta da simulação:', data))
      .catch(error => console.error('❌ Erro na simulação:', error));
  }, 4000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 Mensagem recebida:', message);
    
    if (message.type === 'subscription_confirmed') {
      console.log(`✅ Inscrição confirmada para: ${message.collection}`);
    } else if (message.type === 'collection_update') {
      console.log(`🔄 Atualização recebida para ${message.collection}:`, message.data);
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

// Fechar conexão após 15 segundos
setTimeout(() => {
  console.log('🔌 Fechando conexão...');
  ws.close();
  process.exit(0);
}, 15000);
