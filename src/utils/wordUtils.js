// word data operation tools
import { v4 as uuidv4 } from 'uuid';
import { saveData, getData } from './storage';
import { STORAGE_KEY, initialData } from '../data/initialData';

// get all word data
export const getAllData = () => {
  const data = getData(STORAGE_KEY);
  return data || initialData;
};

// save all word data
export const saveAllData = (data) => {
  return saveData(STORAGE_KEY, data);
};

// get word list of specified unit
export const getUnitWords = (unitId) => {
  const data = getAllData();
  const unit = data.units.find(u => u.id === unitId);
  return unit ? unit.words : [];
};

// add word to specified unit
export const addWord = (unitId, word, meaning) => {
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) return false;
  
  const newWord = {
    id: uuidv4(),
    word: word.trim(),
    meaning: meaning.trim(),
    mastered: false,
    createTime: Date.now(),
    reviewTimes: 0,
    lastReviewTime: null
  };
  
  data.units[unitIndex].words.push(newWord);
  return saveAllData(data);
};

// add words to specified unit in batch
export const addWordsInBatch = (unitId, wordsArray) => {
  // wordsArray format: [{word: 'word1', meaning: 'meaning1'}, ...]
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) return false;
  
  const newWords = wordsArray.map(item => ({
    id: uuidv4(),
    word: item.word.trim(),
    meaning: item.meaning.trim(),
    mastered: false,
    createTime: Date.now(),
    reviewTimes: 0,
    lastReviewTime: null
  }));
  
  data.units[unitIndex].words = [...data.units[unitIndex].words, ...newWords];
  return saveAllData(data);
};

// update word
export const updateWord = (unitId, wordId, updatedWord) => {
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) return false;
  
  const wordIndex = data.units[unitIndex].words.findIndex(w => w.id === wordId);
  
  if (wordIndex === -1) return false;
  
  data.units[unitIndex].words[wordIndex] = {
    ...data.units[unitIndex].words[wordIndex],
    ...updatedWord
  };
  
  return saveAllData(data);
};

// update unit
export const updateUnit = (unitId, newValues) => {
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  if (unitIndex === -1) return false;
  Object.assign(data.units[unitIndex], newValues);
  return saveAllData(data);
};

// mark word as mastered/unmastered
export const toggleWordMastered = (unitId, wordId) => {
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) return false;
  
  const wordIndex = data.units[unitIndex].words.findIndex(w => w.id === wordId);
  
  if (wordIndex === -1) return false;
  
  data.units[unitIndex].words[wordIndex].mastered = !data.units[unitIndex].words[wordIndex].mastered;
  data.units[unitIndex].words[wordIndex].lastReviewTime = Date.now();
  data.units[unitIndex].words[wordIndex].reviewTimes += 1;
  
  return saveAllData(data);
};

// get all unmastered words
export const getUnmasteredWords = () => {
  const data = getAllData();
  const unmasteredWords = [];
  
  data.units.forEach(unit => {
    unit.words.forEach(word => {
      if (!word.mastered) {
        unmasteredWords.push({
          ...word,
          unitId: unit.id,
          unitName: unit.name
        });
      }
    });
  });
  
  return unmasteredWords;
};

// get all mastered words
export const getMasteredWords = () => {
  const data = getAllData();
  const masteredWords = [];
  
  data.units.forEach(unit => {
    unit.words.forEach(word => {
      if (word.mastered) {
        masteredWords.push({
          ...word,
          unitId: unit.id,
          unitName: unit.name
        });
      }
    });
  });
  
  return masteredWords;
};

  // create new unit
export const createUnit = (unitName) => {
  const data = getAllData();
  
  // generate new unit id (current max id + 1, if no unit, start from 1)
  let newId = 1;
  if (data.units.length > 0) {
    const maxId = Math.max(...data.units.map(unit => unit.id));
    newId = maxId + 1;
  }
  
  const newUnit = {
    id: newId,
    name: unitName.trim(),
    words: []
  };
  
  data.units.push(newUnit);
  return saveAllData(data) ? newUnit : null;
};

// general delete method
// type: 'unit' | 'word', ids: id list, unitId: unit id when deleting word
export const deleteItems = ({ type, ids, unitId }) => {
  const data = getAllData();
  let deletedCount = 0;
  if (type === 'unit') {
    ids.forEach(unitId => {
      const unitIndex = data.units.findIndex(u => u.id === unitId);
      if (unitIndex !== -1) {
        data.units.splice(unitIndex, 1);
        deletedCount++;
      }
    });
  } else if (type === 'word' && unitId) {
    const unitIndex = data.units.findIndex(u => u.id === unitId);
    if (unitIndex !== -1) {
      const before = data.units[unitIndex].words.length;
      data.units[unitIndex].words = data.units[unitIndex].words.filter(w => !ids.includes(w.id));
      deletedCount = before - data.units[unitIndex].words.length;
    }
  }
  return saveAllData(data) ? deletedCount : 0;
};

// export unit words to CSV format
export const exportUnitWordsToCSV = (unitId) => {
  const words = getUnitWords(unitId);
  if (words.length === 0) return '';
  
  const header = '单词,释义,是否掌握,创建时间,复习次数,最后复习时间\n'; 
  const rows = words.map(word => {
    const mastered = word.mastered ? '是' : '否';
    const createTime = new Date(word.createTime).toLocaleString();
    const lastReviewTime = word.lastReviewTime ? new Date(word.lastReviewTime).toLocaleString() : '';
    return `${word.word},${word.meaning},${mastered},${createTime},${word.reviewTimes},${lastReviewTime}`;
  }).join('\n');
  
  return header + rows;
};

// import words from CSV
export const importWordsFromCSV = (unitId, csvContent) => {
  try {
    const lines = csvContent.split('\n');
    const wordsArray = [];
    
    // skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',');
      if (parts.length >= 2) {
        wordsArray.push({
          word: parts[0],
          meaning: parts[1]
        });
      }
    }
    
    return addWordsInBatch(unitId, wordsArray);
  } catch (error) {
    console.error('import CSV failed:', error);
    return false;
  }
};