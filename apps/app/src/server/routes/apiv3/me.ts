import { type IUserHasId, isPopulated } from '@growi/core';
import { Router, Request } from 'express';

import ExternalUserGroupRelation from '~/features/external-user-group/server/models/external-user-group-relation';
import loggerFactory from '~/utils/logger';

import UserGroupRelation from '../../models/user-group-relation';

import { ApiV3Response } from './interfaces/apiv3-response';

const logger = loggerFactory('growi:routes:apiv3:me');

const router = Router();

interface AuthorizedRequest extends Request {
  user?: IUserHasId
}

module.exports = function(crowi) {
  const accessTokenParser = require('../../middlewares/access-token-parser')(crowi);
  const loginRequiredStrictly = require('../../middlewares/login-required')(crowi);

  const ApiResponse = require('../../util/apiResponse');

  /**
   * retrieve user-group documents
   */
  router.get('/user-groups', accessTokenParser, loginRequiredStrictly, async(req: AuthorizedRequest, res: ApiV3Response) => {
    try {
      const userGroupRelations = await UserGroupRelation.findAllRelationForUser(req.user);
      const userGroups = userGroupRelations.map((relation) => {
        // relation.relatedGroup should be populated
        return isPopulated(relation.relatedGroup) ? relation.relatedGroup : undefined;
      })
        // exclude undefined elements
        .filter(elem => elem != null);
      return res.json(ApiResponse.success({ userGroups }));
    }
    catch (e) {
      logger.error(e);
      return res.apiv3Err(e, 500);
    }
  });

  /**
   * retrieve external-user-group-relation documents
   */
  router.get('/external-user-groups', accessTokenParser, loginRequiredStrictly, async(req: AuthorizedRequest, res: ApiV3Response) => {
    try {
      const userGroupRelations = await ExternalUserGroupRelation.findAllRelationForUser(req.user);
      const userGroups = userGroupRelations.map((relation) => {
        // relation.relatedGroup should be populated
        return isPopulated(relation.relatedGroup) ? relation.relatedGroup : undefined;
      })
      // exclude undefined elements
        .filter(elem => elem != null);
      return res.json(ApiResponse.success({ userGroups }));
    }
    catch (e) {
      logger.error(e);
      return res.apiv3Err(e, 500);
    }
  });

  return router;
};
