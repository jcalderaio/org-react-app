import React from 'react';
import { getConfig } from './config';

export default function withConfig(Component) {
  return props => {
    const newProps = { config: getConfig() || {} };
    return newProps.config ? <Component {...props} {...newProps} /> : null;
  };
}
