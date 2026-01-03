import { motion, AnimatePresence } from 'framer-motion';


interface SlotCounterProps {
    value: string | number;
    className?: string; // wrapper class
    digitClassName?: string; // class for individual digits
    direction?: 'up' | 'down';
}

export function SlotCounter({ value, className = "", digitClassName = "" }: SlotCounterProps) {
    const valueStr = String(value);
    const chars = valueStr.split('');

    return (
        <div className={`flex items-center overflow-hidden ${className}`}>
            {chars.map((char, index) => (
                <Digit key={`${index}-${chars.length}`} char={char} className={digitClassName} />
            ))}
        </div>
    );
}

function Digit({ char, className }: { char: string; className: string }) {
    // If it's not a number (e.g. "." or ":"), don't animate movement, just render
    const isNumber = /[0-9]/.test(char);

    return (
        <div className={`relative flex flex-col items-center justify-center h-[1em] w-[0.6em] ${className}`}>
            {isNumber ? (
                <AnimatePresence mode='popLayout' initial={false}>
                    <motion.span
                        key={char}
                        initial={{ y: "100%", opacity: 0, filter: "blur(2px)" }}
                        animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: "-100%", opacity: 0, filter: "blur(2px)" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {char}
                    </motion.span>
                </AnimatePresence>
            ) : (
                <span className="flex items-center justify-center">{char}</span>
            )}
        </div>
    );
}
