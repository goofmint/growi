import type { ShareLinkModel } from '~/server/models/share-link';
import { getModelSafely } from '~/server/util/mongoose-utils';
import loggerFactory from '~/utils/logger';

import type { ValidReferer } from './interfaces';


const logger = loggerFactory('growi:middleware:certify-shared-fire:retrieve-valid-share-link');


export const retrieveValidShareLinkByReferer = async(referer: ValidReferer): Promise<ShareLinkModel | null> => {
  const ShareLink = getModelSafely<ShareLinkModel>('ShareLink');
  if (ShareLink == null) {
    logger.warn('Could not get ShareLink model. next() will be called without processing anything.');
    return null;
  }

  const shareLinkId = referer;
  const shareLink = await ShareLink.findOne({
    id: shareLinkId,
  });
  if (shareLink == null || shareLink.isExpired()) {
    logger.info(`ShareLink ('${shareLinkId}') is not found or has already expired.`);
    return null;
  }

  return shareLink;
};
