require('dotenv').config();

async function checkModels() {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) {
        console.log("No API Key found!");
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        console.log("Fetching models from:", url.replace(key, 'HIDDEN_KEY'));

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("No models found or different structure:", data);
        }
    } catch (error) {
        console.error("Error fetching models:", error.message);
    }
}

checkModels();
