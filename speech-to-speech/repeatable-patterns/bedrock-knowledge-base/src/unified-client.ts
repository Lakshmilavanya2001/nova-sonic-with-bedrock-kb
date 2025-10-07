import { NovaSonicBidirectionalStreamClient, StreamSession } from "./client";
import { ClaudeClient, ClaudeResponse } from "./claude-client";
import { BedrockRuntimeClientConfig } from "@aws-sdk/client-bedrock-runtime";

export interface UnifiedClientConfig {
  clientConfig: Partial<BedrockRuntimeClientConfig>;
  knowledgeBaseId: string;
}

export type InputType = 'audio' | 'text';

export interface ProcessingResult {
  type: InputType;
  sessionId?: string;
  response?: ClaudeResponse;
  streamSession?: StreamSession;
}

export class UnifiedClient {
  private novaSonicClient: NovaSonicBidirectionalStreamClient;
  private claudeClient: ClaudeClient;

  constructor(config: UnifiedClientConfig) {
    // Initialize Nova Sonic client for audio
    this.novaSonicClient = new NovaSonicBidirectionalStreamClient({
      clientConfig: config.clientConfig
    });

    // Initialize Claude client for text
    this.claudeClient = new ClaudeClient({
      clientConfig: config.clientConfig,
      knowledgeBaseId: config.knowledgeBaseId
    });
  }

  /**
   * Process text input using Claude Sonnet
   */
  async processTextInput(query: string): Promise<ProcessingResult> {
    try {
      const response = await this.claudeClient.processTextQuery(query);
      return {
        type: 'text',
        response
      };
    } catch (error) {
      console.error("Error processing text input:", error);
      throw error;
    }
  }

  /**
   * Create audio session using Nova Sonic
   */
  createAudioSession(sessionId?: string): ProcessingResult {
    const streamSession = this.novaSonicClient.createStreamSession(sessionId);
    return {
      type: 'audio',
      sessionId: streamSession.getSessionId(),
      streamSession
    };
  }

  /**
   * Detect input type based on content
   */
  detectInputType(input: any): InputType {
    if (typeof input === 'string') {
      return 'text';
    } else if (Buffer.isBuffer(input) || input instanceof ArrayBuffer) {
      return 'audio';
    } else if (input && typeof input === 'object' && input.type === 'audio') {
      return 'audio';
    }
    return 'text'; // Default to text
  }

  /**
   * Process input automatically based on type
   */
  async processInput(input: string | Buffer | any): Promise<ProcessingResult> {
    const inputType = this.detectInputType(input);
    
    if (inputType === 'text') {
      return this.processTextInput(input as string);
    } else {
      // For audio, return a session that can be used for streaming
      return this.createAudioSession();
    }
  }

  /**
   * Get active Nova Sonic sessions
   */
  getActiveAudioSessions(): string[] {
    return this.novaSonicClient.getActiveSessions();
  }

  /**
   * Check if audio session is active
   */
  isAudioSessionActive(sessionId: string): boolean {
    return this.novaSonicClient.isSessionActive(sessionId);
  }
}