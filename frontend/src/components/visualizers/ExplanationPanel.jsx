
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function formatValue(val) {
  if (val && typeof val === 'object' && val.hasOwnProperty('value')) {
    const innerValue = val.value;
    if (typeof innerValue === 'string') return `"${innerValue}"`;
    if (Array.isArray(innerValue)) return `[${innerValue.map(formatValue).join(', ')}]`;
    return String(innerValue);
  }
  if (typeof val === 'string') return `"${val}"`;
  return String(val);
}

function generateExplanation(event) {
  if (!event || typeof event !== 'object') {
    return "Execution has started. Click 'Next' or 'Play' to begin.";
  }

  switch (event.type) {
    case 'assignment':
      return (
        <>
          Assigning the value <code>{formatValue(event.value)}</code> to the variable{' '}
          <code>{event.target_var}</code>.
        </>
      );
    case 'binary_operation':
      if (!event.left_str || !event.right_str) {
        return "Executing a binary operation.";
      }
      return (
        <>
          Calculating <code>{event.left_str} {event.op_str} {event.right_str}</code>, resulting in{' '}
          <code>{formatValue(event.result_val)}</code>, and storing it in{' '}
          <code>{event.target_var}</code>.
        </>
      );
    case 'subscript_assign':
      return (
        <>
          Assigning <code>{formatValue(event.value)}</code> to index <code>{event.index}</code> of list{' '}
          <code>{event.target_var}</code>.
        </>
      );
    case 'method_call':
      return (
        <>
          Calling method <code>.{event.method_name}()</code> on variable{' '}
          <code>{event.target_var}</code>.
        </>
      );
    case 'return_statement':
       return (
        <>
          Preparing to return the value <code>{formatValue(event.value)}</code>.
        </>
      );
    case 'function_return':
      return (
        <>
          Function <code>{event.function_name}</code> is returning the value{' '}
          <code>{formatValue(event.return_value)}</code>.
        </>
      );
    case 'loop_iteration':
      return (
        <>
          Starting a new loop iteration. The variable <code>{event.loop_variable_name}</code> is now{' '}
          <code>{formatValue(event.current_value)}</code>.
        </>
      );
    case 'condition_check':
      return (
        <>
          Checking condition: <code>{event.condition_str}</code>. The result is{' '}
          <code className={event.result ? 'text-green-400' : 'text-red-400'}>
            {String(event.result)}
          </code>.
        </>
      );
    case 'error':
      return (
        <span className="text-red-400">
          <b>Error:</b> {event.error_type}: {event.error_message}
        </span>
      );
    case 'execution_finished':
        return "Execution has finished.";
    default:
      return `Executing event: ${event.type}`;
  }
}

export default function ExplanationPanel({ event }) {
  const explanation = generateExplanation(event);

  return (
    <div className="text-center p-3 font-mono rounded-lg bg-[#0f172a] border border-[#334155] h-16 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={JSON.stringify(event)} 
          className="text-sm text-[#f59e0b] font-semibold sm:text-base"
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {explanation}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}