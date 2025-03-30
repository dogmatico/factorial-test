import express from 'express';

import { setupInventoryManagement } from './inventory-management/setup.ts';
import { setupProductManagement } from './product-management/setup.ts';
import { setupInitSessionManagement } from './session-management/setup.ts';
import { setupSharedFunctionatily } from './shared/setup.ts';

export const app = express();

setupSharedFunctionatily(app);
setupInitSessionManagement(app);
setupProductManagement(app);
setupInventoryManagement(app);

app.get('/status', (_req, res) => {
	res.send({ message: 'Ready' });
});
