import asyncio
from collections import defaultdict

from asset_processing_service.api_client import fetch_jobs, update_job_details
from asset_processing_service.config import config
from asset_processing_service.logger import logger
from asset_processing_service.job_processor import process_job


async def job_fetcher(job_queue: asyncio.Queue, jobs_pending_or_in_progress: set):
    # skip: 39:40-39:43
    while True:
        try:
            logger.info("Fetching jobs...")
            jobs = await fetch_jobs()

            for job in jobs:
                current_time = asyncio.get_running_loop().time()
                if job.status == "in_progress":
                    last_heartbeat_time = job.lastHeartBeat.timestamp()
                    time_since_last_heartbeat = abs(current_time - last_heartbeat_time)
                    logger.info(f"Time since last heartbeat for job {job.id}: {time_since_last_heartbeat}")

                    if time_since_last_heartbeat > config.STUCK_JOB_THRESHOLD_SECONDS:
                        logger.warning(f"Job {job.id} is stuck. Failing job.")
                        await update_job_details(job.id, {
                            "status": "failed",
                            "errorMessage": "Job is stuck - no heartbeat received recently",
                            "attempts": job.attempts + 1
                        })
                        if job.id in jobs_pending_or_in_progress:
                            jobs_pending_or_in_progress.remove(job.id)

                elif job.status in ["created", "failed"]:
                    if job.attempts >= config.MAX_JOB_ATTEMPTS:
                        logger.warning(f"Job {job.id} has exceeded max attempts. Failing job.")
                        await update_job_details(job.id, {
                            "status": "max_attempts_exceeded",
                            "errorMessage": "Max attempts exceeded!",
                        })

                    elif job.id not in jobs_pending_or_in_progress:
                        logger.info("Adding job to queue: %s", job.id)
                        jobs_pending_or_in_progress.add(job.id)
                        await job_queue.put(job)

            await asyncio.sleep(5)
        except Exception as e:
            logger.error(f"Error fetching jobs: {e}")
            await asyncio.sleep(5)

async def worker(
    worker_id: int,
    job_queue: asyncio.Queue,
    job_pending_or_in_progress: set,
    job_locks: dict,
):
    while True:
        try:
            job = await job_queue.get()

            async with job_locks[job.id]:
                logger.info(f"Worker {worker_id} processing {job.id}...")
                try:
                    await process_job(job)
                except Exception as e:
                    logger.error(f"Error processing job {job.id}: {e}")
                    error_message = str(e)
                    await update_job_details(
                        job.id,
                        {
                            "status": "failed",
                            "errorMessage": error_message,
                            "attempts": job.attempts + 1
                        },
                    )
                finally:
                    job_pending_or_in_progress.remove(job.id)
                    job_locks.pop(job.id, None)

            job_queue.task_done()
        except Exception as e:
            logger.error(f"Error in worker {worker_id}: {e}")
            await asyncio.sleep(5)


async def async_main():
    job_queue = asyncio.Queue()
    jobs_pending_or_inprogress = set()
    job_locks = defaultdict(asyncio.Lock)

    job_fetcher_task = asyncio.create_task(job_fetcher(job_queue, jobs_pending_or_inprogress))

    workers = [
        asyncio.create_task(
            worker(
                i + 1,
                job_queue,
                jobs_pending_or_inprogress,
                job_locks,
            )
        )
        for i in range(config.MAX_NUM_WORKERS)
    ]

    await asyncio.gather(job_fetcher_task, *workers)


def main():
    try:
        asyncio.run(async_main())
    except KeyboardInterrupt:
        logger.info("Program terminated")
        exit()


if __name__ == "__main__":
    main()
