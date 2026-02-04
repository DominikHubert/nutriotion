import React, { useState, useEffect } from 'react';

export function FavoriteReviewModal({ favorite, onSave, onCancel }) {
    const [weight, setWeight] = useState('');
    const [baseData, setBaseData] = useState(null);

    useEffect(() => {
        if (favorite) {
            // Default to 100g if no weight saved, otherwise use saved weight
            const initialWeight = favorite.weight || 100;
            setWeight(initialWeight);
            setBaseData({
                calories: favorite.calories,
                protein: favorite.protein || 0,
                carbs: favorite.carbs || 0,
                fat: favorite.fat || 0,
                baseWeight: initialWeight
            });
        }
    }, [favorite]);

    const calculateValues = () => {
        if (!baseData || !weight) return baseData;
        const factor = parseFloat(weight) / baseData.baseWeight;
        return {
            calories: Math.round(baseData.calories * factor),
            protein: Math.round(baseData.protein * factor),
            carbs: Math.round(baseData.carbs * factor),
            fat: Math.round(baseData.fat * factor)
        };
    };

    const currentValues = calculateValues();

    const handleSubmit = () => {
        if (!weight || parseFloat(weight) <= 0) {
            alert("Please enter a valid weight");
            return;
        }

        onSave({
            ...favorite,
            ...currentValues,
            weight: parseFloat(weight)
        });
    };

    if (!favorite) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl overflow-hidden">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{favorite.name}</h3>
                    <p className="text-blue-400 text-sm mb-6 uppercase tracking-wider">{favorite.type}</p>

                    <div className="mb-6">
                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Quantity (g)</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-lg font-mono"
                                autoFocus
                            />
                            <span className="text-gray-400 font-bold">g</span>
                        </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                                <div className="text-sm font-bold text-white">{currentValues?.calories || 0}</div>
                                <div className="text-[10px] text-gray-400 uppercase">Kcal</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-green-400">{currentValues?.protein || 0}g</div>
                                <div className="text-[10px] text-gray-400 uppercase">Prot</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-blue-400">{currentValues?.carbs || 0}g</div>
                                <div className="text-[10px] text-gray-400 uppercase">Carb</div>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-yellow-400">{currentValues?.fat || 0}g</div>
                                <div className="text-[10px] text-gray-400 uppercase">Fat</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/50 transition-colors"
                        >
                            Add Entry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
