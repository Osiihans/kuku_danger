import { useEffect, useCallback, useMemo, useRef } from "react";
import carHornSound from "../Audio/CarHorn.mp3";
import WinSound from "../Audio/Correct7.mp3";
import BackgroundSund from "../Audio/highway-sound.mp3";
import chickenSound from "../Audio/chicken-sound.mp3";

// Chromium's disk-cache backend can choke on the Range requests an <audio>
// element issues when streaming straight from a network URL, surfacing as
// net::ERR_CACHE_OPERATION_NOT_SUPPORTED (seen on Android Chrome hitting a
// LAN dev server). Fetching each file fully and pointing Audio at a blob:
// URL sidesteps Range requests entirely — playback is from memory once
// loaded, not the network. Falls back to the direct URL if the fetch itself
// fails, so playback still works (just via the code path that had the bug).
const loadAsBlobAudio = (url: string): HTMLAudioElement => {
    const audio = new Audio();
    fetch(url)
        .then(r => r.blob())
        .then(blob => { audio.src = URL.createObjectURL(blob); })
        .catch(() => { audio.src = url; });
    return audio;
};

export const useKukuAudioControl = (isMuted: boolean, loop: boolean) => {
    const audioKukuInstances = useMemo(() => ({
        WinSnd: loadAsBlobAudio(WinSound),
        HonkSnd: loadAsBlobAudio(carHornSound),
        ChickenHit: loadAsBlobAudio(chickenSound)
    }), []);

    const backgroundKukuSound = useRef(loadAsBlobAudio(BackgroundSund));

    useEffect(() => {
        const bg = backgroundKukuSound.current;
        bg.loop = loop;

        if (isMuted) {
            bg.pause();
            bg.currentTime = 0;
            return;
        }

        bg.play().catch((err) => {
            if (err.name === 'NotAllowedError') {
                console.warn('User interaction required for audio playback.');
            }
        });
        // The blob URL above loads asynchronously — if play() ran before it
        // resolved, retry once the element actually has audio data.
        const onReady = () => { if (bg.paused) bg.play().catch(() => {}); };
        bg.addEventListener("canplay", onReady);

        return () => {
            bg.removeEventListener("canplay", onReady);
            bg.pause();
            bg.currentTime = 0;
        };
    }, [isMuted, loop]);

    const playKukuSound = useCallback(
        (soundKey: keyof typeof audioKukuInstances) => {
            if (isMuted) return;

            const sound = audioKukuInstances[soundKey];
            if (!sound) return;

            sound.pause();
            sound.currentTime = 0;
            sound.play().catch((err) => {
                if (err.name === 'NotAllowedError') {
                    console.warn('Audio blocked until user interacts.');
                }
            });
        },
        [isMuted, audioKukuInstances]
    );

    return { playKukuSound };
};
