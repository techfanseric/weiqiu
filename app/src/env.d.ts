/// <reference types="vite/client" />

import { Router } from 'vue-router';

declare global {
  interface Window {
    $mqttClientId: string;
    $router: Router
  }
}

export {};
