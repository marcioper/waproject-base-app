import * as React from 'react';
import { ScrollView } from 'react-native';
import { DrawerItems, DrawerItemsProps } from 'react-navigation';
import BaseComponent from '~/components/Shared/Abstract/Base';

export class Drawer extends BaseComponent<DrawerItemsProps> {
  render() {

    return (
      <ScrollView>
        <DrawerItems {...this.props as any} />
      </ScrollView>
    );
  }

}