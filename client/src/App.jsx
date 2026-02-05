import React, { useState, useEffect } from 'react';
import { ProfileForm } from './components/ProfileForm';
import { CameraInput } from './components/CameraInput';
import { FoodEditor } from './components/FoodEditor';
import { SportInput } from './components/SportInput';
import { SportEditor } from './components/SportEditor';
import { EditEntry } from './components/EditEntry';
import { HistoryChart } from './components/HistoryChart';
import { Auth } from './components/Auth';
import { getProfile, analyzeFood, analyzeFoodText, analyzeSport, addEntry, getDailyStats, deleteEntry, updateEntry, logout, getFavorites, addFavorite, deleteFavorite } from './services/api';
import { FavoriteReviewModal } from './components/FavoriteReviewModal';
import { VoiceInput } from './components/VoiceInput';
import { DashboardSummary } from './components/DashboardSummary';

// Simplified Icon components
const IconEdit = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
)
const IconTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
)
const IconStar = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? "text-yellow-400" : "text-gray-400"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
)

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [addMode, setAddMode] = useState('food'); // 'food' or 'sport'
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Dashboard State
    const [dailyStats, setDailyStats] = useState({ calories_in: 0, calories_out: 0, entries: [] });
    const [favorites, setFavorites] = useState([]);

    // Tracking State
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    // Edit State
    const [editingEntry, setEditingEntry] = useState(null);
    const [selectedFavorite, setSelectedFavorite] = useState(null);

    // Manual Entry State
    const [manualFoodName, setManualFoodName] = useState('');
    const [manualCalories, setManualCalories] = useState('');
    const [manualWeight, setManualWeight] = useState('');
    const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [manualSportName, setManualSportName] = useState('');
    const [manualSportCalories, setManualSportCalories] = useState('');

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            loadData();
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated, currentDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [p, stats, favs] = await Promise.all([
                getProfile(),
                getDailyStats(currentDate),
                getFavorites()
            ]);
            setProfile(p);
            setDailyStats(stats);
            setFavorites(favs);
        } catch (e) {
            console.error(e);
            if (e.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = async () => {
        const stats = await getDailyStats(currentDate);
        setDailyStats(stats);
    }

    const refreshFavorites = async () => {
        const favs = await getFavorites();
        setFavorites(favs);
    }

    const handleProfileSave = (newProfile) => {
        setProfile({ ...profile, ...newProfile });
        loadData();
        setActiveTab('dashboard');
    };

    const handleImageSelected = async (base64Image) => {
        setAnalyzing(true);
        try {
            const result = await analyzeFood(base64Image, profile?.ai_provider);
            // Tag result as food
            setAnalysisResult({ ...result, type: 'food' });
        } catch (error) {
            alert("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSportText = async (text) => {
        setAnalyzing(true);
        try {
            const result = await analyzeSport(text, profile?.weight, profile?.ai_provider);
            setAnalysisResult({ ...result, type: 'sport' });
        } catch (error) {
            alert("Analysis failed.");
        } finally {
            setAnalyzing(false);
        }
    }

    const handleSaveMeal = async (mealData) => {
        try {
            for (const food of mealData.foods) {
                await addEntry({
                    type: 'food',
                    name: food.name,
                    calories: food.calories,
                    protein: food.protein_g,
                    carbs: food.carbs_g,
                    fat: food.fat_g,
                    weight: food.weight_g,
                    date: manualDate // Use selected date
                });
            }
            await refreshStats();
            setAnalysisResult(null);
            setCurrentDate(manualDate);
            setActiveTab('dashboard');
        } catch (e) {
            alert('Failed to save meal');
        }
    };

    const handleSaveSport = async (sportData) => {
        try {
            await addEntry({
                type: 'sport',
                name: sportData.name,
                calories: sportData.calories,
                date: manualDate
            });
            await refreshStats();
            setAnalysisResult(null);
            setCurrentDate(manualDate);
            setActiveTab('dashboard');
        } catch (e) {
            alert('Failed to save activity');
        }
    }

    const handleAddFavoriteEntry = async (fav) => {
        // Open the review modal instead of adding directly
        if (fav.type === 'food') {
            setSelectedFavorite(fav);
        } else {
            // For sport, maybe just add directly for now or also review? 
            // Logic in modal supports all, but let's stick to food for weight calc mostly.
            // Actually, easier to just open modal for everything.
            setSelectedFavorite(fav);
        }
    }

    const handleSaveFavoriteEntry = async (entryData) => {
        try {
            await addEntry({
                type: entryData.type,
                name: entryData.name,
                calories: entryData.calories,
                protein: entryData.protein,
                carbs: entryData.carbs,
                fat: entryData.fat,
                weight: entryData.weight,
                date: manualDate
            });
            await refreshStats();
            setSelectedFavorite(null);
            setCurrentDate(manualDate);
            setActiveTab('dashboard');
            alert(`Added ${entryData.name}`);
        } catch (e) {
            alert('Failed to add favorite');
        }
    }

    const handleManualSubmit = async () => {
        if (!manualFoodName) {
            alert("Please enter a food name");
            return;
        }

        setAnalyzing(true);
        try {
            if (manualCalories) {
                let finalCalories = parseFloat(manualCalories);
                let finalWeight = null;

                if (manualWeight && parseFloat(manualWeight) > 0) {
                    // Weight provided: Treat manualCalories as Kcal/100g
                    finalWeight = parseFloat(manualWeight);
                    finalCalories = (parseFloat(manualCalories) / 100) * finalWeight;
                }

                // Direct Save
                await addEntry({
                    type: 'food',
                    name: manualFoodName,
                    calories: finalCalories,
                    protein: 0, // Unknown
                    carbs: 0,
                    fat: 0,
                    weight: finalWeight,
                    date: manualDate
                });
                setManualFoodName('');
                setManualCalories('');
                setManualWeight('');
                await refreshStats();
                setAnalysisResult(null);
                setCurrentDate(manualDate);
                setActiveTab('dashboard');
            } else {
                // AI Analysis
                const result = await analyzeFoodText(manualFoodName, profile?.ai_provider);
                setAnalysisResult({ ...result, type: 'food' });
            }
        } catch (e) {
            console.error(e);
            alert("Failed to process entry");
        } finally {
            setAnalyzing(false);
        }
    }

    const handleManualSportSubmit = async () => {
        if (!manualSportName || !manualSportCalories) {
            alert("Please enter activity name and calories");
            return;
        }

        try {
            await addEntry({
                type: 'sport',
                name: manualSportName,
                calories: parseFloat(manualSportCalories),
                date: manualDate
            });
            setManualSportName('');
            setManualSportCalories('');
            await refreshStats();
            setCurrentDate(manualDate);
            setActiveTab('dashboard');
        } catch (e) {
            alert("Failed to save activity");
        }
    }

    const handleToggleFavorite = async (entry) => {
        // Find if already in favorites (match by name/type approx)
        const exitingFav = favorites.find(f => f.name === entry.name && f.type === entry.type);

        try {
            if (exitingFav) {
                await deleteFavorite(exitingFav.id);
                alert("Removed from favorites");
            } else {
                await addFavorite({
                    type: entry.type,
                    name: entry.name,
                    calories: entry.calories,
                    protein: entry.protein,
                    carbs: entry.carbs,
                    fat: entry.fat,
                    weight: entry.weight || 100 // Default to 100g if unknown when saving as favorite
                });
                alert("Saved to favorites!");
            }
            await refreshFavorites();
        } catch (e) {
            console.error(e);
            alert("Action failed");
        }
    }

    const handleDeleteFavorite = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Remove from favorites?")) {
            await deleteFavorite(id);
            refreshFavorites();
        }
    }

    const handleCancel = () => {
        setAnalysisResult(null);
    };

    const handleDeleteEntry = async (id) => {
        if (window.confirm("Delete this entry?")) {
            await deleteEntry(id);
            refreshStats();
        }
    }

    const handleEditEntry = (entry) => {
        setEditingEntry(entry);
    }

    const handleSaveEdit = async (id, data) => {
        await updateEntry(id, data);
        setEditingEntry(null);
        if (data.date && data.date !== currentDate) {
            setCurrentDate(data.date);
        } else {
            refreshStats();
        }
    }

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    }

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
        setProfile(null);
        setDailyStats({ calories_in: 0, calories_out: 0, entries: [] });
        setFavorites([]);
    }

    if (!isAuthenticated) {
        return <Auth onLogin={handleLoginSuccess} />;
    }

    if (loading) return <div className="text-white p-10 text-center">Loading...</div>;

    // Force profile creation
    if (!profile && activeTab !== 'profile') {
        return (
            <div className="container mx-auto px-4 py-8 max-w-md">
                <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Welcome</h1>
                <p className="text-gray-300 mb-6">Please set up your profile to start.</p>
                <ProfileForm onSave={handleProfileSave} />
                <div className="mt-8 text-center">
                    <button onClick={handleLogout} className="text-red-400 text-sm">Logout</button>
                </div>
            </div>
        )
    }

    const bmr = profile?.bmr || 0;
    const targetCalories = Math.round(bmr * (profile?.activity_level || 1.2));
    const netCalories = dailyStats.calories_in - dailyStats.calories_out;
    const remaining = targetCalories - netCalories;

    const getProgressColor = () => {
        if (netCalories > targetCalories) return 'text-red-500';
        if (netCalories > targetCalories * 0.9) return 'text-yellow-500';
        return 'text-green-500';
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-md pb-24">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        Nutrition Tracker
                    </h1>
                    <p className="text-gray-400 text-sm">Track your eats & moves.</p>
                </div>
                <div className="flex flex-col items-end">
                    {profile && (
                        <div className="mb-1">
                            <div className="text-xs text-slate-400 text-right">Target</div>
                            <div className="font-mono text-xl text-white font-bold">{targetCalories} <span className="text-xs font-normal">kcal</span></div>
                        </div>
                    )}
                    <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-400">Logout</button>
                </div>
            </header>

            <main className="space-y-6">
                {activeTab === 'dashboard' && (
                    <>

                        {/* Date Navigation */}
                        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl mb-6 shadow-lg border border-slate-700">
                            <button
                                onClick={() => {
                                    const d = new Date(currentDate);
                                    d.setDate(d.getDate() - 1);
                                    setCurrentDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-2 hover:bg-slate-700 rounded-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <span className="font-semibold text-white">
                                {new Date(currentDate).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                                {currentDate === new Date().toISOString().split('T')[0] && <span className="text-gray-500 text-xs ml-2">(Today)</span>}
                            </span>
                            <button
                                onClick={() => {
                                    const d = new Date(currentDate);
                                    d.setDate(d.getDate() + 1);
                                    setCurrentDate(d.toISOString().split('T')[0]);
                                }}
                                className="p-2 hover:bg-slate-700 rounded-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>

                        {/* Dashboard Summary */}
                        <DashboardSummary
                            stats={dailyStats}
                            profile={profile}
                            onAddClick={() => setActiveTab('add')}
                        />

                        <HistoryChart />

                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-400 px-1">Recent Entries</h3>
                            {dailyStats.entries.length === 0 ? (
                                <p className="text-center text-gray-600 py-4">No entries yet today.</p>
                            ) : (
                                dailyStats.entries.slice().reverse().map(entry => (
                                    <div key={entry.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 flex justify-between items-center group">
                                        <div>
                                            <div className="font-medium text-white">{entry.name}</div>
                                            <div className="text-xs text-gray-500">{new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className={`font-bold ${entry.type === 'food' ? 'text-blue-400' : 'text-orange-400'}`}>
                                                {entry.type === 'food' ? '+' : '-'}{Math.round(entry.calories)}
                                            </div>
                                            <div className="flex space-x-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleToggleFavorite(entry)} className="p-2 hover:bg-slate-700 rounded-lg" title="Toggle Favorite">
                                                    <IconStar filled={favorites.some(f => f.name === entry.name && f.type === entry.type)} />
                                                </button>
                                                <button onClick={() => handleEditEntry(entry)} className="p-2 text-gray-400 hover:text-white bg-slate-700 rounded-lg">
                                                    <IconEdit />
                                                </button>
                                                <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-gray-400 hover:text-red-500 bg-slate-700 rounded-lg">
                                                    <IconTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'profile' && (
                    <ProfileForm currentProfile={profile} onSave={handleProfileSave} />
                )}

                {activeTab === 'add' && (
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 min-h-[400px]">
                        <div className="mb-6">
                            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Date</label>
                            <input
                                type="date"
                                value={manualDate}
                                onChange={(e) => setManualDate(e.target.value)}
                                className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors text-lg"
                            />
                        </div>
                        <div className="flex space-x-4 mb-6">
                            <button
                                onClick={() => setAddMode('food')}
                                className={`flex-1 py-2 rounded-lg ${addMode === 'food' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                            >Food</button>
                            <button
                                onClick={() => setAddMode('sport')}
                                className={`flex-1 py-2 rounded-lg ${addMode === 'sport' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-gray-400'}`}
                            >Activity</button>
                        </div>

                        {analyzing ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-blue-400 animate-pulse">Analyzing with Gemini AI...</p>
                            </div>
                        ) : (
                            !analysisResult ? (
                                <>
                                    {addMode === 'food' ? (
                                        <>
                                            <CameraInput onImageSelected={handleImageSelected} />

                                            <div className="mt-6 border-t border-slate-700 pt-6">
                                                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Manual Entry</h3>
                                                <div className="space-y-3">
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Food Name (e.g. Big Mac)"
                                                            value={manualFoodName}
                                                            onChange={(e) => setManualFoodName(e.target.value)}
                                                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                                        />
                                                        <VoiceInput onTranscript={(text) => setManualFoodName(text)} />
                                                    </div>
                                                    <div className="flex space-x-3">
                                                        <input
                                                            type="number"
                                                            placeholder="Kcal"
                                                            value={manualCalories}
                                                            onChange={(e) => setManualCalories(e.target.value)}
                                                            className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Weight (g)"
                                                            value={manualWeight}
                                                            onChange={(e) => setManualWeight(e.target.value)}
                                                            disabled={!manualCalories}
                                                            className={`w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors ${!manualCalories ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        />
                                                        <button
                                                            onClick={handleManualSubmit}
                                                            className="w-1/3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
                                                        >
                                                            Add Entry
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 text-center">
                                                        Leave Kcal  empty to auto-calculate with AI.
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <SportInput onAnalyze={handleSportText} />
                                            <div className="mt-6 border-t border-slate-700 pt-6">
                                                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Manual Activity</h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <input
                                                            type="text"
                                                            placeholder="Activity Name (e.g. Running)"
                                                            value={manualSportName}
                                                            onChange={(e) => setManualSportName(e.target.value)}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                                        />
                                                    </div>
                                                    <div className="flex space-x-3">
                                                        <input
                                                            type="number"
                                                            placeholder="Kcal Burned"
                                                            value={manualSportCalories}
                                                            onChange={(e) => setManualSportCalories(e.target.value)}
                                                            className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                                                        />
                                                        <button
                                                            onClick={handleManualSportSubmit}
                                                            className="w-1/2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
                                                        >
                                                            Add Activity
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Favorites Section */}
                                    {favorites.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
                                                <span className="mr-2"><IconStar filled={true} /></span> Favorites
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {favorites.filter(f => f.type === addMode).map(fav => (
                                                    <div key={fav.id}
                                                        className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer group relative"
                                                        onClick={() => handleAddFavoriteEntry(fav)}
                                                    >
                                                        <div className="font-medium text-white truncate">{fav.name}</div>
                                                        <div className={`text-sm font-bold ${fav.type === 'food' ? 'text-blue-400' : 'text-orange-400'}`}>
                                                            {Math.round(fav.calories)} kcal
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDeleteFavorite(fav.id, e)}
                                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500"
                                                        >
                                                            <IconTrash />
                                                        </button>
                                                    </div>
                                                ))}
                                                {favorites.filter(f => f.type === addMode).length === 0 && (
                                                    <div className="col-span-2 text-center text-gray-500 text-sm py-2">
                                                        No favorites for {addMode} yet. Star items from the Dashboard!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                analysisResult.type === 'food' ? (
                                    <FoodEditor
                                        initialData={analysisResult}
                                        onSave={handleSaveMeal}
                                        onCancel={handleCancel}
                                    />
                                ) : (
                                    <SportEditor
                                        initialData={analysisResult}
                                        onSave={handleSaveSport}
                                        onCancel={handleCancel}
                                    />
                                )
                            )
                        )}
                    </div>
                )}
            </main>

            {editingEntry && (
                <EditEntry
                    entry={editingEntry}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingEntry(null)}
                />
            )}

            {selectedFavorite && (
                <FavoriteReviewModal
                    favorite={selectedFavorite}
                    onSave={handleSaveFavoriteEntry}
                    onCancel={() => setSelectedFavorite(null)}
                />
            )}

            <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4 safe-area-bottom z-50">
                <div className="flex justify-around max-w-md mx-auto">
                    <button onClick={() => setActiveTab('dashboard')}
                        className={`p-2 flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-400' : 'text-gray-500'}`}>
                        <span className="text-xs">Home</span>
                    </button>
                    <button onClick={() => { setActiveTab('add'); setAnalysisResult(null); }}
                        className={`p-4 -mt-8 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-900/50 ${activeTab === 'add' ? 'bg-blue-500' : ''}`}>
                        <span className="font-bold text-xl">+</span>
                    </button>
                    <button onClick={() => setActiveTab('profile')}
                        className={`p-2 flex flex-col items-center ${activeTab === 'profile' ? 'text-blue-400' : 'text-gray-500'}`}>
                        <span className="text-xs">Profile</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}

export default App;
