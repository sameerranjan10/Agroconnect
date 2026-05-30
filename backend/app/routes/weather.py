from fastapi import APIRouter, HTTPException
import httpx

from app.core.config import settings

router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)


def generate_farming_recommendations(temp, humidity, wind_speed):
    recommendations = []

    if temp > 38:
        recommendations.append({
            "title": "☀ Heat Stress Alert",
            "action": "Increase irrigation and avoid midday field work.",
            "type": "danger"
        })
    elif temp > 32:
        recommendations.append({
            "title": "🌡 High Temperature",
            "action": "Maintain adequate soil moisture.",
            "type": "warning"
        })

    if humidity > 80:
        recommendations.append({
            "title": "💧 High Humidity",
            "action": "Monitor crops for fungal diseases.",
            "type": "warning"
        })

    if wind_speed > 20:
        recommendations.append({
            "title": "🌬 Strong Winds",
            "action": "Avoid pesticide spraying today.",
            "type": "warning"
        })

    recommendations.append({
        "title": "🌱 General Advisory",
        "action": "Check soil moisture before irrigation.",
        "type": "info"
    })

    return recommendations


@router.get("/")
async def get_weather(lat: float, lon: float):

    if not settings.OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenWeather API key not configured"
        )

    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "lat": lat,
        "lon": lon,
        "units": "metric",
        "appid": settings.OPENWEATHER_API_KEY
    }

    try:
        async with httpx.AsyncClient() as client:

            response = await client.get(
                url,
                params=params,
                timeout=15.0
            )

            print("STATUS:", response.status_code)
            print("BODY:", response.text)

            response.raise_for_status()

            data = response.json()

            temp = data.get("main", {}).get("temp", 0)
            humidity = data.get("main", {}).get("humidity", 0)
            wind_speed = data.get("wind", {}).get("speed", 0)

            recommendations = generate_farming_recommendations(
                temp,
                humidity,
                wind_speed
            )

            return {
                "location": data.get("name"),
                "temperature": temp,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "description": data.get("weather", [{}])[0].get("description"),
                "icon": data.get("weather", [{}])[0].get("icon"),
                "ai_advisory": recommendations
            }

    except httpx.HTTPStatusError as e:

        print("OPENWEATHER ERROR:", e.response.text)

        raise HTTPException(
            status_code=502,
            detail=f"OpenWeather Error: {e.response.text}"
        )

    except Exception as e:

        print("WEATHER ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=f"Weather Service Error: {str(e)}"
        )