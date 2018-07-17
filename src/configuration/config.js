import axios from 'axios';
import { logger } from '../logger';

const log = logger('app-config');
let config;

export function getConfig() {
  return config;
}

export function loadConfig(configUrl) {
  if (config) return Promise.resolve(config);
  const url = configUrl || './config-app.json';
  return axios
    .get(url)
    .then(res => {
      config = res.data;
      return config;
    })
    .catch(err => {
      log('error loading config', err);
      return Promise.reject(err);
    });
}
