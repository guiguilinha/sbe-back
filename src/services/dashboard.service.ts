import { DashboardResponse, OverallLevel, OverallLevelCode, CategorySnapshot, StatusKind } from '../contracts/dashboard/dashboard.types';
import { DiagnosticsService } from './directus/persistence/diagnostics.service';
import { CategoriesService } from './directus/general/categories.service';
import { LevelsService } from './directus/general/levels.service';
import { UsersService } from './directus/persistence/users.service';

export class DashboardService {
  /**
   * Retorna dados completos do dashboard baseados em dados reais do Directus
   * @param userId - ID do usuário no Directus
   * @param token - Token do Directus
   */
  static async getDashboardData(userId: number, token?: string): Promise<DashboardResponse> {
    try {
      // Garantir que userId seja número
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (isNaN(numericUserId)) {
        throw new Error(`userId inválido: ${userId} (tipo: ${typeof userId})`);
      }
      
      console.log('[DashboardService] getDashboardData - Carregando dados completos do dashboard para usuário:', {
        originalUserId: userId,
        originalType: typeof userId,
        numericUserId,
        numericType: typeof numericUserId
      });
      
      // 1. Buscar dados básicos em paralelo
      const [user, categories, levels] = await Promise.all([
        new UsersService().getUserById(numericUserId, token),
        new CategoriesService().getCategories(),
        new LevelsService().getLevels()
      ]);

      console.log('[DashboardService] Dados básicos carregados:', {
        hasUser: !!user,
        categoriesCount: categories.length,
        levelsCount: levels.length
      });

      // 2. Buscar diagnósticos do usuário (último + histórico limitado para performance)
      console.log('[DashboardService] Buscando diagnósticos para userId:', {
        numericUserId,
        tokenProvided: !!token
      });
      const diagnosticsService = new DiagnosticsService();
      
      // Buscar apenas o necessário: último diagnóstico completo + histórico limitado (15 itens)
      // Isso reduz drasticamente o número de queries e melhora a performance
      const diagnosticsResult = await diagnosticsService.getUserDiagnosticsWithDetails(
        numericUserId,
        token,
        1,
        15 // Buscar apenas 15 diagnósticos mais recentes (suficiente para dashboard)
      );

      const allDiagnostics = diagnosticsResult.data;
      
      // Garantir que está ordenado do mais recente para o mais antigo
      const sortedDiagnostics = [...allDiagnostics].sort((a, b) => {
        const dateA = new Date(a.performed_at).getTime();
        const dateB = new Date(b.performed_at).getTime();
        return dateB - dateA; // Ordem decrescente (mais recente primeiro)
      });
      
      const lastDiagnostic = sortedDiagnostics[0] || null;

      console.log('[DashboardService] Diagnósticos encontrados:', {
        total: sortedDiagnostics.length,
        totalNoDirectus: diagnosticsResult.pagination.total,
        hasLastDiagnostic: !!lastDiagnostic
      });

      // 3. Se não tem diagnóstico, retornar estrutura vazia
      if (!lastDiagnostic) {
        console.log('[DashboardService] Nenhum diagnóstico encontrado, retornando estrutura vazia');
        return this.buildEmptyDashboard(user, categories, levels);
      }

      // 4. Mapear último diagnóstico para dados do dashboard
      const dashboardData = await this.mapDiagnosticToDashboard(
        lastDiagnostic,
        sortedDiagnostics,
        user,
        categories,
        levels,
        token
      );

      console.log('[DashboardService] getDashboardData - Dados carregados com sucesso');
      return dashboardData;
    } catch (error) {
      console.error('[DashboardService] getDashboardData - Erro:', error);
      throw error;
    }
  }

  /**
   * Constrói dashboard vazio quando não há diagnósticos
   */
  private static buildEmptyDashboard(
    user: any,
    categories: any[],
    levels: any[]
  ): DashboardResponse {
    const defaultLevel = levels[0] || { id: 1, title: 'Iniciante digital' };
    
    return {
      user: {
        name: `${user.given_name || ''} ${user.last_name || ''}`.trim() || 'Usuário'
      },
      overallLevel: {
        code: 'L1' as OverallLevelCode,
        label: defaultLevel.title
      },
      overallPoints: 0,
      deltaOverall: 0,
      overall: [],
      categories: categories.map(cat => ({
        id: cat.id.toString(),
        name: cat.title,
        status: 'attention' as StatusKind,
        statusLabel: 'Sem dados',
        score: 0,
        insight: 'Realize um diagnóstico para ver seus resultados',
        actions: [],
        resources: []
      })),
      historySample: [],
      evolution: undefined
    };
  }

