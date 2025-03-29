import type { Request, Response } from 'express';

import type { APIResponse } from '../../shared/interfaces.ts';
import type { CategoryConfigurationRules } from '../interfaces.ts';
import { getProductConfigurationService } from '../services/ProductConfigurationService.ts';

export async function getConfigurationByNameController(
	req: Request,
	res: Response,
) {
	const productName = req.params.productName;

	const productConfigurationService = getProductConfigurationService();
	const configuration =
		await productConfigurationService.getProductConfiguration({ productName });

	const responsePayload: APIResponse<CategoryConfigurationRules> = {
		isSuccess: true,
		data: null,
		errors: [],
		warnings: [],
	};
	let status = 200;

	if (configuration) {
		responsePayload.data = configuration;
	} else {
		status = 404;
		responsePayload.isSuccess = false;
		responsePayload.errors.push({
			code: '404',
			description: 'Product category not found',
		});
	}

	res.status(status).json(responsePayload).end();
}
