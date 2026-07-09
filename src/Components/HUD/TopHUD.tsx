import {useState} from "react";
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

    return (
        <>
            <div className="top-bar">
                <div className="top-left">
                    <button className="icon-button" onClick={() => setShowHowToPlay(true)} aria-label="How to Play">
                        ℹ️
                    </button>
                    <button className="icon-button" onClick={toggleMute} aria-label="Toggle Mute">
                        {isMuted ? "🔇" : "🔊"}
                    </button>
                </div>

                <div className="top-center">
                    <img src={KukuLogo} alt="Kuku Logo" className="kuku-logo" />
                </div>

                <div className="top-right">
                    <div className="kd-balance-pill">
                        <img src={CoinIcon} alt="" />
                        {formatKES(balance)}
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
