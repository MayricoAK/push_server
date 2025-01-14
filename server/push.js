const webpush = require("web-push");
const urlsafeBase64 = require("urlsafe-base64");
const Storage = require("node-storage");

const vapid = require("./vapid.json");

webpush.setVapidDetails(
  "mailto:lucymayreels@gmail.com",
  vapid.publicKey,
  vapid.privateKey
);

const store = new Storage(`${__dirname}/db`);
let subscriptions = store.get("subscriptions") || [];

console.log(subscriptions);

module.exports.getKey = () => urlsafeBase64.decode(vapid.publicKey);
module.exports.addSubscription = (subscription) => {
  subscriptions.push(subscription);

  store.put("subscriptions", subscriptions);
};

module.exports.send = (message) => {
  let notifications = [];

  subscriptions.forEach((subscription, i) => {
    let p = webpush.sendNotification(subscription, message).catch((status) => {
      if (status.statusCode === 410) subscriptions[i]["delete"] = true;

      return null;
    });
    notifications.push(p);
  });

  Promise.all(notifications).then(() => {
    subscriptions = subscriptions.filter(
      (subscription) => !subscription.delete
    );
    store.put("subscriptions", subscriptions);
  });
};
