"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
    words,
    className,
}: {
    words: string;
    className?: string;
}) => {
    const [wordArray, setWordArray] = useState<string[]>([]);

    useEffect(() => {
        setWordArray(words.split(" "));
    }, [words]);

    return (
        <div className={cn("font-bold", className)}>
            <div className="mt-4">
                <div className="leading-snug tracking-wide">
                    {wordArray.map((word, idx) => (
                        <motion.span
                            key={word + idx}
                            className="opacity-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                duration: 0.25,
                                delay: idx * 0.1,
                            }}
                        >
                            {word}{" "}
                        </motion.span>
                    ))}
                </div>
            </div>
        </div>
    );
};
