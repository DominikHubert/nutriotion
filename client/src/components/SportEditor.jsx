import React, { useState } from 'react';

export function SportEditor({ initialData, onSave, onCancel }) {
    const [data, setData] = useState(initialData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Simple update logic, keeping data consistent
        setData(prev => ({
            ...prev,
            [name]: name === 'calories' || name === 'duration_min' ? Number(value) : value
        }));
    };

    const handleSave = () => {
        onSave(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Edit Activity</h2>
                <span className="text-orange-400 font-mono font-bold">-{data.calories} kcal</span>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
                <div>
                    <label className="text-xs text-gray-500">Activity Name</label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        className="w-full bg-slate-900 rounded p-2 text-white border border-slate-600 focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500">Duration (min)</label>
                        <input
                            type="number"
                            name="duration_min"
                            value={data.duration_min}
                            onChange={handleChange}
                            className="w-full bg-slate-900 rounded p-2 text-white border border-slate-600"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Calories Burned</label>
                        <input
                            type="number"
                            name="calories"
                            value={data.calories}
                            onChange={handleChange}
                            className="w-full bg-slate-900 rounded p-2 text-white border border-slate-600 font-bold"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-500">Intensity</label>
                    <div className="flex space-x-2 mt-1">
                        {['low', 'moderate', 'high'].map(l => (
                            <button
                                key={l}
                                onClick={() => setData({ ...data, intensity: l })}
                                className={`px-3 py-1 rounded text-xs capitalize border border-slate-600 ${data.intensity === l ? 'bg-blue-600 text-white' : 'bg-slate-900 text-gray-400'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            <div className="flex space-x-4 pt-4">
                <button onClick={onCancel} className="flex-1 py-3 bg-slate-700 rounded-xl text-gray-300">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-orange-600 rounded-xl text-white font-bold shadow-lg shadow-orange-900/50">Confirm Activity</button>
            </div>
        </div>
    );
}
