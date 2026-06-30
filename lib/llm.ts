import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from './prompt';
import { AnalysisResult } from './types';

// === LLM 调用层 ===
// 可替换为真实 API：OpenAI / Claude / DeepSeek 等

interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

// 从环境变量读取配置
function getConfig(): LLMConfig | null {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!apiKey) return null;
  return { apiKey, baseUrl, model };
}

async function callRealLLM(input: string, version: number, config: LLMConfig): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT_TEMPLATE(input, version) },
      ],
      temperature: version === 1 ? 0.7 : Math.min(0.8 + (version - 2) * 0.05, 1.0),
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// === 模拟 LLM（MVP 无 API Key 时使用）===

// 预设解释模型库，按主题分类
const MODEL_LIBRARY = [
  {
    category: 'cognitive',
    models: [
      {
        name: '认知偏差框架',
        explanationTemplate: (event: string) =>
          `从认知心理学角度看，"${event}"可能涉及选择性注意和确认偏误。大脑倾向于优先处理与既有信念一致的信息，同时忽略矛盾证据。这意味着你当前对事件的感受，可能只是整个图景的一部分。`,
        score: 4,
      },
      {
        name: '执行功能模型',
        explanationTemplate: (event: string) =>
          `从神经心理学执行功能角度看，"${event}"可能与工作记忆负荷、抑制控制或任务切换成本有关。这不是意志力问题，而是认知资源分配模式的可观察表现。`,
        score: 3,
      },
      {
        name: '元认知视角',
        explanationTemplate: (event: string) =>
          `从元认知理论出发，"${event}"可能反映了你对自己思维的观察方式。你不仅经历了事件，还在观察自己如何经历它——这种「观察者」和「体验者」的距离，本身就是一个重要的认知信号。`,
        score: 4,
      },
    ],
  },
  {
    category: 'social',
    models: [
      {
        name: '社会认同理论',
        explanationTemplate: (event: string) =>
          `从社会心理学角度看，"${event}"可能涉及群体归属与个人认同之间的张力。当个体感知到自身与所属群体的规范不一致时，会产生认知失调，这种失调往往被体验为不被理解或被排斥。`,
        score: 3,
      },
      {
        name: '标签理论',
        explanationTemplate: (event: string) =>
          `从社会学标签理论出发，"${event}"的核心可能不在于你是什么，而在于系统如何定义你。诊断、评价、分类——这些标签本身具有社会建构性，它们反映的是标准制定者的价值观，而非客观真相。`,
        score: 4,
      },
      {
        name: '期望落差模型',
        explanationTemplate: (event: string) =>
          `从期望管理角度看，"${event}"可能源于你对他人反应的预测与实际结果之间的差距。当期望（我希望被这样理解）与现实（对方这样回应）不匹配时，挫败感是系统反馈信号，而非缺陷。`,
        score: 4,
      },
    ],
  },
  {
    category: 'systemic',
    models: [
      {
        name: '系统动力学视角',
        explanationTemplate: (event: string) =>
          `从系统论角度看，"${event}"不是一个孤立事件，而是一个复杂系统中的反馈回路。你的行为触发了他人的反应，他人的反应又影响了你的后续行为——这个循环的结构可能比任何单一因素都更重要。`,
        score: 3,
      },
      {
        name: '环境匹配假说',
        explanationTemplate: (event: string) =>
          `从生态心理学角度，问题可能不在你内部，而在于你与环境之间的匹配度。就像鱼在沙漠里会挣扎一样，某些特质在特定环境中被定义为"问题"，但在另一种环境中可能是优势。`,
        score: 4,
      },
      {
        name: '路径依赖理论',
        explanationTemplate: (event: string) =>
          `从路径依赖角度看，当前"${event}"的模式可能源于早期某个关键节点的选择或事件。这个初始条件被后续决策不断强化，形成了自我维持的循环——理解起点比批判现状更有价值。`,
        score: 3,
      },
    ],
  },
  {
    category: 'philosophical',
    models: [
      {
        name: '斯多葛框架',
        explanationTemplate: (event: string) =>
          `从斯多葛哲学角度，"${event}"的核心在于可控/不可控的区分。痛苦并非来自事件本身，而是来自你对事件的判断。关键问题是：这件事中，什么是你真正能控制的？`,
        score: 3,
      },
      {
        name: '现象学还原',
        explanationTemplate: (event: string) =>
          `从现象学角度，尝试"悬置"你对"${event}"的所有预设判断。不是"这件事意味着什么"，而是"这件事的实际体验是什么"——回到经验本身，可能发现此前被解释覆盖的原始信息。`,
        score: 2,
      },
    ],
  },
];

