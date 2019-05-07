import isEqual from 'lodash/isEqual';
import { NavigationScreenConfig, NavigationScreenOptions } from 'react-navigation';

import getCurrentRouteState from './currentRouteState';

export default function getTabNavigationOptions(tabs: any): NavigationScreenConfig<NavigationScreenOptions> {
  return (params) => {
    const currentRoute = getCurrentRouteState(params.navigation.state);
    const navigationOptions = tabs[currentRoute.routeName].screen.navigationOptions;

    if (currentRoute.params && !isEqual(params.navigation.state.params, currentRoute.params)) {
      params.navigation.setParams(currentRoute.params);
    }

    if (typeof navigationOptions === 'function') {
      return navigationOptions(params);
    }

    return navigationOptions;
  };
}