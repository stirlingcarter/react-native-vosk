import {
  EmitterSubscription,
  EventSubscription,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-vosk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const VoskModule1 = NativeModules.Vosk
  ? NativeModules.Vosk
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

  

// const VoskModule2 = NativeModules.Vosk
//   ? NativeModules.Vosk
//   : new Proxy(
//       {},
//       {
//         get() {
//           throw new Error(LINKING_ERROR);
//         },
//       }
//     );

type VoskEvent = {
  /**
   * Event datas
   */
  data: string;
}

const eventEmitter1 = new NativeEventEmitter(VoskModule1);
const eventEmitter2 = new NativeEventEmitter(VoskModule1);

export default class Vosk {
  // Public functions
  loadModel1 = (path: string) => VoskModule1.loadModel(path);
  // loadModel2 = (path: string) => VoskModule2.loadModel(path);

  currentRegisteredEvents: EmitterSubscription[] = [];

  start = (grammar: string[] | null = null) : Promise<String> => {

    return new Promise<String>((resolve, reject) => {
      // Check for permission
      this.requestRecordPermission()
        .then((granted) => {
          if (!granted) return reject('Audio record permission denied');

          // Setup events
          this.currentRegisteredEvents.push(eventEmitter1.addListener('onResult', (e: VoskEvent) => resolve(e.data)));
          this.currentRegisteredEvents.push(eventEmitter1.addListener('onFinalResult', (e: VoskEvent) => resolve(e.data)));
          this.currentRegisteredEvents.push(eventEmitter1.addListener('onError', (e: VoskEvent) => reject(e.data)));
          this.currentRegisteredEvents.push(eventEmitter1.addListener('onTimeout', () => reject('timeout')));

          this.currentRegisteredEvents.push(eventEmitter2.addListener('onResult', (e: VoskEvent) => resolve(e.data)));
          this.currentRegisteredEvents.push(eventEmitter2.addListener('onFinalResult', (e: VoskEvent) => resolve(e.data)));
          this.currentRegisteredEvents.push(eventEmitter2.addListener('onError', (e: VoskEvent) => reject(e.data)));
          this.currentRegisteredEvents.push(eventEmitter2.addListener('onTimeout', () => reject('timeout')));

          let p = new Promise<void>((resolve,reject) => {VoskModule1.withBus(0)}).then(VoskModule1.start([]));
          // let p2 = new Promise<void>((resolve,reject) => {VoskModule2.withBus(1)}).then(VoskModule2.start([]));

          // // Start recognition
          // VoskModule1.start([]);
          // VoskModule2.start([]);

          
        })
        .catch((e) => {
          reject(e);
        });
    }).finally(() => {
      this.cleanListeners();
    });
  };

  stop = () => {
    this.cleanListeners();
    VoskModule1.stop();
    // VoskModule2.stop();
  };

  // Event listeners builders
  onResult1 = (onResult: (e: VoskEvent) => void) : EventSubscription => {
    return eventEmitter1.addListener('onResult', onResult);
  };
  onFinalResult1 = (onFinalResult: (e: VoskEvent) => void) : EventSubscription => {
    return eventEmitter1.addListener('onFinalResult', onFinalResult);
  };
  onError1 = (onError: (e: VoskEvent) => void) : EventSubscription => {
    return eventEmitter1.addListener('onError', onError);
  };
  onTimeout1 = (onTimeout: (e: VoskEvent) => void) : EventSubscription => {
    return eventEmitter1.addListener('onTimeout', onTimeout);
  };

  onResult2 = (onResult: (e: VoskEvent) => void) : EventSubscription => {
    return eventEmitter2.addListener('onResult', onResult);
  };
  onFinalResult2 = (onFinalResult: (e: VoskEvent) => void) : EventSubscription => {
    return eventEmitter2.addListener('onFinalResult', onFinalResult);
  };
  onError2 = (onError: (e: VoskEvent) => void) : EventSubscription => {
    return eventEmitter2.addListener('onError', onError);
  };
  onTimeout2 = (onTimeout: (e: VoskEvent) => void) : EventSubscription => {
    return eventEmitter2.addListener('onTimeout', onTimeout);
  };

  // Private functions
  private requestRecordPermission = async () => {
    if (Platform.OS === "ios") return true;
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO!
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  private cleanListeners = () => {
    // Clean event listeners
    this.currentRegisteredEvents.forEach(subscription => subscription.remove());
    this.currentRegisteredEvents = [];
  }
}
