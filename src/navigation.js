import { hashHistory } from 'react-router';
import urljoin from 'url-join';

export function goto(url = '/') {
  hashHistory.push(url);
  // window.top.location = redirectUrl;
}

export { urljoin, hashHistory as history };
