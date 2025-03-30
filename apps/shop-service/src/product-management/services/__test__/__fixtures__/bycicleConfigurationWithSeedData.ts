import type { CategoryConfigurationRules } from 'product-management-interfaces';
import { makeGlobalId } from '../../../utils/global-ids';

export const bycicleConfigurationWithSeedData: CategoryConfigurationRules = {
	category: {
		id: '1',
		name: 'Bicycles',
		description: 'Fully customizable bicycles for all terrains',
		productBreakDown: ['1', '2', '3', '4', '5'].map((dbId) =>
			makeGlobalId('ProductComponent', dbId),
		),
	},
	components: {
		[makeGlobalId('ProductComponent', '1')]: {
			id: makeGlobalId('ProductComponent', '1'),
			name: 'Frame Type',
			description: 'Main bicycle frame structure',
			requiredUnits: 1,
			availableOptions: ['1', '2', '3'].map((dbId) =>
				makeGlobalId('ComponentOption', dbId),
			),
		},
		[makeGlobalId('ProductComponent', '2')]: {
			id: makeGlobalId('ProductComponent', '2'),
			name: 'Frame Finish',
			description: 'Visual and protective coating',
			requiredUnits: 1,
			availableOptions: ['4', '5'].map((dbId) =>
				makeGlobalId('ComponentOption', dbId),
			),
		},
		[makeGlobalId('ProductComponent', '3')]: {
			id: makeGlobalId('ProductComponent', '3'),
			name: 'Wheels',
			description: 'Wheel type for different terrains',
			requiredUnits: 1,
			availableOptions: ['6', '7', '8'].map((dbId) =>
				makeGlobalId('ComponentOption', dbId),
			),
		},
		[makeGlobalId('ProductComponent', '4')]: {
			id: makeGlobalId('ProductComponent', '4'),
			name: 'Rim Color',
			description: 'Visual customization of rims',
			requiredUnits: 1,
			availableOptions: ['9', '10', '11'].map((dbId) =>
				makeGlobalId('ComponentOption', dbId),
			),
		},
		[makeGlobalId('ProductComponent', '5')]: {
			id: makeGlobalId('ProductComponent', '5'),
			name: 'Chain',
			description: 'Drivetrain component',
			requiredUnits: 1,
			availableOptions: ['12', '13'].map((dbId) =>
				makeGlobalId('ComponentOption', dbId),
			),
		},
	},
	componentOptions: {
		[makeGlobalId('ComponentOption', '1')]: {
			id: makeGlobalId('ComponentOption', '1'),
			name: 'Full-suspension',
			description: '',
			basePrice: 130,
		},
		[makeGlobalId('ComponentOption', '2')]: {
			id: makeGlobalId('ComponentOption', '2'),
			name: 'Diamond',
			description: '',
			basePrice: 100,
		},
		[makeGlobalId('ComponentOption', '3')]: {
			id: makeGlobalId('ComponentOption', '3'),
			name: 'Step-through',
			description: '',
			basePrice: 110,
		},
		[makeGlobalId('ComponentOption', '4')]: {
			id: makeGlobalId('ComponentOption', '4'),
			name: 'Matte',
			description: '',
			basePrice: 35,
		},
		[makeGlobalId('ComponentOption', '5')]: {
			id: makeGlobalId('ComponentOption', '5'),
			name: 'Shiny',
			description: '',
			basePrice: 30,
		},
		[makeGlobalId('ComponentOption', '6')]: {
			id: makeGlobalId('ComponentOption', '6'),
			name: 'Road wheels',
			description: '',
			basePrice: 80,
		},
		[makeGlobalId('ComponentOption', '7')]: {
			id: makeGlobalId('ComponentOption', '7'),
			name: 'Mountain wheels',
			description: '',
			basePrice: 90,
		},
		[makeGlobalId('ComponentOption', '8')]: {
			id: makeGlobalId('ComponentOption', '8'),
			name: 'Fat bike wheels',
			description: '',
			basePrice: 120,
		},
		[makeGlobalId('ComponentOption', '9')]: {
			id: makeGlobalId('ComponentOption', '9'),
			name: 'Red',
			description: '',
			basePrice: 15,
		},
		[makeGlobalId('ComponentOption', '10')]: {
			id: makeGlobalId('ComponentOption', '10'),
			name: 'Black',
			description: '',
			basePrice: 20,
		},
		[makeGlobalId('ComponentOption', '11')]: {
			id: makeGlobalId('ComponentOption', '11'),
			name: 'Blue',
			description: '',
			basePrice: 20,
		},
		[makeGlobalId('ComponentOption', '12')]: {
			id: makeGlobalId('ComponentOption', '12'),
			name: 'Single-speed chain',
			description: '',
			basePrice: 43,
		},
		[makeGlobalId('ComponentOption', '13')]: {
			id: makeGlobalId('ComponentOption', '13'),
			name: '8-speed chain',
			description: '',
			basePrice: 55,
		},
	},
	componentOptionsRules: [
		{
			id: makeGlobalId('ProductComponentRule', '2'),
			option1Id: makeGlobalId('ComponentOption', '1'),
			option2Id: makeGlobalId('ComponentOption', '4'),
			kind: 'SUPPLEMENT',
			value: {
				price_adjustment: 15,
				message: 'Matte finish supplement for full-suspension frames',
			},
		},
		{
			id: makeGlobalId('ProductComponentRule', '1'),
			option1Id: makeGlobalId('ComponentOption', '8'),
			option2Id: makeGlobalId('ComponentOption', '9'),
			kind: 'FORBIDDEN',
			value: {
				message: 'Fat bike wheels cannot have red rims',
			},
		},
	],
};
