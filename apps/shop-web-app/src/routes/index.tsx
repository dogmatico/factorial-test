import { createFileRoute } from '@tanstack/react-router';
import type { CategoryConfigurationRules } from 'product-management-interfaces';
import React from 'react';
import { CategoryProductConfiguration } from '../product-configuration/components/ProductConfigurationForm';

export const Route = createFileRoute('/')({
	component: RouteComponent,
});

const configuration: CategoryConfigurationRules = {
	category: {
		id: '1',
		name: 'Bicycles',
		description: 'Fully customizable bicycles for all terrains',
		productBreakDown: ['1', '2', '3', '4', '5'],
	},
	components: {
		'1': {
			id: '1',
			name: 'Frame Type',
			description: 'Main bicycle frame structure',
			requiredUnits: 1,
			availableOptions: ['1', '2', '3'],
		},
		'2': {
			id: '2',
			name: 'Frame Finish',
			description: 'Visual and protective coating',
			requiredUnits: 1,
			availableOptions: ['4', '5'],
		},
		'3': {
			id: '3',
			name: 'Wheels',
			description: 'Wheel type for different terrains',
			requiredUnits: 1,
			availableOptions: ['6', '7', '8'],
		},
		'4': {
			id: '4',
			name: 'Rim Color',
			description: 'Visual customization of rims',
			requiredUnits: 1,
			availableOptions: ['9', '10', '11'],
		},
		'5': {
			id: '5',
			name: 'Chain',
			description: 'Drivetrain component',
			requiredUnits: 1,
			availableOptions: ['12', '13'],
		},
	},
	componentOptions: {
		'1': {
			id: '1',
			name: 'Full-suspension',
			description: '',
			basePrice: 130,
		},
		'2': {
			id: '2',
			name: 'Diamond',
			description: '',
			basePrice: 100,
		},
		'3': {
			id: '3',
			name: 'Step-through',
			description: '',
			basePrice: 110,
		},
		'4': {
			id: '4',
			name: 'Matte',
			description: '',
			basePrice: 35,
		},
		'5': {
			id: '5',
			name: 'Shiny',
			description: '',
			basePrice: 30,
		},
		'6': {
			id: '6',
			name: 'Road wheels',
			description: '',
			basePrice: 80,
		},
		'7': {
			id: '7',
			name: 'Mountain wheels',
			description: '',
			basePrice: 90,
		},
		'8': {
			id: '8',
			name: 'Fat bike wheels',
			description: '',
			basePrice: 120,
		},
		'9': {
			id: '9',
			name: 'Red',
			description: '',
			basePrice: 15,
		},
		'10': {
			id: '10',
			name: 'Black',
			description: '',
			basePrice: 20,
		},
		'11': {
			id: '11',
			name: 'Blue',
			description: '',
			basePrice: 20,
		},
		'12': {
			id: '12',
			name: 'Single-speed chain',
			description: '',
			basePrice: 43,
		},
		'13': {
			id: '13',
			name: '8-speed chain',
			description: '',
			basePrice: 55,
		},
	},
	componentOptionsRules: [
		{
			id: '2',
			option1Id: '1',
			option2Id: '4',
			kind: 'SUPPLEMENT',
			value: {
				price_adjustment: 15,
				message: 'Matte finish supplement for full-suspension frames',
			},
		},
		{
			id: '1',
			option1Id: '8',
			option2Id: '9',
			kind: 'FORBIDDEN',
			value: {
				message: 'Fat bike wheels cannot have red rims',
			},
		},
	],
};

function RouteComponent() {
	return <h1>Welcome to Marcus hardware</h1>;
}
