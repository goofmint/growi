import {
  useState, useCallback, useEffect,
} from 'react';

import { LoadingSpinner } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';

import { apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useSWRxAppSettings } from '~/stores/admin/app-settings';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const PageBulkExportSettings = (): JSX.Element => {
  const { t } = useTranslation(['admin', 'commons']);

  const { data, error, mutate } = useSWRxAppSettings();

  const [isBulkExportPagesEnabled, setIsBulkExportPagesEnabled] = useState(data?.isBulkExportPagesEnabled);
  const [bulkExportDownloadExpirationSeconds, setBulkExportDownloadExpirationSeconds] = useState(data?.bulkExportDownloadExpirationSeconds);

  const changeBulkExportDownloadExpirationSeconds = (bulkExportDownloadExpirationDays: number) => {
    const bulkExportDownloadExpirationSeconds = bulkExportDownloadExpirationDays * 24 * 60 * 60;
    setBulkExportDownloadExpirationSeconds(bulkExportDownloadExpirationSeconds);
  };

  const onSubmitHandler = useCallback(async() => {
    try {
      await apiv3Put('/app-settings/page-bulk-export-settings', {
        isBulkExportPagesEnabled,
        bulkExportDownloadExpirationSeconds,
      });
      toastSuccess(t('commons:toaster.update_successed', { target: t('app_setting.questionnaire_settings') }));
    }
    catch (err) {
      toastError(err);
    }
    mutate();
  }, [isBulkExportPagesEnabled, bulkExportDownloadExpirationSeconds, mutate, t]);

  useEffect(() => {
    setIsBulkExportPagesEnabled(data?.isBulkExportPagesEnabled);
    setBulkExportDownloadExpirationSeconds(data?.bulkExportDownloadExpirationSeconds);
  }, [data, data?.isBulkExportPagesEnabled, data?.bulkExportDownloadExpirationSeconds]);

  const isLoading = data === undefined && error === undefined;

  return (
    <>
      {isLoading && (
        <div className="text-muted text-center mb-5">
          <LoadingSpinner className="me-1 fs-3" />
        </div>
      )}

      {!isLoading && (
        <>
          <p className="card custom-card bg-warning-subtle my-3">
            {t('admin:app_setting.page_bulk_export_explanation')} <br />
            <span className="text-danger mt-1">
              {t('admin:app_setting.page_bulk_export_warning')}
            </span>
          </p>

          <div className="my-4 row">
            <label
              className="text-start text-md-end col-md-3 col-form-label"
            >
            </label>

            <div className="col-md-6">
              <div className="form-check form-switch form-check-info">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="cbIsPageBulkExportEnabled"
                  checked={isBulkExportPagesEnabled}
                  disabled={data?.isFixedIsBulkExportPagesEnabled}
                  onChange={e => setIsBulkExportPagesEnabled(e.target.checked)}
                />
                <label className="form-label form-check-label" htmlFor="cbIsPageBulkExportEnabled">
                  {t('app_setting.enable_page_bulk_export')}
                </label>

                <p className="form-text text-muted">
                  {t('app_setting.page_bulk_export_execute_explanation')}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="container">
              <div className="row">
                <label
                  className="text-start text-md-end col-md-3 col-form-label"
                >
                  {t('app_setting.page_bulk_export_expire_time')}
                </label>

                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={(bulkExportDownloadExpirationSeconds ?? 0) / (24 * 60 * 60)}
                    onChange={(e) => { changeBulkExportDownloadExpirationSeconds(Number(e.target.value)) }}
                  >
                    {Array.from({ length: 7 }, (_, i) => i + 1).map(number => (
                      <option key={`be-download-expiration-option-${number}`} value={number}>
                        {number}{t('admin:days')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {data?.isFixedIsBulkExportPagesEnabled && (
              <p className="alert alert-warning mt-2 text-start">
                <span className="material-symbols-outlined">help</span>
                <b>FIXED</b><br />
                {/* eslint-disable-next-line react/no-danger */}
                <b dangerouslySetInnerHTML={{
                  __html: t('admin:app_setting.fixed_by_env_var', {
                    envKey: 'BULK_EXPORT_PAGES_ENABLED',
                    envVar: isBulkExportPagesEnabled,
                  }),
                }}
                />
              </p>
            )}
          </div>

          <AdminUpdateButtonRow onClick={onSubmitHandler} />
        </>
      )}
    </>
  );
};

export default PageBulkExportSettings;
