import React, {
  useCallback, useState, FC, useEffect,
} from 'react';
import nodePath from 'path';

import { ItemNode } from './ItemNode';
import { useSWRxPageChildren } from '../../../stores/page-listing';


interface ItemProps {
  itemNode: ItemNode
  isOpen?: boolean
}

const Item: FC<ItemProps> = (props: ItemProps) => {
  const { itemNode, isOpen: _isOpen = false } = props;

  const { page, children } = itemNode;

  const [currentChildren, setCurrentChildren] = useState(children);

  const [isOpen, setIsOpen] = useState(_isOpen);

  const { data, error } = useSWRxPageChildren(isOpen ? page._id : null);

  const hasChildren = useCallback((): boolean => {
    return currentChildren != null && currentChildren.length > 0;
  }, [currentChildren]);

  const onClickLoadChildren = useCallback(async() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // make sure itemNode.children and currentChildren are synced
  useEffect(() => {
    if (children.length > currentChildren.length) {
      setCurrentChildren(children);
    }
    /*
     * When swr fetch succeeded
     */
    if (isOpen && error == null && data != null) {
      const newChildren = data.children;
      setCurrentChildren(ItemNode.generateNodesFromPages(newChildren));
    }
  }, [data]);

  // TODO: improve style
  const opacityStyle = { opacity: 1.0 };
  if (page.isTarget) opacityStyle.opacity = 0.7;
  else if (isOpen) opacityStyle.opacity = 0.5;

  return (
    <div style={{ margin: '10px' }}>
      <div style={opacityStyle}>
        <button type="button" className="d-inline-block btn btn-light p-1 mr-1" onClick={onClickLoadChildren}>Load</button>
        <a href={page._id} className="d-inline-block">
          <p>{nodePath.basename(page.path as string) || '/'}</p>
        </a>
      </div>
      {
        isOpen && hasChildren() && currentChildren.map(node => (
          <Item
            key={node.page._id}
            itemNode={node}
            isOpen={false}
          />
        ))
      }
    </div>
  );

};

export default Item;