// 模拟变量库（新格式：分6类）"
const MOCK_VARIABLES = {
  temporal: [
    { variable: '事件发生距现在的精确时间跨度', impact: '时间越久，记忆重构的可能性越大，事实可信度下降' },
    { variable: '事件是单次发生还是重复模式中的一次', impact: '单次事件更适合情境解释，重复模式更适合行为模型' },
  ],
  environmental: [
    { variable: '事件发生时的具体物理环境（光线、噪声、空间大小）', impact: '环境拥挤/嘈杂会显著改变情绪反应和人际互动' },
    { variable: '是否有第三方在场观察', impact: '有观众时行为可能受社会期望影响，偏离真实意图' },
  ],
  interpersonal: [
    { variable: '对方当时的情绪状态和压力水平', impact: '压力下的人更容易出现认知偏差和情绪化反应' },
    { variable: '你们之间是否有未表达的期望或预设', impact: '隐含期望未被满足是多数人际冲突的根源变量' },
  ],
  historical: [
    { variable: '过去类似情境的互动模式和结果', impact: '历史重复模式决定当前事件是特例还是系统性问题' },
    { variable: '对方是否有自身的认知偏见或信息盲区', impact: '对方的信息处理方式可能与你的假设完全不同' },
  ],
  cognitive: [
    { variable: '你当时的睡眠质量和生理状态', impact: '疲劳/饥饿会降低执行功能，增强情绪反应幅度' },
    { variable: '事件前后是否有其他消耗注意力的并行任务', impact: '认知资源被分流时，解释的准确性显著下降' },
  ],
  external: [
    { variable: '对方的第三方视角和解释', impact: '同一事件在不同观察者眼中的版本可能完全不同' },
    { variable: '是否有未被纳入考量的外部信息', impact: '缺失信息的发现可能推翻当前所有解释模型' },
  ],
};

// 模拟实验库（新结构化格式）
const MOCK_EXPERIMENTS = [
  {
    target_variable: '对方的情绪状态和压力水平',
    design: '在接下来24小时内，选择一个与当前事件相似但不完全相同的情境（例如向对方提出一个小请求），观察对方反应。同时记录对方当天是否有明显的压力来源（工作截止日、家庭事务等）。',
    expected_change: '如果在低压力情境下对方反应明显不同，则情绪调节模型和情境变量的权重上升。',
    judgment_criteria: '对方在两种情境下的回应方式差异是否超过50%（更友好/更耐心 vs 更冷淡/更急躁）。',
    model_update: '如果确实存在显著差异，优先采用环境变量模型和情绪调节模型；如果无差异，转向社会互动模型或行为模式模型。',
  },
  {
    target_variable: '是否存在未表达的期望',
    design: '用一个中立的方式（例如"我想确认一下我的理解是否正确"）向对方询问他们对这件事的看法。注意不要带入你的预设，只收集对方版本。',
    expected_change: '如果对方版本与你的重建显著不同，信息不对称模型的解释力上升。',
    judgment_criteria: '对方是否提到了你之前完全不知道的信息、感受或动机。',
    model_update: '如有新信息，重建事实层并重新评估所有模型；如信息一致，转向行为模式分析。',
  },
  {
    target_variable: '事件发生时的环境条件',
    design: '回忆并记录事件发生时的具体环境：几点、在哪、谁在场、当时的灯光/声音/温度。然后选择一个环境条件完全不同的场景，尝试回忆同一件事（例如在安静的书房 vs 嘈杂的咖啡店）。',
    expected_change: '在不同环境下对事件的回忆和感受会有可测量的差异，验证记忆重构模型。',
    judgment_criteria: '两个环境下对事件的描述是否有超过20%的细节差异，且情绪评分是否有显著变化。',
    model_update: '如有显著环境效应，记忆重构模型权重上升，需区分"原始事件"和"回忆版本"。',
  },
];

