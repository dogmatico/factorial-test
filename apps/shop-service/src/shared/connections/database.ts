import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export type DBConnection = ReturnType<typeof drizzle>;

let nativeConnection: Database;

let connection: DBConnection;

export function getDBConnection(): DBConnection {
	if (!connection) {
		const db = getNativeDatabase();
		connection = drizzle({ client: db });
	}

	return connection;
}

export function getNativeDatabase(): Database {
	if (!nativeConnection) {
		const connectionString = process.env.DATABASE_CONNECTION || ':memory:';

		nativeConnection = new Database(connectionString);
	}

	return nativeConnection;
}
