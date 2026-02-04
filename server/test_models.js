require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).run();
        // Wait, listModels is a method on the generic client or manager?
        // SDK 0.14+ has it differently?
        // It's usually not on the model instance.
        // Let's try to just Instantiate and if it fails catch it.
        // Actually the SDK has no direct listModels method exposed easily on the top level class in some versions,
        // but usually it's `genAI.getGenerativeModel(...)`.

        // Let's rely on the error message which says: "Call ListModels to see..."
        // In node SDK, often there isn't a direct listModels helper.
        // We can try to guess or just try gemini-pro-vision.

        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello?");
        console.log("Success with gemini-1.5-flash");
    } catch (e) {
        console.log("Error with gemini-1.5-flash:", e.message);
    }

    try {
        console.log("Testing gemini-pro-vision...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const result = await model.generateContent("Hello?"); // Vision model needs image usually? or text is enough?
        // Vision model might complain if no image.
        console.log("Success with gemini-pro-vision");
    } catch (e) {
        console.log("Error with gemini-pro-vision:", e.message);
    }

    try {
        console.log("Testing gemini-1.5-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent("Hello?");
        console.log("Success with gemini-1.5-pro");
    } catch (e) {
        console.log("Error with gemini-1.5-pro:", e.message);
    }
}

listModels();
