import {
  type ReactNode,
  memo, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import { debounce } from 'throttle-debounce';

import type { IGraphViewerGlobal } from '..';
import { generateMxgraphData } from '../utils/embed';
import { isGraphViewerGlobal } from '../utils/global';


import styles from './DrawioViewer.module.scss';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var GraphViewer: IGraphViewerGlobal;
}


export type DrawioViewerProps = {
  diagramIndex: number,
  bol: number,
  eol: number,
  children?: ReactNode,
  onRenderingStart?: () => void,
  onRenderingUpdated?: (mxfile: string | null) => void,
}

export type DrawioEditByViewerProps = {
  bol: number,
  eol: number,
  drawioMxFile: string,
}

export const DrawioViewer = memo((props: DrawioViewerProps): JSX.Element => {
  const {
    diagramIndex, bol, eol, children,
    onRenderingStart, onRenderingUpdated,
  } = props;

  const drawioContainerRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<Error>();
  const [elementWidth, setElementWidth] = useState(0);

  const renderDrawio = useCallback(() => {
    if (drawioContainerRef.current == null) {
      return;
    }

    if (!('GraphViewer' in window && isGraphViewerGlobal(GraphViewer))) {
      // Do nothing if loading has not been terminated.
      // Alternatively, GraphViewer.processElements() will be called in Script.onLoad.
      // see DrawioViewerScript.tsx
      return;
    }

    const mxgraphs = drawioContainerRef.current.getElementsByClassName('mxgraph') as HTMLCollectionOf<HTMLElement>;
    if (mxgraphs.length > 0) {
      // This component should have only one '.mxgraph' element
      const div = mxgraphs[0];

      if (div != null) {
        div.innerHTML = '';
        div.style.width = '';
        div.style.height = '';

        // render diagram with createViewerForElement
        try {
          GraphViewer.useResizeSensor = false;
          GraphViewer.prototype.checkVisibleState = false;
          GraphViewer.prototype.lightboxZIndex = 1200;
          GraphViewer.prototype.toolbarZIndex = 1200;
          GraphViewer.createViewerForElement(div);
        }
        catch (err) {
          setError(err);
        }
      }
    }

    const observer = new ResizeObserver((entries) => {
      entries.forEach((el) => {
        setElementWidth(el.contentRect.width);
      });
    });
    observer.observe(drawioContainerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  const renderDrawioWithDebounce = useMemo(() => debounce(200, renderDrawio), [renderDrawio]);

  const mxgraphHtml = useMemo(() => {
    setError(undefined);

    if (children == null) {
      return '';
    }

    const code = children instanceof Array
      ? children
        .filter(elem => (typeof elem === 'string')) // omit non-string elements (e.g. br element generated by line-breaks option)
        .join('')
      : children.toString();

    let mxgraphData;
    try {
      mxgraphData = generateMxgraphData(code);
    }
    catch (err) {
      setError(err);
    }

    return `<div class="mxgraph" data-mxgraph="${mxgraphData}"></div>`;
  }, [children]);

  useEffect(() => {
    if (mxgraphHtml.length > 0) {
      onRenderingStart?.();
      renderDrawioWithDebounce();
    }
  }, [mxgraphHtml, onRenderingStart, renderDrawioWithDebounce, elementWidth]);

  useEffect(() => {
    if (error != null) {
      onRenderingUpdated?.(null);
    }
  }, [error, onRenderingUpdated]);

  // ****************  detect data-mxgraph has rendered ****************
  useEffect(() => {
    const container = drawioContainerRef.current;
    if (container == null) return;

    const observerCallback = (mutationRecords:MutationRecord[]) => {
      mutationRecords.forEach((record:MutationRecord) => {
        const target = record.target as HTMLElement;

        const mxgraphData = target.dataset.mxgraph;
        if (mxgraphData != null) {
          const mxgraph = JSON.parse(mxgraphData);
          onRenderingUpdated?.(mxgraph.xml);
        }
      });
    };

    const observer = new MutationObserver(observerCallback);
    observer.observe(container, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
    };
  }, [onRenderingUpdated]);
  // *******************************  end  *******************************

  return (
    <div
      key={`drawio-viewer-${diagramIndex}`}
      ref={drawioContainerRef}
      className={`drawio-viewer ${styles['drawio-viewer']} p-2`}
      data-begin-line-number-of-markdown={bol}
      data-end-line-number-of-markdown={eol}
    >
      {/* show error */}
      { error != null && (
        <span className="text-muted"><i className="icon-fw icon-exclamation"></i>
          {error.name && <strong>{error.name}: </strong>}
          {error.message}
        </span>
      ) }

      { error == null && (
        // eslint-disable-next-line react/no-danger
        <div dangerouslySetInnerHTML={{ __html: mxgraphHtml }} />
      ) }
    </div>
  );
});
DrawioViewer.displayName = 'DrawioViewer';
