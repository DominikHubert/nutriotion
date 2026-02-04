import React, { useState } from 'react';

export function EditEntry({ entry, onSave, onCancel }) {
    const [name, setName] = useState(entry.name);
    const [calories, setCalories] = useState(entry.calories);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(entry.id, { name, calories: Number(calories) });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700">
                <h3 className="text-lg font-bold mb-4">Edit Entry</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-900 rounded p-2 text-white border border-slate-600 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Calories</label>
                        <input
                            type="number"
                            value={calories}
                            onChange={e => setCalories(e.target.value)}
                            className="w-full bg-slate-900 rounded p-2 text-white border border-slate-600 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex space-x-3 pt-2">
                        <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg bg-slate-700 text-gray-300">Cancel</button>
                        <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
