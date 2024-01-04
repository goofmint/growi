let defaultTop = 0;
const padding = 5;

const setDefaultTop = (top: number): void => {
  defaultTop = top;
};
const getDefaultTop = (): number => {
  return defaultTop + padding;
};


const getDataLine = (element: Element | null): number => {
  return element ? +(element.getAttribute('data-line') ?? '0') - 1 : 0;
};

const getEditorElements = (editorRootElement: HTMLElement): Array<Element> => {
  return Array.from(editorRootElement.getElementsByClassName('cm-line'))
    .filter((element) => { return !Number.isNaN(element.getAttribute('data-line')) });
};

const getPreviewElements = (previewRootElement: HTMLElement): Array<Element> => {
  return Array.from(previewRootElement.getElementsByClassName('has-data-line'))
    .filter((element) => { return !Number.isNaN(element.getAttribute('data-line')) });
};


const elementBinarySearch = (list: Array<Element>, fn: (index: number) => boolean): number => {
  let ok = 0;
  let ng = list.length;
  while (ok + 1 < ng) {
    const mid = Math.floor((ok + ng) / 2);
    if (fn(mid)) {
      ok = mid;
    }
    else {
      ng = mid;
    }
  }
  return ok;
};

const findTopElementIndex = (elements: Array<Element>): number => {

  const find = (index: number): boolean => {
    return elements[index].getBoundingClientRect().top < getDefaultTop();
  };

  return elementBinarySearch(elements, find);
};

const findElementIndexFromDataLine = (previewElements: Array<Element>, dataline: number): number => {

  const find = (index: number): boolean => {
    return getDataLine(previewElements[index]) <= dataline;
  };

  return elementBinarySearch(previewElements, find);
};


type SourceElement = {
  start: DOMRect,
  top: DOMRect,
  next: DOMRect | undefined,
}

type TargetElement = {
  start: DOMRect,
  next: DOMRect | undefined,
}

const calcScrollElementToTop = (element: Element): number => {
  return element.getBoundingClientRect().top - getDefaultTop();
};

const calcScorllElementByRatio = (sourceElement: SourceElement, targetElement: TargetElement): number => {
  if (sourceElement.start === sourceElement.next || sourceElement.next == null || targetElement.next == null) {
    return 0;
  }
  const sourceAllHeight = sourceElement.next.top - sourceElement.start.top;
  const sourceOutHeight = sourceElement.top.top - sourceElement.start.top;
  const sourceTopHeight = getDefaultTop() - sourceElement.top.top;
  const sourceRaito = (sourceOutHeight + sourceTopHeight) / sourceAllHeight;

  const targetAllHeight = targetElement.next.top - targetElement.start.top;

  return targetAllHeight * sourceRaito;
};


export const scrollEditor = (editorRootElement: HTMLElement, previewRootElement: HTMLElement): void => {

  setDefaultTop(editorRootElement.getBoundingClientRect().top);

  const editorElements = getEditorElements(editorRootElement);
  const previewElements = getPreviewElements(previewRootElement);

  const topEditorElementIndex = findTopElementIndex(editorElements);
  const topPreviewElementIndex = findElementIndexFromDataLine(previewElements, getDataLine(editorElements[topEditorElementIndex]));

  const startEditorElementIndex = findElementIndexFromDataLine(editorElements, getDataLine(previewElements[topPreviewElementIndex]));
  const nextEditorElementIndex = findElementIndexFromDataLine(editorElements, getDataLine(previewElements[topPreviewElementIndex + 1]));

  let newScrollTop = previewRootElement.scrollTop;

  newScrollTop += calcScrollElementToTop(previewElements[topPreviewElementIndex]);
  newScrollTop += calcScorllElementByRatio(
    {
      start: editorElements[startEditorElementIndex].getBoundingClientRect(),
      top: editorElements[topEditorElementIndex].getBoundingClientRect(),
      next: editorElements[nextEditorElementIndex]?.getBoundingClientRect(),
    },
    {
      start: previewElements[topPreviewElementIndex].getBoundingClientRect(),
      next: previewElements[topPreviewElementIndex + 1]?.getBoundingClientRect(),
    },
  );

  previewRootElement.scrollTop = newScrollTop;

};

export const scrollPreview = (editorRootElement: HTMLElement, previewRootElement: HTMLElement): void => {

  setDefaultTop(previewRootElement.getBoundingClientRect().y);

  const previewElements = getPreviewElements(previewRootElement);
  const editorElements = getEditorElements(editorRootElement);

  const topPreviewElementIndex = findTopElementIndex(previewElements);

  const startEditorElementIndex = findElementIndexFromDataLine(editorElements, getDataLine(previewElements[topPreviewElementIndex]));
  const nextEditorElementIndex = findElementIndexFromDataLine(editorElements, getDataLine(previewElements[topPreviewElementIndex + 1]));

  let newScrollTop = editorRootElement.scrollTop;

  newScrollTop += calcScrollElementToTop(editorElements[startEditorElementIndex]);
  newScrollTop += calcScorllElementByRatio(
    {
      start: previewElements[topPreviewElementIndex].getBoundingClientRect(),
      top: previewElements[topPreviewElementIndex].getBoundingClientRect(),
      next: previewElements[topPreviewElementIndex + 1]?.getBoundingClientRect(),
    },
    {
      start: editorElements[startEditorElementIndex].getBoundingClientRect(),
      next: editorElements[nextEditorElementIndex]?.getBoundingClientRect(),
    },
  );

  editorRootElement.scrollTop = newScrollTop;

};
