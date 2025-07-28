// Simple pronunciation service following Qwerty Learner design
import { PronunciationOptions } from '../types';

/**
 * Simple pronunciation service for playing word audio
 * Following Qwerty Learner's simple and direct approach
 */
export class PronunciationService {
  private static instance: PronunciationService;

  private constructor() {}

  static getInstance(): PronunciationService {
    if (!PronunciationService.instance) {
      PronunciationService.instance = new PronunciationService();
    }
    return PronunciationService.instance;
  }

  /**
   * Play pronunciation using Youdao API
   * Simple and direct implementation like Qwerty Learner
   */
  playYoudaoVoice(word: string, options: PronunciationOptions = {}): void {
    const { type = 2 } = options;
    
    if (!word) return;
    
    try {
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`;
      console.log('PronunciationService: Playing audio for:', word, 'URL:', url);
      const audio = new Audio(url);
      
      // Handle audio loading errors gracefully
      audio.addEventListener('error', (e) => {
        console.warn('Audio failed to load for word:', word, e);
        // Don't throw error, just log it
      });
      
      audio.play().catch((error) => {
        console.warn('Audio playback failed for word:', word, error);
        // Don't throw error, just log it
      });
    } catch (error) {
      console.warn('Pronunciation service error for word:', word, error);
      // Don't throw error, just log it
    }
  }

  /**
   * Auto play pronunciation with delay
   * Simple implementation without complex state management
   */
  autoPlayWithDelay(word: string, delay: number = 500, options: PronunciationOptions = {}): void {
    if (!word) return;
    
    setTimeout(() => {
      this.playYoudaoVoice(word, options);
    }, delay);
  }
}

// Export singleton instance
export const pronunciationService = PronunciationService.getInstance();

// Simple utility function for direct use
export const playPronunciation = (word: string, type: number = 2): void => {
  if (!word) return;
  
  try {
    const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`;
    console.log('playPronunciation: Playing audio for:', word, 'URL:', url);
    const audio = new Audio(url);
    
    // Handle audio loading errors gracefully
    audio.addEventListener('error', (e) => {
      console.warn('Audio failed to load for word:', word, e);
      // Don't throw error, just log it
    });
    
    audio.play().catch((error) => {
      console.warn('Audio playback failed for word:', word, error);
      // Don't throw error, just log it
    });
  } catch (error) {
    console.warn('playPronunciation error for word:', word, error);
    // Don't throw error, just log it
  }
}; 