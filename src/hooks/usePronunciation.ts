import { useCallback } from "react";
import { playPronunciation } from "../services/pronunciationService";

export const usePronunciation = () => {
  const play = useCallback((text: string) => {
    try {
      playPronunciation(text);
    } catch (e) {
      // swallow errors for UX
      // eslint-disable-next-line no-console
      console.warn("Pronunciation play failed:", e);
    }
  }, []);

  return { play };
};


