export function makeGlobalId(entityType: string, localId: string) {
	return Buffer.from(`${entityType}::${localId}`).toString('base64');
}

export function getLocalId(globalId: string) {
	return Buffer.from(globalId, 'base64').toString().split('::')[1];
}