  /**
   * Mapeia diagnóstico do Directus para formato DashboardResponse
   */
  private static async mapDiagnosticToDashboard(
    lastDiagnostic: any,
    allDiagnostics: any[],
    user: any,
    categories: any[],
    levels: any[],
    token?: string
  ): Promise<DashboardResponse> {
    // 1. Mapear nível geral
    const overallLevel = this.mapLevelToOverallLevel(lastDiagnostic.overall_level_id, levels);
    
    // 2. Calcular delta geral (comparar com diagnóstico anterior)
    // allDiagnostics já está ordenado do mais recente para o mais antigo
    const previousDiagnostic = allDiagnostics[1] || null;
    const deltaOverall = previousDiagnostic 
      ? lastDiagnostic.overall_score - previousDiagnostic.overall_score
      : 0;
    
    console.log('[DashboardService] Cálculo de delta:', {
      lastDiagnostic: {
        id: lastDiagnostic.id,
        performed_at: lastDiagnostic.performed_at,
        overall_score: lastDiagnostic.overall_score
      },
      previousDiagnostic: previousDiagnostic ? {
        id: previousDiagnostic.id,
        performed_at: previousDiagnostic.performed_at,
        overall_score: previousDiagnostic.overall_score
      } : null,
      deltaOverall
    });

    // 3. Mapear categorias
    const categorySnapshots = await this.mapCategories(
      lastDiagnostic.categorias || [],
      categories,
      levels,
      previousDiagnostic?.categorias || []
    );

    // 4. Mapear histórico (limitado a 10 registros)
    // allDiagnostics já vem ordenado do mais recente para o mais antigo do Directus
    // Mas vamos garantir a ordenação correta
    const sortedForHistory = [...allDiagnostics].sort((a, b) => {
      const dateA = new Date(a.performed_at).getTime();
      const dateB = new Date(b.performed_at).getTime();
      return dateB - dateA; // Ordem decrescente (mais recente primeiro)
    });
    
    // Limitar a 10 registros mais recentes para o histórico
    const limitedHistory = sortedForHistory.slice(0, 10);
    
    console.log('[DashboardService] Diagnósticos ordenados para histórico:', {
      total: sortedForHistory.length,
      limited: limitedHistory.length,
      first3: limitedHistory.slice(0, 3).map(d => ({
        id: d.id,
        performed_at: d.performed_at,
        overall_score: d.overall_score,
        user_id: d.user_id
      })),
      last3: limitedHistory.slice(-3).map(d => ({
        id: d.id,
        performed_at: d.performed_at,
        overall_score: d.overall_score,
        user_id: d.user_id
      }))
    });
    
    // Mapear apenas os 10 mais recentes para histórico
    const historySample = this.mapHistorySample(limitedHistory, levels);

    // 5. Calcular evolução
    const evolution = this.calculateEvolution(allDiagnostics, categories, levels);

    // 6. Construir stats gerais
    const overall: any[] = [
      {
        label: 'Pontuação Total',
        value: lastDiagnostic.overall_score,
        suffix: 'pts',
        delta: {
          trend: deltaOverall > 0 ? 'up' : deltaOverall < 0 ? 'down' : 'flat',
          value: Math.abs(deltaOverall),
          suffix: 'pts'
        }
      }
    ];

    return {
      user: {
        name: `${user.given_name || ''} ${user.last_name || ''}`.trim() || 'Usuário'
      },
      overallLevel,
      overallPoints: lastDiagnostic.overall_score,
      deltaOverall,
      overall,
      categories: categorySnapshots,
      historySample,
      evolution
    };
  }

