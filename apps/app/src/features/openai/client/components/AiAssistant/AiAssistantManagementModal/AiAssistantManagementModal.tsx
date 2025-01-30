import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Modal } from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/toastr';
import type { IPageForItem } from '~/interfaces/page';
import { usePageSelectModal } from '~/stores/modal';
import loggerFactory from '~/utils/logger';

import type { SelectedPage } from '../../../../interfaces/selected-page';
import { createAiAssistant } from '../../../services/ai-assistant';
import { useAiAssistantManagementModal, AiAssistantManagementModalPageMode } from '../../../stores/ai-assistant';
import { SelectedPageList } from '../../Common/SelectedPageList';

import { AiAssistantManagementEditInstruction } from './AiAssistantManagementEditInstruction';
import { AiAssistantManagementHome } from './AiAssistantManagementHome';

import styles from './AiAssistantManagementModal.module.scss';

const moduleClass = styles['grw-ai-assistant-management'] ?? '';

const logger = loggerFactory('growi:openai:client:components:AiAssistantManagementModal');

const AiAssistantManagementModalSubstance = (): JSX.Element => {
  // Hooks
  const { t } = useTranslation();
  const { open: openPageSelectModal } = usePageSelectModal();
  const { data: aiAssistantManagementModalData } = useAiAssistantManagementModal();

  const pageMode = aiAssistantManagementModalData?.pageMode ?? AiAssistantManagementModalPageMode.HOME;

  // States
  const [selectedPages, setSelectedPages] = useState<SelectedPage[]>([]);
  const [instruction, setInstruction] = useState<string>(t('modal_ai_assistant.default_instruction'));

  // Functions
  const clickOpenPageSelectModalHandler = useCallback(() => {
    const onSelected = (page: IPageForItem, isIncludeSubPage: boolean) => {
      const selectedPageIds = selectedPages.map(selectedPage => selectedPage.page._id);
      if (page._id != null && !selectedPageIds.includes(page._id)) {
        setSelectedPages([...selectedPages, { page, isIncludeSubPage }]);
      }
    };

    openPageSelectModal({ onSelected, isHierarchicalSelectionMode: true });
  }, [openPageSelectModal, selectedPages]);

  const clickRmoveSelectedPageHandler = useCallback((pageId: string) => {
    setSelectedPages(selectedPages.filter(selectedPage => selectedPage.page._id !== pageId));
  }, [selectedPages]);

  const clickCreateAiAssistantHandler = useCallback(async() => {
    try {
      const pagePathPatterns = selectedPages
        .map(selectedPage => (selectedPage.isIncludeSubPage ? `${selectedPage.page.path}/*` : selectedPage.page.path))
        .filter((path): path is string => path !== undefined && path !== null);

      await createAiAssistant({
        name: 'test',
        description: 'test',
        additionalInstruction: instruction,
        pagePathPatterns,
        shareScope: 'publicOnly',
        accessScope: 'publicOnly',
      });
      toastSuccess('アシスタントを作成しました');
    }
    catch (err) {
      toastError('アシスタントの作成に失敗しました');
      logger.error(err);
    }
  }, [instruction, selectedPages]);


  /*
  *  For AiAssistantManagementEditInstruction methods
  */
  const changeInstructionHandler = useCallback((value: string) => {
    setInstruction(value);
  }, []);

  const resetInstructionHandler = useCallback(() => {
    setInstruction(t('modal_ai_assistant.default_instruction'));
  }, [t]);

  return (
    <>
      {pageMode === AiAssistantManagementModalPageMode.HOME && (
        <AiAssistantManagementHome
          instruction={instruction}
        />
      )}

      {pageMode === AiAssistantManagementModalPageMode.INSTRUCTION && (
        <AiAssistantManagementEditInstruction
          instruction={instruction}
          onChange={changeInstructionHandler}
          onReset={resetInstructionHandler}
        />
      )}
    </>
    // <div className="px-4">
    //   <ModalBody>
    //     <Form>
    //       <FormGroup className="mb-4">
    //         <Label className="mb-2 ">アシスタント名</Label>
    //         <Input
    //           type="text"
    //           placeholder="アシスタント名を入力"
    //           className="border rounded"
    //         />
    //       </FormGroup>

  //       <FormGroup className="mb-4">
  //         <div className="d-flex align-items-center mb-2">
  //           <Label className="mb-0">アシスタントの種類</Label>
  //           <span className="ms-1 fs-5 material-symbols-outlined text-secondary">help</span>
  //         </div>
  //         <div className="d-flex gap-4">
  //           <FormGroup check>
  //             <Input type="checkbox" defaultChecked />
  //             <Label check>ナレッジアシスタント</Label>
  //           </FormGroup>
  //           <FormGroup check>
  //             <Input type="checkbox" />
  //             <Label check>エディタアシスタント</Label>
  //           </FormGroup>
  //           <FormGroup check>
  //             <Input type="checkbox" />
  //             <Label check>ラーニングアシスタント</Label>
  //           </FormGroup>
  //         </div>
  //       </FormGroup>

  //       <FormGroup className="mb-4">
  //         <div className="d-flex align-items-center mb-2">
  //           <Label className="mb-0">共有範囲</Label>
  //           <span className="ms-1 fs-5 material-symbols-outlined text-secondary">help</span>
  //         </div>
  //         <Input type="select" className="border rounded w-50">
  //           <option>自分のみ</option>
  //         </Input>
  //       </FormGroup>

  //       <FormGroup className="mb-4">
  //         <div className="d-flex align-items-center mb-2">
  //           <Label className="mb-0">参照するページ</Label>
  //           <span className="ms-1 fs-5 material-symbols-outlined text-secondary">help</span>
  //         </div>
  //         <SelectedPageList selectedPages={selectedPages} onRemove={clickRmoveSelectedPageHandler} />
  //         <button
  //           type="button"
  //           className="btn btn-outline-primary d-flex align-items-center gap-1"
  //           onClick={clickOpenPageSelectModalHandler}
  //         >
  //           <span>+</span>
  //           追加する
  //         </button>
  //       </FormGroup>

  //       <FormGroup>
  //         <div className="d-flex align-items-center mb-2">
  //           <Label className="mb-0 me-2">アシスタントへの指示</Label>
  //           <label className="form-label form-check-label">
  //             <span className="badge text-bg-danger mt-2">
  //               必須
  //             </span>
  //           </label>
  //         </div>
  //         <Input
  //           type="textarea"
  //           placeholder="アシスタントに実行して欲しい内容を具体的に記入してください"
  //           className="border rounded"
  //           rows={4}
  //         />
  //       </FormGroup>

  //       <FormGroup>
  //         <div className="d-flex align-items-center mb-2">
  //           <Label className="mb-0 me-2">アシスタントのメモ</Label>
  //           <label className="form-label form-check-label">
  //             <span className="badge text-bg-secondary mt-2">
  //               必須
  //             </span>
  //           </label>
  //         </div>
  //         <Input
  //           type="textarea"
  //           placeholder="内容や用途のメモを表示させることができます"
  //           className="border rounded"
  //           rows={4}
  //         />
  //         <p className="mt-1 text-muted">メモ内容はアシスタントには影響しません。</p>
  //       </FormGroup>
  //     </Form>
  //   </ModalBody>

  //   <ModalFooter className="border-0 pt-0 mb-3">
  //     <button type="button" className="btn btn-outline-secondary" onClick={() => {}}>キャンセル</button>
  //     <button type="button" className="btn btn-primary" onClick={clickCreateAiAssistantHandler}>作成</button>
  //   </ModalFooter>
  // </div>
  );
};


export const AiAssistantManagementModal = (): JSX.Element => {
  const { data: aiAssistantManagementModalData, close: closeAiAssistantManagementModal } = useAiAssistantManagementModal();

  const isOpened = aiAssistantManagementModalData?.isOpened ?? false;

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeAiAssistantManagementModal} className={moduleClass} scrollable>
      { isOpened && (
        <AiAssistantManagementModalSubstance />
      ) }
    </Modal>
  );
};
