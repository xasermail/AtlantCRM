/* это заготовка на попозже, пока оставляю закомметированной
self.addEventListener("install", function installWebWorker(event) {
  self.skipWaiting();
  console.log("install web worker event " + event);
});

self.addEventListener("fetch", function fetchWebWorker(event) {
  console.log("request fetching");
  //console.log(event);
  if (event.request.url.indexOf("browserLinkSignalR") !== -1) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function cachesMatch(resp) {
        return resp || fetch(event.request)
                         .then(function fetchRequest(response) {
                           let responseClone = response.clone();
                           caches.open("v1").then(function openCaches(cache) {
                             cache.put(event.request, responseClone)
                                    .then(function cachesPut() {
                                      console.log("ok");
                                    }).catch(function cachesPutError(err) {
                                      console.log(event.request);
                                      console.log(err);
                                    });
                           });
                           return response;
                         })
                         .catch(function fetchRequestError(err) {
                           console.log(event.requst);
                           console.log(err);
                         });
      }).catch(function cachesCatch() {
        return {};
      })
  );
});
*/