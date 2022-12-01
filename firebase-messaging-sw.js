self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Received notificationclick event ', event);

    if (!event.action) {
        console.log('Notification Click.SW', {event});
        var click_action = event.notification.data.url || event.notification.data;
        console.log({click_action});
        event.notification.close();
        event.waitUntil(clients.matchAll({
            type: 'window'
        }).then(function (clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url == click_action && 'focus' in client) { return client.focus(); }
            }
            if (clients.openWindow) { return clients.openWindow(click_action); }
        }));
        return;
    }

    clients.openWindow(event.action);

});


importScripts('https://staging-bikayi.firebaseapp.com/__/firebase/9.14.0/firebase-app-compat.js');
importScripts('https://staging-bikayi.firebaseapp.com/__/firebase/9.14.0/firebase-messaging-compat.js');
importScripts('https://staging-bikayi.firebaseapp.com/__/firebase/init.js');

const messaging = firebase.messaging();


messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] I Received background message ', payload);
    const actions = JSON.parse(payload.data['actions']);

    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon,
        title: payload.data.title,
        data: payload.data.click_action,
        actions,
    };

    if (!actions) {
        if (!("Notification" in window)) {
            console.log("This browser does not support system notifications.");
        } else if (Notification.permission === "granted") {
            var notification = new Notification(notificationTitle, notificationOptions);
            notification.onclick = function (event) {
                console.log({ event, payload })
                event.preventDefault();
                clients.openWindow(payload.fcmOptions.link, '_blank');
                notification.close();
            }
        }
        return;
    }
    self.registration.showNotification(notificationTitle, notificationOptions)
});