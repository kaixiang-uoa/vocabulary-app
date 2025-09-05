// Local storage utility functions

// Save data to localStorage
export const saveData = (key: string, data: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save data:', error);
    return false;
  }
};

// Get data from localStorage
export const getData = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get data:', error);
    return null;
  }
};

// Remove data from localStorage
export const removeData = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to remove data:', error);
    return false;
  }
};

// Clean localStorage data
export const clearAllData = (): boolean => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to clear data:', error);
    return false;
  }
};
