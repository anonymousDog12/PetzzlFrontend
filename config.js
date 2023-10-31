import Config from 'react-native-config';

export const ENV = Config.REACT_APP_ENV;

export const CONFIG = {
  DEV: {
    BACKEND_URL: Config.REACT_APP_BACKEND_DEV,
  },
  PROD: {
    BACKEND_URL: Config.REACT_APP_BACKEND_PROD,
  },
}[ENV];
