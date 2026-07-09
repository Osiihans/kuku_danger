import {useGameStore} from "../../state/useGameStore.ts";

export const AmountStepper = () => {
    const currentBet = useGameStore(s => s.currentBet);
    const isBetPlaced = useGameStore(s => s.isBetPlaced);
    const setBet = useGameStore(s => s.setBet);

    return (
        <div className="vuka-plus-minus-input-container">
            <div className="vuka-plus-minus" onClick={() => !isBetPlaced && setBet(Math.max(currentBet - 20, 1))}>
                -
            </div>
            <input
                className="vuka-bet-Amount"
                value={currentBet}
                readOnly={isBetPlaced}
                onChange={(e) => !isBetPlaced && setBet(parseInt(e.target.value, 10) || 0)}
            />
            <div className="vuka-plus-minus" onClick={() => !isBetPlaced && setBet(currentBet + 20)}>
                +
            </div>
        </div>
    );
};
