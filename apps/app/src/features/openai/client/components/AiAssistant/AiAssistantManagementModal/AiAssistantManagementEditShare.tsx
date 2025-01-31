import React, { useCallback, useState } from 'react';

import {
  ModalBody, Input, Label,
} from 'reactstrap';

import type { AiAssistantScopeType } from '~/features/openai/interfaces/ai-assistant';
import { AiAssistantAccessScope, AiAssistantShareScope } from '~/features/openai/interfaces/ai-assistant';
import type { PopulatedGrantedGroup } from '~/interfaces/page-grant';

import { AccessScopeDropdown } from './AccessScopeDropdown';
import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';
import { SelectUserGroupModal } from './SelectUserGroupModal';
import { ShareScopeSwitch } from './ShareScopeSwitch';


type Props = {
  selectedUserGroups: PopulatedGrantedGroup[],
  selectedShareScope: AiAssistantShareScope,
  selectedAccessScope: AiAssistantAccessScope,
  onSelectUserGroup: (userGroup: PopulatedGrantedGroup) => void,
  onSelectScope: (scope: AiAssistantAccessScope | AiAssistantShareScope, scopeType?: AiAssistantScopeType) => void,
}

export const AiAssistantManagementEditShare = (props: Props): JSX.Element => {
  const {
    selectedAccessScope,
    selectedShareScope,
    selectedUserGroups,
    onSelectScope,
    onSelectUserGroup,
  } = props;

  const [isShared, setIsShared] = useState(false);
  const [isUserGroupSelectorOpen, setIsUserGroupSelectorOpen] = useState(false);

  const changeShareToggleHandler = useCallback(() => {
    setIsShared((prev) => {
      if (prev) { // if isShared === true
        onSelectScope(AiAssistantShareScope.OWNER);
      }
      return !prev;
    });
  }, [onSelectScope]);

  const selectScopeHandler = useCallback((scope: AiAssistantAccessScope | AiAssistantShareScope, scopeType: AiAssistantScopeType) => {
    onSelectScope(scope, scopeType);
    if ((scope as AiAssistantAccessScope) === AiAssistantAccessScope.GROUPS || (scope as AiAssistantShareScope) === AiAssistantShareScope.GROUPS) {
      setIsUserGroupSelectorOpen(true);
    }
  }, [onSelectScope]);

  return (
    <>
      <AiAssistantManagementHeader />

      <ModalBody className="px-4">
        <div className="form-check form-switch mb-4">
          <Input
            type="switch"
            role="switch"
            id="shareAssistantSwitch"
            className="form-check-input"
            checked={isShared}
            onChange={changeShareToggleHandler}
          />
          <Label className="form-check-label" for="shareAssistantSwitch">
            アシスタントを共有する
          </Label>
        </div>

        <AccessScopeDropdown
          isDisabled={!isShared}
          selectedAccessScope={selectedAccessScope}
          onSelect={selectScopeHandler}
        />

        <ShareScopeSwitch
          isDisabled={!isShared}
          selectedShareScope={selectedShareScope}
          onSelect={selectScopeHandler}
        />

        <SelectUserGroupModal
          isOpen={isUserGroupSelectorOpen}
          closeModal={() => setIsUserGroupSelectorOpen(false)}
          selectedUserGroup={selectedUserGroups}
          onSelect={onSelectUserGroup}
        />
      </ModalBody>
    </>
  );
};
