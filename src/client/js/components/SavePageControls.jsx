import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';
import AppContainer from '../services/AppContainer';
import EditorContainer from '../services/EditorContainer';

import { createSubscribedElement } from './UnstatedUtils';
import SlackNotification from './SlackNotification';
import GrantSelector from './SavePageControls/GrantSelector';


class SavePageControls extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.appContainer.getConfig();
    this.hasSlackConfig = config.hasSlackConfig;
    this.isAclEnabled = config.isAclEnabled;

    this.slackEnabledFlagChangedHandler = this.slackEnabledFlagChangedHandler.bind(this);
    this.slackChannelsChangedHandler = this.slackChannelsChangedHandler.bind(this);
    this.updateGrantHandler = this.updateGrantHandler.bind(this);

    this.save = this.save.bind(this);
    this.saveAndOverwriteScopesOfDescendants = this.saveAndOverwriteScopesOfDescendants.bind(this);
  }

  slackEnabledFlagChangedHandler(isSlackEnabled) {
    this.props.editorContainer.setState({ isSlackEnabled });
  }

  slackChannelsChangedHandler(slackChannels) {
    this.props.editorContainer.setState({ slackChannels });
  }

  updateGrantHandler(data) {
    this.props.editorContainer.setState(data);
  }

  save() {
    const { pageContainer, editorContainer } = this.props;
    // disable unsaved warning
    editorContainer.disableUnsavedWarning();
    // save
    pageContainer.saveAndReload(editorContainer.getCurrentOptionsToSave());
  }

  saveAndOverwriteScopesOfDescendants() {
    const { pageContainer, editorContainer } = this.props;
    // disable unsaved warning
    editorContainer.disableUnsavedWarning();
    // save
    const optionsToSave = Object.assign(editorContainer.getCurrentOptionsToSave(), {
      overwriteScopesOfDescendants: true,
    });
    pageContainer.saveAndReload(optionsToSave);
  }

  render() {
    const { t, pageContainer, editorContainer } = this.props;
    const isRootPage = pageContainer.state.path === '/';
    const labelSubmitButton = pageContainer.state.pageId == null ? t('Create') : t('Update');
    const labelOverwriteScopes = t('page_edit.overwrite_scopes', { operation: labelSubmitButton });

    return (
      <div className="d-flex align-items-center form-inline">
        {this.hasSlackConfig
          && (
          <div className="mr-2">
            <SlackNotification
              isSlackEnabled={editorContainer.state.isSlackEnabled}
              slackChannels={editorContainer.state.slackChannels}
              onEnabledFlagChange={this.slackEnabledFlagChangedHandler}
              onChannelChange={this.slackChannelsChangedHandler}
            />
          </div>
          )
        }

        {this.isAclEnabled
          && (
          <div className="mr-2">
            <GrantSelector
              disabled={isRootPage}
              grant={editorContainer.state.grant}
              grantGroupId={editorContainer.state.grantGroupId}
              grantGroupName={editorContainer.state.grantGroupName}
              onUpdateGrant={this.updateGrantHandler}
            />
          </div>
          )
        }

        <div className="btn-group btn-group-sm dropup">
          <button type="button" className="btn btn-primary px-5">{labelSubmitButton}</button>
          <button
            type="button"
            id="spl-btn-submit"
            className="btn-submit btn btn-primary dropdown-toggle dropdown-toggle-split"
            data-toggle="dropdown"
            onClick={this.save}
          >
            <span className="sr-only">{labelSubmitButton}</span>
          </button>
          <div
            className="dropdown-menu"
            // eventKey="1"
            onClick={this.saveAndOverwriteScopesOfDescendants}
          >
            {labelOverwriteScopes}
          </div>
        </div>
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SavePageControlsWrapper = (props) => {
  return createSubscribedElement(SavePageControls, props, [AppContainer, PageContainer, EditorContainer]);
};

SavePageControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};

export default withTranslation()(SavePageControlsWrapper);
