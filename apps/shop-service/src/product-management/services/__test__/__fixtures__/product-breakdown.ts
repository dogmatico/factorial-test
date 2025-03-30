import { makeGlobalId } from '../../../utils/global-ids';

export const correctBasicBycicleBreakdown = {
	[makeGlobalId('ComponentOption', '2')]: 1, // Diamond frame
	[makeGlobalId('ComponentOption', '5')]: 1, // Shiny finish
	[makeGlobalId('ComponentOption', '6')]: 1, // Road wheels
	[makeGlobalId('ComponentOption', '10')]: 1, // Black rims
	[makeGlobalId('ComponentOption', '12')]: 1, // Single-speed chain
};

export const correctWithSupplementBycicleBreakdown = {
	[makeGlobalId('ComponentOption', '1')]: 1, // Full-suspension frame
	[makeGlobalId('ComponentOption', '4')]: 1, // Matte finish (triggers +15 supplement)
	[makeGlobalId('ComponentOption', '7')]: 1, // Mountain wheels
	[makeGlobalId('ComponentOption', '11')]: 1, // Blue rims
	[makeGlobalId('ComponentOption', '13')]: 1, // 8-speed chain
};

export const wrongWithExtraUnitsBycicleBreakdown = {
	[makeGlobalId('ComponentOption', '2')]: 2, // Diamond frame (quantity 2 when only 1 needed)
	[makeGlobalId('ComponentOption', '5')]: 1, // Shiny finish
	[makeGlobalId('ComponentOption', '6')]: 1, // Road wheels
	[makeGlobalId('ComponentOption', '10')]: 1, // Black rims
	[makeGlobalId('ComponentOption', '12')]: 1, // Single-speed chain
};

export const wrongWithMissingUnitsBycicleBreakdown = {
	[makeGlobalId('ComponentOption', '6')]: 1, // Road wheels
	[makeGlobalId('ComponentOption', '10')]: 1, // Black rims
	[makeGlobalId('ComponentOption', '12')]: 1, // Single-speed chain
	// Missing ]frame and finish components
};

export const wrongWithForbiddenUnitsBycicleBreakdown = {
	[makeGlobalId('ComponentOption', '1')]: 1, // Full-suspension frame
	[makeGlobalId('ComponentOption', '5')]: 1, // Shiny finish
	[makeGlobalId('ComponentOption', '8')]: 1, // Fat bike wheels
	[makeGlobalId('ComponentOption', '9')]: 1, // Red rims (forbidden combination)
	[makeGlobalId('ComponentOption', '13')]: 1, // 8-speed chain
};

export const wrongWithInverseForbiddenUnitsBycicleBreakdown = {
	[makeGlobalId('ComponentOption', '3')]: 1, // Step-through frame
	[makeGlobalId('ComponentOption', '4')]: 1, // Matte finish
	[makeGlobalId('ComponentOption', '7')]: 1, // Mountain wheels (forbidden with non-full-suspension)
	[makeGlobalId('ComponentOption', '10')]: 1, // Black rims
	[makeGlobalId('ComponentOption', '12')]: 1, // Single-speed chain
};
