//import type { KVNamespace } from "@cloudflare/workers-types";
export const config = {
    runtime: "edge",
};

async function getForecast(lat, lon, key) {
    let req = await fetch(`https://api.pirateweather.net/forecast/${key}/${lat},${lon}?exclude=minutely,hourly,flags`);
    let result = await req.json();
    return result;
}

function shapeData(data) {

    // We already know the location
    delete data.latitude; 
    delete data.longitude;
    // First, reduce daily forecast to 3 days
    data.daily.data = data.daily.data.slice(0, 3);

    // This is a list of keys we can remove from currently/daily data
    const keysToRemove = ['time', 'apparentTemperatureMax', 'apparentTemperatureMaxTime', 'apparentTemperatureMin', 'apparentTemperatureMinTime','apparentTemperatureHigh', 'apparentTemperatureHighTime', 'apparentTemperatureLow', 'apparentTemperatureLowTime', 'cloudCover', 'icon', 'nearestStormBearing', 'apparentTemperature', 'dewPoint', 'pressure', 'uvIndex', 'ozone', 'visibility'];

    for(let key of keysToRemove) {
        delete data.currently[key];
        for(let day of data.daily.data) {
            delete day[key];
        }
    }

    return data;
}

export async function GET({ request, locals }) {

    const PIRATE_API_KEY = locals.runtime.env.PIRATE_API_KEY || process.env.PIRATE_API_KEY;
    const kv = locals.CACHE_KV;
    console.log('kv', kv);
    
    if(!PIRATE_API_KEY) {
        throw('Missing env key');
    }

    let result = shapeData(await getForecast(30.471165, -91.147385, PIRATE_API_KEY));

    return new Response(
        JSON.stringify(result),
        { headers: { 'Content-Type': 'application/json' } }
    );
}