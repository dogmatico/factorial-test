import type { Request, Response } from 'express';

import { dispatchBusinessEvent } from '../../shared/business-events-bus/index.ts';
import { makeUserLoggedInEvent } from '../events/index.ts';

export function sessionCreateController(req: Request, res: Response) {
	if (req.session && !req.session?.userId) {
		req.session.userId = globalThis.crypto.randomUUID();

		res.cookie('csrf-cookie-to-header', globalThis.crypto.randomUUID(), {
			maxAge: 10 * 60 * 1000,
		});

		dispatchBusinessEvent(
			makeUserLoggedInEvent({ userId: req.session.userId }),
		);
	}

	res.status(204).end();
}
