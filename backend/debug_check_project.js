import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Project from './models/Project.js';

dotenv.config();

const run = async () => {
    try {
        await connectDB();
        const project = await Project.findOne({ name: 'Mobile App Development' });
        if (project) {
            console.log('Project found:', JSON.stringify(project.toObject(), null, 2));
            console.log('Validating project...');
            try {
                await project.validate();
                console.log('Project is valid.');
            } catch (err) {
                console.error('Project validation failed:', err.message);
            }
        } else {
            console.log('Project not found.');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
