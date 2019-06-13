import { createBottomTabNavigator } from 'react-navigation';
import HomePage from '~/components/Screens/Home';
import ProfilePage from '~/components/Screens/Profile/Details';
import { IS_IOS } from '~/config';
import { theme } from '~/theme';

export const HomeTabScreens: any = {
  HomeTab: { screen: HomePage },
  ProfileTab: { screen: ProfilePage }
};

const HomeTabNavigator = createBottomTabNavigator(HomeTabScreens, {
  initialRouteName: 'HomeTab',
  swipeEnabled: false,
  tabBarOptions: {
    showIcon: true,
    showLabel: IS_IOS,
    activeTintColor: theme.primary,
    pressColor: theme.primary,
    indicatorStyle: {
      backgroundColor: 'transparent'
    },
    inactiveTintColor: 'gray',
    ... (theme.platform === 'ios' ? {
    } :
      {
        tabStyle: {
          height: 60,
          paddingBottom: 10,
        },
        iconStyle: {

        },
        style: {
          elevation: 8,
          backgroundColor: 'white',
        },
      })
  }
});

export default HomeTabNavigator;