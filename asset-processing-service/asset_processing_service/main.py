import asyncio
import logging

from time import sleep

from asset_processing_service.api_client import fetch_jobs, update_job_details
from asset_processing_service.config import config


log = logging.getLogger(__name__)

async def job_fetcher(job_queue: asyncio.Queue, jobs_pending_or_in_progress: set):
    # skip: 39:40-39:43
    while True:
        log.info("Fetching jobs...")
        jobs = await fetch_jobs()

        for job in jobs:
            current_time = asyncio.get_running_loop().time()
            if job.status == "in_progress":
                last_heartbeat_time = job.lastHeartBeat.timestamp()
                time_since_last_heartbeat = abs(current_time - last_heartbeat_time)
                log.info(f"Time since last heartbeat for job {job.id}: {time_since_last_heartbeat}")

                if time_since_last_heartbeat > config.STUCK_JOB_THRESHOLD_SECONDS:
                    log.warning(f"Job {job.id} is stuck. Failing job.")
                    await update_job_details(job.id, {
                        "status": "failed",
                        "errorMessage": "Job is stuck - no heartbeat received recently",
                        "attempts": job.attempts + 1
                    })
                    if job.id in jobs_pending_or_in_progress:
                        jobs_pending_or_in_progress.remove(job.id)

            elif job.status in ["created", "failed"]:
                if job.attempts >= config.MAX_JOB_ATTEMPTS:
                    log.warning(f"Job {job.id} has exceeded max attempts. Failing job.")
                    await update_job_details(job.id, {
                        "status": "max_attempts_exceeded",
                        "errorMessage": "Max attempts exceeded!",
                    })

                elif job.id not in jobs_pending_or_in_progress:
                    log.info("Adding job to queue: %s", job.id)
                    jobs_pending_or_in_progress.add(job.id)
                    await job_queue.put(job)

        sleep(5)


async def async_main():
    job_queue = asyncio.Queue()
    jobs_pending_or_inprogress = set()

    job_fetcher_task = asyncio.create_task(job_fetcher(job_queue, jobs_pending_or_inprogress))

    await asyncio.gather(job_fetcher_task)


def main():
    try:
        asyncio.run(async_main())
    except KeyboardInterrupt:
        log.info("Program terminated")
        exit()


if __name__ == "__main__":
    main()
