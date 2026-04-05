import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Project from './models/Project.js';

dotenv.config();

const run = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Searching for projects with missing currentMilestone...');
        // Find projects missing currentMilestone or where it is null/undefined
        const projects = await Project.find({
            $or: [
                { currentMilestone: { $exists: false } },
                { currentMilestone: null },
                { currentMilestone: '' }
            ]
        });

        console.log(`Found ${projects.length} projects to update.`);

        for (const project of projects) {
            console.log(`Updating project: ${project.name} (ID: ${project._id})`);
            project.currentMilestone = 'Planning'; // Default value

            // We need to bypass validation initially if other things are broken, 
            // but here we expect only this field to be missing.
            // Let's try standard save.
            try {
                await project.save();
                console.log(`Successfully updated ${project.name}`);
            } catch (saveErr) {
                console.error(`Failed to save ${project.name}:`, saveErr.message);
            }
        }

        console.log('Migration complete.');
        process.exit();
    } catch (err) {
        console.error('Migration script failed:', err);
        process.exit(1);
    }
};

run();
