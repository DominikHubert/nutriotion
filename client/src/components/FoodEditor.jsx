import React, { useState } from 'react';
import { analyzeFoodText } from '../services/api';
import { Sparkles, Loader } from 'lucide-react';

export function FoodEditor({ initialData, onSave, onCancel }) {
    // Helper to calculate ratios
    const calculateRatios = (item) => {
        const weight = Number(item.weight_g) || 100;
        return {
            caloriesPer100g: ((Number(item.calories) || 0) / weight) * 100,
            proteinPer100g: ((Number(item.protein_g) || 0) / weight) * 100,
            carbsPer100g: ((Number(item.carbs_g) || 0) / weight) * 100,
            fatPer100g: ((Number(item.fat_g) || 0) / weight) * 100,
        };
    };

    // Initialize state with per100g values
    const [foods, setFoods] = useState((initialData.foods || []).map(f => ({
        ...f,
        ...calculateRatios(f)
    })));
    const [loadingIndex, setLoadingIndex] = useState(null);

    const updateFood = (index, field, value) => {
        const newFoods = [...foods];
        const food = { ...newFoods[index] };
        food[field] = value;

        if (field === 'weight_g') {
            // Recalculate macros based on new weight and stored ratios
            const weight = Number(value) || 0;
            if (food.caloriesPer100g !== undefined) {
                food.calories = Math.round((food.caloriesPer100g * weight) / 100);
                food.protein_g = Math.round((food.proteinPer100g * weight) / 100);
                food.carbs_g = Math.round((food.carbsPer100g * weight) / 100);
                food.fat_g = Math.round((food.fatPer100g * weight) / 100);
            }
        } else if (['calories', 'protein_g', 'carbs_g', 'fat_g'].includes(field)) {
            // Update ratios based on manual change, assuming manual input is "truth" for current weight
            const updatedRatios = calculateRatios(food);
            Object.assign(food, updatedRatios);
        }

        newFoods[index] = food;
        setFoods(newFoods);
    };

    const removeFood = (index) => {
        setFoods(foods.filter((_, i) => i !== index));
    };

    const handleAiCheck = async (index) => {
        const item = foods[index];
        if (!item.name) return;

        setLoadingIndex(index);
        try {
            // Construct query: "150g Banana"
            const query = `${item.weight_g || 100}g ${item.name}`;
            console.log("AI Re-Check Query:", query);

            const result = await analyzeFoodText(query);

            if (result && result.foods && result.foods.length > 0) {
                const bestMatch = result.foods[0];
                const newFoods = [...foods];

                // Update fields with AI result
                const weight = bestMatch.weight_g || 100;
                newFoods[index] = {
                    ...newFoods[index],
                    calories: bestMatch.calories,
                    protein_g: bestMatch.protein_g,
                    carbs_g: bestMatch.carbs_g,
                    fat_g: bestMatch.fat_g,
                    weight_g: weight,
                    // Save new ratios
                    caloriesPer100g: (bestMatch.calories / weight) * 100,
                    proteinPer100g: (bestMatch.protein_g / weight) * 100,
                    carbsPer100g: (bestMatch.carbs_g / weight) * 100,
                    fatPer100g: (bestMatch.fat_g / weight) * 100
                };
                setFoods(newFoods);
            }
        } catch (error) {
            console.error("AI Check Failed:", error);
            alert("KI Check failed. Try again.");
        } finally {
            setLoadingIndex(null);
        }
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

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleAiCheck(index)}
                                disabled={loadingIndex === index}
                                className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-colors"
                                title="KI Check: Recalculate values"
                            >
                                {loadingIndex === index ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            </button>
                            <button onClick={() => removeFood(index)} className="text-red-400 text-xs text-opacity-80 hover:text-opacity-100">Remove</button>
                        </div>
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
