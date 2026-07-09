import {useGameStore} from "../../state/useGameStore.ts";

export const PrimaryButton = () => {
    const isBetPlaced = useGameStore(s => s.isBetPlaced);
    const winnings = useGameStore(s => s.winnings);
    const startGame = useGameStore(s => s.startGame);
    const cashOut = useGameStore(s => s.cashOut);

    return (
        <div className="vuka-button-group-place-Bet">
            <div
                onClick={() => (isBetPlaced ? cashOut() : startGame())}
                className={`vuka-bet-button ${isBetPlaced ? "kd-cashout" : ""}`}
            >
                {isBetPlaced ? `Cash Out: ${winnings.toFixed(2)}` : "Bet"}
            </div>
        </div>
    );
};
