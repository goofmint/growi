import React, { FC } from 'react';

import toastr from 'toastr';
import { useTranslation } from 'react-i18next';

import { IPageHasId } from '~/interfaces/page';

type PageItemControlProps = {
  page: Partial<IPageHasId>,
  onClickDeleteButton?: (pageId: string)=>void,
}

const PageItemControl: FC<PageItemControlProps> = (props: PageItemControlProps) => {

  const { page, onClickDeleteButton } = props;
  const { t } = useTranslation('');

  const deleteButtonHandler = () => {
    if (onClickDeleteButton != null && page._id != null) {
      onClickDeleteButton(page._id);
    }
  };
  return (
    <>
      <button
        type="button"
        className="btn-link nav-link dropdown-toggle dropdown-toggle-no-caret border-0 rounded grw-btn-page-management py-0"
        data-toggle="dropdown"
      >
        <i className="fa fa-ellipsis-v text-muted"></i>
      </button>
      <div className="dropdown-menu dropdown-menu-right">

        {/* TODO: if there is the following button in XD add it here
        <button
          type="button"
          className="btn btn-link p-0"
          value={page.path}
          onClick={(e) => {
            window.location.href = e.currentTarget.value;
          }}
        >
          <i className="icon-login" />
        </button>
        */}

        {/*
          TODO: add function to the following buttons like using modal or others
          ref: https://estoc.weseek.co.jp/redmine/issues/79026
        */}
        <button className="dropdown-item text-danger" type="button" onClick={deleteButtonHandler}>
          <i className="icon-fw icon-fire"></i>{t('Delete')}
        </button>
        <button className="dropdown-item" type="button" onClick={() => toastr.warning(t('search_result.currently_not_implemented'))}>
          <i className="icon-fw icon-star"></i>{t('Add to bookmark')}
        </button>
        <button className="dropdown-item" type="button" onClick={() => toastr.warning(t('search_result.currently_not_implemented'))}>
          <i className="icon-fw icon-docs"></i>{t('Duplicate')}
        </button>
        <button className="dropdown-item" type="button" onClick={() => toastr.warning(t('search_result.currently_not_implemented'))}>
          <i className="icon-fw  icon-action-redo"></i>{t('Move/Rename')}
        </button>
      </div>
    </>
  );

};

export default PageItemControl;
