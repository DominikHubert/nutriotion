import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getHistory } from '../services/api';

export function HistoryChart() {
    const [range, setRange] = useState('week'); // 'week' or 'month'
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const history = await getHistory(range);
            // Format dates for display
            const formatted = history.map(h => {
                let displayDate;
                if (range === 'year') {
                    // h.date is YYYY-MM
                    const [y, m] = h.date.split('-');
                    const dateObj = new Date(parseInt(y), parseInt(m) - 1);
                    displayDate = dateObj.toLocaleDateString([], { month: 'short' }); // "Jan", "Feb"
                } else {
                    // h.date is YYYY-MM-DD
                    displayDate = new Date(h.date).toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                }
                return { ...h, displayDate };
            });
            setData(formatted);
        };
        fetchData();
    }, [range]);

    return (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-200">History</h2>
                <div className="bg-slate-700 p-1 rounded-lg flex space-x-1">
                    <button
                        onClick={() => setRange('week')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${range === 'week' ? 'bg-slate-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Week
                    </button>
                    <button
                        onClick={() => setRange('month')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${range === 'month' ? 'bg-slate-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => setRange('year')}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${range === 'year' ? 'bg-slate-500 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Year
                    </button>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="displayDate"
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#E5E7EB' }}
                        />
                        <Legend />
                        <Bar dataKey="calories_in" name="In" fill="#60A5FA" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="calories_out" name="Out" fill="#FB923C" radius={[4, 4, 0, 0]} stackId="b" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
