interface HowToPlayModalProps {
    onClose: () => void;
}

export const HowToPlayModal = ({onClose}: HowToPlayModalProps) => {
    return (
        <div className="kuku-howto-overlay" onClick={onClose}>
            <div className="kuku-howto-box" onClick={(e) => e.stopPropagation()}>
                <h2 className="kuku-howto-title">🎮 How to Play <span>Kuku in Danger</span></h2>
                <ol className="kuku-howto-list">
                    <li><strong>Place a Bet:</strong> Pick an amount and difficulty, then hit BET.</li>
                    <li><strong>Cross:</strong> Tap the pulsing gem on the next lane to hop across.</li>
                    <li><strong>Multipliers:</strong> Each lane pays more the further you go. Hit CASH OUT any time to lock in your winnings.</li>
                    <li><strong>Stay Sharp:</strong> A car passing through your lane while you linger ends the round.</li>
                    <li><strong>Auto Cash Out:</strong> Toggle it on and set a lane — the round cashes out for you automatically once you reach it.</li>
                    <li><strong>Full Crossing:</strong> Make it past the last lane and you're paid out automatically at the top multiplier.</li>
                    <li><strong>Results:</strong> Winnings apply instantly to your balance.</li>
                    <li><strong>Repeat:</strong> After cashing out or getting hit, start fresh from lane one.</li>
                </ol>
                <p className="kuku-howto-note">❓ Questions? Check <em>Help</em> or contact support.</p>
                <button className="kuku-howto-close" onClick={onClose}>✖ Close</button>
            </div>
        </div>
    );
};