  /**
   * Mapeia level_id para OverallLevel
   */
  private static mapLevelToOverallLevel(levelId: number, levels: any[]): OverallLevel {
    const level = levels.find(l => l.id === levelId);
    if (!level) {
      return { code: 'L1' as OverallLevelCode, label: 'Iniciante digital' };
    }

    // Mapear para código baseado na ordem (assumindo 4 níveis)
    const levelIndex = levels.findIndex(l => l.id === levelId);
    const codes: OverallLevelCode[] = ['L1', 'L2', 'L3', 'L4'];
    const code = codes[levelIndex] || 'L1';

    return {
      code,
      label: level.title
    };
  }

  /**
   * Mapeia categorias do diagnóstico para CategorySnapshot
   */
  private static async mapCategories(
    diagnosticCategories: any[],
    allCategories: any[],
    allLevels: any[],
    previousCategories: any[]
  ): Promise<CategorySnapshot[]> {
    return diagnosticCategories.map(diagCat => {
      // Buscar dados da categoria
      const category = allCategories.find(c => c.id === diagCat.category_id);
      const level = allLevels.find(l => l.id === diagCat.level_id);

      // Buscar categoria anterior para calcular delta
      const previousCat = previousCategories.find(
        pc => pc.category_id === diagCat.category_id
      );

      // Determinar status baseado no level_id
      let status: StatusKind = 'ok';
      if (diagCat.level_id <= 2) {
        status = 'attention';
      } else if (diagCat.level_id === 3) {
        status = 'evolving';
      }

      return {
        id: diagCat.category_id.toString(),
        name: category?.title || `Categoria ${diagCat.category_id}`,
        status,
        statusLabel: level?.title || 'Sem nível',
        score: diagCat.score,
        insight: diagCat.insight || '',
        actions: diagCat.tip ? [{ id: '1', text: diagCat.tip }] : [],
        resources: []
      };
    });
  }

  /**
   * Mapeia histórico de diagnósticos para historySample
   */
  private static mapHistorySample(diagnostics: any[], levels: any[]): Array<{
    id: string;
    date: string;
    overallScore: number;
    level?: OverallLevel;
    delta?: number;
  }> {
    return diagnostics.map((diag, index) => {
      const previous = diagnostics[index + 1];
      const delta = previous ? diag.overall_score - previous.overall_score : 0;

      return {
        id: diag.id.toString(),
        date: diag.performed_at,
        overallScore: diag.overall_score,
        level: this.mapLevelToOverallLevel(diag.overall_level_id, levels),
        delta
      };
    });
  }

