import React, { memo } from 'react';

import dynamic from 'next/dynamic';

import { useSWRxCurrentPage } from '~/stores/page';

import { Skelton } from './Skelton';

import styles from './PageContentFooter.module.scss';

export const PageContentFooter = memo((): JSX.Element => {

  // TODO: update Skelton props
  const AuthorInfo = dynamic(() => import('./Navbar/AuthorInfo'),
    { ssr: false, loading: () => <Skelton width={300} height={20} additionalClass={'mb-3'} /> });

  const { data: page } = useSWRxCurrentPage();

  // TODO: update Skelton props
  if (page == null) {
    return <Skelton width={300} height={20} additionalClass={'mb-3'} />;
  }

  return (
    // TODO: page-content-footer, scss module import and global import.
    <div className={`${styles['page-content-footer']} page-content-footer py-4 d-edit-none d-print-none}`}>
      <div className="grw-container-convertible">
        <div className="page-meta">
          <AuthorInfo user={page.creator} date={page.createdAt} mode="create" locate="footer" />
          <AuthorInfo user={page.revision.author} date={page.updatedAt} mode="update" locate="footer" />
        </div>
      </div>
    </div>
  );
});

PageContentFooter.displayName = 'PageContentFooter';
