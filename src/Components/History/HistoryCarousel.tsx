import {type ChangeEvent, useState} from "react";
import {useGameStore} from "../../state/useGameStore.ts";

export const HistoryCarousel = () => {
    const history = useGameStore(s => s.history);
    const [limit, setLimit] = useState(5);

    return (
        <div className="vuka-main-history">
            <div className="vuka-history-container">
                <div className="vuka-history-select-title">Recent Rounds</div>
                <select
                    className="vuka-history-select"
                    value={limit}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setLimit(Number(e.target.value))}
                >
                    <option value="0">0</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                </select>
            </div>

            <div className="kd-history-scroll">
                {history.length === 0 && (
                    <div className="kd-history-empty">No rounds yet — place a bet to start.</div>
                )}
                {history.slice(0, limit).map((bet, index) => {
                    const isWin = Number(bet.WinAmount) > 0;
                    return (
                        <div key={index} className={`kd-history-card ${isWin ? "kd-win" : "kd-lose"}`}>
                            <span className="kd-history-mult">{bet.Multiplier}x</span>
                            <span className="kd-history-amount">KSh {bet.WinAmount}</span>
                            <span className="kd-history-status">{isWin ? "WIN" : "LOSE"}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
