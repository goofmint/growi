import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

const ThreeStrandedButton = (props) => {
  const { t, editorMode } = props;
  const [btnActive, setBtnActive] = useState(editorMode);
  function threeStrandedButtonClickedHandler(viewType) {
    if (props.onThreeStrandedButtonClicked != null) {
      props.onThreeStrandedButtonClicked(viewType);
    }
    setBtnActive(viewType);
  }

  return (
    <div className="btn-group grw-three-stranded-button" role="group " aria-label="three-stranded-button">
      <button
        type="button"
        className={`btn btn-outline-primary view-button ${btnActive === 'view' && 'active'}`}
        onClick={() => { threeStrandedButtonClickedHandler('view') }}
      >
        <i className="icon-control-play icon-fw" />
        { t('view') }
      </button>
      <button
        type="button"
        className={`btn btn-outline-primary edit-button ${btnActive === 'edit' && 'active'}`}
        onClick={(e) => { threeStrandedButtonClickedHandler('edit') }}
      >
        <i className="icon-note icon-fw" />
        { t('Edit') }
      </button>
      <button
        type="button"
        className={`btn btn-outline-primary hackmd-button ${btnActive === 'hackmd' && 'active'}`}
        onClick={() => { threeStrandedButtonClickedHandler('hackmd') }}
      >
        <i className="fa fa-fw fa-file-text-o" />
        { t('hackmd.hack_md') }
      </button>
    </div>
  );

};

ThreeStrandedButton.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  editorMode: PropTypes.string.isRequired,
  onThreeStrandedButtonClicked: PropTypes.func,
};

export default withTranslation()(ThreeStrandedButton);
