import {useGameStore} from "../../state/useGameStore.ts";
import {TOTAL_PLAYABLE_LANES} from "../../utils/gameMath.ts";

export const AutoCashOut = () => {
    const autoCashOutLane = useGameStore(s => s.autoCashOutLane);
    const isBetPlaced = useGameStore(s => s.isBetPlaced);
    const setAutoCashOutLane = useGameStore(s => s.setAutoCashOutLane);
    const enabled = autoCashOutLane !== null;
    const lane = autoCashOutLane ?? 1;

    return (
        <div className="vuka-auto-cashout">
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                className={`vuka-toggle-switch ${enabled ? "vuka-toggle-on" : ""}`}
                disabled={isBetPlaced}
                onClick={() => setAutoCashOutLane(enabled ? null : lane)}
            >
                <span className="vuka-toggle-thumb" />
            </button>
            <span className="vuka-auto-cashout-label">Auto cash out</span>
            {enabled && (
                <div className="vuka-plus-minus-input-container vuka-auto-cashout-stepper">
                    <div
                        className="vuka-plus-minus"
                        onClick={() => !isBetPlaced && setAutoCashOutLane(lane - 1)}
                    >
                        -
                    </div>
                    <input
                        className="vuka-bet-Amount"
                        value={lane}
                        readOnly={isBetPlaced}
                        onChange={(e) => !isBetPlaced && setAutoCashOutLane(parseInt(e.target.value, 10) || 1)}
                    />
                    <div
                        className="vuka-plus-minus"
                        onClick={() => !isBetPlaced && setAutoCashOutLane(lane + 1)}
                    >
                        +
                    </div>
                    <span className="vuka-auto-cashout-suffix">/{TOTAL_PLAYABLE_LANES}</span>
                </div>
            )}
        </div>
    );
};
