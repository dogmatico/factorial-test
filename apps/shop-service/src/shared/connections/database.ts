import SQLLiteDatabase, { type Database } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export type DBConnection = ReturnType<typeof drizzle>;

let nativeConnection: Database | null = null;

let connection: DBConnection | null = null;

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

		nativeConnection = new SQLLiteDatabase(connectionString);
	}

	return nativeConnection;
}

export function dropNativeDatabase() {
	if (nativeConnection) {
		nativeConnection.close();
		nativeConnection = null;

		connection = null;
	}
}
