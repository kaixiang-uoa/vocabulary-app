// Universal import parser for JSON/CSV content
// Returns { type: 'json'|'csv-units'|'csv-words', data }

export function parseImportContent(content, fileName) {
  // 1. File extension check
  if (fileName) {
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    if (ext !== '.json' && ext !== '.csv') {
      throw new Error('Only .json and .csv files are allowed');
    }
  }
  // 2. Try parse as JSON
  let isJson = false;
  let data;
  try {
    data = JSON.parse(content);
    isJson = true;
  } catch {
    // If file is .json and parse fails, throw JSON format error
    if (fileName && fileName.toLowerCase().endsWith('.json')) {
      throw new Error('Invalid JSON format');
    }
  }
  if (isJson) {
    // 支持 JSON 单词数组
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'word' in data[0] && 'meaning' in data[0]) {
      return { type: 'json', data };
    }
    if (!data.units || !Array.isArray(data.units)) {
      throw new Error('Invalid JSON format: missing units array');
    }
    return { type: 'json', data };
  }
  // 3. Parse as CSV
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV content is empty');
  const header = lines[0].toLowerCase().replace(/\s+/g, '');
  // 4. unit,word,meaning (multi-unit import)
  if (header === 'unit,word,meaning') {
    const unitsMap = {};
    for (let i = 1; i < lines.length; i++) {
      const [unit, word, meaning] = lines[i].split(',');
      if (!unit || !word || !meaning) continue;
      if (!unitsMap[unit]) unitsMap[unit] = [];
      unitsMap[unit].push({ word: word.trim(), meaning: meaning.trim() });
    }
    // Convert to units array
    const units = Object.entries(unitsMap).map(([name, words], idx) => ({
      id: idx + 1,
      name,
      words
    }));
    return { type: 'csv-units', data: { units } };
  }
  // 5. word,meaning (single-unit import)
  if (header === 'word,meaning') {
    const words = [];
    for (let i = 1; i < lines.length; i++) {
      const [word, meaning] = lines[i].split(',');
      if (!word || !meaning) continue;
      words.push({ word: word.trim(), meaning: meaning.trim() });
    }
    return { type: 'csv-words', data: { words } };
  }
  throw new Error('Unsupported import format. Please use JSON or CSV with correct headers.');
} 