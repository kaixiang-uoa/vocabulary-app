import { Unit, SyncCommand, StorageData } from "../types/data.types";

// 本地存储管理器
export class LocalStorageManager {
  private readonly PREFIX = "vocab_app_";

  // 获取单元
  getUnit(id: string): Unit | null {
    try {
      const data = localStorage.getItem(`${this.PREFIX}unit_${id}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get unit from localStorage:", error);
      return null;
    }
  }

  // 保存单元
  saveUnit(unit: Unit): void {
    try {
      localStorage.setItem(
        `${this.PREFIX}unit_${unit.id}`,
        JSON.stringify(unit),
      );
    } catch (error) {
      console.error("Failed to save unit to localStorage:", error);
    }
  }

  // 获取所有单元
  getAllUnits(): Unit[] {
    try {
      const units: Unit[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.PREFIX}unit_`)) {
          const data = localStorage.getItem(key);
          if (data) {
            units.push(JSON.parse(data));
          }
        }
      }
      return units.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error("Failed to get all units from localStorage:", error);
      return [];
    }
  }

  // 删除单元
  deleteUnit(id: string): void {
    try {
      localStorage.removeItem(`${this.PREFIX}unit_${id}`);
    } catch (error) {
      console.error("Failed to delete unit from localStorage:", error);
    }
  }

  // 获取所有数据
  getAllData(): StorageData {
    try {
      const units = this.getAllUnits();
      return { units };
    } catch (error) {
      console.error("Failed to get all data from localStorage:", error);
      return { units: [] };
    }
  }

  // 保存所有数据
  saveAllData(data: StorageData): boolean {
    try {
      // 清除现有数据
      const existingUnits = this.getAllUnits();
      existingUnits.forEach((unit) => {
        this.deleteUnit(unit.id);
      });

      // 保存新数据
      data.units.forEach((unit) => {
        this.saveUnit(unit);
      });

      return true;
    } catch (error) {
      console.error("Failed to save all data to localStorage:", error);
      return false;
    }
  }

  // 同步队列管理
  getSyncQueue(): SyncCommand[] {
    try {
      const data = localStorage.getItem(`${this.PREFIX}sync_queue`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get sync queue from localStorage:", error);
      return [];
    }
  }

  addToSyncQueue(command: SyncCommand): void {
    try {
      const queue = this.getSyncQueue();
      queue.push(command);
      localStorage.setItem(`${this.PREFIX}sync_queue`, JSON.stringify(queue));
    } catch (error) {
      console.error("Failed to add command to sync queue:", error);
    }
  }

  removeSyncedCommands(commandIds: string[]): void {
    try {
      const queue = this.getSyncQueue();
      const filtered = queue.filter((cmd) => !commandIds.includes(cmd.id));
      localStorage.setItem(
        `${this.PREFIX}sync_queue`,
        JSON.stringify(filtered),
      );
    } catch (error) {
      console.error("Failed to remove synced commands:", error);
    }
  }

  // 清除同步队列
  clearSyncQueue(): void {
    try {
      localStorage.removeItem(`${this.PREFIX}sync_queue`);
    } catch (error) {
      console.error("Failed to clear sync queue:", error);
    }
  }

  // 获取同步状态
  getSyncStatus(): { pendingCount: number; lastSyncTime: number | null } {
    try {
      const queue = this.getSyncQueue();
      const lastSyncTime = localStorage.getItem(`${this.PREFIX}last_sync_time`);
      return {
        pendingCount: queue.length,
        lastSyncTime: lastSyncTime ? parseInt(lastSyncTime) : null,
      };
    } catch (error) {
      console.error("Failed to get sync status:", error);
      return { pendingCount: 0, lastSyncTime: null };
    }
  }

  // 更新最后同步时间
  updateLastSyncTime(): void {
    try {
      localStorage.setItem(
        `${this.PREFIX}last_sync_time`,
        Date.now().toString(),
      );
    } catch (error) {
      console.error("Failed to update last sync time:", error);
    }
  }

  // 检查是否有本地数据
  hasLocalData(): boolean {
    try {
      const units = this.getAllUnits();
      const totalWords = units.reduce(
        (sum, unit) => sum + unit.words.length,
        0,
      );
      return units.length > 0 || totalWords > 0;
    } catch (error) {
      console.error("Failed to check local data:", error);
      return false;
    }
  }

  // 获取本地数据摘要
  getLocalDataSummary(): { units: number; words: number; totalWords: number } {
    try {
      const units = this.getAllUnits();
      const totalWords = units.reduce(
        (sum, unit) => sum + unit.words.length,
        0,
      );
      return {
        units: units.length,
        words: totalWords,
        totalWords: totalWords,
      };
    } catch (error) {
      console.error("Failed to get local data summary:", error);
      return { units: 0, words: 0, totalWords: 0 };
    }
  }

  // 清除所有数据
  clearAllData(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Failed to clear all data:", error);
    }
  }
}
