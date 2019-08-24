import { createDrawerNavigator } from 'react-navigation';
import HomePage from '~/components/Screens/Home';
import ProfilePage from '~/components/Screens/Profile/Details';
import OrderPage from '~/components/Screens/Order/Form';
import { theme } from '~/theme';

import { Drawer } from '../Shared/Drawer';

export const HomeDrawerScreens: any = {
  Home: { screen: HomePage },
  Profile: { screen: ProfilePage },
  Order: { screen: OrderPage }
};

const HomeDrawerNavigator = createDrawerNavigator(HomeDrawerScreens, {
  initialRouteName: 'Home',
  contentComponent: Drawer,
  contentOptions: {
    activeTintColor: theme.accent
  }
});

export default HomeDrawerNavigator;
