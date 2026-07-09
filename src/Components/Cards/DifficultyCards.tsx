import {useGameStore} from "../../state/useGameStore.ts";
import {TOTAL_PLAYABLE_LANES, type Difficulty} from "../../utils/gameMath.ts";

const LEVELS: {key: Difficulty; icon: string; risk: string}[] = [
    {key: "EASY", icon: "🐣", risk: "Low risk"},
    {key: "MEDIUM", icon: "🐔", risk: "Med risk"},
    {key: "HARD", icon: "🔥", risk: "High risk"},
];

const capitalize = (text: string) => text.charAt(0) + text.slice(1).toLowerCase();

export const DifficultyCards = () => {
    const difficulty = useGameStore(s => s.difficulty);
    const isBetPlaced = useGameStore(s => s.isBetPlaced);
    const setDifficulty = useGameStore(s => s.setDifficulty);

    return (
        <div className="kuku-levels">
            {LEVELS.map(level => (
                <div
                    key={level.key}
                    className={`kuku-level-btn ${difficulty === level.key ? "kuku-active-level" : ""}`}
                    onClick={() => !isBetPlaced && setDifficulty(level.key)}
                >
                    <span className="kuku-level-icon">{level.icon}</span>
                    <span className="kuku-level-name">{capitalize(level.key)}</span>
                    <span className="kuku-level-risk">{level.risk} · {TOTAL_PLAYABLE_LANES} lanes</span>
                </div>
            ))}
        </div>
    );
};
