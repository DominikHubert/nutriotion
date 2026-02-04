import axios from 'axios';

const API_URL = '/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
}

export const register = async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
}

export const logout = () => {
    localStorage.removeItem('token');
}

export const saveProfile = async (profileData) => {
    const response = await api.post('/user', profileData);
    return response.data;
};

export const getProfile = async () => {
    try {
        const response = await api.get('/user');
        return response.data;
    } catch (error) {
        console.error("Error fetching profile", error);
        return null; // Return null if not found or error
    }
}

export const analyzeFood = async (base64Image, provider = 'gemini') => {
    try {
        const response = await api.post('/analyze/food', { image: base64Image, provider });
        return response.data;
    } catch (error) {
        console.error("Error analyzing food", error);
        throw error;
    }
}

export const analyzeFoodText = async (text, provider = 'gemini') => {
    try {
        const response = await api.post('/analyze/food-text', { text, provider });
        return response.data;
    } catch (error) {
        console.error("Error analyzing food text", error);
        throw error;
    }
}

export const analyzeSport = async (text, userWeight, provider = 'gemini') => {
    try {
        const response = await api.post('/analyze/sport', { text, weight: userWeight, provider });
        return response.data;
    } catch (error) {
        console.error("Error analyzing sport", error);
        throw error;
    }
}

export const addEntry = async (entryData) => {
    const response = await api.post('/entries', entryData);
    return response.data;
}

export const getDailyStats = async () => {
    try {
        const response = await api.get('/entries/today');
        return response.data;
    } catch (error) {
        console.error("Error fetching stats", error);
        return { calories_in: 0, calories_out: 0, entries: [] };
    }
}

export const deleteEntry = async (id) => {
    await api.delete(`/entries/${id}`);
}

export const updateEntry = async (id, data) => {
    await api.put(`/entries/${id}`, data);
}

export const getHistory = async (range = 'week') => {
    try {
        const response = await api.get(`/entries/history?range=${range}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching history", error);
        return [];
    }
}

export const getFavorites = async () => {
    try {
        const response = await api.get('/favorites');
        return response.data;
    } catch (error) {
        console.error("Error fetching favorites", error);
        return [];
    }
}

export const addFavorite = async (entry) => {
    // entry should have type, name, calories, protein, carbs, fat
    const response = await api.post('/favorites', entry);
    return response.data;
}

export const deleteFavorite = async (id) => {
    await api.delete(`/favorites/${id}`);
}
