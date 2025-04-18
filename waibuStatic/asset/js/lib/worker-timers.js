var WorkerTimers = (function (exports) {
  'use strict';

  const createCache = (lastNumberWeakMap) => {
      return (collection, nextNumber) => {
          lastNumberWeakMap.set(collection, nextNumber);
          return nextNumber;
      };
  };

  /*
   * The value of the constant Number.MAX_SAFE_INTEGER equals (2 ** 53 - 1) but it
   * is fairly new.
   */
  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER === undefined ? 9007199254740991 : Number.MAX_SAFE_INTEGER;
  const TWO_TO_THE_POWER_OF_TWENTY_NINE = 536870912;
  const TWO_TO_THE_POWER_OF_THIRTY = TWO_TO_THE_POWER_OF_TWENTY_NINE * 2;
  const createGenerateUniqueNumber = (cache, lastNumberWeakMap) => {
      return (collection) => {
          const lastNumber = lastNumberWeakMap.get(collection);
          /*
           * Let's try the cheapest algorithm first. It might fail to produce a new
           * number, but it is so cheap that it is okay to take the risk. Just
           * increase the last number by one or reset it to 0 if we reached the upper
           * bound of SMIs (which stands for small integers). When the last number is
           * unknown it is assumed that the collection contains zero based consecutive
           * numbers.
           */
          let nextNumber = lastNumber === undefined ? collection.size : lastNumber < TWO_TO_THE_POWER_OF_THIRTY ? lastNumber + 1 : 0;
          if (!collection.has(nextNumber)) {
              return cache(collection, nextNumber);
          }
          /*
           * If there are less than half of 2 ** 30 numbers stored in the collection,
           * the chance to generate a new random number in the range from 0 to 2 ** 30
           * is at least 50%. It's benifitial to use only SMIs because they perform
           * much better in any environment based on V8.
           */
          if (collection.size < TWO_TO_THE_POWER_OF_TWENTY_NINE) {
              while (collection.has(nextNumber)) {
                  nextNumber = Math.floor(Math.random() * TWO_TO_THE_POWER_OF_THIRTY);
              }
              return cache(collection, nextNumber);
          }
          // Quickly check if there is a theoretical chance to generate a new number.
          if (collection.size > MAX_SAFE_INTEGER) {
              throw new Error('Congratulations, you created a collection of unique numbers which uses all available integers!');
          }
          // Otherwise use the full scale of safely usable integers.
          while (collection.has(nextNumber)) {
              nextNumber = Math.floor(Math.random() * MAX_SAFE_INTEGER);
          }
          return cache(collection, nextNumber);
      };
  };

  const LAST_NUMBER_WEAK_MAP = new WeakMap();
  const cache = createCache(LAST_NUMBER_WEAK_MAP);
  const generateUniqueNumber = createGenerateUniqueNumber(cache, LAST_NUMBER_WEAK_MAP);

  const isCallNotification = (message) => {
      return message.method !== undefined && message.method === 'call';
  };

  const isClearResponse = (message) => {
      return typeof message.id === 'number' && typeof message.result === 'boolean';
  };

  const load = (url) => {
      // Prefilling the Maps with a function indexed by zero is necessary to be compliant with the specification.
      const scheduledIntervalFunctions = new Map([[0, () => { }]]); // tslint:disable-line no-empty
      const scheduledTimeoutFunctions = new Map([[0, () => { }]]); // tslint:disable-line no-empty
      const unrespondedRequests = new Map();
      const worker = new Worker(url);
      worker.addEventListener('message', ({ data }) => {
          if (isCallNotification(data)) {
              const { params: { timerId, timerType } } = data;
              if (timerType === 'interval') {
                  const idOrFunc = scheduledIntervalFunctions.get(timerId);
                  if (typeof idOrFunc === undefined) {
                      throw new Error('The timer is in an undefined state.');
                  }
                  if (typeof idOrFunc === 'number') {
                      const timerIdAndTimerType = unrespondedRequests.get(idOrFunc);
                      if (timerIdAndTimerType === undefined ||
                          timerIdAndTimerType.timerId !== timerId ||
                          timerIdAndTimerType.timerType !== timerType) {
                          throw new Error('The timer is in an undefined state.');
                      }
                  }
                  else if (typeof idOrFunc === 'function') {
                      idOrFunc();
                  }
              }
              else if (timerType === 'timeout') {
                  const idOrFunc = scheduledTimeoutFunctions.get(timerId);
                  if (typeof idOrFunc === undefined) {
                      throw new Error('The timer is in an undefined state.');
                  }
                  if (typeof idOrFunc === 'number') {
                      const timerIdAndTimerType = unrespondedRequests.get(idOrFunc);
                      if (timerIdAndTimerType === undefined ||
                          timerIdAndTimerType.timerId !== timerId ||
                          timerIdAndTimerType.timerType !== timerType) {
                          throw new Error('The timer is in an undefined state.');
                      }
                  }
                  else if (typeof idOrFunc === 'function') {
                      idOrFunc();
                      // A timeout can be savely deleted because it is only called once.
                      scheduledTimeoutFunctions.delete(timerId);
                  }
              }
          }
          else if (isClearResponse(data)) {
              const { id } = data;
              const timerIdAndTimerType = unrespondedRequests.get(id);
              if (timerIdAndTimerType === undefined) {
                  throw new Error('The timer is in an undefined state.');
              }
              const { timerId, timerType } = timerIdAndTimerType;
              unrespondedRequests.delete(id);
              if (timerType === 'interval') {
                  scheduledIntervalFunctions.delete(timerId);
              }
              else {
                  scheduledTimeoutFunctions.delete(timerId);
              }
          }
          else {
              const { error: { message } } = data;
              throw new Error(message);
          }
      });
      const clearInterval = (timerId) => {
          if (typeof scheduledIntervalFunctions.get(timerId) === 'function') {
              const id = generateUniqueNumber(unrespondedRequests);
              unrespondedRequests.set(id, { timerId, timerType: 'interval' });
              scheduledIntervalFunctions.set(timerId, id);
              worker.postMessage({
                  id,
                  method: 'clear',
                  params: { timerId, timerType: 'interval' }
              });
          }
      };
      const clearTimeout = (timerId) => {
          if (typeof scheduledTimeoutFunctions.get(timerId) === 'function') {
              const id = generateUniqueNumber(unrespondedRequests);
              unrespondedRequests.set(id, { timerId, timerType: 'timeout' });
              scheduledTimeoutFunctions.set(timerId, id);
              worker.postMessage({
                  id,
                  method: 'clear',
                  params: { timerId, timerType: 'timeout' }
              });
          }
      };
      const setInterval = (func, delay = 0, ...args) => {
          const timerId = generateUniqueNumber(scheduledIntervalFunctions);
          scheduledIntervalFunctions.set(timerId, () => {
              func(...args);
              // Doublecheck if the interval should still be rescheduled because it could have been cleared inside of func().
              if (typeof scheduledIntervalFunctions.get(timerId) === 'function') {
                  worker.postMessage({
                      id: null,
                      method: 'set',
                      params: {
                          delay,
                          now: performance.timeOrigin + performance.now(),
                          timerId,
                          timerType: 'interval'
                      }
                  });
              }
          });
          worker.postMessage({
              id: null,
              method: 'set',
              params: {
                  delay,
                  now: performance.timeOrigin + performance.now(),
                  timerId,
                  timerType: 'interval'
              }
          });
          return timerId;
      };
      const setTimeout = (func, delay = 0, ...args) => {
          const timerId = generateUniqueNumber(scheduledTimeoutFunctions);
          scheduledTimeoutFunctions.set(timerId, () => func(...args));
          worker.postMessage({
              id: null,
              method: 'set',
              params: {
                  delay,
                  now: performance.timeOrigin + performance.now(),
                  timerId,
                  timerType: 'timeout'
              }
          });
          return timerId;
      };
      return {
          clearInterval,
          clearTimeout,
          setInterval,
          setTimeout
      };
  };

  const createLoadOrReturnBroker = (loadBroker, worker) => {
      let broker = null;
      return () => {
          if (broker !== null) {
              return broker;
          }
          const blob = new Blob([worker], { type: 'application/javascript; charset=utf-8' });
          const url = URL.createObjectURL(blob);
          broker = loadBroker(url);
          // Bug #1: Edge up until v18 didn't like the URL to be revoked directly.
          setTimeout(() => URL.revokeObjectURL(url));
          return broker;
      };
  };

  // This is the minified and stringified code of the worker-timers-worker package.
  const worker = `(()=>{"use strict";const e=new Map,t=new Map,r=t=>{const r=e.get(t);return void 0!==r&&(clearTimeout(r),e.delete(t),!0)},s=e=>{const r=t.get(e);return void 0!==r&&(clearTimeout(r),t.delete(e),!0)},o=(e,t)=>{const r=performance.now(),s=e+t-r-performance.timeOrigin;return{expected:r+s,remainingDelay:s}},i=(e,t,r,s)=>{const o=r-performance.now();o>0?e.set(t,setTimeout(i,o,e,t,r,s)):(e.delete(t),postMessage({id:null,method:"call",params:{timerId:t,timerType:s}}))};addEventListener("message",(({data:n})=>{try{if("clear"===n.method){const{id:e,params:{timerId:t,timerType:o}}=n;if("interval"===o)postMessage({id:e,result:r(t)});else{if("timeout"!==o)throw new Error('The given type "'.concat(o,'" is not supported'));postMessage({id:e,result:s(t)})}}else{if("set"!==n.method)throw new Error('The given method "'.concat(n.method,'" is not supported'));{const{params:{delay:r,now:s,timerId:a,timerType:m}}=n;if("interval"===m)((t,r,s)=>{const{expected:n,remainingDelay:a}=o(t,s);e.set(r,setTimeout(i,a,e,r,n,"interval"))})(r,a,s);else{if("timeout"!==m)throw new Error('The given type "'.concat(m,'" is not supported'));((e,r,s)=>{const{expected:n,remainingDelay:a}=o(e,s);t.set(r,setTimeout(i,a,t,r,n,"timeout"))})(r,a,s)}}}}catch(e){postMessage({error:{message:e.message},id:n.id,result:null})}}))})();`; // tslint:disable-line:max-line-length

  const loadOrReturnBroker = createLoadOrReturnBroker(load, worker);
  const clearInterval = (timerId) => loadOrReturnBroker().clearInterval(timerId);
  const clearTimeout = (timerId) => loadOrReturnBroker().clearTimeout(timerId);
  const setInterval = (...args) => loadOrReturnBroker().setInterval(...args);
  const setTimeout$1 = (...args) => loadOrReturnBroker().setTimeout(...args);

  exports.clearInterval = clearInterval;
  exports.clearTimeout = clearTimeout;
  exports.setInterval = setInterval;
  exports.setTimeout = setTimeout$1;

  return exports;

})({});