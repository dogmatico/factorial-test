import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { getNativeDatabase } from './shared/connections/database.ts';

export async function preloadData() {
	const db = getNativeDatabase();

	const schemaFile = readFileSync(
		path.resolve(
			import.meta.dirname,
			'..',
			'migrations',
			'db_20250327181940.sql',
		),
		{ encoding: 'utf-8' },
	);

	db.exec(schemaFile);

	const seedData = readFileSync(
		path.resolve(import.meta.dirname, '..', 'migrations', 'db_seed_data.sql'),
		{ encoding: 'utf-8' },
	);
	db.exec(seedData);
}
