import {
  ImportCompleteData,
  ImportData,
  ImportUnitData,
  ImportWordData,
} from '../types';

// Parse CSV content to word array (for single unit)
export const parseCSV = (csvContent: string): ImportWordData[] => {
  const lines = csvContent.trim().split('\n');
  const words: ImportWordData[] = [];

  // Skip header line (word,meaning)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV format, support comma and tab separation
    const parts = line.includes('\t') ? line.split('\t') : line.split(',');

    if (parts.length >= 2) {
      const word = parts[0].trim().replace(/"/g, '');
      const meaning = parts[1].trim().replace(/"/g, '');

      if (word && meaning) {
        words.push({ word, meaning });
      }
    }
  }

  return words;
};

// Parse CSV content to unit data array (for multiple units)
export const parseUnitCSV = (csvContent: string): ImportUnitData[] => {
  const lines = csvContent.trim().split('\n');
  const unitData: ImportUnitData[] = [];

  // Skip header line (unit,word,meaning)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV format, support comma and tab separation
    const parts = line.includes('\t') ? line.split('\t') : line.split(',');

    if (parts.length >= 3) {
      const unit = parts[0].trim().replace(/"/g, '');
      const word = parts[1].trim().replace(/"/g, '');
      const meaning = parts[2].trim().replace(/"/g, '');

      if (unit && word && meaning) {
        unitData.push({ unit, word, meaning });
      }
    }
  }

  return unitData;
};

// Parse JSON content to word array (for single unit)
export const parseJSON = (jsonContent: string): ImportWordData[] => {
  try {
    const data = JSON.parse(jsonContent);

    if (Array.isArray(data)) {
      return data
        .map(item => ({
          word: item.word || item.Word || '',
          meaning: item.meaning || item.Meaning || item.translation || '',
        }))
        .filter(item => item.word && item.meaning);
    }

    return [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to parse JSON:', error);
    return [];
  }
};

// Parse JSON content to complete data structure (for multiple units)
export const parseCompleteJSON = (
  jsonContent: string
): ImportCompleteData | null => {
  try {
    const data = JSON.parse(jsonContent);

    if (data && data.units && Array.isArray(data.units)) {
      return data;
    }

    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to parse complete JSON:', error);
    return null;
  }
};

// Auto-detect and parse content based on format
export const parseImportContent = (
  content: string,
  fileType: string
): ImportData => {
  switch (fileType.toLowerCase()) {
    case 'csv':
      // Check if CSV has unit column (3 columns: unit,word,meaning)
      const lines = content.trim().split('\n');
      const firstLine = lines[0]?.trim();
      if (firstLine) {
        const parts = firstLine.includes('\t')
          ? firstLine.split('\t')
          : firstLine.split(',');
        if (parts.length >= 3) {
          // Has unit column, parse as unit CSV
          return parseUnitCSV(content);
        }
      }
      // No unit column, parse as word CSV
      return parseCSV(content);

    case 'json':
      // Try to parse as complete structure first
      const completeData = parseCompleteJSON(content);
      if (completeData) {
        return completeData;
      }
      // Fall back to word array
      return parseJSON(content);

    default:
      // Auto-detect format
      if (content.trim().startsWith('{')) {
        // Try complete JSON first
        const completeData = parseCompleteJSON(content);
        if (completeData) {
          return completeData;
        }
        return parseJSON(content);
      } else if (content.trim().startsWith('[')) {
        return parseJSON(content);
      } else {
        // CSV format - check for unit column
        const lines = content.trim().split('\n');
        const firstLine = lines[0]?.trim();
        if (firstLine) {
          const parts = firstLine.includes('\t')
            ? firstLine.split('\t')
            : firstLine.split(',');
          if (parts.length >= 3) {
            return parseUnitCSV(content);
          }
        }
        return parseCSV(content);
      }
  }
};