// 根据版本号和输入选择不同模型组合
function selectModels(input: string, version: number) {
  const allModels = MODEL_LIBRARY.flatMap((cat) => cat.models);

  // 根据版本轮转选择不同模型
  const offset = (version - 1) * 3;
  const selected: typeof allModels = [];

  for (let i = 0; i < Math.min(4, allModels.length); i++) {
    const idx = (offset + i) % allModels.length;
    // 确保不重复
    if (!selected.find((m) => m.name === allModels[idx].name)) {
      selected.push(allModels[idx]);
    }
  }

  // 保证至少3个
  while (selected.length < 3) {
    const idx = selected.length % allModels.length;
    if (!selected.find((m) => m.name === allModels[idx].name)) {
      selected.push(allModels[idx]);
    }
  }

  return selected;
}

function generateVariables(input: string, version: number) {
  return MOCK_VARIABLES;
}

function generateExperiment(version: number) {
  return MOCK_EXPERIMENTS[version % MOCK_EXPERIMENTS.length];
}

// === 主入口 ===

export async function analyze(input: string, version: number = 1): Promise<AnalysisResult> {
  const config = getConfig();

  if (config) {
    // 真实 LLM 调用
    try {
      const raw = await callRealLLM(input, version, config);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        event_type: parsed.event_type || '',
        event_reconstruction: parsed.event_reconstruction || '',
        event_summary: parsed.event_summary || parsed.event_reconstruction || '',
        facts: parsed.facts || [],
        models: parsed.models.map((m: any) => ({
          name: m.name,
          dimension: m.dimension || '',
          approach: m.approach || m.dimension || '',
          content: m.content || '',
          explanation: m.explanation || m.content || '',
          logic: m.logic || '',
          scope: m.scope || '',
          score: Math.min(5, Math.max(1, m.score || 3)),
        })),
        variables: parsed.variables || [],
        key_variables: parsed.key_variables || [],
        categorized_variables: parsed.variables && typeof parsed.variables === 'object' && !Array.isArray(parsed.variables) ? parsed.variables : undefined,
        experiment: parsed.experiment || '',
        next_experiment: typeof parsed.next_experiment === 'object' ? parsed.next_experiment : (parsed.next_experiment || parsed.experiment || ''),
        conflict_analysis: parsed.conflict_analysis || undefined,
        version,
        created_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error('LLM call failed, falling back to simulated engine:', err);
      // fallback to simulated
    }
  }

  // 模拟引擎（MVP 无 API Key 时自动使用）
  const selectedModels = selectModels(input, version);
  const models = selectedModels.map((m, i) => ({
    name: m.name,
    explanation: m.explanationTemplate(input),
    score: Math.max(1, Math.min(5, m.score + ((version % 3) - 1))),
  }));

  const variables = generateVariables(input, version);
  const experiment = generateExperiment(version);

  // 生成事件总结（简单规则版）
  const eventSummary = input.length > 50 ? `你描述了：${input.slice(0, 50)}...` : `你描述了：${input}`;

  return {
    event_type: '',
    event_reconstruction: eventSummary,
    event_summary: eventSummary,
    facts: [],
    models,
    variables: [] as string[],
    key_variables: [],
    categorized_variables: variables,
    experiment: '',
    next_experiment: experiment,
    conflict_analysis: undefined,
    version,
    created_at: new Date().toISOString(),
  };
}
