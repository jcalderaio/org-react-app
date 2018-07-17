import React from 'react';
import { getUser } from './auth';

export default function withUser(Component) {
  return function hoc(props) {
    const newProps = { user: getUser() };
    return <Component {...props} {...newProps} />;
  };
}
