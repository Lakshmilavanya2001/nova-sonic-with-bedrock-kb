import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  BedrockRuntimeClientConfig,
} from "@aws-sdk/client-bedrock-runtime";
import { BedrockKnowledgeBaseClient } from "./bedrock-kb-client";

export interface ClaudeClientConfig {
  clientConfig: Partial<BedrockRuntimeClientConfig>;
  knowledgeBaseId: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeClient {
  private bedrockClient: BedrockRuntimeClient;
  private knowledgeBaseId: string;
  private kbClient: BedrockKnowledgeBaseClient;

  constructor(config: ClaudeClientConfig) {
    this.bedrockClient = new BedrockRuntimeClient({
      region: "us-east-1",
      ...config.clientConfig,
    });
    this.knowledgeBaseId = config.knowledgeBaseId;
    this.kbClient = new BedrockKnowledgeBaseClient();
  }

  async processTextQuery(query: string): Promise<ClaudeResponse> {
    try {
      let context = '';
      
      // Try to retrieve from knowledge base, but continue without it if it fails
      try {
        const kbResults = await this.kbClient.retrieveFromKnowledgeBase({
          knowledgeBaseId: this.knowledgeBaseId,
          query,
          numberOfResults: 3
        });
        
        context = Array.isArray(kbResults) 
          ? kbResults.map((result: any) => result.content || '').join('\n\n')
          : '';
      } catch (kbError) {
        console.log('Knowledge base not available, proceeding without context');
        context = 'No knowledge base context available.';
      }

      // Create the prompt for Claude
      const systemPrompt = context 
        ? `You are an AWS Technical Assistant. You must ONLY answer questions using the provided context from the knowledge base. Keep responses to maximum 2-3 sentences. If the context doesn't contain relevant information, say "I don't have information about that in my knowledge base."

Context from Knowledge Base:
${context}

IMPORTANT: Base your answer ONLY on the provided context above. Keep response concise (2-3 sentences maximum).`
        : `You are an AWS Technical Assistant. Answer questions about AWS services and best practices in maximum 2-3 sentences.`;

      const userMessage = query;

      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userMessage
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: "us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload)
      });

      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return {
        content: responseBody.content[0].text,
        usage: responseBody.usage
      };

    } catch (error) {
      console.error("Error processing text query with Claude:", error);
      throw error;
    }
  }
}