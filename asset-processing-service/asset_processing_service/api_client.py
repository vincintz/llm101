from datetime import datetime
from typing import Any, Dict, List, Optional
import aiohttp

from asset_processing_service.config import HEADERS, config
from asset_processing_service.logger import logger
from asset_processing_service.models import Asset, AssetProcessingJob

import tiktoken


class ApiError(Exception):
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


async def fetch_jobs() -> List[AssetProcessingJob]:
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job"

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                if response.status == 200:
                    data = await response.json()
                    return [AssetProcessingJob(**item) for item in data]

                else:
                    logger.error("Error fetching jobs: %s", response.status)
                    return []
    except Exception as e:
        logger.error("Error fetching jobs: %s", e)
        return []


async def update_job_details(job_id: str, update_data: Dict[str, Any]) -> None:
    data = {**update_data, "lastHeartBeat": datetime.now().isoformat()}
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job?jobId={job_id}"
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, json=data, headers=HEADERS) as response:
                response.raise_for_status()
    except aiohttp.ClientError as error:
        logger.error(f"Failed to update job details for job {job_id}: {error}")


async def update_job_heartbeat(job_id: str):
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job?jobId={job_id}"
        data = {"lastHeartBeat": datetime.now().isoformat()}
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, json=data, headers=HEADERS) as response:
                response.raise_for_status()
    except aiohttp.ClientError as error:
        logger.error(f"Failed to update job heartbeat for {job_id}: {error}")


async def fetch_asset(asset_id: str) -> Optional[Asset]:
    try:
        url = f"{config.API_BASE_URL}/asset?asset_id={asset_id}"

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                if response.status == 200:
                    data = await response.json()
                    if data:
                        return Asset(**data)
                    else:
                        return None

                else:
                    logger.error(f"Error fetching asset {asset_id}: {response.status}")
                    return None
    except Exception as e:
        logger.error("Error fetching asset %s: %s", asset_id, e)
        return None


async def fetch_asset_file(file_url: str) -> bytes:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(file_url, headers=HEADERS) as response:
                response.raise_for_status()
                return await response.read()
    except aiohttp.ClientError as error:
        logger.error(f"Error fetching asset file: {error}")
        raise ApiError("Failed to fetch asset file", status_code=500)


async def update_asset_content(asset_id: str, content: str) -> None:
    try:
        encoding = tiktoken.encoding_for_model("gpt-4o")
        tokens = encoding.encode(content)
        token_count = len(tokens)

        update_data = {
            "content": content,
            "tokenCount": token_count,
        }

        async with aiohttp.ClientSession() as session:
            url = f"{config.API_BASE_URL}/asset?assetId={asset_id}"
            async with session.patch(url, json=update_data, headers=HEADERS) as response:
                response.raise_for_status()

    except aiohttp.ClientError as error:
        logger.error(f"Failed to update asset content for asset {asset_id}: {error}")
        raise ApiError("Failed to update asset content", status_code=500)
