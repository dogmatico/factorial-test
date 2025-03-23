import type { Request, Response } from 'express';

import { dispatchBusinessEvent } from '../../shared/business-events-bus/index.ts';
import { makeUserLoggedOutEvent } from '../events/index.ts';

export function sessionDeleteController(req: Request, res: Response) {
	const userId = req.session?.userId;

	req.session = null;
	res.clearCookie('csrf-cookie-to-header');

	if (userId) {
		dispatchBusinessEvent(makeUserLoggedOutEvent({ userId: userId }));
	}

	res.status(204).end();
}
