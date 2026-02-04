import React, { useState } from 'react';
import { saveProfile } from '../services/api';

const ActivityLevels = [
    { value: 1.2, label: 'Sedentary (Office job, no exercise)' },
    { value: 1.375, label: 'Light Exercise (1-3 days/week)' },
    { value: 1.55, label: 'Moderate Exercise (3-5 days/week)' },
    { value: 1.725, label: 'Heavy Exercise (6-7 days/week)' },
    { value: 1.9, label: 'Athlete (2x per day)' },
];

export function ProfileForm({ onSave, currentProfile }) {
    const [formData, setFormData] = useState({
        gender: currentProfile?.gender || 'male',
        age: currentProfile?.age || 25,
        weight: currentProfile?.weight || 70,
        height: currentProfile?.height || 175,
        activity_level: currentProfile?.activity_level || 1.375,
        goal: currentProfile?.goal || 'maintain', // maintain, cut, bulk
        ai_provider: currentProfile?.ai_provider || 'gemini'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'gender' || name === 'goal' ? value : Number(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await saveProfile(formData);
            if (onSave) onSave(result);
        } catch (error) {
            alert('Error saving profile');
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Your Profile</h2>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                        className="w-full bg-slate-700 text-white rounded p-2 border border-slate-600">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange}
                        className="w-full bg-slate-700 text-white rounded p-2 border border-slate-600" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Weight (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange}
                        className="w-full bg-slate-700 text-white rounded p-2 border border-slate-600" />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Height (cm)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange}
                        className="w-full bg-slate-700 text-white rounded p-2 border border-slate-600" />
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Activity Level</label>
                <select name="activity_level" value={formData.activity_level} onChange={handleChange}
                    className="w-full bg-slate-700 text-white rounded p-2 border border-slate-600">
                    {ActivityLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">AI Provider</label>
                <select name="ai_provider" value={formData.ai_provider || 'gemini'} onChange={handleChange}
                    className="w-full bg-slate-700 text-white rounded p-2 border border-slate-600">
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI ChatGPT</option>
                </select>
            </div>

            <button type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-xl mt-4 active:scale-95 transition-transform">
                Save Profile
            </button>
        </form>
    );
}
