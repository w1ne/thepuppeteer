export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  generate(messages: LLMMessage[]): Promise<string>;
}

export class MockLLMService implements LLMProvider {
  async generate(messages: LLMMessage[]): Promise<string> {
    console.log(
      '[MockLLM] Generating response for:',
      messages[messages.length - 1].content,
    );

    // Simple heuristic for demo purposes
    const lastMsg = messages[messages.length - 1].content.toLowerCase();

    if (lastMsg.includes('task')) {
      return JSON.stringify({
        thought: 'I need to check the task details.',
        action: 'read_task',
        args: {},
      });
    }

    return JSON.stringify({
      thought: 'I have completed the request.',
      action: 'task_complete',
      args: { result: 'Done' },
    });
  }
}

// In a real app, we would switch this based on env vars
export const llm = new MockLLMService();
