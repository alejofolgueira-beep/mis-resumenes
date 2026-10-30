/*
 * Avisos de vencimientos (Web Push): esta parte la suma el service worker de la app (vite.config.ts, importScripts).
 * El servidor manda { titulo, cuerpo, url, etiqueta } (apps/api/src/avisos.ts): se muestra como notificación y, al
 * tocarla, abre la app en la Agenda de pagos (o trae al frente la que ya estaba abierta).
 */
self.addEventListener('push', (evento) => {
  let datos = {};
  try {
    datos = evento.data ? evento.data.json() : {};
  } catch {
    datos = { cuerpo: evento.data ? evento.data.text() : '' };
  }
  const titulo = datos.titulo || 'Mis Resúmenes';
  evento.waitUntil(
    self.registration.showNotification(titulo, {
      body: datos.cuerpo || '',
      icon: '/icono-192.png',
      badge: '/icono-192.png',
      lang: 'es-AR',
      tag: datos.etiqueta || 'vencimientos',
      renotify: true,
      data: { url: datos.url || '/#/agenda' },
    }),
  );
});

self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  const destino = new URL((evento.notification.data && evento.notification.data.url) || '/#/agenda', self.location.origin).href;
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      const abierta = ventanas.find((v) => new URL(v.url).origin === self.location.origin);
      // La que ya estaba abierta va a la Agenda; si no se deja llevar, se abre otra.
      if (abierta) {
        return abierta
          .focus()
          .then((v) => (v && 'navigate' in v ? v.navigate(destino) : v))
          .catch(() => self.clients.openWindow(destino));
      }
      return self.clients.openWindow(destino);
    }),
  );
});
