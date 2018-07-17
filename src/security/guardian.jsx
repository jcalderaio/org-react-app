import React from 'react';
import PropTypes from 'prop-types';
import { logger } from '../logger';
import { isMemberOf } from './auth';

const log = logger('auth:guardian');

export default class Guardian extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    allowed: PropTypes.arrayOf(PropTypes.string)
  };

  get isAccessDenied() {
    return !isMemberOf(this.props.allowed);
  }

  render() {
    if (this.isAccessDenied) {
      log('Guardian: access denied %j', this.props.allowed);
      return null;
    }
    return React.Children.only(this.props.children);
  }
}
