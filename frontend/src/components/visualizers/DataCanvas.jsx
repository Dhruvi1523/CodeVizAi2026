import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// A single visual block for an array element
const ArrayBlock = ({ value, isHighlighted, blockRef }) => (
    <motion.div
        ref={blockRef}
        className={`w-16 h-16 flex items-center justify-center m-1 rounded-lg border-2 ${isHighlighted ? 'bg-yellow-400 border-yellow-600 text-black' : 'bg-slate-700 border-slate-600 text-white'}`}
        layout
    >
        <span className="font-mono text-lg font-bold">{String(value.value)}</span>
    </motion.div>
);

// A component to render a full array
const ArrayVisualizer = ({ name, data, highlightedIndex, elementRefs }) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-300 mb-2 font-mono">{name}</h3>
        <div className="flex flex-wrap bg-slate-800/50 p-2 rounded-lg">
            {data.value.map((item, index) => (
                <ArrayBlock
                    key={index}
                    value={item}
                    isHighlighted={index === highlightedIndex}
                    blockRef={(el) => elementRefs.current.set(`${name}-${index}`, el)}
                />
            ))}
        </div>
    </div>
);


// The main DataCanvas component
const DataCanvas = forwardRef(({ trace, currentStep, currentEvent }, ref) => {
    const { locals } = trace[currentStep] || {};
    const elementRefs = useRef(new Map());

    // This exposes a function to the parent (TraceLayout) to get element positions
    useImperativeHandle(ref, () => ({
        getElementPositions: () => {
            const positions = new Map();
            elementRefs.current.forEach((el, key) => {
                if (el) {
                    positions.set(key, el.getBoundingClientRect());
                }
            });
            return positions;
        },
    }));

    // Memoize the lists to avoid re-renders unless locals change
    const listsToRender = useMemo(() => {
        if (!locals) return [];
        return Object.entries(locals)
            .filter(([key, val]) => val.type === 'list');
    }, [locals]);

    const highlightedIndex = currentEvent?.target_index;
    const highlightedListName = currentEvent?.target_data_structure;

    return (
        <div className="p-4 h-full">
            {listsToRender.length > 0 ? (
                listsToRender.map(([name, data]) => (
                    <ArrayVisualizer
                        key={name}
                        name={name}
                        data={data}
                        highlightedIndex={name === highlightedListName ? highlightedIndex : -1}
                        elementRefs={elementRefs}
                    />
                ))
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400">No lists or arrays in the current scope.</p>
                </div>
            )}
        </div>
    );
});

export default DataCanvas;
