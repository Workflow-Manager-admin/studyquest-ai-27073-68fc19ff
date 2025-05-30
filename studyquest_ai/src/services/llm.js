/**
 * LLM API integration for MCQ generation (OpenAI or compatible API)
 */
const fetch = require('node-fetch');

// .env: OPENAI_API_KEY, optionally LLM_API_BASE
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const LLM_BASE_URL = process.env.LLM_API_BASE || 'https://api.openai.com/v1/chat/completions';

async function generate(prompt) {
  if (!OPENAI_API_KEY) {
    // Mock: For dev/demo without OpenAI
    return `[{"id":"1","question":"Sample Q: What color is the sky?","options":["A. Blue","B. Green","C. Red","D. Yellow"],"correct":"A","explanation":"Usually blue due to light scattering."}]`;
  }
  const response = await fetch(LLM_BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1024,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status}`);
  }
  const result = await response.json();
  // Extract from response: (for OpenAI Chat API)
  return (result.choices && result.choices[0].message.content) || '';
}

module.exports = { generate };
