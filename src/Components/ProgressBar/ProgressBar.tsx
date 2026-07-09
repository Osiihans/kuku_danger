import {useGameStore} from "../../state/useGameStore.ts";
import {TOTAL_PLAYABLE_LANES} from "../../utils/gameMath.ts";

export const ProgressBar = () => {
    const currentLane = useGameStore(s => s.currentLane);

    return (
        <>
            <div className="kd-progress">
                <span className="kd-progress-emoji">🐔</span>
                <div className="kd-progress-track">
                    {Array.from({length: TOTAL_PLAYABLE_LANES}, (_, i) => (
                        <div key={i} className={`kd-progress-seg ${i < currentLane ? "lit" : ""}`} />
                    ))}
                </div>
                <span className="kd-progress-emoji">🏁</span>
                <span className="kd-progress-count">{currentLane} / {TOTAL_PLAYABLE_LANES}</span>
            </div>
        </>
    );
};
