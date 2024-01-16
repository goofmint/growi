import { memo, useCallback, useEffect } from 'react';

import { apiv3Post } from '~/client/util/apiv3-client';
import { SidebarContentsType } from '~/interfaces/ui';
import { useSWRxInAppNotificationStatus } from '~/stores/in-app-notification';
import { useDefaultSocket } from '~/stores/socket-io';
import loggerFactory from '~/utils/logger';

// eslint-disable-next-line import/no-cycle
import { PrimaryItem, type PrimaryItemProps } from '../SidebarNav/PrimaryItems';


const logger = loggerFactory('growi:PrimaryItemsForNotification');

type PrimaryItemForNotification = Omit<PrimaryItemProps, 'onClick' | 'label' | 'iconName' | 'contents' | 'badgeContents' >

// TODO(after v7 release): https://redmine.weseek.co.jp/issues/138463
export const PrimaryItemForNotification = memo((props: PrimaryItemForNotification) => {
  const { sidebarMode, onHover } = props;


  const { data: socket } = useDefaultSocket();

  const { data: notificationCount, mutate: mutateNotificationCount } = useSWRxInAppNotificationStatus();

  const badgeContents = notificationCount != null && notificationCount > 0 ? notificationCount : undefined;

  const updateNotificationStatus = useCallback(async() => {
    try {
      await apiv3Post('/in-app-notification/read');
      mutateNotificationCount();
    }
    catch (err) {
      logger.error(err);
    }
  }, [mutateNotificationCount]);

  const itemHoverHandler = useCallback((contents: SidebarContentsType) => {
    onHover?.(contents);
    updateNotificationStatus();
  }, [onHover, updateNotificationStatus]);

  useEffect(() => {
    if (socket != null) {
      socket.on('notificationUpdated', () => {
        mutateNotificationCount();
      });

      // clean up
      return () => {
        socket.off('notificationUpdated');
      };
    }
  }, [mutateNotificationCount, socket]);


  if (sidebarMode == null) {
    return <></>;
  }

  return (
    <PrimaryItem
      sidebarMode={sidebarMode}
      contents={SidebarContentsType.NOTIFICATION}
      label="In-App Notification"
      iconName="notifications"
      badgeContents={badgeContents}
      onClick={updateNotificationStatus}
      onHover={itemHoverHandler}
    />
  );
});
