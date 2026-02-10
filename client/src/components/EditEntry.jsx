import React, { useState } from 'react';

export function EditEntry({ entry, onSave, onCancel }) {
    const [name, setName] = useState(entry.name);
    const [calories, setCalories] = useState(entry.calories);
    const [weight, setWeight] = useState(entry.weight || ''); // Initialize weight
    const [date, setDate] = useState(entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0]);

    // Calculate initial density (kcal per gram) if both exist
    const initialDensity = (entry.calories && entry.weight && entry.weight > 0)
        ? entry.calories / entry.weight
        : null;

    const handleWeightChange = (e) => {
        const newWeight = e.target.value;
        setWeight(newWeight);

        // Auto-calculate calories if we have a known density
        if (initialDensity && newWeight && parseFloat(newWeight) > 0) {
            const newCalories = Math.round(parseFloat(newWeight) * initialDensity);
            setCalories(newCalories);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(entry.id, {
            name,
            calories: Number(calories),
            date: date,
            weight: weight ? Number(weight) : null
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700">
                <h3 className="text-lg font-bold mb-4 text-white">Edit Entry</h3>
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
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="text-xs text-gray-400">Weight (g)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={handleWeightChange}
                                placeholder="Optional"
                                className="w-full bg-slate-900 rounded p-2 text-white border border-slate-600 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-400">Calories</label>
                            <input
                                type="number"
                                value={calories}
                                onChange={e => setCalories(e.target.value)}
                                className="w-full bg-slate-900 rounded p-2 text-white border border-slate-600 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-slate-900 rounded p-2 text-white border border-slate-600 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex space-x-3 pt-2">
                        <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
