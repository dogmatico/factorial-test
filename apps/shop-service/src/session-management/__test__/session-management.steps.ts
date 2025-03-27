import { Given, type QuickPickleWorld, Then, When } from 'quickpickle';
import supertest, { type Test } from 'supertest';
import { expect, vi } from 'vitest';
import { app } from '../../app';
import { registerBusinessEventHandler } from '../../shared/business-events-bus';
import type { BusinessEventHandler } from '../../shared/business-events-bus/interfaces';
import { makeUserLoggedInEvent, makeUserLoggedOutEvent } from '../events';

interface WorldWithData extends QuickPickleWorld {
	data: {
		request: Test;
		sessionId: string;
		credentialCookies: string[];
		businessEventHandler: typeof vi.fn;
	};
}

When(
	'the consumer visits the session status endpoint',
	(world: WorldWithData) => {
		world.data.request = supertest(app).post('/api/v1/shop/currentSession');
		world.data.businessEventHandler = vi.fn();

		registerBusinessEventHandler(
			'shop-service/session-management/USER_LOGGED_IN',
			world.data.businessEventHandler as BusinessEventHandler,
		);
	},
);

Then(
	'a new session is generated with the configured TTL',
	async (world: WorldWithData) => {
		const requestResult = await world.data.request;
		expect(requestResult.statusCode).toEqual(204);
	},
);

Then(
	'the response sets an httpOnly cookie with the session identifier',
	async (world: WorldWithData) => {
		const requestResult = await world.data.request;

		expect(requestResult.headers['set-cookie']).toBeDefined();

		const sessionCookie = Object.values(
			requestResult.headers['set-cookie'],
		).find((val) => val.startsWith('session='));
		expect(sessionCookie).toBeDefined();
		expect(sessionCookie).toContain('httponly');
	},
);

Then(
	'the response sets a cookie with a CSRF token',
	async (world: WorldWithData) => {
		const requestResult = await world.data.request;

		const csrfCookie = Object.values(requestResult.headers['set-cookie']).find(
			(val) => val.startsWith('X-CSRF-TOKEN='),
		);
		expect(csrfCookie).toBeDefined();
		expect(csrfCookie).not.toContain('httponly');
	},
);

Given('a consumer with session credentials', async (world: WorldWithData) => {
	const prevReq = await supertest(app).post('/api/v1/shop/currentSession');
	world.data.businessEventHandler = vi.fn();

	registerBusinessEventHandler(
		'shop-service/session-management/USER_LOGGED_OUT',
		world.data.businessEventHandler as BusinessEventHandler,
	);

	world.data.credentialCookies = Object.values(
		prevReq.headers['set-cookie'],
	).reduce((acum: string[], curr) => {
		if (
			curr.startsWith('session=') ||
			curr.startsWith('session.sig=') ||
			curr.startsWith('X-CSRF-TOKEN=')
		) {
			acum.push(curr.split(';')[0]);
		}

		return acum;
	}, []);
});

When(
	'the consumer visits the session status endpoint with the session credentials',
	async (world: WorldWithData) => {
		world.data.request = supertest(app)
			.post('/api/v1/shop/currentSession')
			.set('Cookie', world.data.credentialCookies.join('; '));
	},
);

Then('the previous session is returned', async (world: WorldWithData) => {
	const res = await world.data.request;
	expect(res.headers['set-cookie']).not.toBeDefined();
});

When('the consumer closes the session', async (world: WorldWithData) => {
	world.data.request = supertest(app).delete('/api/v1/shop/currentSession');

	world.data.request.set('Cookie', world.data.credentialCookies.join('; '));

	const requestResult = await world.data.request;
	expect(requestResult.statusCode).toEqual(204);
});

Then('a user logged-in event is emitted', (world: WorldWithData) => {
	expect(world.data.businessEventHandler).toHaveBeenCalledWith({
		event: makeUserLoggedInEvent({ userId: expect.any(String) }),
	});
});

Then('the session cookies are cleared', async (world: WorldWithData) => {
	const res = await world.data.request;
	expect(res.headers['set-cookie']).toContain(
		'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
	);
});

Then('a user logged-out event is emitted', (world: WorldWithData) => {
	expect(world.data.businessEventHandler).toHaveBeenCalledWith({
		event: makeUserLoggedOutEvent({ userId: expect.any(String) }),
	});
});
