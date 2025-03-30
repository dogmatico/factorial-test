// augmentations
import './src/augmentations.ts';

import { preloadData } from './src/preloadData.ts';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Preload data when in memory
if (!process.env.DATABASE_CONNECTION) {
	await preloadData();
}

const { app } = await import('./src/app.ts');

app.listen(port, host, async () => {
	console.log(`[ ready ] http://${host}:${port}`);
});
