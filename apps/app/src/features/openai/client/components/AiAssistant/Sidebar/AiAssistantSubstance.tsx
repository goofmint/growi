import React from 'react';

import { useAiAssistantManagementModal, useSWRxAiAssistants } from '../../../stores/ai-assistant';

import { AiAssistantTree } from './AiAssistantTree';

import styles from './AiAssistantSubstance.module.scss';

const moduleClass = styles['grw-ai-assistant-substance'] ?? '';

export const AiAssistantContent = (): JSX.Element => {
  const { open } = useAiAssistantManagementModal();
  const { data: aiAssistants, mutate: mutateAiAssistants } = useSWRxAiAssistants();

  return (
    <div className={moduleClass}>
      <button
        type="button"
        className="btn btn-outline-secondary px-3 d-flex align-items-center mb-4"
        onClick={open}
      >
        <span className="material-symbols-outlined fs-5 me-2">add</span>
        <span className="fw-normal">アシスタントを追加する</span>
      </button>

      <div className="d-flex flex-column gap-4">
        <div>
          <h3 className="fw-bold grw-ai-assistant-substance-header">
            マイアシスタント
          </h3>
          {aiAssistants?.myAiAssistants != null && aiAssistants.myAiAssistants.length !== 0 && (
            <AiAssistantTree
              onDeleted={mutateAiAssistants}
              aiAssistants={aiAssistants.myAiAssistants}
            />
          )}
        </div>

        <div>
          <h3 className="fw-bold grw-ai-assistant-substance-header">
            チームアシスタント
          </h3>
          {aiAssistants?.teamAiAssistants != null && aiAssistants.teamAiAssistants.length !== 0 && (
            <AiAssistantTree aiAssistants={aiAssistants.teamAiAssistants} />
          )}
        </div>
      </div>
    </div>
  );
};
