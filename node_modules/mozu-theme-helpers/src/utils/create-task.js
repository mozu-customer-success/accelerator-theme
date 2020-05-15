import { EventEmitter } from "events";

export default function createTask() {
  var l = new EventEmitter();
  l.info = str => l.emit('info', str);
  l.warn = str => l.emit('warn', str);
  l.fail = str => {
    let msg = 'mozu-theme-helpers: '
    if (typeof str === "string") {
      msg += str;
    } else if (str && str.message) {
      msg += str.message;
      if (str.stack) {
        msg += "\n" + str.stack;
      }
    } else {
      msg += str && str.toString() || 'Unknown error!'
    }
    l.emit('error', new Error(msg));
  };
  l.done = x => l.emit('done', x);
  return l;
}
