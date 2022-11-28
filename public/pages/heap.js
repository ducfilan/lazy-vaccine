window.heap = window.heap || [], heap.load = function (e, t) { window.heap.appid = e, window.heap.config = t = t || {}; var r = document.createElement("script"); r.type = "text/javascript", r.async = !0, r.src = "./heap-$HEAP_IO_ID.js"; var a = document.getElementsByTagName("script")[0]; a.parentNode.insertBefore(r, a); for (var n = function (e) { return function () { heap.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }, p = ["addEventProperties", "addUserProperties", "clearEventProperties", "identify", "resetIdentity", "removeEventProperty", "setEventProperties", "track", "unsetEventProperty"], o = 0; o < p.length; o++)heap[p[o]] = n(p[o]) };
heap.load("$HEAP_IO_ID");

(function () {
  let quarters = 0;
  let scrollHeight, quarterHeight, scrollDistance, divisible, scrollPercent;
  document.addEventListener("scroll", function () {
    scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    quarterHeight = scrollHeight / 4;
    scrollDistance = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
    divisible = Math.trunc(scrollDistance / quarterHeight);
    if (quarters < divisible && divisible !== Infinity) {
      scrollPercent = divisible * 25;
      heap.track('Scroll Depth', {
        percent: scrollPercent
      });
      quarters++;
    }
  });
}());
