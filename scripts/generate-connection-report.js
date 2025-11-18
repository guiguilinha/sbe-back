#!/usr/bin/env node

/**
 * Script para gerar relatório consolidado de todos os testes de conexão
 * Executa todos os testes e gera relatório em JSON e Markdown
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');

const execPromise = util.promisify(exec);

const scriptsDir = path.join(__dirname);
const reportsDir = path.join(__dirname, '../../.docs/test-results');

// Garantir que o diretório de relatórios existe
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

async function runTestScript(scriptName) {
  const scriptPath = path.join(scriptsDir, scriptName);
  try {
    const { stdout, stderr } = await execPromise(`node ${scriptPath}`, {
      timeout: 60000 // 60 segundos de timeout
    });
    return {
      success: true,
      stdout,
      stderr,
      exitCode: 0
    };
  } catch (error) {
    return {
      success: false,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.code || 1,
      message: error.message
    };
  }
}

async function generateReport() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  GERADOR DE RELATÓRIO DE TESTES DE CONEXÃO');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Data/Hora: ${new Date().toISOString()}\n`);
  
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  const tests = [
    { name: 'Directus', script: 'test-directus-connection.js' },
    { name: 'MySQL Legado', script: 'test-mysql-legacy-connection.js' },
    { name: 'Keycloak', script: 'test-keycloak-connection.js' },
    { name: 'CPE Backend', script: 'test-cpe-connection.js' }
  ];
  
  const results = {
    timestamp: new Date().toISOString(),
    duration: 0,
    tests: []
  };
  
  console.log('Executando testes de conexão...\n');
  
  for (const test of tests) {
    console.log(`\n📊 Executando teste: ${test.name}...`);
    const testStart = Date.now();
    
    const testResult = await runTestScript(test.script);
    const testDuration = Date.now() - testStart;
    
    const status = testResult.success ? 'PASS' : 'FAIL';
    const icon = testResult.success ? '✅' : '❌';
    
    console.log(`${icon} ${test.name}: ${status} (${testDuration}ms)`);
    
    results.tests.push({
      name: test.name,
      script: test.script,
      status,
      duration: testDuration,
      success: testResult.success,
      exitCode: testResult.exitCode,
      stdout: testResult.stdout.substring(0, 1000), // Limitar tamanho
      stderr: testResult.stderr.substring(0, 1000),
      error: testResult.message
    });
  }
  
  results.duration = Date.now() - startTime;
  
  // Calcular estatísticas
  const totalTests = results.tests.length;
  const passedTests = results.tests.filter(t => t.success).length;
  const failedTests = results.tests.filter(t => !t.success).length;
  const totalDuration = results.tests.reduce((sum, t) => sum + t.duration, 0);
  
  // Salvar relatório JSON
  const jsonReportPath = path.join(reportsDir, `connection-tests-${timestamp}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Relatório JSON salvo: ${jsonReportPath}`);
  
  // Gerar relatório Markdown
  const markdownReport = generateMarkdownReport(results, totalTests, passedTests, failedTests, totalDuration);
  const mdReportPath = path.join(reportsDir, `connection-tests-${timestamp}.md`);
  fs.writeFileSync(mdReportPath, markdownReport);
  console.log(`✅ Relatório Markdown salvo: ${mdReportPath}`);
  
  // Resumo final
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESUMO FINAL');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`Total de testes: ${totalTests}`);
  console.log(`✅ Passou: ${passedTests}`);
  console.log(`❌ Falhou: ${failedTests}`);
  console.log(`⏱️  Tempo total: ${results.duration}ms\n`);
  
  // Listar resultados
  results.tests.forEach(test => {
    const icon = test.success ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.status} (${test.duration}ms)`);
  });
  
  console.log(`\n📄 Relatórios salvos em: ${reportsDir}\n`);
  
  return {
    success: failedTests === 0,
    totalTests,
    passedTests,
    failedTests
  };
}

function generateMarkdownReport(results, totalTests, passedTests, failedTests, totalDuration) {
  const timestamp = new Date(results.timestamp).toLocaleString('pt-BR');
  
  let markdown = `# Relatório de Testes de Conexão\n\n`;
  markdown += `**Data/Hora**: ${timestamp}\n\n`;
  markdown += `**Duração Total**: ${results.duration}ms\n\n`;
  markdown += `---\n\n`;
  
  markdown += `## Resumo\n\n`;
  markdown += `- **Total de Testes**: ${totalTests}\n`;
  markdown += `- **✅ Passou**: ${passedTests}\n`;
  markdown += `- **❌ Falhou**: ${failedTests}\n`;
  markdown += `- **⏱️ Tempo Total**: ${totalDuration}ms\n\n`;
  
  markdown += `---\n\n`;
  markdown += `## Detalhes dos Testes\n\n`;
  
  results.tests.forEach((test, index) => {
    const icon = test.success ? '✅' : '❌';
    markdown += `### ${index + 1}. ${icon} ${test.name}\n\n`;
    markdown += `- **Status**: ${test.status}\n`;
    markdown += `- **Duração**: ${test.duration}ms\n`;
    markdown += `- **Exit Code**: ${test.exitCode}\n`;
    
    if (test.error) {
      markdown += `- **Erro**: ${test.error}\n`;
    }
    
    if (test.stderr) {
      markdown += `\n**Stderr**:\n\`\`\`\n${test.stderr}\n\`\`\`\n`;
    }
    
    markdown += `\n`;
  });
  
  markdown += `---\n\n`;
  markdown += `## Conclusão\n\n`;
  
  if (failedTests === 0) {
    markdown += `✅ **Todos os testes passaram com sucesso!**\n\n`;
    markdown += `Todas as conexões estão funcionando corretamente.\n`;
  } else {
    markdown += `❌ **Alguns testes falharam.**\n\n`;
    markdown += `Verifique os detalhes acima para identificar os problemas.\n`;
  }
  
  return markdown;
}

// Executar geração de relatório
generateReport()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Erro fatal ao gerar relatório:', error);
    process.exit(1);
  });

