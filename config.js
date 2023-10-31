export const ENV = process.env.REACT_APP_ENV;

export const CONFIG = {
  DEV: {
    BACKEND_URL: process.env.REACT_APP_BACKEND_DEV,
  },
  PROD: {
    BACKEND_URL: process.env.REACT_APP_BACKEND_PROD,
  },
}[ENV];
