import {BetChips} from "../Buttons/BetChips.tsx";
import {AmountStepper} from "../Buttons/AmountStepper.tsx";
import {AutoCashOut} from "../Buttons/AutoCashOut.tsx";
import {PrimaryButton} from "../Buttons/PrimaryButton.tsx";
import {DifficultyCards} from "../Cards/DifficultyCards.tsx";

export const BottomPanel = () => {
    return (
        <div className="vuka-main-bet-controls">
            <span className="vuka-controls-title">Bet Amount</span>
            <div className="vuka-bet-amount-area">
                <BetChips />
                <AmountStepper />
            </div>
            <DifficultyCards />
            <AutoCashOut />
            <PrimaryButton />
        </div>
    );
};
