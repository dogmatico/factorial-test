import express from 'express';

import { setupInitSessionManagement } from './session-management/setup.ts';
import { setupSharedFunctionatily } from './shared/setup.ts';

export const app = express();

setupSharedFunctionatily(app);
setupInitSessionManagement(app);

app.get('/', (_req, res) => {
	res.send({ message: 'Ready' });
});
