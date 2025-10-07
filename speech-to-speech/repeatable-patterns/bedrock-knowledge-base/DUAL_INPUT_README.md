# Dual Input Mode: Text + Audio with Bedrock Knowledge Base

This application now supports both text and audio inputs, automatically routing to the appropriate AI model:

## Features

- **Text Input**: Uses Claude Sonnet 3.5 for text-based queries
- **Audio Input**: Uses Nova Sonic for voice conversations
- **Unified Knowledge Base**: Both models access the same Bedrock Knowledge Base

## How It Works

### Text Input (Claude Sonnet)
1. Type your question in the text input field
2. Press Enter or click "Send"
3. Claude Sonnet processes your query with knowledge base context
4. Response appears in the chat

### Audio Input (Nova Sonic)
1. Click "Start Voice Chat" to begin audio session
2. Speak your question
3. Nova Sonic processes your voice with knowledge base context
4. Response is both spoken and displayed in chat
5. Click "Stop Voice Chat" to end the session

## Configuration

Set your Knowledge Base ID in the environment variable:
```bash
export KNOWLEDGE_BASE_ID="your-knowledge-base-id"
```

Or modify the default in `server.ts`:
```typescript
const KNOWLEDGE_BASE_ID = process.env.KNOWLEDGE_BASE_ID || 'KGTNCOBA0B';
```

## Usage Examples

### Text Queries
- "What is Amazon S3?"
- "How do I configure VPC security groups?"
- "Explain AWS Lambda pricing"

### Voice Queries
- Speak naturally: "Tell me about EC2 instance types"
- Ask follow-up questions in the same voice session
- The system maintains conversation context

## Technical Details

- **Text Model**: `anthropic.claude-3-5-sonnet-20241022-v2:0`
- **Audio Model**: `amazon.nova-sonic-v1:0`
- **Knowledge Base**: Shared across both input types
- **Response Format**: Text responses for text input, audio + text for voice input

## Benefits

1. **Flexibility**: Choose input method based on your preference
2. **Consistency**: Same knowledge base ensures consistent answers
3. **Context Preservation**: Each input type maintains its own conversation flow
4. **Accessibility**: Supports both text and voice interactions