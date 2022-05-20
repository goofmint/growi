import React, {
  memo, useCallback, useMemo, useState,
} from 'react';

import { useTranslation } from 'react-i18next';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import AppContainer from '~/client/services/AppContainer';
import EditorContainer from '~/client/services/EditorContainer';
import { useEditorSettings, useIsTextlintEnabled } from '~/stores/editor';

import { DEFAULT_THEME, KeyMapMode } from '../../interfaces/editor-settings';
import { withUnstatedContainers } from '../UnstatedUtils';

import { DownloadDictModal } from './DownloadDictModal';


const AVAILABLE_THEMES = [
  'eclipse', 'elegant', 'neo', 'mdn-like', 'material', 'dracula', 'monokai', 'twilight',
];

const TYPICAL_INDENT_SIZE = [2, 4];


const ThemeSelector = (): JSX.Element => {

  const { data: editorSettings, update } = useEditorSettings();

  const menuItems = useMemo(() => (
    <>
      { AVAILABLE_THEMES.map((theme) => {
        return <button key={theme} className="dropdown-item" type="button" onClick={() => update({ theme })}>{theme}</button>;
      }) }
    </>
  ), [update]);

  const selectedTheme = editorSettings?.theme ?? DEFAULT_THEME;

  return (
    <div className="input-group flex-nowrap">
      <div className="input-group-prepend">
        <span className="input-group-text" id="igt-theme">Theme</span>
      </div>
      <div className="input-group-append dropup">
        <button
          type="button"
          className="btn btn-outline-secondary dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-describedby="igt-theme"
        >
          {selectedTheme}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          {menuItems}
        </div>
      </div>
    </div>
  );
};


type KeyMapModeToLabel = {
  [key in KeyMapMode]: string;
}

const KEYMAP_LABEL_MAP: KeyMapModeToLabel = {
  default: 'Default',
  vim: 'Vim',
  emacs: 'Emacs',
  sublime: 'Sublime Text',
};

const KeymapSelector = memo((): JSX.Element => {

  const { data: editorSettings, update } = useEditorSettings();

  Object.keys(KEYMAP_LABEL_MAP);
  const menuItems = useMemo(() => (
    <>
      { (Object.keys(KEYMAP_LABEL_MAP) as KeyMapMode[]).map((keymapMode) => {
        const keymapLabel = KEYMAP_LABEL_MAP[keymapMode];
        const icon = (keymapMode !== 'default')
          ? <img src={`/images/icons/${keymapMode}.png`} width="16px" className="mr-2"></img>
          : null;
        return <button key={keymapMode} className="dropdown-item" type="button" onClick={() => update({ keymapMode })}>{icon}{keymapLabel}</button>;
      }) }
    </>
  ), [update]);

  const selectedKeymapMode = editorSettings?.keymapMode ?? 'default';

  return (
    <div className="input-group flex-nowrap">
      <div className="input-group-prepend">
        <span className="input-group-text" id="igt-keymap">Keymap</span>
      </div>
      <div className="input-group-append dropup">
        <button
          type="button"
          className="btn btn-outline-secondary dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-describedby="igt-keymap"
        >
          { editorSettings != null && selectedKeymapMode}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          {menuItems}
        </div>
      </div>
    </div>
  );

});


type IndentSizeSelectorProps = {
  isIndentSizeForced: boolean,
  selectedIndentSize: number,
  onChange: (indentSize: number) => void,
}

const IndentSizeSelector = memo(({ isIndentSizeForced, selectedIndentSize, onChange }: IndentSizeSelectorProps): JSX.Element => {
  const menuItems = useMemo(() => (
    <>
      { TYPICAL_INDENT_SIZE.map((indent) => {
        return <button key={indent} className="dropdown-item" type="button" onClick={() => onChange(indent)}>{indent}</button>;
      }) }
    </>
  ), [onChange]);

  return (
    <div className="input-group flex-nowrap">
      <div className="input-group-prepend">
        <span className="input-group-text" id="igt-indent">Indent</span>
      </div>
      <div className="input-group-append dropup">
        <button
          type="button"
          className="btn btn-outline-secondary dropdown-toggle"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          aria-describedby="igt-indent"
          disabled={isIndentSizeForced}
        >
          {selectedIndentSize}
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          {menuItems}
        </div>
      </div>
    </div>
  );

});


type ConfigurationDropdownProps = {
  isMathJaxEnabled: boolean,
  onConfirmEnableTextlint?: () => void,
}

