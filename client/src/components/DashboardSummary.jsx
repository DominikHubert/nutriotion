import React from 'react';

const CircularProgress = ({ value, max, size = 180, strokeWidth = 15, color = "text-emerald-400" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const normalizedValue = Math.min(value, max);
    const progress = (normalizedValue / max) * circumference;
    const dashoffset = circumference - progress;

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    className="text-slate-700"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`${color} transition-all duration-1000 ease-in-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
        </div>
    );
};

const ProgressBar = ({ label, current, target, color }) => {
    const percentage = Math.min(100, (current / target) * 100);
    return (
        <div className="flex-1 text-center">
            <div className="text-sm text-gray-400 mb-1">{label}</div>
            <div className="h-2 bg-slate-700 rounded-full mb-1 overflow-hidden">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className="text-xs font-semibold text-gray-300">
                {Math.round(current)} <span className="text-gray-500">/ {Math.round(target)} g</span>
            </div>
        </div>
    );
};

export function DashboardSummary({ stats, profile, onAddClick }) {
    // defaults or calc
    const bmr = profile?.bmr || 2000;
    const activityLevel = profile?.activity_level || 1.2;
    const targetCalories = Math.round(bmr * activityLevel);

    // Macro split (approximate standard: 50% carbs, 30% prot, 20% fat)
    const targetCarbs = Math.round((targetCalories * 0.5) / 4);
    const targetProtein = Math.round((targetCalories * 0.3) / 4);
    const targetFat = Math.round((targetCalories * 0.2) / 9);

    const netCalories = stats.calories_in - stats.calories_out;
    const remaining = Math.max(0, targetCalories - netCalories);
    const eaten = Math.round(stats.calories_in);
    const burned = Math.round(stats.calories_out);

    return (
        <div className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700/50 mb-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-200">Daily Summary</h2>
            </div>

            {/* Main Gauge Area */}
            <div className="flex items-center justify-between mb-8">

                {/* Eaten (Left) */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{eaten}</div>
                    <div className="text-sm text-gray-500">Eaten</div>
                </div>

                {/* Center Gauge */}
                <div className="relative">
                    <CircularProgress
                        value={netCalories}
                        max={targetCalories}
                        size={160}
                        color={remaining < 0 ? "text-red-500" : "text-emerald-400"}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">{remaining}</span>
                        <span className="text-sm text-gray-400">Remaining</span>
                    </div>
                </div>

                {/* Burned (Right) */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{burned}</div>
                    <div className="text-sm text-gray-500">Burned</div>
                </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <ProgressBar
                    label="Carbs"
                    current={stats.carbs || 0}
                    target={targetCarbs}
                    color="bg-blue-400"
                />
                <ProgressBar
                    label="Protein"
                    current={stats.protein || 0}
                    target={targetProtein}
                    color="bg-emerald-400"
                />
                <ProgressBar
                    label="Fat"
                    current={stats.fat || 0}
                    target={targetFat}
                    color="bg-yellow-400"
                />
            </div>

            {/* Action Button */}
            <button
                onClick={onAddClick}
                className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 border border-emerald-500/20"
            >
                <span>🦊</span>
                <span>Add Food Now</span>
            </button>
        </div>
    );
}
