const axios = require('axios');

const LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.50.0' },
  php: { language: 'php', version: '8.2.3' }
};

exports.runCode = async (code, language, stdin = '') => {
  const lang = LANGUAGE_MAP[language];
  if (!lang) throw new Error(`Language "${language}" is not supported`);

  const response = await axios.post(
    'https://emkc.org/api/v2/piston/execute',
    {
      language: lang.language,
      version: lang.version,
      files: [{ content: code }],
      stdin: stdin
    }
  );

  const result = response.data;
  const run = result.run;

  return {
    stdout: run.stdout || null,
    stderr: run.stderr || null,
    compileOutput: result.compile?.stderr || null,
    status: run.code === 0 ? 'Accepted' : 'Runtime Error',
    time: null,
    memory: null
  };
};