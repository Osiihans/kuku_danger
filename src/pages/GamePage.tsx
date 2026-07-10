import {useEffect, useRef} from "react";
import {TopHUD} from "../Components/HUD/TopHUD.tsx";
import {WinPopup} from "../Components/HUD/WinPopup.tsx";
import {ProgressBar} from "../Components/ProgressBar/ProgressBar.tsx";
import {BottomPanel} from "../Components/BottomPanel/BottomPanel.tsx";
import {HistoryCarousel} from "../Components/History/HistoryCarousel.tsx";
import {GameScene} from "../game/Scene/GameScene.tsx";
import {useKukuAudioControl} from "../Hooks/useKukuSounds.ts";
import {useAutoAdvance} from "../Hooks/useAutoAdvance.ts";
import {useGameStore} from "../state/useGameStore.ts";

const GamePage = () => {
    const isMuted = useGameStore(s => s.isMuted);
    const chickenAnim = useGameStore(s => s.chickenAnim);
    const showWinPopup = useGameStore(s => s.showWinPopup);
    const {playKukuSound} = useKukuAudioControl(isMuted, true);
    const lastAnimRef = useRef(chickenAnim);
    useAutoAdvance();

    useEffect(() => {
        if (chickenAnim === "die" && lastAnimRef.current !== "die") {
            playKukuSound("HonkSnd");
            playKukuSound("ChickenHit");
        }
        lastAnimRef.current = chickenAnim;
    }, [chickenAnim, playKukuSound]);

    useEffect(() => {
        if (showWinPopup) playKukuSound("WinSnd");
    }, [showWinPopup, playKukuSound]);

    return (
        <div className="vuka-game-container">
            <div className="vuka-primary-view">
                <TopHUD />
                <ProgressBar />
                <div className="vuka-canvas-container kd-scene-container">
                    <GameScene />
                </div>
                <BottomPanel />
            </div>
            <HistoryCarousel />
            <WinPopup />
        </div>
    );
};

export default GamePage;
