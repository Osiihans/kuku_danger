import {useGameStore} from "../../state/useGameStore.ts";

const CHIPS = [20, 50, 100, 500, 1000];

export const BetChips = () => {
    const currentBet = useGameStore(s => s.currentBet);
    const isBetPlaced = useGameStore(s => s.isBetPlaced);
    const setBet = useGameStore(s => s.setBet);

    return (
        <div className="vuka-bet-controls">
            {CHIPS.map(amount => (
                <div
                    key={amount}
                    className={`vuka-bet-controls-buttons ${currentBet === amount ? "vuka-active-bet" : ""}`}
                    onClick={() => !isBetPlaced && setBet(amount)}
                >
                    {amount}
                </div>
            ))}
        </div>
    );
};
