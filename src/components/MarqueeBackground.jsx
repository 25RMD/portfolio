import './MarqueeBackground.css';

const ROW_COUNT = 10;
const WORDS = ['RAUM', '25RMD'];
const REPEAT = 12;

export default function MarqueeBackground() {
    return (
        <div className="marquee-bg">
            {Array.from({ length: ROW_COUNT }, (_, i) => {
                const word = WORDS[i % WORDS.length];
                const reverse = i % 2 === 1;
                const speed = 20 + (i % 3) * 8;
                const text = Array(REPEAT)
                    .fill(null)
                    .map((_, j) => (
                        <span key={j} className="marquee-word">
                            {word}
                            <span className="marquee-dot" aria-hidden="true">&middot;</span>
                        </span>
                    ));

                return (
                    <div key={i} className="marquee-row">
                        <div
                            className="marquee-track"
                            style={{
                                animationDuration: `${speed}s`,
                                animationDirection: reverse ? 'reverse' : 'normal',
                            }}
                        >
                            {text}
                            {text}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
