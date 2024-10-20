from datetime import datetime
from typing import Any, Dict, List
import aiohttp
import logging

from asset_processing_service.config import HEADERS, config
from asset_processing_service.models import AssetProcessingJob


log = logging.getLogger(__name__)

async def fetch_jobs() -> List[AssetProcessingJob]:
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job"

        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=HEADERS) as response:
                if response.status == 200:
                    data = await response.json()
                    return [AssetProcessingJob(**item) for item in data]

                else:
                    log.error("Error fetching jobs: %s", response.status)
                    return []
    except Exception as e:
        log.error("Error fetching jobs: %s", e)
        return []

async def update_job_details(job_id: str, update_data: Dict[str, Any]) -> None:
    data = {**update_data, "lastHeartBeat": datetime.now().isoformat()}
    try:
        url = f"{config.API_BASE_URL}/asset-processing-job?jobId={job_id}"
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, json=data, headers=HEADERS) as response:
                response.raise_for_status()
    except aiohttp.ClientError as error:
        log.error(f"Failed to update job details for job {job_id}: {error}")
