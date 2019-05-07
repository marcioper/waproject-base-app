import { PixelRatio } from 'react-native';

import variable from './../variables/platform';

export default (variables = variable) => {
	const platform = variables.platform;

	const segmentTheme = {
		height: 45,
		borderColor: variables.segmentBorderColorMain,
		flexDirection: 'row',
		justifyContent: 'center',
		backgroundColor: variables.segmentBackgroundColor,
		borderBottomWidth: platform === 'ios' ? 1 / PixelRatio.getPixelSizeForLayoutSize(1) : 0,
		borderBottomColor: variables.toolbarDefaultBorder,
		'NativeBase.Button': {
			alignSelf: 'center',
			borderRadius: 0,
			paddingHorizontal: 20,
			height: 30,
			backgroundColor: 'transparent',
			borderWidth: 1,
			borderLeftWidth: 0,
			paddingTop: 5,
			borderColor: variables.segmentBorderColor,
			elevation: 0,
			'.active': {
				backgroundColor: variables.segmentActiveBackgroundColor,
				'NativeBase.Text': {
					color: variables.segmentActiveTextColor,
				},
			},
			'.first': {
				borderTopLeftRadius: 5,
				borderBottomLeftRadius: 5,
				borderLeftWidth: 1,
			},
			'.last': {
				borderTopRightRadius: 5,
				borderBottomRightRadius: 5,
			},
			'NativeBase.Text': {
				color: variables.segmentTextColor,
				fontSize: 14,
			},
		},
	};

	return segmentTheme;
};
