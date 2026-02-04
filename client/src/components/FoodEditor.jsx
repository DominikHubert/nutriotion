import React, { useState } from 'react';

export function FoodEditor({ initialData, onSave, onCancel }) {
    const [foods, setFoods] = useState(initialData.foods || []);

    const updateFood = (index, field, value) => {
        const newFoods = [...foods];
        newFoods[index] = { ...newFoods[index], [field]: value };
        // Recalculate calories approx if needed, but simplistic for now
        setFoods(newFoods);
    };

    const removeFood = (index) => {
        setFoods(foods.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return foods.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    };

    const handleSave = () => {
        onSave({
            foods,
            total_calories: calculateTotal()
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Edit Meal</h2>
                <span className="text-green-400 font-mono font-bold">{calculateTotal()} kcal</span>
            </div>

            {foods.map((food, index) => (
                <div key={index} className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex justify-between">
                        <input
                            type="text"
                            value={food.name}
                            onChange={(e) => updateFood(index, 'name', e.target.value)}
                            className="bg-transparent text-white font-semibold border-b border-slate-600 focus:border-blue-500 outline-none w-2/3"
                        />
                        <button onClick={() => removeFood(index)} className="text-red-400 text-xs">Remove</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500">Weight (g)</label>
                            <input
                                type="number"
                                value={food.weight_g}
                                onChange={(e) => updateFood(index, 'weight_g', Number(e.target.value))}
                                className="w-full bg-slate-900 rounded p-1 text-sm text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Calories</label>
                            <input
                                type="number"
                                value={food.calories}
                                onChange={(e) => updateFood(index, 'calories', Number(e.target.value))}
                                className="w-full bg-slate-900 rounded p-1 text-sm text-gray-300 font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
                        <div className="bg-slate-900 rounded p-1">
                            <div>Prot</div>
                            <div className="text-white">{food.protein_g}g</div>
                        </div>
                        <div className="bg-slate-900 rounded p-1">
                            <div>Carb</div>
                            <div className="text-white">{food.carbs_g}g</div>
                        </div>
                        <div className="bg-slate-900 rounded p-1">
                            <div>Fat</div>
                            <div className="text-white">{food.fat_g}g</div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="flex space-x-4 pt-4">
                <button onClick={onCancel} className="flex-1 py-3 bg-slate-700 rounded-xl text-gray-300">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-green-600 rounded-xl text-white font-bold shadow-lg shadow-green-900/50">Confirm Meal</button>
            </div>
        </div>
    );
}
