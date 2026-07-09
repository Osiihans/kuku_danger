import {motion, AnimatePresence} from "framer-motion";
import {useEffect} from "react";
import {useGameStore} from "../../state/useGameStore.ts";
import {formatKES} from "../../utils/gameMath.ts";

export const WinPopup = () => {
    const showWinPopup = useGameStore(s => s.showWinPopup);
    const winnings = useGameStore(s => s.winnings);
    const bestMultiplier = useGameStore(s => s.bestMultiplier);
    const dismissWinPopup = useGameStore(s => s.dismissWinPopup);

    useEffect(() => {
        if (!showWinPopup) return;
        const timer = setTimeout(() => dismissWinPopup(), 1400);
        return () => clearTimeout(timer);
    }, [showWinPopup, dismissWinPopup]);

    return (
        <AnimatePresence>
            {showWinPopup && (
                <motion.div
                    className="vuka-pop-overlay"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                >
                    <motion.div
                        className="vuka-pop-up-container"
                        initial={{scale: 0.5, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        exit={{scale: 0.6, opacity: 0}}
                        transition={{type: "spring", stiffness: 300, damping: 18}}
                    >
                        <div className="vuka-pop-up-title">🏆 Cashed Out</div>
                        <div className="vuka-pop-up-header">{formatKES(winnings)}</div>
                        <div className="vuka-pop-up-multiplier">
                            Multiplier
                            <div>{bestMultiplier.toFixed(2)}x</div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
