import { createAppContainer, createStackNavigator } from 'react-navigation';
import IndexPage from '~/components/Screens';
import DevPage from '~/components/Screens/_Dev';
import LoginPage from '~/components/Screens/Login';
import UserEditPage from '~/components/Screens/Profile/Form';
import getTabNavigationOptions from '~/helpers/tabNavigationOptions';
import { theme } from '~/theme';

import HomeDrawerNavigator, { HomeDrawerScreens } from './HomeDrawer';

// import HomeTabNavigator, { HomeTabScreens } from './HomeTab';
const Navigator = createStackNavigator({
  Index: { screen: IndexPage },
  Login: { screen: LoginPage },

  Home: {
    screen: HomeDrawerNavigator,
    navigationOptions: getTabNavigationOptions(HomeDrawerScreens)
  },

  UserEdit: { screen: UserEditPage },
  Dev: { screen: DevPage }
}, {
  // headerMode: 'none',
  headerBackTitleVisible: false,
  initialRouteName: 'Index',
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: theme.toolbarDefaultBg,
    },
    headerTintColor: theme.toolbarBtnTextColor,
  }
});

export default createAppContainer(Navigator);