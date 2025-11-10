// Simple rate limiter for AWS Bedrock API calls
let lastCallTime = 0;
const RATE_LIMIT_DELAY = 1500; // 1.5 seconds in milliseconds

export async function rateLimitedBedrockCall<T>(
    callFn: () => Promise<T>
): Promise<T> {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall < RATE_LIMIT_DELAY) {
        // Wait for the remaining time before making the next call
        const waitTime = RATE_LIMIT_DELAY - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    try {
        const result = await callFn();
        lastCallTime = Date.now();
        return result;
    } catch (error) {
        // Re-throw the error after updating the last call time
        lastCallTime = Date.now();
        throw error;
    }
}