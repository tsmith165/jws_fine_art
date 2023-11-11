import React, { useState, useEffect, useContext } from 'react';
import { useUser } from '@clerk/nextjs';
import MenuOverlayButton from './MenuOverlayButton';
import styles from "@/styles/layout/MenuOverlay.module.scss";
import { SIGNED_OUT_MENU_LIST, SIGNED_IN_MENU_LIST, ADMIN_MENU_LIST } from "@/lib/menu_list.js";
import AppContext from '@/contexts/AppContext';
import logger from "@/lib/logger";

const MenuOverlay = (props) => {
  const [menuItems, setMenuItems] = useState([]);
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const usingMenu = selectMenu(isLoaded, isSignedIn, user);

    logger.debug("Menu List (Next Line):");
    logger.debug(usingMenu);
    
    const items = generateMenu(usingMenu);
    setMenuItems(items);
  }, [isLoaded, isSignedIn, user]);

  const generateMenu = (menuList) => {
    return menuList.map((menuItem, i) => {
      const [className, menuItemString, , urlEndpoint] = menuItem;
      logger.debug(`Creating Menu Item for: ${menuItemString}`);
      return <MenuOverlayButton key={i} id={i} menu_name={menuItemString} url_endpoint={urlEndpoint} />;
    });
  };

  const selectMenu = (isLoaded, isSignedIn, user) => {
    if (!isLoaded) {
      logger.debug('User not loaded - returning signed out menu...');
      return SIGNED_OUT_MENU_LIST;
    }
    if (!isSignedIn || user == null || !user.publicMetadata || !user.publicMetadata.role) {
      logger.debug('User not signed in or missing metadata - returning signed out menu...');
      return SIGNED_OUT_MENU_LIST;
    }
    if (user.publicMetadata.role === 'ADMIN') {
      logger.debug('User has role Admin - returning admin menu...');
      return ADMIN_MENU_LIST;
    }
    logger.debug('User is signed in but not admin - returning signed in non-admin menu...');
    return SIGNED_IN_MENU_LIST;
  };

  return (
    <div className={styles.menu_overlay_items_container}>
      {menuItems}
    </div>
  );
};

export default MenuOverlay;
