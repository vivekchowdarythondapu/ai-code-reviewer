const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.reviewCode = async (code, language) => {
  const prompt = `
You are an expert software engineer doing a deep code review.
First, detect the actual programming language of this code by looking at its syntax — ignore what the user selected.
Then analyze the code and respond ONLY in this exact JSON format:

{
  "detectedLanguage": "<the actual language you detect from syntax, lowercase, e.g. python, javascript, java, cpp>",
  "languageMismatch": <true if detectedLanguage is different from "${language}", otherwise false>,
  "score": <0-100>,
  "summary": "<2-3 sentence summary>",
  "complexity": {
    "time": {
      "current": "<e.g. O(n²)>",
      "optimized": "<e.g. O(n)>",
      "explanation": "<why and how>"
    },
    "space": {
      "current": "<e.g. O(1)>",
      "optimized": "<e.g. O(n)>",
      "explanation": "<why and how>"
    }
  },
  "optimizedCode": "<the COMPLETE rewritten version of the entire input code, with the best possible time and space complexity, fully working and runnable, same language as detected, preserving function signature and behavior>",
  "issues": [
    {
      "line": <line number or null>,
      "lineEnd": <end line number or null>,
      "type": "<bug|security|performance|style>",
      "severity": "<critical|warning|suggestion>",
      "message": "<one short sentence, max 15 words>",
      "before": "<exact problematic code snippet>",
      "after": "<exact fixed code snippet>",
      "complexityImpact": {
        "timeBefore": "<e.g. O(n²) or null>",
        "timeAfter": "<e.g. O(n) or null>",
        "spaceBefore": "<e.g. O(1) or null>",
        "spaceAfter": "<e.g. O(n) or null>"
      }
    }
  ]
}

Rules:
- detectedLanguage must be based purely on syntax patterns in the code, not on what the user selected
- "before" and "after" in issues must be small ACTUAL CODE snippets, not English sentences
- "optimizedCode" must be the FULL complete code, not a snippet — it should be directly runnable
- If the original code is already optimal, optimizedCode can be the same but cleaned up
- message must be ONE short sentence, no more than 15 words
- Score: 90-100 excellent, 70-89 good, 50-69 average, 30-49 poor, 0-29 critical issues
- Return ONLY valid JSON, no markdown, no extra text
- Escape newlines in optimizedCode properly as \\n within the JSON string

User selected language: ${language}

Code to review:
\`\`\`
${code}
\`\`\`
`;

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4000,
    messages: [
      {
        role: 'system',
        content: 'You are an expert software engineer. Always respond with valid JSON only. No markdown, no extra text. Always provide actual code in before/after and optimizedCode fields. Keep issue messages to one short sentence. Ensure optimizedCode is complete and properly escaped JSON.'
      },
      { role: 'user', content: prompt }
    ]
  });

  const text = response.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};