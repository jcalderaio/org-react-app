import debug from 'debug';

console.log('Configuring logging ...');
debug.log = console.info.bind(console);

export function activateLog(loggername) {
  console.log(`Activating log ${loggername}`);
  debug.enable(loggername);
}

export function logger(loggername) {
  return debug(loggername);
}
