// Arranque local (npm start). En Work Zone no se usa: el launchpad crea el componente.
sap.ui.require(["sap/m/Shell", "sap/ui/core/ComponentContainer"], function (Shell, ComponentContainer) {
  "use strict";
  new Shell({
    appWidthLimited: false,
    app: new ComponentContainer({ async: true, name: "paltarumi.portalweb.registroprefactura", height: "100%" }),
  }).placeAt("content");
});
