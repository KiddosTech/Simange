// Background Soundtrack Music Player

let audio: HTMLAudioElement | null = null;
let isPlaying = false;
let volume = 0.45;

export const musicPlayer = {
  init() {
    if (typeof window === 'undefined' || audio) return;
    audio = new Audio('/audio/soundtrack.mp3');
    audio.loop = true;
    audio.volume = volume;
  },

  play() {
    this.init();
    if (!audio) return;
    audio
      .play()
      .then(() => {
        isPlaying = true;
      })
      .catch((err) => {
        console.warn('Audio autoplay prevented by browser policy (requires user interaction):', err);
      });
  },

  pause() {
    if (audio) {
      audio.pause();
      isPlaying = false;
    }
  },

  toggle(): boolean {
    if (isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  },

  isPlaying(): boolean {
    return isPlaying;
  },

  setVolume(vol: number) {
    volume = Math.max(0, Math.min(1, vol));
    if (audio) {
      audio.volume = volume;
    }
  },

  getVolume(): number {
    return volume;
  },
};
