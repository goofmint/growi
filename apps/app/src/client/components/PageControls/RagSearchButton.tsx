import React, { useCallback } from 'react';

import { useIsAiEnabled, useIsGuestUser } from '~/stores-universal/context';
import { useRagSearchModal } from '~/stores/rag-search';

import styles from './RagSearchButton.module.scss';

const RagSearchButton = (): JSX.Element => {
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isAiEnabled } = useIsAiEnabled();
  const { open: openRagSearchModal } = useRagSearchModal();

  const ragSearchButtonClickHandler = useCallback(() => {
    openRagSearchModal();
  }, [openRagSearchModal]);

  if (!isAiEnabled || isGuestUser) {
    return <></>;
  }

  return (
    <button
      type="button"
      className={`btn btn-search ${styles['btn-rag-search']}`}
      onClick={ragSearchButtonClickHandler}
      data-testid="open-search-modal-button"
    >
      <span className="material-symbols-outlined">chat</span>
    </button>
  );
};

export default RagSearchButton;
