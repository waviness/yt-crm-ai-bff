import type { VercelRequest, VercelResponse } from '@vercel/node';

const DASHSCOPE_API_URL =
  'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const DEFAULT_MODEL = 'qwen-plus';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
}

interface DashScopeResponse {
  status_code?: number;
  code?: string;
  message?: string;
  output?: {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
    text?: string;
  };
}

function buildMessages(body: ChatRequestBody): ChatMessage[] {
  const messages: ChatMessage[] = [];
  const systemPrompt = 'You are a helpful AI assistant.';

  messages.push({ role: 'system', content: systemPrompt });

  if (body.history && body.history.length > 0) {
    for (const msg of body.history) {
      if (msg.role && msg.content) {
        messages.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        });
      }
    }
  }

  messages.push({ role: 'user', content: body.message });
  return messages;
}

async function callDashScope(
  apiKey: string,
  messages: ChatMessage[]
): Promise<string> {
  const response = await fetch(DASHSCOPE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: { messages },
      parameters: { result_format: 'message' },
    }),
  });

  const data = (await response.json()) as DashScopeResponse;

  if (!response.ok) {
    const errMsg = data.message || response.statusText || 'API 调用失败';
    throw new Error(errMsg);
  }

  if (data.output?.choices?.[0]?.message?.content) {
    return data.output.choices[0].message.content;
  }

  if (data.output?.text) {
    return data.output.text;
  }

  throw new Error(data.message || '未获取到有效回复');
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      reply: '仅支持 POST 请求',
    });
    return;
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      success: false,
      reply: '服务端未配置 AI_API_KEY',
    });
    return;
  }

  let body: ChatRequestBody;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({
      success: false,
      reply: '请求体必须是有效的 JSON',
    });
    return;
  }

  if (!body?.message || typeof body.message !== 'string') {
    res.status(400).json({
      success: false,
      reply: '缺少 message 字段或格式错误',
    });
    return;
  }

  try {
    const messages = buildMessages(body);
    const reply = await callDashScope(apiKey, messages);
    res.status(200).json({ success: true, reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    res.status(500).json({
      success: false,
      reply: `AI 服务异常: ${message}`,
    });
  }
}