  /**
   * Calcula dados de evolução baseados no histórico
   */
  private static calculateEvolution(
    diagnostics: any[],
    categories: any[],
    levels: any[]
  ): DashboardResponse['evolution'] {
    try {
      console.log('[DashboardService] calculateEvolution - Iniciando cálculo:', {
        totalDiagnostics: diagnostics.length,
        diagnosticsDates: diagnostics.map(d => ({
          id: d.id,
          performed_at: d.performed_at,
          dateFormatted: new Date(d.performed_at).toLocaleDateString('pt-BR')
        }))
      });
      
      if (diagnostics.length === 0) {
        return undefined;
      }

    // Ordenar todos os diagnósticos por data (do mais antigo para o mais recente)
    const sortedDiagnostics = [...diagnostics].sort((a, b) => {
      const dateA = new Date(a.performed_at).getTime();
      const dateB = new Date(b.performed_at).getTime();
      return dateA - dateB; // Ordem crescente (mais antigo primeiro)
    });
    
    console.log('[DashboardService] calculateEvolution - Diagnósticos ordenados:', {
      total: sortedDiagnostics.length,
      first: sortedDiagnostics[0] ? {
        id: sortedDiagnostics[0].id,
        performed_at: sortedDiagnostics[0].performed_at
      } : null,
      last: sortedDiagnostics[sortedDiagnostics.length - 1] ? {
        id: sortedDiagnostics[sortedDiagnostics.length - 1].id,
        performed_at: sortedDiagnostics[sortedDiagnostics.length - 1].performed_at
      } : null
    });

    // Mapear level labels
    const levelLabels = levels.map(l => l.title);

    // Calcular dados gerais - usar TODOS os diagnósticos individualmente (não agrupar por mês)
    // Formatar a data para exibição no gráfico (usar formato de mês abreviado)
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const generalData = sortedDiagnostics.map((diag, index) => {
      // Verificar se diag tem os dados necessários
      if (!diag || !diag.overall_level_id || diag.overall_score === undefined) {
        console.warn('[DashboardService] Diagnóstico incompleto:', diag);
        return null;
      }
      
      const date = new Date(diag.performed_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
      
      // Buscar o diagnóstico anterior para calcular delta
      const previous = index > 0 ? sortedDiagnostics[index - 1] : null;

      const levelIndex = levels.findIndex(l => l.id === diag.overall_level_id);
      const delta = previous && previous.overall_score !== undefined 
        ? diag.overall_score - previous.overall_score 
        : 0;

      return {
        month: monthKey, // Manter formato YYYY-MM para compatibilidade
        monthLabel: monthLabel, // Adicionar label formatado para exibição
        level: levelIndex >= 0 ? levelIndex + 1 : 1, // 1-based index
        levelLabel: levelIndex >= 0 ? (levels[levelIndex]?.title || 'Sem nível') : 'Sem nível',
        score: diag.overall_score,
        delta
      };
    }).filter(item => item !== null) as any[];
    
    // Extrair meses únicos para o array de meses (usado para filtros)
    const uniqueMonths = Array.from(new Set(generalData.map(d => d.month))).sort();
    
    console.log('[DashboardService] Dados de evolução geral calculados:', {
      totalDiagnostics: sortedDiagnostics.length,
      totalDataPoints: generalData.length,
      uniqueMonths: uniqueMonths.length,
      months: uniqueMonths
    });
    
    // Agrupar diagnósticos por mês (para categorias - manter compatibilidade)
    const diagnosticsByMonth = new Map<string, any[]>();
    sortedDiagnostics.forEach(diag => {
      const date = new Date(diag.performed_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!diagnosticsByMonth.has(monthKey)) {
        diagnosticsByMonth.set(monthKey, []);
      }
      diagnosticsByMonth.get(monthKey)!.push(diag);
    });
    
    const sortedMonths = Array.from(diagnosticsByMonth.keys()).sort();
    const recentMonths = sortedMonths.slice(-12);
    
    // Para categorias, vamos usar o diagnóstico mais recente de cada mês (para não sobrecarregar o gráfico)
    const categoriesData = recentMonths.map(month => {
      const monthDiagnostics = diagnosticsByMonth.get(month);
      if (!monthDiagnostics || monthDiagnostics.length === 0) {
        return null;
      }
      
      // Pegar o mais recente do mês (último do array, já que sortedDiagnostics está ordenado)
      const latest = monthDiagnostics[monthDiagnostics.length - 1];
      
      // Verificar se latest tem os dados necessários
      if (!latest || !latest.categorias || !Array.isArray(latest.categorias)) {
        console.warn('[DashboardService] Diagnóstico sem categorias no mês', month, latest);
        return null;
      }
      
      // Buscar o mês anterior que tenha dados
      const currentMonthIndex = recentMonths.indexOf(month);
      let previous: any = null;
      for (let i = currentMonthIndex - 1; i >= 0; i--) {
        const prevMonth = recentMonths[i];
        const prevDiagnostics = diagnosticsByMonth.get(prevMonth);
        if (prevDiagnostics && prevDiagnostics.length > 0) {
          previous = prevDiagnostics[prevDiagnostics.length - 1];
          break;
        }
      }

      const topCategories = (latest.categorias || [])
        .map((cat: any) => {
          const category = categories.find(c => c.id === cat.category_id);
          const level = levels.find(l => l.id === cat.level_id);
          const previousCat = previous?.categorias?.find(
            (pc: any) => pc.category_id === cat.category_id
          );
          const delta = previousCat ? cat.score - previousCat.score : 0;

          // Cores por categoria (pode ser melhorado)
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
          const colorIndex = (cat.category_id - 1) % colors.length;
          const levelIndex = levels.findIndex(l => l.id === cat.level_id);

          return {
            id: cat.category_id.toString(),
            name: category?.title || `Categoria ${cat.category_id}`,
            level: levelIndex >= 0 ? levelIndex + 1 : 1,
            levelLabel: level?.title || 'Sem nível',
            score: cat.score,
            delta,
            color: colors[colorIndex]
          };
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3);

      return {
        month,
        topCategories
      };
    }).filter(item => item !== null) as any[];

    // Calcular performance
    const generalPerformance = generalData.length >= 2 
      ? this.calculatePerformanceMetrics(generalData)
      : {
          percentage: 0,
          trend: 'flat' as const,
          period: 'último mês'
        };
    
    const categoriesPerformance: Record<string, any> = {};
    categories.forEach(cat => {
      const categoryData = categoriesData
        .filter(m => m && m.topCategories && m.topCategories.length > 0)
        .flatMap(m => m.topCategories.filter((tc: any) => tc.id === cat.id.toString()))
        .map((tc: any) => ({ score: tc.score, delta: tc.delta }));
      
      if (categoryData.length >= 2) {
        categoriesPerformance[cat.id.toString()] = this.calculatePerformanceMetrics(
          categoryData.map((d, i) => ({
            month: recentMonths[i] || '',
            score: d.score,
            delta: d.delta
          }))
        );
      }
    });

    // Extrair meses únicos dos dados gerais para o array de meses
    const monthsForDisplay = Array.from(new Set(generalData.map(d => d.month))).sort();
    
    return {
      levelLabels,
      months: monthsForDisplay, // Usar meses únicos dos dados gerais
      insightLines: [
        'Atualmente em sua trilha de crescimento',
        'Continue evoluindo para alcançar novos patamares'
      ],
      general: {
        data: generalData,
        performance: generalPerformance
      },
      categories: {
        data: categoriesData,
        performance: categoriesPerformance
      }
    };
    } catch (error) {
      console.error('[DashboardService] Erro ao calcular evolução:', error);
      console.error('[DashboardService] Stack:', error instanceof Error ? error.stack : 'N/A');
      // Retornar undefined em caso de erro para não quebrar o dashboard
      return undefined;
    }
  }

  /**
   * Retorna dados de evolução geral
   * @param userId - ID do usuário no Directus
   * @param token - Token do Directus
   */
  static async getEvolutionGeneralData(userId?: number, token?: string) {
    try {
      console.log('[DashboardService] getEvolutionGeneralData - Carregando evolução geral');
      
      if (!userId) {
        throw new Error('userId é obrigatório para buscar dados de evolução');
      }

      const dashboardData = await this.getDashboardData(userId, token);
      const evolutionData = dashboardData.evolution?.general;
      
      if (!evolutionData) {
        throw new Error('Dados de evolução geral não encontrados');
      }
      
      console.log('[DashboardService] getEvolutionGeneralData - Dados carregados:', {
        dataLength: evolutionData.data?.length || 0,
        hasPerformance: !!evolutionData.performance
      });
      
      return evolutionData;
    } catch (error) {
      console.error('[DashboardService] getEvolutionGeneralData - Erro:', error);
      throw error;
    }
  }

  /**
   * Retorna dados de evolução por categorias
   * @param userId - ID do usuário no Directus
   * @param token - Token do Directus
   */
  static async getEvolutionCategoriesData(userId?: number, token?: string) {
    try {
      console.log('[DashboardService] getEvolutionCategoriesData - Carregando evolução por categorias');
      
      if (!userId) {
        throw new Error('userId é obrigatório para buscar dados de evolução');
      }

      const dashboardData = await this.getDashboardData(userId, token);
      const evolutionData = dashboardData.evolution?.categories;
      
      if (!evolutionData) {
        throw new Error('Dados de evolução por categorias não encontrados');
      }
      
      console.log('[DashboardService] getEvolutionCategoriesData - Dados carregados:', {
        dataLength: evolutionData.data?.length || 0,
        hasPerformance: !!evolutionData.performance
      });
      
      return evolutionData;
    } catch (error) {
      console.error('[DashboardService] getEvolutionCategoriesData - Erro:', error);
      throw error;
    }
  }

  /**
   * Retorna dados de performance geral
   * @param userId - ID do usuário no Directus
   * @param token - Token do Directus
   */
  static async getPerformanceGeneralData(userId?: number, token?: string) {
    try {
      console.log('[DashboardService] getPerformanceGeneralData - Carregando performance geral');
      
      if (!userId) {
        throw new Error('userId é obrigatório para buscar dados de performance');
      }

      const dashboardData = await this.getDashboardData(userId, token);
      const performanceData = dashboardData.evolution?.general?.performance;
      
      if (!performanceData) {
        throw new Error('Dados de performance geral não encontrados');
      }
      
      console.log('[DashboardService] getPerformanceGeneralData - Dados carregados:', {
        percentage: performanceData.percentage,
        trend: performanceData.trend,
        period: performanceData.period
      });
      
      return performanceData;
    } catch (error) {
      console.error('[DashboardService] getPerformanceGeneralData - Erro:', error);
      throw error;
    }
  }

  /**
   * Retorna dados de performance por categoria específica
   * @param categoryId - ID da categoria
   * @param userId - ID do usuário no Directus
   * @param token - Token do Directus
   */
  static async getPerformanceCategoryData(categoryId: string, userId?: number, token?: string) {
    try {
      console.log('[DashboardService] getPerformanceCategoryData - Carregando performance para categoria:', categoryId);
      
      if (!userId) {
        throw new Error('userId é obrigatório para buscar dados de performance');
      }

      const dashboardData = await this.getDashboardData(userId, token);
      const categoryPerformance = dashboardData.evolution?.categories?.performance?.[categoryId];
      
      if (!categoryPerformance) {
        throw new Error(`Dados de performance para categoria ${categoryId} não encontrados`);
      }
      
      console.log('[DashboardService] getPerformanceCategoryData - Dados carregados:', {
        categoryId,
        percentage: categoryPerformance.percentage,
        trend: categoryPerformance.trend,
        period: categoryPerformance.period
      });
      
      return categoryPerformance;
    } catch (error) {
      console.error('[DashboardService] getPerformanceCategoryData - Erro:', error);
      throw error;
    }
  }

  /**
   * Carrega dados mock do arquivo JSON
   */
  private static async loadMockData(): Promise<DashboardResponse> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Caminho para o arquivo mock
      const mockPath = path.join(__dirname, '../../server/mock/dashboard.mock.json');
      
      console.log('[DashboardService] loadMockData - Carregando arquivo:', mockPath);
      
      const rawData = fs.readFileSync(mockPath, 'utf8');
      const mockData = JSON.parse(rawData);
      
      console.log('[DashboardService] loadMockData - Arquivo carregado com sucesso');
      return mockData;
    } catch (error) {
      console.error('[DashboardService] loadMockData - Erro ao carregar mock:', error);
      throw new Error('Erro ao carregar dados mock do dashboard');
    }
  }

