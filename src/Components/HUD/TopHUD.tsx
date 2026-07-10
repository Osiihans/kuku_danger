import {useEffect, useRef, useState} from "react";
import {useGameStore} from "../../state/useGameStore.ts";
import {formatKES} from "../../utils/gameMath.ts";
import {HowToPlayModal} from "./HowToPlayModal.tsx";
import KukuLogo from "../../assets/kukulogo.png";
import CoinIcon from "../../assets/coin.svg";

export const TopHUD = () => {
    const balance = useGameStore(s => s.balance);
    const isMuted = useGameStore(s => s.isMuted);
    const toggleMute = useGameStore(s => s.toggleMute);
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showSettings) return;
        const onOutsideClick = (e: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener("mousedown", onOutsideClick);
        return () => document.removeEventListener("mousedown", onOutsideClick);
    }, [showSettings]);

    return (
        <>
            <div className="top-bar">
                <div className="top-left">
                    <img src={KukuLogo} alt="Kuku Logo" className="kuku-logo" />
                </div>

                <div className="top-center">
                    <div className="kd-balance-pill">
                        <img src={CoinIcon} alt="" />
                        {formatKES(balance)}
                    </div>
                </div>

                <div className="top-right">
                    <div className="kd-settings-wrap" ref={settingsRef}>
                        <button
                            className="icon-button"
                            onClick={() => setShowSettings(v => !v)}
                            aria-label="Settings"
                            aria-expanded={showSettings}
                        >
                            ⚙️
                        </button>
                        {showSettings && (
                            <div className="kd-settings-dropdown">
                                <button
                                    className="kd-settings-item"
                                    onClick={() => { setShowHowToPlay(true); setShowSettings(false); }}
                                >
                                    ℹ️ How to Play
                                </button>
                                <button
                                    className="kd-settings-item"
                                    onClick={() => { toggleMute(); setShowSettings(false); }}
                                >
                                    {isMuted ? "🔇" : "🔊"} Sound {isMuted ? "Off" : "On"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rendered as a sibling of .top-bar, not a child — .top-bar's
                backdrop-filter creates a containing block that would trap
                this modal's position:fixed inside the header box. */}
            {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
        </>
    );
};
