from fastapi import APIRouter, HTTPException, status
import httpx
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/market",
    tags=["Market"]
)

RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"

# --- Simple TTL Cache Implementation ---
CACHE_TTL = 3600  # 1 hour
_market_prices_cache = {
    "data": None,
    "timestamp": 0
}

@router.get("/prices")
async def get_market_prices():
    from app.core.config import settings

    api_key = getattr(settings, "DATA_GOV_API_KEY", None)
    if not api_key:
        logger.error("DATA_GOV_API_KEY is missing.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="External API key is missing."
        )

    current_time = time.time()
    if _market_prices_cache["data"] and (current_time - _market_prices_cache["timestamp"] < CACHE_TTL):
        return _market_prices_cache["data"]

    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": 20
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # Format according to original return shape
            formatted_data = {
                "count": data.get("count"),
                "records": data.get("records", [])
            }

            _market_prices_cache["data"] = formatted_data
            _market_prices_cache["timestamp"] = current_time

            return formatted_data

        except httpx.TimeoutException:
            logger.error("Timeout connecting to Data.gov.in")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Market data service is taking too long to respond."
            )
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error from Data.gov.in: {e.response.status_code}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Market data service returned an error: {e.response.status_code}"
            )
        except Exception as e:
            logger.exception("Unexpected error fetching market prices")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while fetching market prices."
            )