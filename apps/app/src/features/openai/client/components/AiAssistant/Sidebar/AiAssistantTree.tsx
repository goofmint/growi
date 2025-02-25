import React, { useCallback, useState } from 'react';

import { getIdStringForRef } from '@growi/core';

import { toastError, toastSuccess } from '~/client/util/toastr';
import type { IThreadRelationHasId } from '~/features/openai/interfaces/thread-relation';
import { useCurrentUser } from '~/stores-universal/context';

import type { AiAssistantAccessScope } from '../../../../interfaces/ai-assistant';
import { AiAssistantShareScope, type AiAssistantHasId } from '../../../../interfaces/ai-assistant';
import { deleteAiAssistant } from '../../../services/ai-assistant';
import { useAiAssistantChatSidebar, useAiAssistantManagementModal } from '../../../stores/ai-assistant';
import { useSWRMUTxThreads, useSWRxThreads } from '../../../stores/thread';

import styles from './AiAssistantTree.module.scss';

const moduleClass = styles['ai-assistant-tree-item'] ?? '';


/*
*  ThreadItem
*/
type ThreadItemProps = {
  thread: IThreadRelationHasId
  aiAssistantData: AiAssistantHasId;
  onThreadClick: (aiAssistantData: AiAssistantHasId, threadId?: string) => void;
};

const ThreadItem: React.FC<ThreadItemProps> = ({ thread, aiAssistantData, onThreadClick }) => {

  const deleteThreadHandler = useCallback(() => {
    // TODO: https://redmine.weseek.co.jp/issues/161490
  }, []);

  const openChatHandler = useCallback(() => {
    onThreadClick(aiAssistantData, thread.threadId);
  }, [aiAssistantData, onThreadClick, thread.threadId]);

  return (
    <li
      role="button"
      className="list-group-item list-group-item-action border-0 d-flex align-items-center rounded-1 ps-5"
      onClick={openChatHandler}
    >
      <div>
        <span className="material-symbols-outlined fs-5">chat</span>
      </div>

      <div className="grw-ai-assistant-title-anchor ps-1">
        <p className="text-truncate m-auto">{thread?.title ?? 'Untitled Thread'}</p>
      </div>

      <div className="grw-ai-assistant-actions opacity-0 d-flex justify-content-center ">
        <button
          type="button"
          className="btn btn-link text-secondary p-0"
          onClick={deleteThreadHandler}
        >
          <span className="material-symbols-outlined fs-5">delete</span>
        </button>
      </div>
    </li>
  );
};


/*
*  ThreadItems
*/
type ThreadItemsProps = {
  aiAssistantData: AiAssistantHasId;
  onThreadClick: (aiAssistantData: AiAssistantHasId, threadId?: string) => void;
};

const ThreadItems: React.FC<ThreadItemsProps> = ({ aiAssistantData, onThreadClick }) => {
  const { data: threads } = useSWRxThreads(aiAssistantData._id);

  if (threads == null || threads.length === 0) {
    return <p className="text-secondary ms-5">スレッドが存在しません</p>;
  }

  return (
    <div className="grw-ai-assistant-item-children">
      {threads.map(thread => (
        <ThreadItem
          key={thread._id}
          thread={thread}
          aiAssistantData={aiAssistantData}
          onThreadClick={onThreadClick}
        />
      ))}
    </div>
  );
};


/*
*  AiAssistantItem
*/
const getShareScopeIcon = (shareScope: AiAssistantShareScope, accessScope: AiAssistantAccessScope): string => {
  const determinedSharedScope = shareScope === AiAssistantShareScope.SAME_AS_ACCESS_SCOPE ? accessScope : shareScope;
  switch (determinedSharedScope) {
    case AiAssistantShareScope.OWNER:
      return 'lock';
    case AiAssistantShareScope.GROUPS:
      return 'account_tree';
    case AiAssistantShareScope.PUBLIC_ONLY:
      return 'group';
  }
};

type AiAssistantItemProps = {
  currentUserId?: string;
  aiAssistant: AiAssistantHasId;
  onEditClick: (aiAssistantData: AiAssistantHasId) => void;
  onItemClick: (aiAssistantData: AiAssistantHasId, threadId?: string) => void;
  onDeleted?: () => void;
};

