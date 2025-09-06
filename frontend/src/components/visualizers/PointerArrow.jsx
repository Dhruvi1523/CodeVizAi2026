// src/components/state/PointerArrow.jsx

import React from 'react';
import { motion } from 'framer-motion';

const PointerArrow = ({ x, y, label, id }) => {
    return (
        <motion.div
            key={id}
            className="absolute z-10 flex items-center"
            style={{ top: y, left: 0, y: "-50%" }}
            initial={{ opacity: 0, x: x - 40 }}
            animate={{ opacity: 1, x: x - 10, transition: { type: 'spring', stiffness: 250, damping: 15, delay: 0.1 } }}
            exit={{ opacity: 0, x: x - 50, scale: 0.5, transition: { duration: 0.4 } }}
        >
            {label && <span className="px-2 py-0.5 bg-sky-500 text-white text-xs rounded mr-2 whitespace-nowrap">{label}</span>}
            <span className="text-sky-400 text-2xl font-mono">--&gt;</span>
        </motion.div>
    )
}

export default PointerArrow;