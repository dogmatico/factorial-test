import type { Request, Response } from 'express';

import { dispatchBusinessEvent } from '../../shared/business-events-bus/index.ts';
import { makeUserLoggedInEvent } from '../events/index.ts';

export function sessionCreateController(req: Request, res: Response) {
	if (req.session && !req.session?.userId) {
		req.session.userId = globalThis.crypto.randomUUID();
		req.session.sessionId = 'SESSION_ID';

		res.cookie('X-CSRF-TOKEN', globalThis.crypto.randomUUID(), {
			maxAge: 10 * 60 * 1000,
		});

		dispatchBusinessEvent(
			makeUserLoggedInEvent({
				userId: req.session.userId,
				sessionId: 'SESSION_ID',
			}),
		);
	}

	res.status(204).end();
}
