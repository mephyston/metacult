import type { Job } from 'bullmq';
import { getDbConnection, works } from '@metacult/backend/infrastructure';
import { eq } from 'drizzle-orm';

const { db } = getDbConnection();

// Define job payload interface
interface ImportMediaJob {
    workId: string;
    sourceData: any; // Simulated external API data
}

export const processImportMedia = async (job: Job<ImportMediaJob>) => {
    console.log(`🔄 Processing Import Job ${job.id} for Work ID: ${job.data.workId}`);

    // Simulate async processing (e.g., fetching from IGDB/TMDB)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
        // Fake update in DB
        // In a real scenario, we would parse sourceData and update columns
        await db.update(works)
            .set({
                sourceRawData: job.data.sourceData,
                // Mark as updated or processed if we had a status column
            })
            .where(eq(works.id, job.data.workId));

        console.log(`✅ Work ${job.data.workId} updated successfully with raw data.`);
    } catch (error) {
        console.error(`💥 Failed to update work ${job.data.workId}:`, error);
        throw error; // Let BullMQ handle retries
    }
};
