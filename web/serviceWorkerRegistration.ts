import { register } from 'next/offline';

export function registerServiceWorker() {
  register();
}

export default registerServiceWorker;