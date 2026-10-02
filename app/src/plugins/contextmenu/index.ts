
import { createApp } from 'vue';
import view from './src/view.vue';
import { getUniqueId } from '@/utils';
import type { Contextmenu } from './type';

export default (options: Contextmenu.Options)=> {
  let app = createApp(view);
  let uid = getUniqueId();
  let div = document.createElement('div');

  div.id = uid;

  document.body.append(div);

  app.mount(`#${uid}`);

  return new Promise<Contextmenu.Menu>((resolve: any, reject: any)=> {
    (window as any)['__contextmenuShow'](options).then(resolve).catch(reject).finally(()=> {
      delete (window as any)['__contextmenuShow'];
      app.unmount();
      div.parentNode?.removeChild(div);
    });
  });
}