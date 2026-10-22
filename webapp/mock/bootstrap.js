// Arranque del mock: simula lo que hace el Portal (sesión, modelos globales) y el API (execute-api).
// Se carga ANTES que el resto de la app (dependencia de Component.js) y es síncrono a propósito.
sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";
  if (window.__REGPRE_MOCK__) { return window.__REGPRE_MOCK__; }
  window.USE_MOCK = true;

  var base = sap.ui.require.toUrl("paltarumi/portalweb/registroprefactura/mock");
  function loadSync(url) {
    var x = new XMLHttpRequest();
    x.open("GET", url, false);
    x.send();
    if (x.status !== 200) { throw new Error("No se pudo cargar " + url + " (" + x.status + ")"); }
    return JSON.parse(x.responseText);
  }

  var mocks = [], models = {};
  try {
    mocks = loadSync(base + "/api-mock.json");
    models = loadSync(base + "/models.json");
  } catch (e) {
    console.error("[mock] " + e.message);
  }

  // Sesión simulada (lo que normalmente deja el Portal en localStorage)
  try {
    var ses = mocks.find(function (m) { return m.path.endsWith("procesoObtenerInfoUsuarioGlobalSociedad"); });
    if (ses) {
      var d = JSON.parse(ses.text).oDataResponse;
      localStorage.setItem("token", d.Token);
      localStorage.setItem("login", JSON.stringify(d));
    }
  } catch (e) { console.warn("[mock] no se pudo armar la sesión", e); }

  // Modelos globales que el Portal deja en el core
  Object.keys(models).forEach(function (name) {
    sap.ui.getCore().setModel(new JSONModel(models[name]), name);
  });

  // Intercepta las llamadas al API gateway (execute-api)
  var realFetch = window.fetch.bind(window);
  var IGNORAR = ["IV_FECINI", "IV_FECFIN", "ESTADO"];
  var POR_PROVEEDOR = ["procesoConsultarPartesEntradaProveedor", "procesoConsultarListaDeEmpresas", "obtenerUsuarioInfo"];
  function limpiar(o) {
    if (Array.isArray(o)) { return o.map(limpiar); }
    if (o && typeof o === "object") {
      var r = {};
      Object.keys(o).forEach(function (k) { if (IGNORAR.indexOf(k) < 0) { r[k] = limpiar(o[k]); } });
      return r;
    }
    return o;
  }
  function norm(b) { try { return JSON.stringify(limpiar(JSON.parse(b))); } catch (e) { return b; } }

  window.fetch = async function (input, init) {
    var req = typeof input === "string" ? null : input;
    var url = new URL(req ? req.url : input, location.href);
    if (url.hostname.indexOf("execute-api") < 0) { return realFetch(input, init); }

    var method = ((init && init.method) || (req && req.method) || "GET").toUpperCase();
    var body = init && init.body ? String(init.body) : null;
    if (!body && req && method !== "GET") { body = await req.clone().text(); }

    var sameRoute = mocks.filter(function (m) { return m.method === method && m.path === url.pathname; });
    var hit = sameRoute.find(function (m) { return norm(m.body) === norm(body); });
    var porProveedor = POR_PROVEEDOR.some(function (p) { return url.pathname.endsWith(p); });
    if (!hit && !porProveedor) { hit = sameRoute[0]; }

    if (!hit || !hit.text) {
      console.warn("[mock] sin respuesta grabada para", method, url.pathname, body);
      return new Response(JSON.stringify({ error: "sin mock" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    return new Response(hit.text, { status: hit.status, headers: { "Content-Type": "application/json" } });
  };

  window.__REGPRE_MOCK__ = { mocks: mocks };
  return window.__REGPRE_MOCK__;
});
