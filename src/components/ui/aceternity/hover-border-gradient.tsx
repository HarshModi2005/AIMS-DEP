"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const HoverBorderGradient = ({
    children,
    containerClassName,
    className,
    as: Tag = "button",
    duration = 1,
    clockwise = true,
    ...props
}: React.PropsWithChildren<
    {
        as?: React.ElementType;
        containerClassName?: string;
        className?: string;
        duration?: number;
        clockwise?: boolean;
    } & React.HTMLAttributes<HTMLElement>
>) => {
    return (
        <Tag
            className={cn(
                "relative flex h-min w-fit cursor-pointer items-center justify-center overflow-hidden rounded-full bg-black/20 p-[1px] transition duration-500 dark:bg-white/20",
                containerClassName
            )}
            {...props}
        >
            <motion.div
                className="absolute inset-0 z-0"
                style={{
                    background: `conic-gradient(from ${clockwise ? "0deg" : "180deg"}, transparent, #6366f1, #22d3ee, transparent)`,
                }}
                animate={{
                    rotate: clockwise ? 360 : -360,
                }}
                transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <div
                className={cn(
                    "relative z-10 flex items-center justify-center rounded-full bg-black px-4 py-2 text-white",
                    className
                )}
            >
                {children}
            </div>
        </Tag>
    );
};
