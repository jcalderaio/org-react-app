import React from 'react';
import PropTypes from 'prop-types';
import { loadConfig, auth, logger } from './index';

const log = logger('app:host');

export default class AppHost extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onInit: PropTypes.func
  };

  state = { init: false };

  componentDidMount() {
    loadConfig()
      .then(config => auth(config.auth).then(() => config))
      .then(config => {
        if (this.props.onInit) {
          this.props.onInit(config);
        }
        return config;
      })
      .then(cfg => this.setState({ config: cfg, init: true }));
  }

  render() {
    const { init, config } = this.state;
    if (!init) {
      log('Waiting for application to initialize ...');
      return <div />;
    }
    log('Application initialized - config %j', config);
    return React.Children.only(this.props.children);
  }
}
