import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

export function CameraInput({ onImageSelected }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Pass base64 string to parent
                onImageSelected(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-2xl bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer block w-full">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-blue-600/20 rounded-full text-blue-400">
                    <Camera size={48} />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Take a Photo</h3>
                    <p className="text-sm text-gray-400">or upload from gallery</p>
                </div>
            </div>
        </label>
    );
}
