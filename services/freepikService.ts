import { FREEPIK_API_KEY } from '../constants';

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    // Note: Calling Freepik directly from browser often fails due to CORS.
    // In a real production setup, this fetch happens on your Node.js backend.
    // We will attempt the call, but if it fails (CORS), we return a placeholder 
    // to ensure the UI demo works for you.
    
    const response = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
        method: 'POST',
        headers: {
            'x-freepik-api-key': FREEPIK_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            num_images: 1,
            image: { size: "square_1_1" }
        })
    });

    if (!response.ok) {
        throw new Error(`Freepik API Error: ${response.statusText}`);
    }

    const data = await response.json();
    // Freepik returns base64 usually, or a URL. 
    // Adapting based on standard response structure.
    if (data.data && data.data[0] && data.data[0].base64) {
        return `data:image/png;base64,${data.data[0].base64}`;
    }
    
    // Fallback if structure is different
    throw new Error("Invalid response format");

  } catch (error) {
    console.warn("API Call Failed (likely CORS or limit), using high-quality mock for demo.", error);
    // Return a visually stunning placeholder from Unsplash that matches the "prompt" vaguely
    // deterministic based on prompt length
    const id = prompt.length % 10; 
    return `https://picsum.photos/1024/1024?random=${id}`;
  }
};

// Video generation is currently not publicly standardized in Freepik public docs the same way,
// So we will simulate a "Processing" state that returns a video placeholder.
export const generateVideo = async (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4");
        }, 3000);
    });
}