const ConfigurationDropdown = memo(({ isMathJaxEnabled, onConfirmEnableTextlint }: ConfigurationDropdownProps): JSX.Element => {
  const { t } = useTranslation();

  const [isCddMenuOpened, setCddMenuOpened] = useState(false);

  const { data: editorSettings, update } = useEditorSettings();

  const { data: isTextlintEnabled, mutate: mutateTextlintEnabled } = useIsTextlintEnabled();

  const renderActiveLineMenuItem = useCallback(() => {
    if (editorSettings == null) {
      return <></>;
    }

    const isActive = editorSettings.styleActiveLine;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <DropdownItem toggle={false} onClick={() => update({ styleActiveLine: !isActive })}>
        <div className="d-flex justify-content-between">
          <span className="icon-container"></span>
          <span className="menuitem-label">{ t('page_edit.Show active line') }</span>
          <span className="icon-container"><i className={iconClassName}></i></span>
        </div>
      </DropdownItem>
    );
  }, [editorSettings, update, t]);

  const renderRealtimeMathJaxMenuItem = useCallback(() => {
    if (editorSettings == null) {
      return <></>;
    }

    if (!isMathJaxEnabled) {
      return <></>;
    }

    const isActive = editorSettings.renderMathJaxInRealtime;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <DropdownItem toggle={false} onClick={() => update({ renderMathJaxInRealtime: !isActive })}>
        <div className="d-flex justify-content-between">
          <span className="icon-container"><img src="/images/icons/fx.svg" width="14px" alt="fx"></img></span>
          <span className="menuitem-label">MathJax Rendering</span>
          <span className="icon-container"><i className={iconClassName}></i></span>
        </div>
      </DropdownItem>
    );
  }, [editorSettings, isMathJaxEnabled, update]);

  const renderRealtimeDrawioMenuItem = useCallback(() => {
    if (editorSettings == null) {
      return <></>;
    }

    const isActive = editorSettings.renderDrawioInRealtime;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <DropdownItem toggle={false} onClick={() => update({ renderDrawioInRealtime: !isActive })}>
        <div className="d-flex justify-content-between">
          <span className="icon-container"><img src="/images/icons/fx.svg" width="14px" alt="fx"></img></span>
          <span className="menuitem-label">draw.io Rendering</span>
          <span className="icon-container"><i className={iconClassName}></i></span>
        </div>
      </DropdownItem>
    );
  }, [editorSettings, update]);

  const renderMarkdownTableAutoFormattingMenuItem = useCallback(() => {
    if (editorSettings == null) {
      return <></>;
    }

    const isActive = editorSettings.autoFormatMarkdownTable;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <DropdownItem toggle={false} onClick={() => update({ autoFormatMarkdownTable: !isActive })}>
        <div className="d-flex justify-content-between">
          <span className="icon-container"></span>
          <span className="menuitem-label">{ t('page_edit.auto_format_table') }</span>
          <span className="icon-container"><i className={iconClassName}></i></span>
        </div>
      </DropdownItem>
    );
  }, [editorSettings, t, update]);

  const renderIsTextlintEnabledMenuItem = useCallback(() => {
    if (editorSettings == null) {
      return <></>;
    }

    const clickHandler = () => {
      if (isTextlintEnabled) {
        mutateTextlintEnabled(false);
        return;
      }

      if (editorSettings.textlintSettings?.neverAskBeforeDownloadLargeFiles) {
        mutateTextlintEnabled(true);
        return;
      }

      if (onConfirmEnableTextlint != null) {
        onConfirmEnableTextlint();
      }
    };

    const iconClasses = ['text-info'];
    if (isTextlintEnabled) {
      iconClasses.push('ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <DropdownItem toggle={false} onClick={clickHandler}>
        <div className="d-flex justify-content-between">
          <span className="icon-container"></span>
          <span className="menuitem-label">Textlint</span>
          <span className="icon-container"><i className={iconClassName}></i></span>
        </div>
      </DropdownItem>
    );
  }, [editorSettings, isTextlintEnabled, mutateTextlintEnabled, onConfirmEnableTextlint]);

  return (
    <div className="my-0 form-group">
      <Dropdown
        direction="up"
        className="grw-editor-configuration-dropdown"
        isOpen={isCddMenuOpened}
        toggle={() => setCddMenuOpened(!isCddMenuOpened)}
      >

        <DropdownToggle color="outline-secondary" caret>
          <i className="icon-settings"></i>
        </DropdownToggle>

        <DropdownMenu>
          {renderActiveLineMenuItem()}
          {renderRealtimeMathJaxMenuItem()}
          {renderRealtimeDrawioMenuItem()}
          {renderMarkdownTableAutoFormattingMenuItem()}
          {renderIsTextlintEnabledMenuItem()}
          {/* <DropdownItem divider /> */}
        </DropdownMenu>

      </Dropdown>
    </div>
  );

});


type Props = {
  appContainer: AppContainer
  editorContainer: EditorContainer,
};

const OptionsSelector = (props: Props): JSX.Element => {
  const { appContainer, editorContainer } = props;
  const config = appContainer.getConfig();

  const [isDownloadDictModalShown, setDownloadDictModalShown] = useState(false);

  const { data: editorSettings, turnOffAskingBeforeDownloadLargeFiles } = useEditorSettings();
  const { mutate: mutateTextlintEnabled } = useIsTextlintEnabled();

  if (editorSettings == null) {
    return <></>;
  }

  return (
    <>
      <div className="d-flex flex-row">
        <span>
          <ThemeSelector />
        </span>
        <span className="d-none d-sm-block ml-2 ml-sm-4">
          <KeymapSelector />
        </span>
        <span className="ml-2 ml-sm-4">
          <IndentSizeSelector
            isIndentSizeForced={config.isIndentSizeForced}
            selectedIndentSize={editorContainer.state.indentSize}
            onChange={newIndentSize => editorContainer.setState({ indentSize: newIndentSize })}
          />
        </span>
        <span className="ml-2 ml-sm-4">
          <ConfigurationDropdown
            isMathJaxEnabled={!!config.env.MATHJAX}
            onConfirmEnableTextlint={() => setDownloadDictModalShown(true)}
          />
        </span>
      </div>

      { editorSettings != null && !editorSettings.textlintSettings?.neverAskBeforeDownloadLargeFiles && (
        <DownloadDictModal
          isModalOpen={isDownloadDictModalShown}
          onEnableTextlint={(isSkipAskingAgainChecked) => {
            mutateTextlintEnabled(true);

            if (isSkipAskingAgainChecked) {
              turnOffAskingBeforeDownloadLargeFiles();
            }

            setDownloadDictModalShown(false);
          }}
          onCancel={() => setDownloadDictModalShown(false)}
        />
      )}
    </>
  );

};


const OptionsSelectorWrapper = withUnstatedContainers(OptionsSelector, [AppContainer, EditorContainer]);
export default OptionsSelectorWrapper;
