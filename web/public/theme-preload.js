// Apply the saved theme before React loads to avoid a flash of the wrong
// palette. Lives in an external file (not inline) so the app's CSP can keep
// script-src 'self'.
(function () {
  try {
    var t = localStorage.getItem("tc:theme");
    if (t) document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
