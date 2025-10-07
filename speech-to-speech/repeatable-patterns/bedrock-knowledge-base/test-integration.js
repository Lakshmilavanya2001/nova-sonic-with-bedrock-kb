// Simple test script to verify the dual input integration
const { UnifiedClient } = require('./dist/unified-client');
const { fromIni } = require('@aws-sdk/credential-providers');

async function testIntegration() {
    console.log('Testing dual input integration...');
    
    try {
        // Initialize the unified client
        const client = new UnifiedClient({
            clientConfig: {
                region: 'us-east-1',
                credentials: fromIni({ profile: process.env.AWS_PROFILE || 'bedrock-test' })
            },
            knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID || 'KGTNCOBA0B'
        });

        console.log('✓ Unified client initialized successfully');

        // Test text input detection
        const textInputType = client.detectInputType("What is Amazon S3?");
        console.log(`✓ Text input detected as: ${textInputType}`);

        // Test audio input detection
        const audioBuffer = Buffer.from([1, 2, 3, 4]);
        const audioInputType = client.detectInputType(audioBuffer);
        console.log(`✓ Audio input detected as: ${audioInputType}`);

        // Test text processing (this will make an actual API call)
        console.log('Testing text processing with Claude...');
        const textResult = await client.processTextInput("What is Amazon S3?");
        console.log('✓ Text processing successful');
        console.log('Response:', textResult.response?.content?.substring(0, 100) + '...');

        // Test audio session creation
        console.log('Testing audio session creation...');
        const audioResult = client.createAudioSession();
        console.log(`✓ Audio session created with ID: ${audioResult.sessionId}`);

        console.log('\n🎉 All tests passed! Integration is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testIntegration();