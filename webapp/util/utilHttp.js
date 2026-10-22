sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../constantes",
    "../util/utilResponse",
    "../util/utilPopUps",
  ],
  function (Controller, JSONModel, constantes, utilResponse, utilPopUps) {
    "use strict";
    return {
      obtenerFechaIso: function () {
        const d = new Date();
        const fechaIso = d.toISOString();
        return fechaIso.toString();
      },
      extractTenant: function () {
        let fullHost = window.location.href;
        // 1) Host: viene del header estándar (sin protocolo)
        if (!fullHost) return "";

        // Quitar protocolo
        fullHost = fullHost.replace(/^https?:\/\//, "");

        // Quitar slash final o cualquier ruta
        fullHost = fullHost.split("/")[0];

        // Quitar hash (#)
        fullHost = fullHost.split("#")[0];

        // Quitar puerto (ej: :3000)
        fullHost = fullHost.split(":")[0];

        // El tenant es el primer segmento antes del primer punto
        const tenant = fullHost.split(".")[0];

        return tenant;
      },
      generarIdTransaccion: function () {
        var fecha = new Date();
        var fechaIso = fecha.toISOString();
        var fechaString = fechaIso
          .toString()
          .replace(/:/g, "")
          .replace(/-/g, "")
          .replace(".", "")
          .replace("Z", "")
          .replace("T", "");
        var randon = Math.floor(Math.random() * 1000000 + 1);
        var idTransaccion = fechaString + "" + randon;
        return idTransaccion;
      },
      generarIdTransaccionFecha: function () {
        var fecha = new Date();
        var fechaIso = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ"); //fecha.toISOString();
        var fechaString = fechaIso
          .toString()
          .replace(/:/g, "")
          .replace(/-/g, "")
          .replace(".", "")
          .replace("Z", "")
          .replace("T", "");
        var randon = Math.floor(Math.random() * 1000000 + 1);
        var idTransaccion = fechaString + "" + randon;
        return { idTransaccion: idTransaccion, fechatransaccion: fechaIso };
      },
      validarRespuestaServicio: function (oAuditResponse, mensaje2, callback) {
        if (oAuditResponse.code === 1) {
          utilPopUps.onMessageSuccessDialogPress(
            oAuditResponse.idtransaccion,
            mensaje2,
            callback
          );
        } else if (oAuditResponse.code === 200) {
          utilPopUps.onMessageWarningDialogPressExit(
            oAuditResponse.idtransaccion,
            mensaje2
          );
        } else if (oAuditResponse.code > 1) {
          var mensaje = oAuditResponse.message;
          utilPopUps.onMessageWarningDialogPress2(
            oAuditResponse.idtransaccion,
            mensaje
          );
        } else if (oAuditResponse.code === 0) {
          utilPopUps.onMessageErrorDialogPress(oAuditResponse.idtransaccion);
        } else {
          utilPopUps.onMessageErrorDialogPress(oAuditResponse.idtransaccion);
        }
      },
      generarHeaders: function (self) {
        let sToken = "";

        // let token = "";

        // if (this.obtenerDTokenDesdeURL(window.location.href) != null) {
        //   token = this.obtenerDTokenDesdeURL(window.location.href);
        // } else {
        //   if (localStorage.login) {
        //     token = JSON.parse(localStorage.login).Token;
        //   }
        // }

        let token = localStorage.getItem("token");
        let tenant = localStorage.getItem("Tenant");

        let request = {};

        const generarIdTransaccionFecha = this.generarIdTransaccionFecha();
        request.fechatransaccion = generarIdTransaccionFecha.fechatransaccion;
        request.idTransaccion = generarIdTransaccionFecha.idTransaccion;
        request.aplicacion = constantes.idProyecto;
        request.usuario = token == "" ? null : this.parseJwt(token).email;
        request.token = token;
        request.tenant = window.location.href;
        request["Content-Type"] = "application/json";

        request["subdomain"] = constantes.subdomain;

        const lista = constantes.subdomain.split("-");
        const client_alias = lista[0];
        const cod_country = lista[1];
        const cod_product = constantes.cod_product;
        const cod_society = lista[2];
        // self
        //   .getView()
        //   .getModel("localModel")
        //   .getData().cod_society;

        const enviroment = lista[3];

        // request["schema_db"] = [
        //   client_alias,
        //   cod_country,
        //   cod_product,
        //   cod_society,
        //   enviroment,
        // ].join("-");

        const sociedad = self
          .getView()
          .getModel("localModel")
          .getData().filtrosSociedad;

        request.sociedad = sociedad;
        return request;
      },

      generarHeadersGestion: function (self) {
        let sToken = "";

        let token = constantes.isLocal
          ? constantes.token
          : JSON.parse(localStorage.login).Token;
        let request = {};
        let subdomain = constantes.isLocal
          ? constantes.subdomain
          : window.location.host.split(".")[0];
        let schema_db = constantes.isLocal
          ? constantes.schema_db
          : JSON.parse(localStorage.login).schema_db;

        const generarIdTransaccionFecha = this.generarIdTransaccionFecha();
        request.aplicacion = constantes.idProyecto;
        request.usuario = this.parseJwt(token).email;
        request.token = token;
        request["Content-Type"] = "application/json";

        return request;
      },

      generarHeadersSeguridad: function (self) {
        let request = {};
        const generarIdTransaccionFecha = this.generarIdTransaccionFecha();
        request.fechatransaccion = generarIdTransaccionFecha.fechatransaccion;
        request.idtransaccion = generarIdTransaccionFecha.idTransaccion;
        request.aplicacion = constantes.idProyecto;
        request.fechatransaccion = generarIdTransaccionFecha.fechatransaccion;
        request["Content-Type"] = "application/json";
        request["Access-Control-Allow-Origin"] = "*";
        // request[" Access-Control-Allow-Methods"] = "OPTIONS,POST";

        request["x-tenant-id"] = JSON.parse(
          localStorage.login
        ).Empresa[0].Tenant;
        return request;
      },

      httpPostSeguridad: async function (path, data, context) {
        sap.ui.core.BusyIndicator.show(0);
        const oHeader = this.generarHeadersSeguridad(context);
        const self = this;
        try {
          // path = constantes.destApiGateway + path;
          // if (constantes.isLocal) {
          //   path = path.replace(
          //     "./portal/dest-provwebapigateway/",
          //     constantes.urlApiGatewayLocal
          //   );
          // }
          const rawResponse = await fetch(path, {
            method: "POST",
            headers: oHeader,
            mode: "cors",
            body: JSON.stringify(data),
          });

          const content = await rawResponse.json();

          return self.success(content, null);
        } catch (error) {
          return self.error(error, oHeader, null);
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },
      httpPost: async function (path, data, context) {
        sap.ui.core.BusyIndicator.show(0);
        const oHeader = this.generarHeaders(context);
        const self = this;
        try {
          path = constantes.destApiGateway + path;
          if (constantes.isLocal) {
            path = path.replace(
              "./regprefacturascontador/dest-provwebapigateway/",
              constantes.urlApiGatewayLocal
            );
          }
          const rawResponse = await fetch(path, {
            method: "POST",
            headers: oHeader,
            mode: "cors",
            body: JSON.stringify(data),
          });

          const content = await rawResponse.json();

          return self.success(content, null);
        } catch (error) {
          return self.error(error, oHeader, null);
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },
      httpPostDemo: async function (path, data, context) {
        sap.ui.core.BusyIndicator.show(0);
        const oHeader = this.generarHeaders(context);
        const self = this;
        try {
          // path = constantes.destApiGateway + path;
          // if (constantes.isLocal) {
          //   path = path.replace(
          //     "./regprefacturascontador/dest-provwebapigateway/",
          //     constantes.urlApiGatewayLocal
          //   );
          // }
          const rawResponse = await fetch("http://localhost:3012" + path, {
            method: "POST",
            headers: oHeader,
            mode: "cors",
            body: JSON.stringify(data),
          });

          const content = await rawResponse.json();

          return self.success(content, null);
        } catch (error) {
          return self.error(error, oHeader, null);
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },

      httpPostGestion: async function (path, data, context) {
        sap.ui.core.BusyIndicator.show(0);
        const oHeader = this.generarHeadersGestion(context);
        const self = this;
        try {
          // path = constantes.destApiGateway + path;
          // if (constantes.isLocal) {
          //   path = path.replace(
          //     "./portal/dest-provwebapigateway/",
          //     constantes.urlApiGatewayLocal
          //   );
          // }
          const rawResponse = await fetch(path, {
            method: "POST",
            headers: oHeader,
            mode: "cors",
            body: JSON.stringify(data),
          });

          const content = await rawResponse.json();

          return self.success(content, null);
        } catch (error) {
          return self.error(error, oHeader, null);
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },

      parseJwt: function (token) {
        var base64Url = token.split(".")[1];
        var base64 = decodeURIComponent(
          atob(base64Url)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        return JSON.parse(base64);
      },

      httpDelete: async function (path, data, context) {
        const oHeader = this.generarHeaders(context);
        try {
          //if (constantes.ActivarLocal) {
          path = path.replace(
            "./regprefacturascontador/dest-provwebapigateway/",
            constantes.urlApiGatewayLocal
          );
          //}
          const rawResponse = await fetch(path, {
            method: "DELETE",
            headers: oHeader,
            body: JSON.stringify(data),
          });
          const content = await rawResponse.json();
          return content;
        } catch (error) {
          sap.ui.core.BusyIndicator.hide();
          return {
            oAuditResponse: {
              idtransaccion: oHeader.idtransaccion,
              code: -1000,
              sMensaje:
                "Error al consultar el servicio (" +
                error.status +
                "), vuelva a intentarlo o comuníquese con el área de soporte.",
            },
          };
        }
      },
      httpPut: async function (path, data, context) {
        try {
          const oHeader = this.generarHeaders(context);
          //if (constantes.ActivarLocal) {
          path = path.replace(
            "./regprefacturascontador/dest-provwebapigateway/",
            constantes.urlApiGatewayLocal
          );
          //}
          const rawResponse = await fetch(path, {
            method: "PUT",
            headers: oHeader,
            body: JSON.stringify(data),
          });
          const content = await rawResponse.json();
          return content;
        } catch (error) {
          sap.ui.core.BusyIndicator.hide();
          return {
            oAuditResponse: {
              idtransaccion: oHeader.idtransaccion,
              code: -1000,
              sMensaje:
                "Error al consultar el servicio (" +
                error.status +
                "), vuelva a intentarlo o comuníquese con el área de soporte.",
            },
          };
        }
      },
      httpGet: async function (path, context) {
        sap.ui.core.BusyIndicator.show(0);
        const oHeader = this.generarHeaders(context);
        const self = this;
        try {
          path = constantes.destApiGateway + path;
          if (constantes.isLocal) {
            path = path.replace(
              "./regprefacturascontador/dest-provwebapigateway/",
              constantes.urlApiGatewayLocal
            );
          }
          const rawResponse = await fetch(path, {
            method: "GET",
            headers: oHeader,
            mode: "cors",
          });

          const content = await rawResponse.json();

          return self.success(content, null);
        } catch (error) {
          sap.ui.core.BusyIndicator.hide();
          return self.error(error, oHeader, null);
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },
      httpGetSeguridad: async function (path, context) {
        sap.ui.core.BusyIndicator.show(0);

        const oHeader = this.generarHeadersSeguridad(context);
        const self = this;
        try {
          path = constantes.destApiSeguridad + path;

          const rawResponse = await fetch(path, {
            method: "GET",
            headers: oHeader,
            mode: "cors",
          });

          const content = await rawResponse.json();

          return self.success(content, null);
        } catch (error) {
          sap.ui.core.BusyIndicator.hide();
          return self.error(error, oHeader, null);
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },
      parseJwt: function (token) {
        let base64Url = token.split(".")[1];
        let base64 = decodeURIComponent(
          atob(base64Url)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        return JSON.parse(base64);
      },

      success: function (result, mockData) {
        var self = this;
        var modResult;
        var oAuditResponse = result.oAuditResponse;
        if (!constantes.ActivarMockData) {
          mockData = null;
        }
        if (mockData) {
          modResult = utilResponse.success(
            "17682783782383",
            "Se consultó correctamente.",
            mockData
          );
        } else {
          if (oAuditResponse.code === 1) {
            modResult = utilResponse.success(
              oAuditResponse.idtransaccion,
              oAuditResponse.message,
              result.oDataResponse
            );
          } else if (oAuditResponse.code > 1) {
            modResult = utilResponse.warn(
              oAuditResponse.idtransaccion,
              oAuditResponse.message,
              result.oDataResponse
            );
          } else if (oAuditResponse.code == -99) {
            modResult = utilResponse.errorNoAutorizado(
              oAuditResponse.idtransaccion,
              oAuditResponse.message,
              result.oDataResponse
            );
            //utilPopUps.onMessageErrorDialogPress(modResult.idtransaccion);
          } else if (oAuditResponse.code < 0 && oAuditResponse.code !== -1000) {
            modResult = utilResponse.error(
              oAuditResponse.idtransaccion,
              oAuditResponse.message,
              result.oDataResponse
            );
            //utilPopUps.onMessageErrorDialogPress(modResult.idtransaccion);
          } else if (oAuditResponse.code === -1000) {
            modResult = utilResponse.exception(
              oAuditResponse.idtransaccion,
              oAuditResponse.message
            );
          }
        }
        return modResult;
      },
      error: function (error, oHeader, mockData) {
        var modResult;
        if (!constantes.ActivarMockData) {
          mockData = null;
        }
        if (mockData) {
          modResult = utilResponse.success(
            "17682783782383",
            "Se consultó correctamente.",
            mockData
          );
        } else {
          modResult = utilResponse.errorServicio(error, oHeader);
        }
        return modResult;
      },
    };
  }
);
