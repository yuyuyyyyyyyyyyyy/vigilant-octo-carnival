import { NextRequest, NextResponse } from 'next/server';
import { analyze } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, version = 1 } = body;

    // 输入验证
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { success: false, error: '请输入事件描述' },
        { status: 400 }
      );
    }

    if (input.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: '输入太短，请描述更多细节' },
        { status: 400 }
      );
    }

    if (input.length > 2000) {
      return NextResponse.json(
        { success: false, error: '输入过长，请精简到2000字以内' },
        { status: 400 }
      );
    }

    // 调用分析引擎
    const result = await analyze(input.trim(), version);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { success: false, error: '分析引擎暂时不可用，请稍后再试' },
      { status: 500 }
    );
  }
}
