export const correctBasicBycicleBreakdown = {
	'2': 1, // Diamond frame
	'5': 1, // Shiny finish
	'6': 1, // Road wheels
	'10': 1, // Black rims
	'12': 1, // Single-speed chain
};

export const correctWithSupplementBycicleBreakdown = {
	'1': 1, // Full-suspension frame
	'4': 1, // Matte finish (triggers +15 supplement)
	'7': 1, // Mountain wheels
	'11': 1, // Blue rims
	'13': 1, // 8-speed chain
};

export const wrongWithExtraUnitsBycicleBreakdown = {
	'2': 2, // Diamond frame (quantity 2 when only 1 needed)
	'5': 1, // Shiny finish
	'6': 1, // Road wheels
	'10': 1, // Black rims
	'12': 1, // Single-speed chain
};

export const wrongWithMissingUnitsBycicleBreakdown = {
	'6': 1, // Road wheels
	'10': 1, // Black rims
	'12': 1, // Single-speed chain
	// Missing frame and finish components
};

export const wrongWithForbiddenUnitsBycicleBreakdown = {
	'1': 1, // Full-suspension frame
	'5': 1, // Shiny finish
	'8': 1, // Fat bike wheels
	'9': 1, // Red rims (forbidden combination)
	'13': 1, // 8-speed chain
};

export const wrongWithInverseForbiddenUnitsBycicleBreakdown = {
	'3': 1, // Step-through frame
	'4': 1, // Matte finish
	'7': 1, // Mountain wheels (forbidden with non-full-suspension)
	'10': 1, // Black rims
	'12': 1, // Single-speed chain
};
