import { Ref } from './common';
import { HasObjectId } from './has-object-id';
import { IUser } from './user';

// Model
const MODEL_PAGE = 'Page';
const MODEL_COMMENT = 'Comment';

// Action
const ACTION_UNSETTLED = 'UNSETTLED';
const ACTION_REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS';
const ACTION_LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const ACTION_LOGIN_FAILURE = 'LOGIN_FAILURE';
const ACTION_LOGOUT = 'LOGOUT';
const ACTION_USER_PERSONAL_SETTINGS_UPDATE = 'USER_PERSONAL_SETTINGS_UPDATE';
const ACTION_USER_IMAGE_TYPE_UPDATE = 'USER_IMAGE_TYPE_UPDATE';
const ACTION_USER_LDAP_ACCOUNT_ASSOCIATE = 'USER_LDAP_ACCOUNT_ASSOCIATE';
const ACTION_USER_LDAP_ACCOUNT_DISCONNECT = 'USER_LDAP_ACCOUNT_DISCONNECT';
const ACTION_USER_PASSWORD_UPDATE = 'USER_PASSWORD_UPDATE';
const ACTION_USER_API_TOKEN_UPDATE = 'USER_API_TOKEN_UPDATE';
const ACTION_USER_EDITOR_SETTINGS_UPDATE = 'USER_EDITOR_SETTINGS_UPDATE';
const ACTION_USER_IN_APP_NOTIFICATION_SETTINGS_UPDATE = 'USER_IN_APP_NOTIFICATION_SETTINGS_UPDATE';
const ACTION_PAGE_VIEW = 'PAGE_VIEW';
const ACTION_PAGE_LIKE = 'PAGE_LIKE';
const ACTION_PAGE_UNLIKE = 'PAGE_UNLIKE';
const ACTION_PAGE_BOOKMARK = 'PAGE_BOOKMARK';
const ACTION_PAGE_UNBOOKMARK = 'PAGE_UNBOOKMARK';
const ACTION_PAGE_CREATE = 'PAGE_CREATE';
const ACTION_PAGE_UPDATE = 'PAGE_UPDATE';
const ACTION_PAGE_RENAME = 'PAGE_RENAME';
const ACTION_PAGE_DUPLICATE = 'PAGE_DUPLICATE';
const ACTION_PAGE_DELETE = 'PAGE_DELETE';
const ACTION_PAGE_DELETE_COMPLETELY = 'PAGE_DELETE_COMPLETELY';
const ACTION_PAGE_REVERT = 'PAGE_REVERT';
const ACTION_COMMENT_CREATE = 'COMMENT_CREATE';
const ACTION_COMMENT_UPDATE = 'COMMENT_UPDATE';
const ACTION_COMMENT_REMOVE = 'COMMENT_REMOVE';

export const SupportedTargetModel = {
  MODEL_PAGE,
} as const;

export const SupportedEventModel = {
  MODEL_COMMENT,
} as const;

export const SupportedAction = {
  ACTION_UNSETTLED,
  ACTION_REGISTRATION_SUCCESS,
  ACTION_LOGIN_SUCCESS,
  ACTION_LOGIN_FAILURE,
  ACTION_LOGOUT,
  ACTION_USER_PERSONAL_SETTINGS_UPDATE,
  ACTION_USER_IMAGE_TYPE_UPDATE,
  ACTION_USER_LDAP_ACCOUNT_ASSOCIATE,
  ACTION_USER_LDAP_ACCOUNT_DISCONNECT,
  ACTION_USER_PASSWORD_UPDATE,
  ACTION_USER_API_TOKEN_UPDATE,
  ACTION_USER_EDITOR_SETTINGS_UPDATE,
  ACTION_USER_IN_APP_NOTIFICATION_SETTINGS_UPDATE,
  ACTION_PAGE_VIEW,
  ACTION_PAGE_LIKE,
  ACTION_PAGE_UNLIKE,
  ACTION_PAGE_BOOKMARK,
  ACTION_PAGE_UNBOOKMARK,
  ACTION_PAGE_CREATE,
  ACTION_PAGE_UPDATE,
  ACTION_PAGE_RENAME,
  ACTION_PAGE_DUPLICATE,
  ACTION_PAGE_DELETE,
  ACTION_PAGE_DELETE_COMPLETELY,
  ACTION_PAGE_REVERT,
  ACTION_COMMENT_CREATE,
  ACTION_COMMENT_UPDATE,
  ACTION_COMMENT_REMOVE,
} as const;

export const SupportedActionToNotified = {
  ACTION_PAGE_LIKE,
  ACTION_PAGE_BOOKMARK,
  ACTION_PAGE_UPDATE,
  ACTION_PAGE_RENAME,
  ACTION_PAGE_DUPLICATE,
  ACTION_PAGE_DELETE,
  ACTION_PAGE_DELETE_COMPLETELY,
  ACTION_PAGE_REVERT,
  ACTION_COMMENT_CREATE,
} as const;

/*
 * For AuditLogManagement.tsx
 */
export const PageActions = Object.values({
  ACTION_PAGE_LIKE,
  ACTION_PAGE_BOOKMARK,
  ACTION_PAGE_CREATE,
  ACTION_PAGE_UPDATE,
  ACTION_PAGE_RENAME,
  ACTION_PAGE_DUPLICATE,
  ACTION_PAGE_DELETE,
  ACTION_PAGE_DELETE_COMPLETELY,
  ACTION_PAGE_REVERT,
} as const);

export const CommentActions = Object.values({
  ACTION_COMMENT_CREATE,
  ACTION_COMMENT_UPDATE,
} as const);

/*
 * Array
 */
export const AllSupportedTargetModel = Object.values(SupportedTargetModel);
export const AllSupportedEventModel = Object.values(SupportedEventModel);
export const AllSupportedAction = Object.values(SupportedAction);
export const AllSupportedActionToNotified = Object.values(SupportedActionToNotified);

/*
 * Type
 */
export type SupportedTargetModelType = typeof SupportedTargetModel[keyof typeof SupportedTargetModel];
export type SupportedEventModelType = typeof SupportedEventModel[keyof typeof SupportedEventModel];
export type SupportedActionType = typeof SupportedAction[keyof typeof SupportedAction];

export type ISnapshot = Partial<Pick<IUser, 'username'>>

export type IActivity = {
  user?: Ref<IUser>
  ip?: string
  endpoint?: string
  targetModel?: SupportedTargetModelType
  target?: string
  eventModel?: SupportedEventModelType
  event?: string
  action: SupportedActionType
  createdAt: Date
  snapshot?: ISnapshot
}

export type IActivityHasId = IActivity & HasObjectId;
