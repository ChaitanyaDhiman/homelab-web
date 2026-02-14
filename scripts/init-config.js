const fs = require('fs');
const path = require('path');

const DEFAULTS_PATH = '/app/defaults/default.json';
const CONFIG_DIR = '/app/app/config';

function init() {
    console.log('Initializing configuration...');

    if (!fs.existsSync(DEFAULTS_PATH)) {
        console.error(`Defaults file not found at ${DEFAULTS_PATH}`);
        return;
    }

    try {
        // Ensure config dir exists
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }

        // Only ensure default.json exists in the volume
        // We do NOT create apps.json/storage.json/widgets.json automatically.
        // The application handles fallback to default.json at runtime.
        const targetDefaultPath = path.join(CONFIG_DIR, 'default.json');

        if (!fs.existsSync(targetDefaultPath)) {
            console.log(`Copying default.json to ${targetDefaultPath}`);
            const defaultsContent = fs.readFileSync(DEFAULTS_PATH, 'utf8');
            fs.writeFileSync(targetDefaultPath, defaultsContent);
        } else {
            console.log('default.json already exists in volume.');
        }

        console.log('Configuration initialization complete.');

    } catch (error) {
        console.error('Error initializing config:', error);
    }
}

init();