  /**
   * Calcula métricas de performance baseadas nos dados
   */
  static calculatePerformanceMetrics(data: any[]) {
    if (!data || data.length === 0) {
      return {
        percentage: 0,
        trend: 'flat' as const,
        period: 'último mês'
      };
    }

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    if (!latest || !previous) {
      return {
        percentage: 0,
        trend: 'flat' as const,
        period: 'último mês'
      };
    }

    const delta = latest.score - previous.score;
    const percentage = previous.score > 0 ? (delta / previous.score) * 100 : 0;
    
    return {
      percentage: Math.round(percentage * 10) / 10, // Arredondar para 1 casa decimal
      trend: delta > 0 ? 'up' as const : delta < 0 ? 'down' as const : 'flat' as const,
      period: 'último mês'
    };
  }

  /**
   * Filtra dados por período (3m, 6m, 12m)
   */
  static filterDataByPeriod(data: any[], period: string) {
    const periods = {
      '3m': 3,
      '6m': 6,
      '12m': 12
    };
    
    const months = periods[period as keyof typeof periods] || 12;
    return data.slice(-months);
  }

  /**
   * Obtém as 3 melhores categorias de um mês específico
   */
  static getTopCategories(monthData: any, limit: number = 3) {
    if (!monthData?.topCategories) {
      return [];
    }
    
    return monthData.topCategories
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);
  }
}
