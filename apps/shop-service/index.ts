import { app } from './src/app.ts';

// augmentations
import './src/augmentations.ts';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, host, () => {
	console.log(`[ ready ] http://${host}:${port}`);
});
