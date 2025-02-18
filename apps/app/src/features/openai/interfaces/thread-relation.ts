import type { IUser, Ref, HasObjectId } from '@growi/core';

import type { IVectorStore } from './vector-store';

export interface IThreadRelation {
  userId: Ref<IUser>
  vectorStore: Ref<IVectorStore>
  threadId: string;
  expiredAt: Date;
}

export type IThreadRelationHasId = IThreadRelation & HasObjectId;
