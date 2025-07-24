// 初始数据结构

export const STORAGE_KEY = 'vocabulary_data';

// 初始数据结构
export const initialData = {
  units: [] // 空数组，让用户自己创建单元
};

// 示例单词数据结构
/*
{
  id: 'unique_id',
  word: '单词',
  meaning: '释义',
  mastered: false, // 是否已掌握
  createTime: Date.now(), // 创建时间
  reviewTimes: 0, // 复习次数
  lastReviewTime: null // 最后复习时间
}
*/