const AiAssistantItem: React.FC<AiAssistantItemProps> = ({
  currentUserId,
  aiAssistant,
  onEditClick,
  onItemClick,
  onDeleted,
}) => {
  const [isThreadsOpened, setIsThreadsOpened] = useState(false);

  const { trigger: mutateThreadData } = useSWRMUTxThreads(aiAssistant._id);

  const openManagementModalHandler = useCallback((aiAssistantData: AiAssistantHasId) => {
    onEditClick(aiAssistantData);
  }, [onEditClick]);

  const openChatHandler = useCallback((aiAssistantData: AiAssistantHasId) => {
    onItemClick(aiAssistantData);
  }, [onItemClick]);

  const openThreadsHandler = useCallback(async() => {
    mutateThreadData();
    setIsThreadsOpened(toggle => !toggle);
  }, [mutateThreadData]);

  const deleteAiAssistantHandler = useCallback(async() => {
    try {
      await deleteAiAssistant(aiAssistant._id);
      onDeleted?.();
      toastSuccess('アシスタントを削除しました');
    }
    catch (err) {
      toastError('アシスタントの削除に失敗しました');
    }
  }, [aiAssistant._id, onDeleted]);

  const isOperable = currentUserId != null && getIdStringForRef(aiAssistant.owner) === currentUserId;

  return (
    <>
      <li
        onClick={(e) => {
          e.stopPropagation();
          openChatHandler(aiAssistant);
        }}
        role="button"
        className="list-group-item list-group-item-action border-0 d-flex align-items-center rounded-1"
      >
        <div className="d-flex justify-content-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openThreadsHandler();
            }}
            className={`grw-ai-assistant-triangle-btn btn px-0 ${isThreadsOpened ? 'grw-ai-assistant-open' : ''}`}
          >
            <div className="d-flex justify-content-center">
              <span className="material-symbols-outlined fs-5">arrow_right</span>
            </div>
          </button>
        </div>

        <div className="d-flex justify-content-center">
          <span className="material-symbols-outlined fs-5">{getShareScopeIcon(aiAssistant.shareScope, aiAssistant.accessScope)}</span>
        </div>

        <div className="grw-ai-assistant-title-anchor ps-1">
          <p className="text-truncate m-auto">{aiAssistant.name}</p>
        </div>

        { isOperable && (
          <div className="grw-ai-assistant-actions opacity-0 d-flex justify-content-center ">
            <button
              type="button"
              className="btn btn-link text-secondary p-0 ms-2"
              onClick={(e) => {
                e.stopPropagation();
                openManagementModalHandler(aiAssistant);
              }}
            >
              <span className="material-symbols-outlined fs-5">edit</span>
            </button>
            <button
              type="button"
              className="btn btn-link text-secondary p-0"
              onClick={(e) => {
                e.stopPropagation();
                deleteAiAssistantHandler();
              }}
            >
              <span className="material-symbols-outlined fs-5">delete</span>
            </button>
          </div>
        )}
      </li>

      { isThreadsOpened && (
        <ThreadItems
          aiAssistantData={aiAssistant}
          onThreadClick={onItemClick}
        />
      ) }
    </>
  );
};


/*
*  AiAssistantTree
*/
type AiAssistantTreeProps = {
  aiAssistants: AiAssistantHasId[];
  onDeleted?: () => void;
};

export const AiAssistantTree: React.FC<AiAssistantTreeProps> = ({ aiAssistants, onDeleted }) => {
  const { data: currentUser } = useCurrentUser();
  const { open: openAiAssistantChatSidebar } = useAiAssistantChatSidebar();
  const { open: openAiAssistantManagementModal } = useAiAssistantManagementModal();

  return (
    <ul className={`list-group ${moduleClass}`}>
      {aiAssistants.map(assistant => (
        <AiAssistantItem
          key={assistant._id}
          currentUserId={currentUser?._id}
          aiAssistant={assistant}
          onEditClick={openAiAssistantManagementModal}
          onItemClick={openAiAssistantChatSidebar}
          onDeleted={onDeleted}
        />
      ))}
    </ul>
  );
};
