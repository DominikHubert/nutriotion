import React, { useState } from 'react';

export function SportInput({ onAnalyze }) {
    const [text, setText] = useState('');

    return (
        <div className="space-y-4">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. '30 min jogging, intense, felt great'"
                className="w-full h-32 bg-slate-900 text-white p-4 rounded-xl border border-slate-700 focus:border-orange-500 outline-none resize-none placeholder-slate-600"
            />
            <button
                onClick={() => onAnalyze(text)}
                disabled={!text.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            >
                Analyze Activity
            </button>
        </div>
    );
}
