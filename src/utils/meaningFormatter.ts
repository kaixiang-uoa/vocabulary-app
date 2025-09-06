/**
 * Meaning formatter utility
 * Handles formatting of word meanings with multiple parts of speech
 */

// Common parts of speech patterns (English abbreviations)
const PARTS_OF_SPEECH = [
  'n.',
  'noun.',
  'v.',
  'verb.',
  'adj.',
  'adv.',
  'prep.',
  'conj.',
  'pron.',
  'art.',
  'interj.',
  'num.',
  'det.',
  'aux.',
  'modal.',
  'vi.',
  'vt.',
  'pl.',
  'sing.',
  'inf.',
  'past.',
  'pp.',
  'ing.',
];

// Chinese parts of speech patterns
const CHINESE_PARTS_OF_SPEECH = [
  '名词',
  '动词',
  '形容词',
  '副词',
  '介词',
  '连词',
  '代词',
  '感叹词',
  '数词',
  '量词',
  '助词',
  '语气词',
];

/**
 * Check if a text segment starts with a part of speech indicator
 */
const startsWithPartOfSpeech = (text: string): boolean => {
  const trimmed = text.trim();
  return (
    PARTS_OF_SPEECH.some(pos => trimmed.startsWith(pos)) ||
    CHINESE_PARTS_OF_SPEECH.some(pos => trimmed.startsWith(pos))
  );
};

/**
 * Split meaning by parts of speech and format for display
 */
export const formatMeaning = (meaning: string): string[] => {
  if (!meaning) return [meaning];

  // Strategy 1: Split by semicolon or Chinese semicolon first
  const segments = meaning
    .split(/[;；]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // If we have good segments from semicolon, use them
  if (segments.length > 1 && segments.every(s => s.length > 5)) {
    return segments;
  }

  // Strategy 2: Look for clear part-of-speech patterns with sufficient content
  const posRegex =
    /\b(n\.|v\.|adj\.|adv\.|prep\.|conj\.|pron\.|art\.|interj\.|vi\.|vt\.)\s+/g;
  const matches = Array.from(meaning.matchAll(posRegex));

  if (matches.length > 0) {
    const parts: string[] = [];

    // Add content before first part of speech if it exists and is substantial
    if (matches[0].index! > 0) {
      const beforeFirst = meaning.substring(0, matches[0].index!).trim();
      if (beforeFirst.length > 8) {
        parts.push(beforeFirst);
      }
    }

    // Process each part of speech section
    matches.forEach((match, index) => {
      const startIndex = match.index!;
      const nextMatch = matches[index + 1];
      const endIndex = nextMatch ? nextMatch.index! : meaning.length;

      const part = meaning.substring(startIndex, endIndex).trim();

      // Only add parts that have substantial content (not just "n." alone)
      if (part.length > 5) {
        parts.push(part);
      }
    });

    // Only use this split if we got meaningful parts
    if (parts.length > 1 && parts.every(part => part.length > 5)) {
      return parts;
    }
  }

  // Strategy 3: Manual parsing for complex cases
  const words = meaning.split(/\s+/);
  const parts: string[] = [];
  let currentPart = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check if this starts a new part of speech section
    // But only split if we have substantial content already
    if (
      i > 0 &&
      startsWithPartOfSpeech(word) &&
      currentPart.trim().length > 15
    ) {
      parts.push(currentPart.trim());
      currentPart = word;
    } else {
      currentPart += (currentPart ? ' ' : '') + word;
    }
  }

  // Add the final part
  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  // Only use manual split if it produces good results
  if (parts.length > 1 && parts.every(part => part.length > 8)) {
    return parts;
  }

  // If no good split found, return original as single item
  return [meaning];
};

/**
 * Check if meaning should be formatted (has multiple parts)
 */
export const shouldFormatMeaning = (meaning: string): boolean => {
  const formatted = formatMeaning(meaning);
  return formatted.length > 1;
};

/**
 * Get a preview of formatted meaning (first line + indicator)
 */
export const getMeaningPreview = (meaning: string): string => {
  const formatted = formatMeaning(meaning);
  if (formatted.length <= 1) return meaning;

  return formatted[0] + (formatted.length > 1 ? '...' : '');
};
