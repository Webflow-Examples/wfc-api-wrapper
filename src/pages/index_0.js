
export const config = {
    runtime: "edge",
};

async function getForecast(lat, lon, key) {
    let req = await fetch(`https://api.pirateweather.net/forecast/${key}/${lat},${lon}?exclude=minutely,hourly,flags`);
    let result = await req.json();
    return result;
}

export async function GET({ request, locals }) {

    const PIRATE_API_KEY = locals.runtime.env.PIRATE_API_KEY || process.env.PIRATE_API_KEY;
    
    if(!PIRATE_API_KEY) {
        throw('Missing env key');
    }

    let result = await getForecast(30.471165, -91.147385, PIRATE_API_KEY);

    return new Response(
        JSON.stringify(result),
        { headers: { 'Content-Type': 'application/json' } }
    );
}