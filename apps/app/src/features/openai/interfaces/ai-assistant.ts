import type { IGrantedGroup, IUser, Ref } from '@growi/core';

import type { VectorStore } from '../server/models/vector-store';

/*
*  Objects
*/
export const AiAssistantShareScope = {
  PUBLIC_ONLY: 'publicOnly',
  OWNER: 'owner',
  GROUPS: 'groups',
} as const;

export const AiAssistantAccessScope = {
  PUBLIC_ONLY: 'publicOnly',
  OWNER: 'owner',
  GROUPS: 'groups',
} as const;

/*
*  Interfaces
*/
export type AiAssistantShareScope = typeof AiAssistantShareScope[keyof typeof AiAssistantShareScope];
export type AiAssistantAccessScope = typeof AiAssistantAccessScope[keyof typeof AiAssistantAccessScope];

export interface AiAssistant {
  name: string;
  description: string
  additionalInstruction: string
  pagePathPatterns: string[],
  vectorStore: Ref<VectorStore>
  owner: Ref<IUser>
  grantedGroupsForShareScope?: IGrantedGroup[]
  grantedGroupsForAccessScope?: IGrantedGroup[]
  shareScope: AiAssistantShareScope
  accessScope: AiAssistantAccessScope
}

export type IApiv3AiAssistantCreateParams = Omit<AiAssistant, 'owner' | 'vectorStore'>

export type AccessibleAiAssistants = {
  myAiAssistants: AiAssistant[],
  teamAiAssistants: AiAssistant[],
}
