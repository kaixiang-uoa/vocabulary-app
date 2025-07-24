// 本地存储工具函数

// 保存数据到localStorage
export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存数据失败:', error);
    return false;
  }
};

// 从localStorage获取数据
export const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('获取数据失败:', error);
    return null;
  }
};

// 从localStorage删除数据
export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('删除数据失败:', error);
    return false;
  }
};

// 清空localStorage
export const clearAllData = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('清空数据失败:', error);
    return false;
  }
};