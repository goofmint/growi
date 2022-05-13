import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiv3Put } from '~/client/util/apiv3-client';
import { PageGrant } from '~/interfaces/page';
import { IRecordApplicableGrant } from '~/interfaces/page-grant';
import { useCurrentPageId, useHasParent } from '~/stores/context';
import { useSWRxApplicableGrant, useSWRxIsGrantNormalized } from '~/stores/page';

type ModalProps = {
  isOpen: boolean
  pageId: string
  dataApplicableGrant: IRecordApplicableGrant
  close(): void
}

const FixPageGrantModal = (props: ModalProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    isOpen, pageId, dataApplicableGrant, close,
  } = props;

  const [selectedGrant, setSelectedGrant] = useState<PageGrant>(PageGrant.GRANT_OWNER);
  const [selectedGroup, setSelectedGroup] = useState<{_id: string, name: string} | undefined>(undefined); // TODO: Typescriptize model

  // Alert message state
  const [shouldShowModalAlert, setShowModalAlert] = useState<boolean>(false);

  const applicableGroups = dataApplicableGrant[PageGrant.GRANT_USER_GROUP]?.applicableGroups;

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedGrant(PageGrant.GRANT_OWNER);
      setSelectedGroup(undefined);
      setShowModalAlert(false);
    }
  }, [isOpen]);

  const submit = async() => {
    // Validate input values
    if (selectedGrant === PageGrant.GRANT_USER_GROUP && selectedGroup == null) {
      setShowModalAlert(true);
      return;
    }

    close();

    try {
      await apiv3Put(`/page/${pageId}/grant`, {
        grant: selectedGrant,
        grantedGroup: selectedGroup?._id,
      });

      toastSuccess(t('Successfully updated'));
    }
    catch (err) {
      toastError(t('Failed to update'));
    }
  };

  const renderModalBodyAndFooter = () => {
    const isGrantAvailable = Object.keys(dataApplicableGrant || {}).length > 0;

    if (!isGrantAvailable) {
      return (
        <p className="m-5">
          { t('fix_page_grant.modal.no_grant_available') }
        </p>
      );
    }

    return (
      <>
        <ModalBody>
          <div className="form-group">
            {/* eslint-disable-next-line react/no-danger */}
            <p className="mb-2" dangerouslySetInnerHTML={{ __html: t('fix_page_grant.modal.need_to_fix_grant') }} />
            <div className="ml-2">
              <div className="custom-control custom-radio mb-3">
                <input
                  className="custom-control-input"
                  name="grantRestricted"
                  id="grantRestricted"
                  type="radio"
                  checked={selectedGrant === PageGrant.GRANT_RESTRICTED}
                  onChange={() => setSelectedGrant(PageGrant.GRANT_RESTRICTED)}
                />
                <label className="custom-control-label" htmlFor="grantRestricted">
                  { t('fix_page_grant.modal.radio_btn.restrected') }
                </label>
              </div>
              <div className="custom-control custom-radio mb-3">
                <input
                  className="custom-control-input"
                  name="grantUser"
                  id="grantUser"
                  type="radio"
                  checked={selectedGrant === PageGrant.GRANT_OWNER}
                  onChange={() => setSelectedGrant(PageGrant.GRANT_OWNER)}
                />
                <label className="custom-control-label" htmlFor="grantUser">
                  { t('fix_page_grant.modal.radio_btn.only_me') }
                </label>
              </div>
              <div className="custom-control custom-radio d-flex mb-3">
                <input
                  className="custom-control-input"
                  name="grantUserGroup"
                  id="grantUserGroup"
                  type="radio"
                  checked={selectedGrant === PageGrant.GRANT_USER_GROUP}
                  onChange={() => setSelectedGrant(PageGrant.GRANT_USER_GROUP)}
                />
                <label className="custom-control-label" htmlFor="grantUserGroup">
                  { t('fix_page_grant.modal.radio_btn.grant_group') }
                </label>
                <div className="dropdown ml-2">
                  <button
                    type="button"
                    className="btn btn-secondary dropdown-toggle text-right w-100 border-0 shadow-none"
                    data-toggle="dropdown"
                    disabled={selectedGrant !== PageGrant.GRANT_USER_GROUP} // disable when its radio input is not selected
                  >
                    <span className="float-left ml-2">
                      {
                        selectedGroup == null
                          ? t('fix_page_grant.modal.select_group_default_text')
                          : selectedGroup.name
                      }
                    </span>
                  </button>
                  <div className="dropdown-menu">
                    {
                      applicableGroups != null && applicableGroups.map(g => (
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={() => setSelectedGroup(g)}
                        >
                          {g.name}
                        </button>
                      ))
                    }
                  </div>
                </div>
              </div>
              {
                shouldShowModalAlert && (
                  <p className="alert alert-warning">
                    {t('fix_page_grant.modal.alert_message')}
                  </p>
                )
              }
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className="btn btn-primary" onClick={submit}>
            { t('fix_page_grant.modal.btn_label') }
          </button>
        </ModalFooter>
      </>
    );
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={close} className="grw-create-page">
      <ModalHeader tag="h4" toggle={close} className="bg-primary text-light">
        { t('fix_page_grant.modal.title') }
      </ModalHeader>
      {renderModalBodyAndFooter()}
    </Modal>
  );
};

const FixPageGrantAlert = (): JSX.Element => {
  const { t } = useTranslation();

  const [isOpen, setOpen] = useState<boolean>(false);

  const { data: pageId } = useCurrentPageId();
  const { data: hasParent } = useHasParent();
  const { data: dataIsGrantNormalized } = useSWRxIsGrantNormalized(pageId);
  const { data: dataApplicableGrant } = useSWRxApplicableGrant(pageId);

  // Dependencies
  if (!hasParent) {
    return <></>;
  }
  if (dataIsGrantNormalized?.isGrantNormalized == null || dataIsGrantNormalized.isGrantNormalized) {
    return <></>;
  }

  return (
    <>
      <div className="alert alert-warning py-3 pl-4 d-flex flex-column flex-lg-row">
        <div className="flex-grow-1 d-flex align-items-center">
          <i className="icon-fw icon-exclamation ml-1" aria-hidden="true" />
          {t('fix_page_grant.alert.description')}
        </div>
        <div className="d-flex align-items-end align-items-lg-center">
          <button type="button" className="btn btn-info btn-sm rounded-pill px-3" onClick={() => setOpen(true)}>
            {t('fix_page_grant.alert.btn_label')}
          </button>
        </div>
      </div>

      {
        pageId != null && dataApplicableGrant != null && (
          <FixPageGrantModal
            isOpen={isOpen}
            pageId={pageId}
            dataApplicableGrant={dataApplicableGrant}
            close={() => setOpen(false)}
          />
        )
      }
    </>
  );
};

export default FixPageGrantAlert;
