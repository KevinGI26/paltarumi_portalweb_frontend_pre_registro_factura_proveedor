sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "paltarumi/portalweb/registroprefactura/controller/BaseController",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Button",
    "sap/ui/core/HTML",
    "sap/ui/core/format/NumberFormat",
    "../model/models",
    "../service/service",
    "../constantes",
    "../estructuras/enviarDatos",
    "../estructuras/recibirDatos",
    "../util/utilPopUps",
    "../util/utilController",
    "../util/utilHttp",
    "paltarumi/portalweb/registroprefactura/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../util/util",
    "sap/ui/core/BusyIndicator",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    BaseController,
    MessageBox,
    MessageToast,
    Fragment,
    exportLibrary,
    Spreadsheet,
    ColumnListItem,
    Text,
    Button,
    HTML,
    NumberFormat,
    models,
    service,
    constantes,
    enviarDatos,
    recibirDatos,
    utilPopUps,
    utilController,
    utilHttp,
    formatter,
    Filter,
    FilterOperator,
    util,
    BusyIndicator
  ) {
    "use strict";
    const EdmType = exportLibrary.EdmType;

    function _registerXmlNamespaces(oModelX, xmlDoc) {
      oModelX.setNameSpace("urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2", "cac");
      oModelX.setNameSpace("urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2", "cbc");
      oModelX.setNameSpace("urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2", "ext");
      oModelX.setNameSpace("urn:pe:gob:sunat:specification:ubl:pe:custom:schema:xsd:SunatAggregateComponents-1", "biz");
      if (xmlDoc && xmlDoc.documentElement) {
        var attrs = xmlDoc.documentElement.attributes;
        for (var i = 0; i < attrs.length; i++) {
          var attr = attrs[i];
          if (attr.name.indexOf("xmlns:") === 0 || attr.name === "xmlns") {
            var prefix = attr.name.indexOf("xmlns:") === 0 ? attr.name.substring(6) : "";
            var uri = attr.value;
            if (uri.indexOf("CommonAggregateComponents") !== -1) {
              oModelX.setNameSpace(uri, "cac");
            } else if (uri.indexOf("CommonBasicComponents") !== -1) {
              oModelX.setNameSpace(uri, "cbc");
            } else if (uri.indexOf("CommonExtensionComponents") !== -1) {
              oModelX.setNameSpace(uri, "ext");
            } else if (uri.indexOf("SunatAggregateComponents") !== -1) {
              oModelX.setNameSpace(uri, "biz");
            } else if (uri.indexOf("tci") !== -1) {
              oModelX.setNameSpace(uri, "tci");
            }
            if (prefix) {
              oModelX.setNameSpace(uri, prefix);
            }
          }
        }
      }
    }

    return BaseController.extend(
      "paltarumi.portalweb.registroprefactura.controller.MainView",
      {
        formatter: formatter,
        xmlFileExists: false,

        onInit: function () {
          BusyIndicator.show(0);

          // Simular un retraso en la carga de la vista
          setTimeout(function () {
            // Ocultar el BusyIndicator
            BusyIndicator.hide();
          }, 1500);
        },

        onAfterRendering: async function () {
          // if (!constantes.isLocal) {
          //   await this.consultarUserApi();
          // } else {
			  
		   if (location.hostname === "localhost" || window.USE_MOCK) {
			try {
			  const base = jQuery.sap.getModulePath("paltarumi.portalweb.registroprefactura");
			  const mock = await (await fetch(base + "/mock/models.json")).json();
			  Object.keys(mock).forEach(function (name) {
				const core = sap.ui.getCore();
				const m = core.getModel(name);
				if (m) { m.setData(mock[name]); }
				else { core.setModel(new sap.ui.model.json.JSONModel(mock[name]), name); }
			  });
			} catch (e) {
			  console.error("No se pudo cargar mock/models.json", e);
			}
		  }

          this.getView()
            .getModel("localModel")
            .setProperty("/token", constantes.token);
          var oUserInfoModel = sap.ui
            .getCore()
            .getModel("modelInfoUsuario")
            .getProperty("/infoUsuario");

          this.getView()
            .getModel("localModel")
            .setProperty("/infoUsuario", oUserInfoModel);
          this.obtenerSociedadesXApp();
          await this.callApis();
          // }
          this.onInicialiarColumansDinamicasTabla();

          // init and activate controller
          // this._oTPC = new TablePersoController({
          // 	table: this.byId("productsTable"),
          // 	//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
          // 	componentName: "demoApp",
          // 	resetAllMode: ResetAllMode.ServiceReset,
          // 	persoService: DemoPersoService
          // }).activate();

          // var oDataModel = this.getView().getModel("oDataModel");
          // oDataModel.getServiceMetadata();
          // var oModel = new sap.ui.model.odata.v2.ODataModel({serviceUrl: "/sap/opu/odata/sap/ZSEILOCPE_PORPROV_SRV/"});
          // oModel.getServiceMetadata();
        },
        obtenerSociedadesXApp: function () {
          var oSocietiesModel2 = sap.ui
            .getCore()
            .getModel("modelSociedadesGlobalCompras");

          const { Accesos } = sap.ui
            .getCore()
            .getModel("infoGlobalUsuario")
            .getData().infoGlobalUsuario;

          const listB = sap.ui
            .getCore()
            .getModel("modelSociedadesGlobal")
            .getData().listSocieties;
          let filteredList = [];
          for (let index = 0; index < Accesos.length; index++) {
            const element = Accesos[index];
            const Aplicaciones = element.Aplicaciones;
            const findApp = Aplicaciones.find(function (item, index) {
              return item.Codigo == constantes.codigoProyecto;
            });
            if (findApp) {
              const listA = element.sociedades;
              const sociedadesSet = new Set(listA.map((item) => item.sociedad));

              filteredList = listB.filter((item) =>
                sociedadesSet.has(item.cod)
              );
              break;
            }
          }
          oSocietiesModel2.setProperty("/listSocieties", filteredList);
        },
        newValidarCampoUnit: function (oEvent) {
          util.validation.validarCampoUnit(oEvent);
          var input = oEvent.getSource();

          input.setValue(input.getValue().toUpperCase());
          /*this.getView().byId("NRO_SERIE").setValue(this.getView().byId("NRO_SERIE").getValue().toUpperCase());
        this.getView().byId("COMPROBANTE").setValue(this.getView().byId("COMPROBANTE").getValue().toUpperCase());*/
        },
        fnChangeSerie: function (oEvent) {
          var formatPad = function (num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
          };
          var Serie = oEvent.getParameters().newValue;
          Serie = Serie.replace(/\s/g, "");
          var zeroPad = oEvent.getSource().data("zeroPad");
          var nValue = formatPad(Serie, zeroPad);
          this.getView().byId(oEvent.getSource().sId).setValue(nValue);
        },

        _typeNumber: function (oEvent) {
          var value = oEvent.getSource().getValue();
          var bNotnumber = isNaN(value);
          if (bNotnumber === true) {
            oEvent.getSource().setValue(value.substring(0, value.length - 1));
          }
        },

        onInputChangeNroSerie: function (oEvent) {
          //MAXIMO -> 5
          const cantidad = this.getView()
            .getModel("localModel")
            .getProperty("/LONGSERIE");
          var oInput = oEvent.getSource();
          var sNewValue = oInput.getValue();

          if (sNewValue.length < cantidad + 1) {
            // Rellena con ceros a la izquierda hasta que tenga 5 dígitos
            var sPaddedValue = sNewValue.padStart(cantidad, "0");
            let sPaddeValueUpperCase = sPaddedValue.toUpperCase();
            oInput.setValue(sPaddeValueUpperCase);
          }
        },

        onInputChangeCorrelativo: function (oEvent) {
          //MAXIMO -> 7

          const cantidad = this.getView()
            .getModel("localModel")
            .getProperty("/LONGCORRELATIVO");

          var oInput = oEvent.getSource();
          var sNewValue = oInput.getValue();

          if (sNewValue.length < cantidad + 1) {
            // Rellena con ceros a la izquierda hasta que tenga 7 dígitos
            var sPaddedValue = sNewValue.padStart(cantidad, "0");
            oInput.setValue(sPaddedValue);
          }
        },

        onInputChangeNumeroComprobante: function (oEvent) {
          var oInput = oEvent.getSource();
          var sNewValue = oInput.getValue();

          if (sNewValue.length < 16) {
            // Rellena con ceros a la izquierda hasta que tenga 15 dígitos
            var sPaddedValue2 = sNewValue.padStart(15, "0");
            let sPaddeValueUpperCase2 = sPaddedValue2.toUpperCase();
            oInput.setValue(sPaddeValueUpperCase2);
          }
        },

        onInputChangeNumeroComprobante2: function (oEvent) {
          var oInput = oEvent.getSource();
          var sNewValue = oInput.getValue();

          if (sNewValue.length < 14) {
            // Rellena con ceros a la izquierda hasta que tenga 13 dígitos
            var sPaddedValue3 = sNewValue.padStart(13, "0");
            let sPaddeValueUpperCase3 = sPaddedValue3.toUpperCase();
            oInput.setValue(sPaddeValueUpperCase3);
          }
        },

        onChangeImporteFactura: function (oEvent) {
          const IMPORTE_FACTURA = oEvent.getSource().getValue();
          // var regex = /^(\d+\.\d*|\.\d+)$/;
          var regex = /^\d+(\.\d+)?$/;
          var esValido = regex.test(IMPORTE_FACTURA);

          console.log(esValido);
          if (!esValido) {
            this.getView()
              .getModel("localModel")
              .setProperty("/preRegistro/IMPUESTOIMPORTE", 0);
            this.getView()
              .getModel("localModel")
              .setProperty("/preRegistro/IMPORTE", 0);
            utilPopUps.messageBox(
              "El importe de factura no es válido.",
              "A",
              function () {
                // do nothing...
              }
            );
            return;
          }
          const aEncontrado = this.getView()
            .getModel("localModel")
            .getData()
            .selectedRowsPreFactura.filter(function (item, index) {
              return item.TIPO_IMPUESTO == "C1" || item.TIPO_IMPUESTO == "C7";
            });
          if (aEncontrado.length > 0) {
            // importe_factura

            let IMPORTE_FACTURA_CALC = parseFloat(IMPORTE_FACTURA) * 0.13;
            IMPORTE_FACTURA_CALC = parseFloat(IMPORTE_FACTURA_CALC.toFixed(2));
            this.getView()
              .getModel("localModel")
              .setProperty(
                "/preRegistro/IMPUESTOIMPORTE",
                IMPORTE_FACTURA_CALC
              );
            this.getView()
              .getModel("localModel")
              .setProperty("/preRegistro/IMPORTE", parseFloat(IMPORTE_FACTURA));
          } else {
            this.getView()
              .getModel("localModel")
              .setProperty("/preRegistro/IMPUESTOIMPORTE", 0);

            this.getView()
              .getModel("localModel")
              .setProperty("/preRegistro/IMPORTE", 0);
          }
        },

        onPrepararRegistro: function () {
          console.log("--- onPrepararRegistro ---");
          var sPaths = this.getView().byId("tblPreRegistro")._aSelectedPaths;
          var oList = this.getView()
            .byId("tblPreRegistro")
            .getBinding("items")
            .getModel("localModel");
          var oRegistro = [];
          var oValidarComprobante = false;
          var condiciones = [];
          oRegistro.IMPORTE = 0;

          let IMPUESTOIMPORTE = 0;
          let IMPORTE = 0;

          const self = this;
          const sociedadActual = this.getView()
            .getModel("localModel")
            .getProperty("/sociedadActual");
          const { CODIGO_TIPO_EMISOR } = this.getView()
            .getModel("localModel")
            .getData().infoUsuario;
          sPaths.forEach(function (row) {
            let linea = oList.getProperty(row);
            if (row.NRO_COMPROBANTE !== "") {
              oValidarComprobante = true;
            }

            const aEncontrado = self
              .getView()
              .getModel("localModel")
              .getProperty("/listaPorcentajeIVA")
              .filter(function (item, index) {
                return item.CAMPO == linea.TIPO_IMPUESTO;
              });
            if (aEncontrado.length > 0) {
              oList.getProperty(row).IMPUESTO = parseFloat(
                (
                  parseFloat(oList.getProperty(row).IMPORTE) *
                  (parseFloat(aEncontrado[0].VALOR) / 100)
                ).toFixed(2)
              );
            } else {
              oList.getProperty(row).IMPUESTO = 0;
            }

            IMPUESTOIMPORTE =
              parseFloat(oList.getProperty(row).IMPUESTO) + IMPUESTOIMPORTE;
            IMPORTE = IMPORTE + parseFloat(oList.getProperty(row).IMPORTE);

            oList.getProperty(row).NRO_DOC_ARTICULO =
              oList.getProperty(row).NRO_PARTE_ENTRADA;
            oRegistro.push(oList.getProperty(row));
            oRegistro.TIPODETALLE = oRegistro[0].tipoDetalle;
            oRegistro.CONDICIONPAGO = oRegistro[0].CONDICIONPAGO;
            condiciones.push(oList.getProperty(row).CONDICIONPAGO);
            oRegistro.DESCRIPCION_CONDICION_PAGO = "";
            oRegistro.FECHA_BASE = new Date();
            oRegistro.FECHA_EMISION = new Date();
            oRegistro.TIPO_RETENCION = "";
            oRegistro.CLASE_DOCUMENTO = "01";

            // oRegistro.TIPO_IMPUESTO = oRegistro[0].TIPO_IMPUESTO ?? 'D1';

            // if (sociedadActual == 'PE') {
            //   if (oRegistro[0].TIPO_IMPUESTO) {
            //     oRegistro.TIPO_IMPUESTO = oRegistro[0].TIPO_IMPUESTO;
            //   } else {
            //     oRegistro.TIPO_IMPUESTO = 'C1'; //;
            //   }
            // }

            oRegistro.BLOQUEO_DETRA = oRegistro[0].BLOQUEO_DETRA;
            oRegistro.MONEDA = oRegistro[0].MONEDA;
            // oRegistro.IMPORTE =
            //   parseFloat(oList.getProperty(row).IMPORTE) + parseFloat(oRegistro.IMPORTE) + '';
            oRegistro.IdAnterior = oList.getProperty(row).IdAnterior;
          });

          //condicion mayor
          if (condiciones.length > 1) {
            condiciones.sort(function (a, b) {
              return b - a;
            });
            oRegistro.CONDICIONPAGO = condiciones[0];
          }
          //detraccion
          oRegistro.TIPO_DETRACCION = "";
          // Solo IGV (Total)

          // if (sociedadActual == 'PE') {
          //   if (oRegistro.TIPO_IMPUESTO == 'C0') {
          //     oRegistro.IMPUESTOIMPORTE = parseFloat(0);
          //     oRegistro.IMPORTE = IMPORTE;
          //   } else {
          //     oRegistro.IMPUESTOIMPORTE = IMPUESTOIMPORTE; //parseFloat(oRegistro.IMPORTE) * 0.18;
          //     oRegistro.IMPORTE = IMPUESTOIMPORTE + IMPORTE;
          //   }
          // } else {
          //   oRegistro.IMPUESTOIMPORTE = IMPUESTOIMPORTE;
          //   oRegistro.IMPORTE = IMPUESTOIMPORTE + IMPORTE;
          // }

          oRegistro.IMPUESTOIMPORTE = IMPUESTOIMPORTE;
          oRegistro.IMPORTE = IMPUESTOIMPORTE + IMPORTE;

          //oRegistro.IMPUESTOIMPORTE = parseFloat(oRegistro.IMPORTE) * 0.18;
          // Importe + IGV (Total)

          oRegistro.oValidarComprobante = oValidarComprobante;

          oRegistro.IMPORTE_FACTURA = "0.0";

          oRegistro.IMPORTE_TEXT = "0.0";
          oRegistro.IMPORTE_VISIBLE = true;
          oRegistro.IMPORTE_TEXT_VISIBLE = false;

          if (CODIGO_TIPO_EMISOR == "F") {
            oRegistro.IMPORTE_VISIBLE = false;
            oRegistro.IMPORTE_TEXT_VISIBLE = true;
          }

          return oRegistro;
        },

        onFechaDefault: function () {
          // let datosFiltros = this.getView().getModel("localModel").getProperty("/filtros");
          // let fechacont = moment(new Date(), 'DD/MM/YYYY'); // Crea un objeto Moment.js a partir de la fecha actual
          // let fechamasuno = moment(new Date(), 'DD/MM/YYYY'); // Crea otro objeto Moment.js a partir de la fecha actual

          // // Aumenta un mes a la segunda fecha
          // fechamasuno.setMonth(fechamasuno.getMonth() + 1);

          // datosFiltros.fFechaEmision = fechacont.format('DD/MM/YYYY');
          // datosFiltros.fFechamasuno = fechamasuno.format('DD/MM/YYYY');

          // this.getView().getModel("localModel").setProperty("/filtros", datosFiltros);

          /*let datosFiltros = this.getView().getModel("localModel").getProperty("/filtros");
                let fechacont = new Date(); // Crea un objeto JavaScript Date a partir de la fecha actual
                let fechamasuno = new Date(); // Crea otro objeto JavaScript Date a partir de la fecha actual

                // Aumenta un mes a la segunda fecha
                fechamasuno.setMonth(fechamasuno.getMonth() + 1);

                // Formatea las fechas en el formato 'DD/MM/YYYY'
                let fechacontStr = fechacont.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                let fechamasunoStr = fechamasuno.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

                datosFiltros.fFechaEmision = fechacontStr;
                datosFiltros.fFechamasuno = fechamasunoStr;

                this.getView().getModel("localModel").setProperty("/filtros", datosFiltros);*/

          let datosFiltros = this.getView()
            .getModel("localModel")
            .getProperty("/filtros");
          // let fechacont = moment(new Date(), 'DD/MM/YYYY').add(-1, 'month');
          // let fechamasuno = moment(fechacont, 'DD-MM-YYYY').add(1, 'month');
          const Hoy = new Date();
		  const FEmision = new Date(Hoy.getFullYear(), Hoy.getMonth() - 2, 1);

          datosFiltros.fFechaEmision = moment(FEmision).format("DD/MM/YYYY"); //fechacont.format('DD/MM/YYYY');
          datosFiltros.fFechamasuno = moment(new Date()).format("DD/MM/YYYY"); //fechamasuno.format('DD/MM/YYYY');

          this.getView()
            .getModel("localModel")
            .setProperty("/filtros", datosFiltros);
        },

        onEstadoCambio: function (oEvent) {
          this.buscarGlobalLive();
        },

        getInfoUserBySchema: async function (oEvent) {
          const self = this;
          var oUserInfoModel = sap.ui
            .getCore()
            .getModel("modelInfoUsuario")
            .getProperty("/infoUsuario");

          const oParam = {
            emails: [oUserInfoModel.CORREO],
            // emails: ["demo2@gmail.com"],
          };

          // let response2 = await service.servicePost(
          //   constantes.urlApiGatewayLocal + "base/usuario/obtenerUsuarioInfo",
          //   // "http://localhost:3004/base/usuario/obtenerUsuarioInfo",
          //   oParam,
          //   self
          // );

          let response2 = await service.servicePost(
            "/base/usuario/obtenerUsuarioInfo",
            // "http://localhost:3004/base/usuario/obtenerUsuarioInfo",
            oParam,
            self
          );

          this.getView()
            .getModel("localModel")
            .setProperty("/infoUsuario", response2.results.user[0]);
        },
        onChangeSociedad: async function (oEvent) {
          const oLocalModel = this.getView().getModel("localModel");
          debugger;
          if (oEvent.getParameter("selectedItem") == null) {
            this.getView().byId("proveedorInput").setEnabled(false);
            this.getView().byId("mcRolMainView2").setEnabled(false);
            this.getView()
              .getModel("localModel")
              .setProperty(
                "/ProveedorSeleccionado",
                models.localModel().getData().ProveedorSeleccionado
              );
            this.getView()
              .getModel("localModel")
              .setProperty("/ListaComprobantes", []);
            oLocalModel.setProperty("/ProveedorSeleccionado", null);
            oLocalModel.setProperty("/ProveedorSeleccionadoVisible", false);
            this.getView()
              .getModel("localModel")
              .setProperty("/filtrosEstadoRegistro", []);
          } else {
            var selectedKey = oEvent.getParameter("selectedItem").getKey();
            // Activa todos los ComboBox
            this.getView()
              .getModel("localModel")
              .setProperty("/ListaComprobantes", []);
            oLocalModel.setProperty("/ProveedorSeleccionado", null);
            oLocalModel.setProperty("/ProveedorSeleccionadoVisible", false);

            this.getView().byId("proveedorInput").setEnabled(true);
            this.getView().byId("mcRolMainView2").setEnabled(true);

            await this.obtenerDatosMaestros();

            this.getView()
              .getModel("localModel")
              .setProperty("/datosSociedad", []);

            this.getView()
              .getModel("localModel")
              .setProperty("/sociedadActual", "");

            const listaSociedadesMaestra = this.getView()
              .getModel("localModel")
              .getProperty("/listaSociedadesMaestra");
            const filtroSociedad = oEvent
              .getSource()
              .getSelectedItem()
              .getProperty("key");
            if (listaSociedadesMaestra.length == 0) {
              // MessageBox.warning(
              //   "No se encontró información de la sociedad en las maestras de las sociedades."
              // );
              util.utilPopUps.messageBox(
                "No se encontró información de la sociedad en las maestras de las sociedades.",
                "A",
                function () {}
              );
              return;
            }
            if (filtroSociedad.length == 0) {
              // MessageBox.warning(
              //   "No ha seleccionado la sociedad por favor realizar nuevamente la búsqueda."
              // );
              util.utilPopUps.messageBox(
                "No ha seleccionado la sociedad por favor realizar nuevamente la búsqueda.",
                "A",
                function () {}
              );
              return;
            } else {
              const aEncontrado = listaSociedadesMaestra.filter(function (
                item,
                index
              ) {
                return item.VALOR == filtroSociedad;
              });
              if (aEncontrado.length == 0) {
                // MessageBox.warning(
                //   "No se encontró información de la sociedad seleccionada en las maestras de las sociedades.Por favor, ingresarla en los datos maestros."
                // );
              } else {
                var listaSerieCorrelativo = this.getView()
                  .getModel("localModel")
                  .getProperty("/listaSerieCorrelativo");
                console.log(listaSerieCorrelativo);
                this.getView()
                  .getModel("localModel")
                  .setProperty("/datosSociedad", aEncontrado);

                this.getView()
                  .getModel("localModel")
                  .setProperty(
                    "/sociedadActual",
                    aEncontrado[0].SOCIEDAD_ACTUAL
                  );

                if (aEncontrado[0].SOCIEDAD_ACTUAL == "PE") {
                  const listaDetraccionHomologacionInicial = this.getView()
                    .getModel("localModel")
                    .getProperty("/listaDetraccionHomologacionInicial");

                  this.getView()
                    .getModel("localModel")
                    .setProperty(
                      "/listaDetraccionHomologacion",
                      listaDetraccionHomologacionInicial
                    );
                } else {
                  this.getView()
                    .getModel("localModel")
                    .setProperty("/listaDetraccionHomologacion", []);
                }
              }

              await this.getInfoUserBySchema();
            }
          }
        },

        /** ---------------------- Abrir Fragment Crear Pre Factura ---------------------- */
        onCrearPreFactura: function () {
          this.getView()
            .getModel("localModel")
            .setProperty("/totalSizePdfUploaded", 0);
          let aSeleccionados = this.getView()
            .byId("tblPreRegistro")
            .getSelectedContexts();

          let selectedRowsPreFactura = [];

          if (aSeleccionados.length === 0) {
            // MessageBox.warning("Por favor, elija al menos un registro");
            util.utilPopUps.messageBox(
              "Por favor, elija al menos un registro",
              "A",
              function () {}
            );
            return;
          }

          let sCondicionPagoBase = null;
          let bCondicionPagoDiferente = false;

          aSeleccionados.forEach((element, index) => {
            const path = element.getPath();
            const obj = this.getView().getModel("localModel").getProperty(path);

            if (index === 0) {
              sCondicionPagoBase = obj.CONDICION_PAGO;
            } else if (obj.CONDICION_PAGO !== sCondicionPagoBase) {
              bCondicionPagoDiferente = true;
            }
          });

          if (bCondicionPagoDiferente) {
            util.utilPopUps.messageBox(
              "Los registros seleccionados tienen diferentes condiciones de pago. Por favor seleccione registros con la misma condición de pago.",
              "E",
              function () {}
            );
            return;
          }

          // self.getView().getModel('localModel').getProperty('/sociedadActual')
          // Para leer archivo correo

          const oModel = this.getView().getModel("localModel");
          const aFilasSeleccionadas =
            oModel.getProperty("/filasSeleccionadas") || [];

          if (aFilasSeleccionadas.length > 0) {
            console.log(
              "Adjuntos seleccionados para carga automática:",
              aFilasSeleccionadas
            );

            // Solo usar las filas seleccionadas
            oModel.setProperty(
              "/listaAdjuntosSeleccionados",
              aFilasSeleccionadas
            );
          } else {
            console.log("No hay adjuntos seleccionados.");
            // sap.m.MessageToast.show("No se han seleccionado adjuntos.");
          }

          if (
            this.getView().getModel("localModel").getProperty("/datosSociedad")
              .length == 0
          ) {
            // MessageBox.warning(
            //   "No se encontró información de la sociedad seleccionada en las maestras de las sociedades.Por favor, ingresarla en los datos maestros."
            // );
            util.utilPopUps.messageBox(
              "No se encontró información de la sociedad seleccionada en las maestras de las sociedades.Por favor, ingresarla en los datos maestros.",
              "A",
              function () {}
            );
            return;
          }
          this.getView()
            .getModel("localModel")
            .setProperty("/totalSizePdfUploaded", 0);
          ////////////////////// ////////////////////////////////////////// --------->>>>>>>>> LOGICA COMUN
          /////////////////////////////////////////////////////////////////
          let sociedadActual = this.getView()
            .getModel("localModel")
            .getProperty("/sociedadActual");
          const oRegistro = this.onPrepararRegistro();

          this.getView()
            .getModel("localModel")
            .setProperty("/preRegistro", oRegistro);
          let fImporte = 0;
          let sImporte = "0.00";
          let fIgv = 0;
          let sIgv = "0.00";
          // this.consultarDetraccion();
          this.consultarImpuesto();
          const oNumberFormat = NumberFormat.getFloatInstance({
            minFractionDigits: 2,
            maxFractionDigits: 2,
            decimals: 2,
            groupingEnabled: true,
            groupingSeparator: ",",
            decimalSeparator: ".",
          });
          let fechacont = moment(new Date(), "DD/MM/YYYY");
          let datosCabecera = this.getView()
            .getModel("localModel")
            .getProperty("/datosCabecera");
          datosCabecera.sFechaContable = fechacont.format("DD/MM/YYYY");
          datosCabecera.sFechaEmision = fechacont.format("DD/MM/YYYY");

          //sociedadActual = 'BO';
          //sociedadActual = 'EC';
          ////////////////////// ////////////////////////////////////////// --------->>>>>>>>> LOGICA PERU
          /////////////////////////////////////////////////////////////////
          oRegistro.EDITABLE_DETRACCION = false;

          this.consultarDetraccion();
          oRegistro.EDITABLE_DETRACCION = true;
          aSeleccionados.forEach((element, index) => {
            const path = element.getPath();
            const obj = {
              ...this.getView().getModel("localModel").getProperty(path),
            };
            if (oRegistro.TIPO_IMPUESTO == "C0") {
              obj.IMPUESTO = 0;
            }
            selectedRowsPreFactura.push(obj);
            fImporte = fImporte + parseFloat(obj.IMPORTE);
          });
          if (oRegistro.TIPO_IMPUESTO == "C0") {
            fIgv = 0;
            sImporte = oNumberFormat.format(parseFloat(fImporte).toFixed(2));
            sIgv = oNumberFormat.format(parseFloat(fIgv).toFixed(2));
          } else {
            fIgv = 0.18 * fImporte;
            sImporte = oNumberFormat.format(
              parseFloat(fImporte + fIgv).toFixed(2)
            );
            sIgv = oNumberFormat.format(parseFloat(fIgv).toFixed(2));
          }

          //

          let clasePedido = selectedRowsPreFactura[0].CLASE_PEDIDO;

          let listaOrdenERP = this.getView()
            .getModel("localModel")
            .getProperty("/listaOrdenERP");

          let listaFiltradaERP = listaOrdenERP.filter(
            (item) => item.CAMPO === clasePedido
          );

          // Si necesitas actualizar el modelo o hacer algo con la lista filtrada, hazlo aquí
          console.log(listaFiltradaERP);

          let concat_cod_father_cod_hijo =
            listaFiltradaERP[0].CODIGO_MAESTRO_CABECERA +
            "-" +
            listaFiltradaERP[0].CODIGO_MAESTRO_DETALLE;

          let listaTipoDocumentoHijo = this.getView()
            .getModel("localModel")
            .getProperty("/listaTipoDocumentoHijo");

          let listaTipoDocumento = listaTipoDocumentoHijo.filter(
            (item) =>
              item.concat_cod_father_cod_hijo === concat_cod_father_cod_hijo
          );

          listaTipoDocumento =
            recibirDatos.obtenerDatosMaestrosTipoDocumento(listaTipoDocumento);
          this.getView()
            .getModel("localModel")
            .setProperty("/listaTipoDocumentoGlobal", listaTipoDocumento);

          //
          datosCabecera.sImporte = sImporte;
          datosCabecera.fImporte = fImporte;
          datosCabecera.fIgv = fIgv;
          datosCabecera.sIgv = sIgv;
          this.getView()
            .getModel("localModel")
            .setProperty("/datosCabecera", datosCabecera);
          this.getView()
            .getModel("localModel")
            .setProperty("/selectedRowsPreFactura", selectedRowsPreFactura);
          this.getView().getModel("localModel").refresh(true);

          if (!this.oMPDialogCreatePreFacturaPeru) {
            this.oMPDialogCreatePreFacturaPeru = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.CrearPreFacturaPeru",
            });
          }
          this.oMPDialogCreatePreFacturaPeru.then(
            function (oDialogCrearPreFacturaPeru) {
              this.oDialogCreatePreFacturaPeru = oDialogCrearPreFacturaPeru;
              this.oDialogCreatePreFacturaPeru.open();
            }.bind(this)
          );

          // const listaAdjuntos = this.getView()
          //   .getModel("localModel")
          //   .getProperty("/listaAdjuntos");
          // if (listaAdjuntos.length > 0) {
          //   this.handleFileUploadDocsAutomatico();
          // }
          ////////////////////// ////////////////////////////////////////// --------->>>>>>>>> LOGICA BOLIVIA
          /////////////////////////////////////////////////////////////////
        },

        onCloseCrearPreFacturaPeru: function () {
          this.oDialogCreatePreFacturaPeru.close();
          this.onLimpiarCamposDialogos();
          this.getView().byId("tblPreRegistro").removeSelections();
        },

        onCloseDetallePreFacturaPeru: function () {
          this.oDialogDetallePreFacturaPeru.close();
          this.onLimpiarCamposDialogos();
          this.getView().byId("tblPreRegistro").removeSelections();
        },

        onCloseCrearPreFacturaBolivia: function () {
          this.oDialogCreatePreFacturaBolivia.close();
          this.onLimpiarCamposDialogos();
          this.getView().byId("tblPreRegistro").removeSelections();
        },

        onCloseCrearPreFacturaEcuador: function () {
          this.oDialogCreatePreFacturaEcuador.close();
          this.onLimpiarCamposDialogos();
          this.getView().byId("tblPreRegistro").removeSelections();
        },

        /** ---------------------- Seleccionar proveedor ---------------------- */

        onSelectChangeProveedor: function () {
          const oItem = this.byId("slProveedor").getSelectedItem();
          const itemText = oItem.getText();

          this.getView().byId("objProveedor").setText(itemText);

          this.getView().byId("msgStrip").setVisible(true);
        },

        /** ---------------------- Abrir Popover Motivo Rechazo Pre Factura ---------------------- */
        onShowMotivoRechazoPreFact: function (oEvent) {
          const oButtonMotivoRechazo = oEvent.getSource();
          const oPreFactura = oButtonMotivoRechazo
            .getParent()
            .getBindingContext("localModel");
          const oSelectObj = oPreFactura.getObject();
          this.getView()
            .getModel("localModel")
            .setProperty("/selectedRowPreFactura", oSelectObj);
          if (!this.oPopoverPreFactura) {
            this.oPopoverPreFactura = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.PopoverHistorialRechazo",
            });
          }
          this.oPopoverPreFactura.then(
            function (oPop) {
              this.pPopover = oPop;
              oPop.openBy(oButtonMotivoRechazo);
            }.bind(this)
          );
        },

        /** ---------------------- Abrir Popover Historial Rechazo Pre Factura ---------------------- */
        onShowHistorialRechazoPreFact: async function (oEvent) {
          let RUC = this.getView().getModel("localModel").getData()
            .ProveedorSeleccionado.usuario;
          const oButtonMotivoRechazo = oEvent.getSource();
          const oPreFactura = oButtonMotivoRechazo
            .getParent()
            .getBindingContext("localModel");
          const oSelectObj = oPreFactura.getObject();
          const ruc = RUC;
          const comprobante = oSelectObj.NRO_COMPROBANTE;
          const pedido = oSelectObj.PEDIDO_REFERENCIA;

          const nro_parte_entrada = oSelectObj.NRO_PARTE_ENTRADA;
          const pos_parte_entrada = oSelectObj.POS_PARTE_ENTRADA;

          const historial = await this.consultarHistorialRechazoPorId(
            ruc,
            comprobante,
            pedido,
            nro_parte_entrada,
            pos_parte_entrada
          );

          // Guardamos el historial en el modelo para que el fragment lo use
          // oModel.setProperty("/selectedRowFacturas", historial || []);
          this.getView()
            .getModel("localModel")
            .setProperty("/selectedRowPreFactura", historial);
          if (!this.oPopoverPreFactura) {
            this.oPopoverPreFactura = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.PopoverHistorialRechazo",
            });
          }
          this.oPopoverPreFactura.then(
            function (oPop) {
              this.pPopover = oPop;
              oPop.openBy(oButtonMotivoRechazo);
            }.bind(this)
          );
        },

        closePopoverHistorialRechazo: function () {
          this.byId("myPopoverHistorialRechazo").close();
        },

        /** ---------------------- Abrir Fragment Eliminar Pre Factura ---------------------- */
        onEliminarPreFactura: function () {
          if (!this.oMPDialogDeletePreFactura) {
            this.oMPDialogDeletePreFactura = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.EliminarPreFactura",
            });
          }
          this.oMPDialogDeletePreFactura.then(
            function (oDialogEliminarPreFactura) {
              this.oDialogDeletePreFactura = oDialogEliminarPreFactura;
              this.oDialogDeletePreFactura.open();
            }.bind(this)
          );
        },

        closeDialogEliminarPreFactura: function () {
          this.oDialogDeletePreFactura.close();
        },

        /** ---------------------- Abrir Fragment Exportar Datos ---------------------- */
        onDataExport: function () {
          let that = this;
          let FileName =
            "PreRegistroFactura_" + new Date().toISOString().split("T")[0];
          if (!this.oMPDialogExportData) {
            this.oMPDialogExportData = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.ExportarExcel",
            });
          }
          this.oMPDialogExportData.then(
            function (oDialogExportarData) {
              this.oDialogExportData = oDialogExportarData;
              this.oDialogExportData.open();
              that.getView().byId("fileNameInput").setValue(FileName);
            }.bind(this)
          );
        },
        onCloseExportExcel: function () {
          this.oDialogExportData.close();
        },
        onInicialiarColumansDinamicas: function () {
          const listaColumnas = this.getView()
            .byId("tblPreRegistro")
            .getColumns();
          let lista = [];

          listaColumnas.forEach((element, index) => {
            lista.push({
              idColumnas: element.getId(),
              idConfigColum: "idConfigColum-" + index,
              text: element.mAggregations.header.getProperty("text"),
              visible: true,
            });
          });
          this.getView()
            .getModel("localModel")
            .setProperty("/listaColunasDinamicasXVisiblidad", lista);
        },

        /** ---------------------- Abrir Fragment Configurar Columnas ---------------------- */
        onConfigurarColumnasMejorado: async function () {
          const self = this;

          if (!this.oMPDialogConfigColumn) {
            this.oMPDialogConfigColumn = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.ConfigurarColumnaPreFactura",
            });
          }
          await this.oMPDialogConfigColumn.then(
            function (oDialogConfigurarColumna) {
              this.oDialogConfigColumn = oDialogConfigurarColumna;
              this.oDialogConfigColumn.open();
            }.bind(this)
          );

          const oContentConfigColumns = this.getView().byId(
            "contentConfigColumns"
          );
          oContentConfigColumns.destroyItems();

          this.getView()
            .getModel("localModel")
            .setProperty("/listaColumnasAplicar", []);
          const listaColunasDinamicasXVisiblidad = this.getView()
            .getModel("localModel")
            .getProperty("/listaColunasDinamicasXVisiblidad");

          for (
            let index = 0;
            index < listaColunasDinamicasXVisiblidad.length;
            index++
          ) {
            const element = listaColunasDinamicasXVisiblidad[index];
            var oCheckBox = new sap.m.CheckBox({
              id: element.idConfigColum,
              text: element.text,
              selected: element.visible,
              select: function (oEvent) {},
            });
            oContentConfigColumns.addItem(oCheckBox);
          }
        },
        onConfigurarColumnas: function () {
          if (!this.oMPDialogConfigColumn) {
            this.oMPDialogConfigColumn = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.ConfigurarColumnaPreFactura",
            });
          }
          this.oMPDialogConfigColumn.then(
            function (oDialogConfigurarColumna) {
              this.oDialogConfigColumn = oDialogConfigurarColumna;
              this.oDialogConfigColumn.open();
            }.bind(this)
          );
        },
        onCloseConfigurarColumnas: function () {
          this.oDialogConfigColumn.close();
        },

        /** ---------------------- Configuración de columnas ---------------------- */
        onAplicarConfiguracion: function () {
          const oContentConfigColumns = this.getView().byId(
            "contentConfigColumns"
          );
          let listaColunasDinamicasXVisiblidad = [
            ...this.getView()
              .getModel("localModel")
              .getProperty("/listaColunasDinamicasXVisiblidad"),
          ];

          for (
            let index = 0;
            index < listaColunasDinamicasXVisiblidad.length;
            index++
          ) {
            const element = listaColunasDinamicasXVisiblidad[index];
            this.getView().byId(element.idColumnas).setVisible(true);
          }

          const aContentItems = oContentConfigColumns.getItems();
          for (let index = 0; index < aContentItems.length; index++) {
            const element = aContentItems[index];
            listaColunasDinamicasXVisiblidad[index].visible =
              element.getSelected();
          }
          this.getView()
            .getModel("localModel")
            .setProperty(
              "/listaColunasDinamicasXVisiblidad",
              listaColunasDinamicasXVisiblidad
            );

          for (
            let index = 0;
            index < listaColunasDinamicasXVisiblidad.length;
            index++
          ) {
            const element = listaColunasDinamicasXVisiblidad[index];
            this.getView().byId(element.idColumnas).setVisible(element.visible);
          }

          // const chkParteIngresoPreFact = this.getView().byId('chkParteIngresoPreFact');
          // const idParteIngresoPreFact = this.getView().byId('idParteIngresoPreFact');
          // if (chkParteIngresoPreFact.getSelected() === false) {
          //   idParteIngresoPreFact.setVisible(false);
          // }

          // const chkPosParteEntrada = this.getView().byId('chkPosParteEntradaPreFact');
          // const idPosParteEntradaPreFact = this.getView().byId('idPosParteEntradaPreFact');
          // if (chkPosParteEntrada.getSelected() === false) {
          //   idPosParteEntradaPreFact.setVisible(false);
          // }

          // const chkHojaEntradaPreFact = this.getView().byId('chkHojaEntradaPreFact');
          // const idHojaEntradaPreFact = this.getView().byId('idHojaEntradaPreFact');
          // if (chkHojaEntradaPreFact.getSelected() === false) {
          //   idHojaEntradaPreFact.setVisible(false);
          // }

          // const chkNotaEntregaPreFact = this.getView().byId('chkNotaEntregaPreFact');
          // const idNotaEntregaPreFact = this.getView().byId('idNotaEntregaPreFact');
          // if (chkNotaEntregaPreFact.getSelected() === false) {
          //   idNotaEntregaPreFact.setVisible(false);
          // }

          // const chkFechaContPreFact = this.getView().byId('chkFechaContPreFact');
          // const idFechaContPreFact = this.getView().byId('idFechaContPreFact');
          // if (chkFechaContPreFact.getSelected() === false) {
          //   idFechaContPreFact.setVisible(false);
          // }

          // const chkDescArtServPreFact = this.getView().byId('chkDescArtServPreFact');
          // const idDescripcionArtServPreFact = this.getView().byId('idDescripcionArtServPreFact');
          // if (chkDescArtServPreFact.getSelected() === false) {
          //   idDescripcionArtServPreFact.setVisible(false);
          // }

          // const chkCantEntregaPreFact = this.getView().byId('chkCantEntregaPreFact');
          // const idCantEntregaPreFact = this.getView().byId('idCantEntregaPreFact');
          // if (chkCantEntregaPreFact.getSelected() === false) {
          //   idCantEntregaPreFact.setVisible(false);
          // }

          // const chkImportePreFact = this.getView().byId('chkImportePreFact');
          // const idImportePreFact = this.getView().byId('idImportePreFact');
          // if (chkImportePreFact.getSelected() === false) {
          //   idImportePreFact.setVisible(false);
          // }

          // const chkOrdenCompraPreFact = this.getView().byId('chkOrdenCompraPreFact');
          // const idOrdenCompraPreFact = this.getView().byId('idOrdenCompraPreFact');
          // if (chkImportePreFact.getSelected() === false) {
          //   idImportePreFact.setVisible(false);
          // }

          // const chkOrdenCompraPoscOC = this.getView().byId('chkPoscOCPreFact');
          // const idPoscOCPreFact = this.getView().byId('idPoscOCPreFact');

          // const chkCorrelativoSCPPreFact = this.getView().byId('chkCorrelativoSCPPreFact');
          // const chkEjercicioPreFact = this.getView().byId('chkEjercicioPreFact');
          // const chkMotivoRechazoPreFact = this.getView().byId('chkMotivoRechazoPreFact');
          // const chkFechaRegistroPreFact = this.getView().byId('chkFechaRegistroPreFact');
          // const chkFechaRechazoPreFact = this.getView().byId('chkFechaRechazoPreFact');
          // const chkHistorialRechazoPreFact = this.getView().byId('chkHistorialRechazoPreFact');

          // const idComprobantePreFact = this.getView().byId('idComprobantePreFact');
          // const idCorrelativoSCPPreFact = this.getView().byId('idCorrelativoSCPPreFact');
          // const idEjercicioPreFact = this.getView().byId('idEjercicioPreFact');
          // const idMotivoRechazoPreFact = this.getView().byId('idMotivoRechazoPreFact');
          // const idFechaRegistroPreFact = this.getView().byId('idFechaRegistroPreFact');
          // const idFechaRechazoPreFact = this.getView().byId('idFechaRechazoPreFact');

          // if (chkParteIngresoPreFact.getSelected() === false) {
          //   idParteIngresoPreFact.setVisible(false);
          // } else idParteIngresoPreFact.setVisible(true);

          // if (chkPosParteEntrada.getSelected() === false) {
          //   idPosParteEntrada.setVisible(false);
          // } else idPosParteEntrada.setVisible(true);

          // if (chkHojaEntradaPreFact.getSelected() === false) {
          //   idHojaEntradaPreFact.setVisible(false);
          // } else idHojaEntradaPreFact.setVisible(true);

          // if (chkNotaEntregaPreFact.getSelected() === false) {
          //   idNotaEntregaPreFact.setVisible(false);
          // } else idNotaEntregaPreFact.setVisible(true);

          // if (chkPosPreFact.getSelected() === false) {
          //   idPosPreFact.setVisible(false);
          // } else idPosPreFact.setVisible(true);

          // if (chkFechaContPreFact.getSelected() === false) {
          //   idFechaContPreFact.setVisible(false);
          // } else idFechaContPreFact.setVisible(true);

          // if (chkDescArtServPreFact.getSelected() === false) {
          //   idDescripcionArtServPreFact.setVisible(false);
          // } else idDescripcionArtServPreFact.setVisible(true);

          // if (chkCantEntregaPreFact.getSelected() === false) {
          //   idCantEntregaPreFact.setVisible(false);
          // } else idCantEntregaPreFact.setVisible(true);

          // if (chkImportePreFact.getSelected() === false) {
          //   idImportePreFact.setVisible(false);
          // } else idImportePreFact.setVisible(true);

          // if (chkOrdenCompraPreFact.getSelected() === false) {
          //   idOrdenCompraPreFact.setVisible(false);
          // } else idOrdenCompraPreFact.setVisible(true);

          // if (chkOrdenCompraPoscOC.getSelected() === false) {
          //   idOrdenCompraPoscOC.setVisible(false);
          // } else idOrdenCompraPoscOC.setVisible(true);

          // if (chkCorrelativoSCPPreFact.getSelected() === false) {
          //   idCorrelativoSCPPreFact.setVisible(false);
          // } else idCorrelativoSCPPreFact.setVisible(true);

          // if (chkEjercicioPreFact.getSelected() === false) {
          //   idEjercicioPreFact.setVisible(false);
          // } else idEjercicioPreFact.setVisible(true);

          // if (chkMotivoRechazoPreFact.getSelected() === false) {
          //   idMotivoRechazoPreFact.setVisible(false);
          // } else idMotivoRechazoPreFact.setVisible(true);

          // if (chkFechaRegistroPreFact.getSelected() === false) {
          //   idFechaRegistroPreFact.setVisible(false);
          // } else idFechaRegistroPreFact.setVisible(true);

          // if (chkFechaRechazoPreFact.getSelected() === false) {
          //   idFechaRechazoPreFact.setVisible(false);
          // } else idFechaRechazoPreFact.setVisible(true);

          // if (chkHistorialRechazoPreFact.getSelected() === false) {
          //   idHistorialRechazoPreFact.setVisible(false);
          // } else idHistorialRechazoPreFact.setVisible(true);

          this.onCloseConfigurarColumnas();
        },

        onResetConfiguracion: function () {
          let listaColunasDinamicasXVisiblidad = [
            ...this.getView()
              .getModel("localModel")
              .getProperty("/listaColunasDinamicasXVisiblidad"),
          ];

          for (
            let index = 0;
            index < listaColunasDinamicasXVisiblidad.length;
            index++
          ) {
            const element = listaColunasDinamicasXVisiblidad[index];
            element.visible = true;
            this.getView().byId(element.idColumnas).setVisible(true);
          }

          this.getView()
            .getModel("localModel")
            .setProperty(
              "/listaColunasDinamicasXVisiblidad",
              listaColunasDinamicasXVisiblidad
            );

          this.onCloseConfigurarColumnas();

          // const chkParteIngresoPreFact = this.getView().byId('chkParteIngresoPreFact');
          // const chkHojaEntradaPreFact = this.getView().byId('chkHojaEntradaPreFact');
          // const chkNotaEntregaPreFact = this.getView().byId('chkNotaEntregaPreFact');
          // const chkPosPreFact = this.getView().byId('chkPosPreFact');
          // const chkFechaContPreFact = this.getView().byId('chkFechaContPreFact');
          // const chkDescArtServPreFact = this.getView().byId('chkDescArtServPreFact');
          // const chkCantEntregaPreFact = this.getView().byId('chkCantEntregaPreFact');
          // const chkImportePreFact = this.getView().byId('chkImportePreFact');
          // const chkOrdenCompraPreFact = this.getView().byId('chkOrdenCompraPreFact');
          // const chkNumFacturaPreFact = this.getView().byId('chkNumFacturaPreFact');
          // const chkCorrelativoSCPPreFact = this.getView().byId('chkCorrelativoSCPPreFact');
          // const chkEjercicioPreFact = this.getView().byId('chkEjercicioPreFact');
          // const chkMotivoRechazoPreFact = this.getView().byId('chkMotivoRechazoPreFact');
          // const chkFechaRegistroPreFact = this.getView().byId('chkFechaRegistroPreFact');
          // const chkFechaRechazoPreFact = this.getView().byId('chkFechaRechazoPreFact');
          // const chkHistorialRechazoPreFact = this.getView().byId('chkHistorialRechazoPreFact');

          // chkParteIngresoPreFact.setSelected(true);
          // chkHojaEntradaPreFact.setSelected(true);
          // chkNotaEntregaPreFact.setSelected(true);
          // chkPosPreFact.setSelected(true);
          // chkFechaContPreFact.setSelected(true);
          // chkDescArtServPreFact.setSelected(true);
          // chkCantEntregaPreFact.setSelected(true);
          // chkImportePreFact.setSelected(true);
          // chkOrdenCompraPreFact.setSelected(true);
          // chkNumFacturaPreFact.setSelected(true);
          // chkCorrelativoSCPPreFact.setSelected(true);
          // chkEjercicioPreFact.setSelected(true);
          // chkMotivoRechazoPreFact.setSelected(true);
          // chkFechaRegistroPreFact.setSelected(true);
          // chkFechaRechazoPreFact.setSelected(true);
          // chkHistorialRechazoPreFact.setSelected(true);
        },
        /** ---------------------------- Filtrado On Search ------------------------- */

        onSearch: async function () {
          this.onLimpiarFiltroApplyTabla();
          await this.consultarPartesEntradaProveedor();
        },

        filtering: function (value) {
          const oFilter1 = new sap.ui.model.Filter(
            "NRO_PARTE_ENTRADA",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          const oFilter2 = new sap.ui.model.Filter(
            "HES",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          const oFilter3 = new sap.ui.model.Filter(
            "NRO_GUIA_REMISION",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          const oFilter4 = new sap.ui.model.Filter(
            "FECHA_ENTREGA",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          // const oFilter5 = new sap.ui.model.Filter(
          //   'fechaContable',
          //   sap.ui.model.FilterOperator.Contains,
          //   value
          // );
          const oFilter6 = new sap.ui.model.Filter(
            "DESCRIPCION_ARTICULO",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          const oFilter7 = new sap.ui.model.Filter(
            "CANTIDAD_ENTREGADA",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          // const oFilter8 = new sap.ui.model.Filter(
          //   'importe',
          //   sap.ui.model.FilterOperator.Contains,
          //   value
          // );
          const oFilter9 = new sap.ui.model.Filter(
            "PEDIDO_REFERENCIA",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          const oFilter10 = new sap.ui.model.Filter(
            "NRO_COMPROBANTE",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          const oFilter11 = new sap.ui.model.Filter(
            "CORRELATIVO_SCP",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          const oFilter12 = new sap.ui.model.Filter(
            "EJERCICIO",
            sap.ui.model.FilterOperator.Contains,
            value
          );
          // const oFilter13 = new sap.ui.model.Filter(
          //   'motivoRechazo',
          //   sap.ui.model.FilterOperator.Contains,
          //   value
          // );
          // const oFilter14 = new sap.ui.model.Filter(
          //   'fechaRegistro',
          //   sap.ui.model.FilterOperator.Contains,
          //   value
          // );
          // const oFilter15 = new sap.ui.model.Filter(
          //   'fechaRechazo',
          //   sap.ui.model.FilterOperator.Contains,
          //   value
          // );
          // const oFilter16 = new sap.ui.model.Filter(
          //   'historialRechazo',
          //   sap.ui.model.FilterOperator.Contains,
          //   value
          // );

          const allFilter = new sap.ui.model.Filter(
            [
              oFilter1,
              oFilter2,
              oFilter3,
              oFilter4,
              //oFilter5,
              oFilter6,
              oFilter7,
              //oFilter8,
              oFilter9,
              oFilter10,
              oFilter11,
              oFilter12,
              //oFilter13,
              //oFilter14,
              //oFilter15,
              //oFilter16,
            ],
            false
          );

          if (value == "" || value == " " || value == undefined) {
            allFilter = [
              new sap.ui.model.Filter(
                "CORRELATIVO_SCP",
                sap.ui.model.FilterOperator.Contains,
                ""
              ),
            ];
          }
          const oBinding = this.getView()
            .byId("tblPreRegistro")
            .getBinding("items");
          oBinding.filter(allFilter);
        },
        onLimpiarFiltros: function () {
          const filtrosBase = structuredClone(
            models.localModel().getData().filtros
          );
          this.getView().getModel("localModel").proveedor = "";
          this.getView()
            .getModel("localModel")
            .setProperty("/filtros", filtrosBase);
          // let datosFiltros = this.getView()
          //   .getModel("localModel")
          //   .getProperty("/filtros");
          // datosFiltros.fFechaEmision = moment(new Date()).format("DD/MM/YYYY");
          filtrosBase.fFechaEmision = moment()
			.subtract(2, "months")
			.startOf("month")
			.format("DD/MM/YYYY");
          filtrosBase.fFechamasuno = moment(new Date()).format("DD/MM/YYYY");

          this.getView()
            .getModel("localModel")
            .setProperty("/filtrosEstadoRegistro", []);
          this.getView().getModel("localModel").setProperty("/search", "");

          // this.getView()
          //   .getModel("localModel")
          //   .setProperty("/filtros", datosFiltros);
          this.getView()
            .getModel("localModel")
            .setProperty("/ListaComprobantes", []);

          this.getView()
            .getModel("localModel")
            .setProperty(
              "/paginacionFiltrosUsuario",
              models.localModel().getData().paginacionFiltrosUsuario
            );

          this.getView()
            .getModel("localModel")
            .setProperty(
              "/ProveedorSeleccionado",
              models.localModel().getData().ProveedorSeleccionado
            );

          this.getView()
            .getModel("localModel")
            .setProperty(
              "/ProveedorSeleccionadoVisible",
              models.localModel().getData().ProveedorSeleccionadoVisible
            );

          // this.getView()
          //   .getModel("localModel")
          //   .setProperty("/filtros", models.localModel().getData().filtros);

          this.getView()
            .getModel("localModel")
            .setProperty(
              "/filtrosSociedad",
              models.localModel().getData().filtrosSociedad
            );

          this.getView()
            .getModel("localModel")
            .setProperty(
              "/bEnabledSociedadEncontrada",
              models.localModel().getData().bEnabledSociedadEncontrada
            );

          this.getView()
            .getModel("localModel")
            .setProperty(
              "/datosSociedad",
              models.localModel().getData().datosSociedad
            );

          this.getView()
            .getModel("localModel")
            .setProperty(
              "/sociedadActual",
              models.localModel().getData().sociedadActual
            );

          this.onLimpiarFiltroApplyTabla();

          this.getView().byId("proveedorInput").setEnabled(false);
          this.getView().byId("mcRolMainView2").setEnabled(false);
        },

        onValueHelpCancel: function (oEvent) {
          const oDialog = oEvent.getSource();
          const oLocal = this.getView().getModel("localModel");

          oDialog.clearSelection();

          oLocal.setProperty("/filtros/proveedor", "");
          oLocal.setProperty("/ProveedorSeleccionado", null);

          this.byId("proveedorInput").setValue("");
        },

        onLiveChangeBusqueda: function (oEvent) {
          var sQuery = oEvent.getParameter("newValue");
          this.getView().getModel("localModel").setProperty("/search", sQuery);

          this.buscarGlobalLive();
        },

        /** ----------------------------Limpiar campos a ingresar ------------------------- */

        onLimpiarCamposDialogos: function () {
          this.getView()
            .getModel("localModel")
            .setProperty("/addPreRegistros", {
              parteIngreso: "",
              hojaEntrada: "",
              notaEntrega: "",
              pos: "",
              fechaContable: "",
              descripcionArticuloServicio: "",
              cantidadEntrega: "",
              importe: "",
              ordenCompra: "",
              comprobante: "",
              correlativoSCP: "",
              ejercicio: "",
              motivoRechazo: "",
              fechaRegistro: "",
              fechaRechazo: "",
              historialRechazo: "",
            });

          this.getView().getModel("localModel").refresh(true);
        },

        /** ----------------------------Agregar registros a la tabla Pre Factura ------------------------- */

        onAddPreFactura: function () {
          const parteIngreso = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").parteIngreso;
          const hojaEntrada = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").hojaEntrada;
          const notaEntrega = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").notaEntrega;
          const pos = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").pos;
          const fechaContable = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").fechaContable;
          const descripcionArticuloServicio = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").descripcionArticuloServicio;
          const cantidadEntrega = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").cantidadEntrega;
          const importe = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").importe;
          const ordenCompra = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").ordenCompra;
          const comprobante = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").comprobante;
          const correlativoSCP = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").correlativoSCP;
          const ejercicio = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").ejercicio;
          const motivoRechazo = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").motivoRechazo;
          const fechaRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").fechaRegistro;
          const fechaRechazo = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").fechaRechazo;
          const historialRechazo = this.getView()
            .getModel("localModel")
            .getProperty("/addPreRegistros").historialRechazo;

          let id;
          if (
            this.getView()
              .getModel("localModel")
              .getProperty("/tablaPreRegistros").length === 0
          ) {
            id = 1;
          } else {
            const listaTabla1OrdenadoDesc = this.getView()
              .getModel("localModel")
              .getProperty("/tablaPreRegistros")
              .sort(function (a, b) {
                return b.id - a.id;
              });
            id = listaTabla1OrdenadoDesc[0].id + 1;
          }

          const oProducto = {
            id: id,
            parteIngreso: parteIngreso,
            hojaEntrada: hojaEntrada,
            notaEntrega: notaEntrega,
            pos: pos,
            fechaContable: fechaContable,
            descripcionArticuloServicio: descripcionArticuloServicio,
            cantidadEntrega: cantidadEntrega,
            importe: importe,
            ordenCompra: ordenCompra,
            comprobante: comprobante,
            correlativoSCP: correlativoSCP,
            ejercicio: ejercicio,
            motivoRechazo: motivoRechazo,
            fechaRegistro: fechaRegistro,
            fechaRechazo: fechaRechazo,
            historialRechazo: historialRechazo,
          };
          const oRespuesta = {
            valid: true,
            mensaje: "",
          };
          if (
            parteIngreso <= 0 ||
            hojaEntrada <= 0 ||
            notaEntrega.trim().length === 0 ||
            pos <= 0 ||
            fechaContable.trim().length === 0 ||
            descripcionArticuloServicio.trim().length === 0 ||
            cantidadEntrega <= 0 ||
            importe <= 0 ||
            ordenCompra <= 0 ||
            comprobante.trim().length === 0 ||
            correlativoSCP.trim().length === 0 ||
            ejercicio <= 0 ||
            motivoRechazo.trim().length === 0 ||
            fechaRegistro.trim().length === 0 ||
            fechaRechazo.trim().length === 0 ||
            historialRechazo.trim().length === 0
          ) {
            oRespuesta.valid = false;
            oRespuesta.mensaje = "llena los campos";
            // MessageBox.warning(
            //   "Todos los campos son obligatorios y no se pueden ingresar números menores o iguales a 0"
            // );
            util.utilPopUps.messageBox(
              "Todos los campos son obligatorios y no se pueden ingresar números menores o iguales a 0",
              "A",
              function () {}
            );
            return oRespuesta;
          }
          const tablaPreRegistros = this.getView()
            .getModel("localModel")
            .getProperty("/tablaPreRegistros");
          tablaPreRegistros.push(oProducto);
          this.getView().getModel("localModel").refresh(true);
          // MessageBox.success("Datos ingresados correctamente");
          util.utilPopUps.messageBox(
            "Datos ingresados correctamente",
            "S",
            function () {}
          );
          this.onCloseCrearPreFacturaPeru();
        },

        //configuracion tabla pre Registro (Excel)
        createColumnConfigTablePreRegistro: function () {
          var aCols = [];
          aCols.push({
            label: "Parte de Ingreso",
            property: ["NRO_PARTE_ENTRADA"],
            type: EdmType.Number,
            template: "{0}",
          });

          aCols.push({
            label: "Hoja de Entrada",
            property: ["HES"],
            type: EdmType.String,
            template: "{0}",
          });
          aCols.push({
            label: "Nota de Entrega",
            property: ["NRO_GUIA_REMISION"],
            type: EdmType.String,
            template: "{0}",
          });
          aCols.push({
            label: "Pos",
            property: ["POS_PARTE_ENTRADA"],
            type: EdmType.Number,
            template: "{0}",
          });
          aCols.push({
            label: "Fecha Contable",
            property: ["FECHA_ENTREGA"],
            type: EdmType.Date,
            template: "{0}",
          });

          aCols.push({
            label: "Descripción de Artículo/Servicio",
            property: ["ARTICULO_DESC"],
            type: EdmType.String,
            template: "{0}",
          });

          aCols.push({
            label: "Cantidad de Entrega",
            property: ["CANTIDAD_ENTREGADA"],
            type: EdmType.Number,
            template: "{0}",
          });

          aCols.push({
            label: "Importe",
            property: ["IMPORTE"],
            type: EdmType.Number,
            template: "{0}",
          });
          aCols.push({
            label: "Orden de Compra",
            property: ["PEDIDO_REFERENCIA"],
            type: EdmType.Number,
            template: "{0}",
          });

          aCols.push({
            label: "Comprobante",
            property: ["NRO_COMPROBANTE"],
            type: EdmType.String,
            template: "{0}",
          });

          aCols.push({
            label: "Correlativo SCP",
            property: ["CORRELATIVO_SCP"],
            type: EdmType.String,
            template: "{0}",
          });

          aCols.push({
            label: "Ejercicio",
            property: ["EJERCICIO"],
            type: EdmType.Number,
            template: "{0}",
          });
          aCols.push({
            label: "Motivo de Rechazo",
            property: ["COMENTARIO"],
            type: EdmType.String,
            template: "{0}",
          });
          aCols.push({
            label: "Fecha de Registro",
            property: ["FECHA_REGISTRO"],
            type: EdmType.Date,
            template: "{0}",
          });
          aCols.push({
            label: "Fecha de Rechazo",
            property: ["FECHA_RECHAZO"],
            type: EdmType.Date,
            template: "{0}",
          });
          aCols.push({
            label: "Historial de Rechazo",
            property: ["historialRechazo"],
            type: EdmType.String,
            template: "{0}",
          });
          return aCols;
        },
        //exportar excel
        //excel
        onExportarExcel: function () {
          var oInput = this.getView().byId("fileNameInput");
          var fileName = oInput.getValue();

          var aCols, oRowBinding, oSettings, oSheet, oTable;
          oTable = this.getView().byId("tblPreRegistro");
          oRowBinding = oTable.getBinding("items");
          aCols = this.createColumnConfigTablePreRegistro();

          oSettings = {
            workbook: {
              columns: aCols,
              hierarchyLevel: "Level",
            },
            dataSource: oRowBinding,
            fileName: fileName + ".xlsx",
            worker: false, // We need to disable worker because we are using a MockServer as OData Service
          };

          oSheet = new Spreadsheet(oSettings);
          oSheet.build().finally(function () {
            oSheet.destroy();
          });
          this.onCloseExportExcel();
          oInput.setValue("");
        },

        //adjuntar pdf
        // onAdjuntarPDF: function() {
        //     var that = this;
        //     var oTable = this.getView().byId("tblAdjuntosPeru");
        //     var oRow;

        //     var oFileUploader = new sap.ui.unified.FileUploader({
        //         buttonText: "Adjuntar",
        //         fileType: ["pdf"],
        //         change: function(oEvent) {
        //             var oFile = oEvent.getParameter("files")[0];
        //             var reader = new FileReader();

        //             reader.onload = function(e) {
        //                 var fileData = e.target.result;

        //                 oRow = new sap.m.ColumnListItem({
        //                     cells: [
        //                         new sap.m.Text({ text: oFile.name }),
        //                         new sap.m.Button({
        //                             text: "Eliminar",
        //                             press: function() {
        //                                 oTable.removeItem(oRow);
        //                                 MessageBox.success("Archivo eliminado exitosamente");
        //                             }
        //                         })
        //                     ]
        //                 });

        //                 oTable.addItem(oRow);
        //                 MessageBox.success("Archivo adjuntado exitosamente");
        //                 oDialog.close();

        //             };

        //             reader.readAsDataURL(oFile);
        //         }
        //     });

        //     var oDialog = new sap.m.Dialog({
        //         title: "Adjuntar PDF",
        //         content: [oFileUploader],
        //         beginButton: new sap.m.Button({
        //             text: "Cerrar",
        //             press: function() {
        //                 oDialog.close();
        //             }
        //         }),
        //         afterClose: function() {
        //             oDialog.destroy();
        //         }
        //     });

        //     oDialog.open();
        // }

        onSeleccionFila: async function (oEvent) {
          var self = this;

          // Mostrar la cantidad de elmenetos selectos.
          /*var oLength = self.getView().byId("tablaComprobantes")._aSelectedPaths.length;
        if (oLength > 0) {
          self.getView().byId("btnRegistrar").setType(sap.m.ButtonType.Emphasized);
          self.getView().byId("btnRegistrar").setText("Guardar factura (" + oLength + ")");
        } else {
          self.getView().byId("btnRegistrar").setType(sap.m.ButtonType.Default);
          self.getView().byId("btnRegistrar").setText("Guardar factura");
        }*/

          //MCA : No deja marcar registros con comprobante
          console.log("onSeleccionFila() --- Controla habilitación checkbox");
          var blCheckbox = oEvent.getParameter("selected");
          var oTable = oEvent.getSource();

          //var sPath = oEvent.getParameter("listItem").getBindingContextPath();
          //var iIndice = parseInt(sPath.replace("/ListaComprobantes/",""));

          //var oFilas = oEvent.getParameter("listItem")
          //

          var iIndice = 0;
          const filaObj = oEvent
            .getParameter("listItem")
            .getBindingContext("localModel")
            .getObject();
          var sParteEntrada = filaObj.NRO_PARTE_ENTRADA; //oEvent.getParameter('listItem').mAggregations.cells[0].mProperties.text;
          var sPosicion = "0" + parseInt(filaObj.POS_PARTE_ENTRADA) * 10;

          //oEvent.getParameter('listItem').mAggregations.cells[3].mProperties.text;
          var oListaTabla = self
            .getView()
            .getModel("localModel")
            .getData().ListaComprobantes;
          oListaTabla.forEach(function (elemento, indice) {
            if (
              sParteEntrada === elemento.NRO_PARTE_ENTRADA &&
              sPosicion === "0" + parseInt(elemento.POS_PARTE_ENTRADA) * 10
            ) {
              //if (sParteEntrada === elemento.NRO_PARTE_ENTRADA && sPosicion === elemento.POS_PARTE_ENTRADA) {
              iIndice = indice;
            }
          });

          var iIndiceComprobante = 9;
          var sComprobante = oListaTabla[iIndice].NRO_COMPROBANTE; //oEvent.getSource().getItems()[iIndice].getCells()[iIndiceComprobante].getText();
          var sDocumentoSap = "";
          var sidEstado = "";
          try {
            sDocumentoSap = oListaTabla[iIndice].DOCUMENTOSAP;
            sidEstado = oListaTabla[iIndice].ID_ESTADO_REG_PRELIMINAR_STR;
          } catch (ex) {}

          if (
            blCheckbox &&
            sComprobante !== undefined &&
            sComprobante !== null &&
            sComprobante !== "" &&
            sidEstado != "2" // rechazaso
          ) {
            console.log(
              "No se puede marcar este parte porque ya hay comprobante " +
                sComprobante
            );

            // barre la tabla en busca del indice
            var iPosTable = 0;
            oTable.getItems().forEach(function (elemento, indice) {
              if (
                elemento.getBindingContext("localModel").getObject()
                  .NRO_COMPROBANTE === sComprobante

                // elemento.mAggregations.cells[iIndiceComprobante].mProperties.text === sComprobante
              ) {
                iPosTable = indice;
                oTable.setSelectedItem(oTable.getItems()[iPosTable], false);
              }
            });

            utilPopUps.onMensajeDetalle(
              self,
              "No se puede marcar, ya tiene asociado el comprobante " +
                sComprobante,
              filaObj
            );
            return;
          }

          var proveedor = self
            .getView()
            .getModel("localModel")
            .getProperty("/Proveedor");
          const valid = true; //await this.procesoConsultarValidarPadron(oEvent);
          //models.ValidarPadron(self, proveedor, function (data) {
          if (valid) {
            // Mostrar la cantidad de elmenetos selectos.
            var oLength = self.getView().byId("tblPreRegistro")
              ._aSelectedPaths.length;
            if (oLength > 0) {
              self
                .getView()
                .byId("btnRegistrar")
                .setType(sap.m.ButtonType.Emphasized);
              self
                .getView()
                .byId("btnRegistrar")
                .setText("Guardar factura (" + oLength + ")");
            } else {
              self
                .getView()
                .byId("btnRegistrar")
                .setType(sap.m.ButtonType.Default);
              self.getView().byId("btnRegistrar").setText("Guardar factura");
            }
            sap.ui.core.BusyIndicator.hide();
          } else {
            oTable.getItems().forEach(function (elemento, indice) {
              if (
                elemento.mAggregations.cells[iIndiceComprobante].mProperties
                  .text === sComprobante
              ) {
                iPosTable = indice;
                oTable.setSelectedItem(oTable.getItems()[iPosTable], false);
              }
            });

            utilPopUps.onMessageErrorDialogPressNew(
              data.oAuditResponse.sIdTransaction,
              data.oAuditResponse.sMessage
            );
            sap.ui.core.BusyIndicator.hide();
          }

          //});
        },

        onAdjuntarPDF: function () {
          var that = this;
          var oTable = this.getView().byId("tblAdjuntosPeru");
          var oRow;
          var fileInput = document.createElement("input");
          fileInput.setAttribute("type", "file");
          fileInput.setAttribute("accept", "application/pdf");
          fileInput.addEventListener("change", function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
              var fileData = e.target.result;
              oRow = new ColumnListItem({
                cells: [
                  new Text({ text: oTable.getItems().length + 1 }), // Numero.
                  new Text({ text: file.name }),
                  new Text({ text: "Descripción" }), // Texto descriptivo
                  new Text({ text: "PDF" }), // Tipo
                  new Text({ text: that.formatFileSize(file.size) }), // Tamaño
                  new Button({
                    text: "Eliminar",
                    press: function () {
                      oTable.removeItem(oRow);
                      // MessageBox.success("Archivo eliminado exitosamente");
                      util.utilPopUps.messageBox(
                        "Archivo eliminado exitosamente",
                        "S",
                        function () {}
                      );
                    },
                  }),
                ],
              });
              oTable.addItem(oRow);
              // MessageBox.success("Archivo adjuntado exitosamente");
              util.utilPopUps.messageBox(
                "Archivo adjuntado exitosamente",
                "S",
                function () {}
              );
            };
            reader.readAsDataURL(file);
          });
          fileInput.click();
        },
        formatFileSize: function (size) {
          if (size === 0) return "0 Bytes";
          var k = 1024,
            sizes = ["Bytes", "KB", "MB", "GB", "TB"],
            i = Math.floor(Math.log(size) / Math.log(k));
          return (
            parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
          );
        },
        //adjuntar xml
        onAdjuntarXML: function () {
          debugger;
          var that = this;
          var oTable = this.getView().byId("tblAdjuntosXMLPeru");
          var oRow;

          var fileInput = document.createElement("input");
          fileInput.setAttribute("type", "file");
          fileInput.setAttribute("accept", "application/xml");

          fileInput.addEventListener("change", function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();

            reader.onload = function (e) {
              var fileData = e.target.result;

              oRow = new ColumnListItem({
                cells: [
                  new Text({ text: oTable.getItems().length + 1 }), // Nro.
                  new Text({ text: file.name }), // Nombre documento
                  new Text({ text: "Descripción del documento" }), // Texto descriptivo
                  new Text({ text: "XML" }), // Tipo
                  new Text({ text: that.formatFileSize(file.size) }), // Tamaño
                  new Button({
                    text: "Eliminar",
                    press: function () {
                      oTable.removeItem(oRow);
                      // MessageBox.success("Archivo eliminado exitosamente");
                      util.utilPopUps.messageBox(
                        "Archivo eliminado exitosamente",
                        "S",
                        function () {}
                      );
                    },
                  }),
                ],
              });

              oTable.addItem(oRow);
              // MessageBox.success("Archivo adjuntado exitosamente");
              util.utilPopUps.messageBox(
                "Archivo adjuntado exitosamente",
                "S",
                function () {}
              );
            };

            reader.readAsDataURL(file);
          });

          fileInput.click();
        },

        ////////////////////////// PDF PERU ///////////////////////
        ///////////////////////////////////////////////////////////
        handleFileUpload: function () {
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          var fU = this.getView().byId("idfileUploader");
          var domRef = fU.getFocusDomRef();
          var file =
            domRef.files == undefined ? fU.FUEl.files[0] : domRef.files[0];

          var Data = {};
          Data.nombreArchivo = file.name; //.split(/[\\/]/g).pop().split('.')[0];
          Data.sizeArchivo = (file.size / 1024).toFixed(2);
          Data.fileSize = file.size;
          Data.descriArchivo = file.name;
          Data.tipoArchivo = file.name.split(".").pop().toLowerCase();
          // Validar que el archivo no sea mayor a 10mb.

          let totalSizePdfUploaded = this.getView()
            .getModel("localModel")
            .getProperty("/totalSizePdfUploaded");
          totalSizePdfUploaded =
            parseFloat(Data.fileSize) + totalSizePdfUploaded;

          let { maxMBtotalSizePdfUploaded, maxtotalSizePdfUploaded } =
            this.getView().getModel("localModel").getData();

          if (totalSizePdfUploaded > maxtotalSizePdfUploaded) {
            sap.ui.core.BusyIndicator.hide();
            utilPopUps.messageBox(
              `El suma total del tamaño de todos los PDF cargados supera el tamaño maximo de  ${maxMBtotalSizePdfUploaded}.\n  `,
              "A",
              function () {
                // do nothing...
              }
            );
            return;
          }

          if (Data.fileSize > maxtotalSizePdfUploaded) {
            sap.ui.core.BusyIndicator.hide();
            utilPopUps.messageBox(
              `El documento supera el tamaño maximo ${maxMBtotalSizePdfUploaded}.\n  ` +
                "Tamaño actual es : " +
                (Data.fileSize / 1024).toFixed(2) +
                " Kb.",
              "A",
              function () {
                // do nothing...
              }
            );

            // $.confirm({
            //   title: 'Tamaño máximo',
            //   content:
            //     'El documento supera el tamaño maximo (1024Kb). <br>  ' +
            //     'Tamaño actual es : ' +
            //     (file.size / 1024).toFixed(2) +
            //     ' Kb.',
            //   theme: 'supervan',
            //   buttons: {
            //     Aceptar: function () {
            //       sap.ui.core.BusyIndicator.hide();
            //       this.close();
            //       return false;
            //     },
            //   },
            // });
            return false;
          } else {
            this.getView()
              .getModel("localModel")
              .setProperty("/totalSizePdfUploaded", totalSizePdfUploaded);
          }
          // Create Base64 Object
          var execution = function () {
            if (file) {
              var reader = new FileReader();
              reader.onload = function (readerEvt) {
                var binaryString = readerEvt.target.result.toString();
                Data.FileEncode = btoa(binaryString).toString();
                that.onAdjuntar(Data);
              };
              reader.readAsBinaryString(file);
            }
          }; // Funcion execution
          sap.ui.core.BusyIndicator.show();
          setTimeout(function () {
            execution();
          }, 800);
        },
        // Adjuntar y re-ordenar elementos adjuntos.
        onAdjuntar: function (data) {
          var preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          if (!(preRegistro.dataAttached && preRegistro.dataAttached.length)) {
            preRegistro.dataAttached = [];
          }
          preRegistro.dataAttached.push(data);

          // Reorganizar
          var counter = 0;
          preRegistro.dataAttached.forEach(function (row) {
            row.nro = "0" + (counter + 1) * 10;
            row.index = counter;
            row.XmlEncode = [];
            row.XmlEncode.ARCHIVO = [];
            var Longito = data.FileEncode.length;
            var looper = parseInt(Longito / 100) + 1;
            /*for (var i = 0; i <= looper; i++) {
            var Linea = {
              "ZLINEA": row.FileEncode.substring(i * 100, 100 * i + 100).toString()
            };
            row.XmlEncode.ARCHIVO.push(Linea);
          }*/
            counter++;
          });
          this.getView()
            .getModel("localModel")
            .setProperty("/preRegistro", preRegistro);
          //this.getView().setModel(new JSONModel(preRegistro), "preRegistro");
          sap.ui.core.BusyIndicator.hide();
        },
        // Eliminar adjunto.
        onpressEliminar: function (oEvent) {
          const self = this;
          var preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          var IndexOf = oEvent.getSource().data("indexOf");

          let sizeArchivo = parseFloat(
            oEvent.getSource().getBindingContext("localModel").getObject()
              .fileSize
          );
          utilPopUps.messageBox(
            "¿Esta seguro que desea eliminar el PDF?.",
            "C",
            function () {
              // totalSizePdfUploaded
              let totalSizePdfUploaded = self
                .getView()
                .getModel("localModel")
                .getProperty("/totalSizePdfUploaded");

              let lastTotalSizePdfUploaded = totalSizePdfUploaded - sizeArchivo;

              self
                .getView()
                .getModel("localModel")
                .setProperty("/totalSizePdfUploaded", lastTotalSizePdfUploaded);
              preRegistro.dataAttached.splice(IndexOf, 1);

              self.getView().getModel("localModel").refresh();
            }
          );
        },
        // Validar tipo de documento (extension)
        handleTypeMissmatch: function (oEvent) {
          var aFileTypes = oEvent.getSource().getFileType();
          jQuery.each(aFileTypes, function (key, value) {
            aFileTypes[key] = "*." + value;
          });
          var sSupportedFileTypes = aFileTypes.join(", ");
          sap.m.MessageToast.show(
            "El tipo de documento *." +
              oEvent.getParameter("fileType") +
              " no es soportado. Seleccione unicamente los siguientes tipos : " +
              sSupportedFileTypes
          );
        },

        /////////////////////////////////////////////////////////// ------------>>>>>>>>>>>  XML PERU
        ///////////////////////////////////////////////////////////
        ////////// DATOS ARCHVIVO XML /////////
        handleFileUploadXMLPeru: function () {
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          var fU = this.getView().byId("idfileUploaderXML");
          var domRef = fU.getFocusDomRef();
          var file =
            domRef.files == undefined ? fU.FUEl.files[0] : domRef.files[0];
          var Data = {};
          Data.nombreArchivoXML = file.name; //.split(/[\\/]/g).pop().split('.')[0].replace(/ /g, '');
          Data.sizeArchivoXML = (file.size / 1024).toFixed(2);
          Data.descriArchivoXML = file.name.replace(/ /g, "");
          Data.tipoArchivoXML = file.name.split(".").pop().toLowerCase();
          // Validar que el archivo no sea mayor a 10mb.
          if (file.size > 1000000) {
            $.confirm({
              title: "Tamaño máximo",
              content:
                "El documento supera el tamaño maximo (1024Kb). <br>  " +
                "Tamaño actual es : " +
                (file.size / 1024).toFixed(2) +
                " Kb.",
              theme: "supervan",
              buttons: {
                Aceptar: function () {
                  sap.ui.core.BusyIndicator.hide();
                  this.close();
                  return false;
                },
              },
            });
            return false;
          }
          // Create Base64 Object
          var execution = function () {
            if (file) {
              var reader = new FileReader();
              reader.onload = function (readerEvt) {
                var binaryString = readerEvt.target.result.toString();
                Data.FileEncode = btoa(binaryString).toString();

                that.onAdjuntarXMLPeru(Data, binaryString);
              };
              reader.readAsBinaryString(file);
            }
          }; // Funcion execution
          sap.ui.core.BusyIndicator.show();
          setTimeout(function () {
            execution();
          }, 800);
        },
        onAdjuntarXMLPeru: async function (data, dataxml) {
          debugger;
          var self = this;

          //JC
          self._LongSerie = self
            .getView()
            .getModel("localModel")
            .getProperty("/LONGSERIE"); // 5;
          self._LongCorrelativo = self
            .getView()
            .getModel("localModel")
            .getProperty("/LONGCORRELATIVO"); //7;
          self
            .getView()
            .setModel(new sap.ui.model.json.JSONModel([]), "modelLog");
          var estados_comprobante = this.getView()
            .getModel("localModel")
            .getProperty("/EstadosComprobante");
          var estados_ruc = this.getView()
            .getModel("localModel")
            .getProperty("/EstadosRuc");
          var estados_domicilio = this.getView()
            .getModel("localModel")
            .getProperty("/EstadosDomicilio");
          var constantes = this.getView()
            .getModel("localModel")
            .getProperty("/Constantes");
          var flagComprobante = false;
          var flagRuc = false;
          var flagDomicilio = false;
          var diferencia = 0;
          var preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          var rucLogin = this.getView().getModel("localModel").getData()
            .ProveedorSeleccionado.usuario;
          //this.getView().getModel('localModel').getProperty('/infoUsuario').USUARIO;

          // var datos_usuario = this.getView().getModel('localModel').getProperty('/infoUsuario');
          var datos_usuario = this.getView()
            .getModel("localModel")
            .getProperty("/ProveedorSeleccionado");

          //FISICO
          if (datos_usuario.CODIGO_TIPO_EMISOR == "F") {
            //util.popups.showToast("Error", "Tipo de Emisor Fisico, no se permite adjuntar XML", 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "Tipo de Emisor Fisico, no se permite adjuntar XML"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }

          var formatPad = function (num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
          };

          //VALORES DEL XML
          var parser = new DOMParser();
          try {
            // Try to convert to utf-8
            dataxml = decodeURIComponent(escape(dataxml)).trim();
            // If the conversion succeeds, text is not utf-8
          } catch (e) {
            dataxml = dataxml;
          }
          dataxml = dataxml.replace(
            /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm,
            ""
          );
          var xmlDoc = parser.parseFromString(dataxml, "text/xml");
          var oModelX = new sap.ui.model.xml.XMLModel();
          _registerXmlNamespaces(oModelX, xmlDoc);
          oModelX.attachRequestCompleted(function () {
            var xmlStr = oModelX.getXML();
            //console.log(xmlStr); // Do what ever you want with your xml string
          });
          oModelX.setData(xmlDoc);
          //console.log("MODELO", oModelX);

          //---amayuri 26/11/2021
          var oSerializer = new XMLSerializer();
          var sXML = oSerializer.serializeToString(xmlDoc);

          if (sXML.includes(rucLogin)) {
            var rucXml = rucLogin; // se hace la validacion con el ruc logeado
          } else {
            // XML no válido, RUC del XML no coincide con el RUC del usuario logueado
            var oLocalModel = this.getView().getModel("localModel");
            var preRegistro = oLocalModel.getProperty("/preRegistro");

            // 🔹 Limpiar solo los campos necesarios
            preRegistro.NRO_SERIE = "";
            preRegistro.NRO_COMPROBANTE = "";
            preRegistro.TIPO_DETRACCION = "";
            preRegistro.Editable = true;
            preRegistro.EDITABLE_DETRACCION = true;
            preRegistro.FECHA_EMISION = new Date();

            oLocalModel.setProperty("/preRegistro", preRegistro);
            oLocalModel.refresh();
            //util.popups.showToast("Error", "XML no válido, RUC del XML no coincide con el RUC del usuario logueado", 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "XML no válido, RUC del XML no coincide con el RUC del Proveedor Seleccionado"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          //---

          // cvc se comenta
          /*var rucXml = oModelX.getProperty("/cac:Signature/cbc:ID");
        let isnum = /^\d+$/.test(rucXml);
        if (rucXml.length != 11 || isnum == false) {
          rucXml = oModelX.getProperty("/cac:Signature/cac:SignatoryParty/cac:PartyIdentification/cbc:ID");
        }*/
          //end cvc

          var fechaXml = oModelX.getProperty("/cbc:IssueDate");
          var importeXml = oModelX.getProperty(
            "/cac:LegalMonetaryTotal/cbc:PayableAmount"
          );
          var monedaXml = oModelX.getProperty("/cbc:DocumentCurrencyCode");
          var serieCorrelativoXml = oModelX.getProperty("/cbc:ID");
          var rucSociedad = oModelX.getProperty(
            "/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID"
          );
          let TIPO_DETRACCION_DEFAULT = null;
          let EDITABLE_DETRACCION = true;

          if (
            this.getView()
              .getModel("localModel")
              .getProperty("/sociedadActual") == "PE"
          ) {
            var codDetraccion = oModelX.getProperty(
              "/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/biz:AdditionalInformation/cac:PaymentTerms/cbc:PaymentMeansID"
            );
            if (!codDetraccion) {
              var codDetraccion2 = oModelX.getProperty(
                "/cac:PaymentTerms/cbc:PaymentMeansID"
              );
              codDetraccion = codDetraccion2;
            }

            if (codDetraccion.length > 0) {
              const aEcontrado = this.getView()
                .getModel("localModel")
                .getProperty("/listaDetraccionHomologacion")
                .filter(function (item, index) {
                  return item.CODIGO_MAESTRO_DETALLE == codDetraccion;
                });
              if (aEcontrado.length > 0) {
                // utilPopUps.messageBox(
                //   'No se encontró información de la detracción del xml. Por favor, registrarla en la tabla de homologación',
                //   'A',
                //   function () {
                //     // do nothing...
                //   }
                // );
                // } else {
                const { CAMPO, VALOR } = aEcontrado[0] || {};
                TIPO_DETRACCION_DEFAULT =
                  CAMPO && VALOR ? `${CAMPO}-${VALOR}` : CAMPO || VALOR || "";
                EDITABLE_DETRACCION = false;
              }
            }
          }

          //var listaRucSociedades = this.getView().getModel("localModel").getProperty("/RucSociedades");
          var datosSociedad = this.getView()
            .getModel("localModel")
            .getProperty("/datosSociedad");
          //Validacion del ruc por sociedad
          var flagErrorRucSociedad = false;

          if (rucSociedad != datosSociedad[0].CAMPO) {
            flagErrorRucSociedad = true;
          }

          if (flagErrorRucSociedad) {
            utilPopUps.onMessageWarningDialogPress3(
              "Ruc de sociedad no valido"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          //Fin validacion
          if (serieCorrelativoXml != undefined) {
            if (
              (rucXml == undefined || rucXml == "") &&
              serieCorrelativoXml[0] == "E"
            ) {
              rucXml = this.getView().getModel("localModel").getData()
                .ProveedorSeleccionado.usuario;
              //this.getView().getModel('localModel').getProperty('/infoUsuario').USUARIO;
            }
          }

          if (
            rucXml == undefined ||
            rucXml == "" ||
            fechaXml == undefined ||
            fechaXml == "" ||
            importeXml == undefined ||
            importeXml == "" ||
            monedaXml == undefined ||
            monedaXml == "" ||
            serieCorrelativoXml == undefined ||
            serieCorrelativoXml == ""
          ) {
            //util.popups.showToast("Error", "XML no válido, no cuenta con los datos necesarios", 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "XML no válido, no cuenta con los datos necesarios"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          //VALIDAR MONEDA E IMPORTE
          //validar consntante de diferencia

          constantes.forEach(function (c) {
            if (c.CAMPO == "diferenciaMonto") {
              diferencia = c.VALOR;
            }
          });
          var importePantalla = this.getView()
            .byId("IMPORTE")
            .getValue()
            .replace(",", "");
          importePantalla = importePantalla.replace("'", "");
          var diferenciaReal = Math.abs(
            (parseFloat(importeXml) - parseFloat(importePantalla)).toFixed(2)
          );
          if (
            !(monedaXml == preRegistro.MONEDA && diferenciaReal <= diferencia)
          ) {
            //util.popups.showToast("Error", "XML no válido, Importe y/o Moneda diferente. " + importeXml + " " + monedaXml, 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "XML no válido, Importe y/o Moneda diferente. "
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }

          var datos = {
            numRuc: rucXml,
            sRuc: rucXml,
            sociedad: this.getView()
              .getModel("localModel")
              .getProperty("/filtrosSociedad"),
            codComp: "01",
            numeroSerie: serieCorrelativoXml.split("-")[0].replace(/^0+/, ""),
            numero: serieCorrelativoXml.split("-")[1].replace(/^0+/, ""),
            fechaEmision: fechaXml.split("-").reverse().join("/"),
            monto: importeXml,
            rucSociedad: this.getView()
              .getModel("localModel")
              .getProperty("/datosSociedad")[0].VALOR,
          };

          /// PRUEBA
          // var datos =
          // {
          //   "numRuc": "10077006309",
          //   "codComp": "01",
          //   "numeroSerie": "F003",
          //   "numero": "39426",
          //   "fechaEmision": "05/08/2023",
          //   "monto": "16.00"
          // }
          //

          let consultarSunatResponse = await self.consultarSunat(datos);

          //models.ValidarComprobante(self, datos, function (dataresponse) {
          if (consultarSunatResponse.code === 1) {
            var aMensajes = [];
            var oMensaje = {};
            var response = consultarSunatResponse.results.consultarSunat;
            if (Object.keys(response).length < 3) {
              sap.ui.core.BusyIndicator.hide();

              utilPopUps.onMessageWarningDialogPress3(
                "No se logró validar el XML por demora del Servidor SUNAT. Por favor, intentarlo más tarde."
              );
              return;
            }
            //estadoCp
            oMensaje = {};
            oMensaje.item = 1;
            oMensaje.sMessage = "Estado de Comprobante";
            var aUniEstado = estados_comprobante.filter(function (item) {
              return item.CAMPO == response.estadoCp;
            });
            if (aUniEstado.length > 0) {
              if (aUniEstado[0].DESCRIPCION == "OK") {
                oMensaje.estado =
                  aUniEstado[0].CAMPO + " " + aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://accept";
                oMensaje.state = "Success";
                flagComprobante = true;
              } else {
                oMensaje.estado = aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://error";
                oMensaje.state = "Error";
              }
            } else {
              oMensaje.estado = "Sin Respuesta";
              oMensaje.icon = "sap-icon://alert";
              oMensaje.state = "Warning";
            }
            aMensajes.push(oMensaje);

            //estadoRuc
            oMensaje = {};
            oMensaje.item = 2;
            oMensaje.sMessage = "Estado de Contribuyente";
            var aUniEstado = estados_ruc.filter(function (item) {
              return item.CAMPO == response.estadoRuc;
            });
            if (aUniEstado.length > 0) {
              if (aUniEstado[0].DESCRIPCION == "OK") {
                oMensaje.estado =
                  aUniEstado[0].CAMPO + " " + aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://accept";
                oMensaje.state = "Success";
                flagRuc = true;
              } else {
                oMensaje.estado = aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://error";
                oMensaje.state = "Error";
              }
            } else {
              oMensaje.estado = "Sin Respuesta";
              oMensaje.icon = "sap-icon://alert";
              oMensaje.state = "Warning";
            }
            aMensajes.push(oMensaje);

            //Domicilio
            oMensaje = {};
            oMensaje.item = 3;
            oMensaje.sMessage = "Condicion de Domicilio Contribuyente";
            var aUniEstado = estados_domicilio.filter(function (item) {
              return item.CAMPO == response.condDomiRuc;
            });
            if (aUniEstado.length > 0) {
              if (aUniEstado[0].DESCRIPCION == "OK") {
                oMensaje.estado =
                  aUniEstado[0].CAMPO + " " + aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://accept";
                oMensaje.state = "Success";
                flagDomicilio = true;
              } else {
                oMensaje.estado = aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://error";
                oMensaje.state = "Error";
              }
            } else {
              oMensaje.estado = "Sin Respuesta";
              oMensaje.icon = "sap-icon://alert";
              oMensaje.state = "Warning";
            }
            aMensajes.push(oMensaje);

            if (flagComprobante && flagRuc && flagDomicilio) {
              preRegistro.NRO_SERIE = serieCorrelativoXml.split("-")[0];
              preRegistro.NRO_SERIE = preRegistro.NRO_SERIE.replace(/\s/g, "");
              preRegistro.NRO_SERIE = preRegistro.NRO_SERIE.replace(/^0+/, "");
              preRegistro.NRO_SERIE = formatPad(
                preRegistro.NRO_SERIE,
                self._LongSerie
              );
              preRegistro.NRO_COMPROBANTE = serieCorrelativoXml.split("-")[1];
              preRegistro.NRO_COMPROBANTE = preRegistro.NRO_COMPROBANTE.replace(
                /\s/g,
                ""
              );
              preRegistro.NRO_COMPROBANTE = preRegistro.NRO_COMPROBANTE.replace(
                /^0+/,
                ""
              );
              preRegistro.NRO_COMPROBANTE = formatPad(
                preRegistro.NRO_COMPROBANTE,
                self._LongCorrelativo
              );
              preRegistro.FECHA_EMISION = new Date(
                fechaXml.split("-").join("/")
              );
              preRegistro.Editable = false;

              preRegistro.IMPORTE = importeXml;

              if (TIPO_DETRACCION_DEFAULT !== null) {
                this.getView()
                  .getModel("localModel")
                  .setProperty(
                    "/preRegistro/TIPO_DETRACCION",
                    TIPO_DETRACCION_DEFAULT
                  );

                this.getView()
                  .getModel("localModel")
                  .setProperty(
                    "/preRegistro/EDITABLE_DETRACCION",
                    EDITABLE_DETRACCION
                  );
              }

              //ADJUNTAR ARCHIVO
              data.dataxml = dataxml;
              if (
                !(
                  preRegistro.dataAttachedXML &&
                  preRegistro.dataAttachedXML.length
                )
              ) {
                preRegistro.dataAttachedXML = [];
              }
              preRegistro.dataAttachedXML.push(data);

              // Reorganizar
              var counter = 0;
              preRegistro.dataAttachedXML.forEach(function (row) {
                row.nroXML = "0" + (counter + 1) * 10;
                row.indexXML = counter;
                row.XmlEncode = [];
                row.XmlEncode.ARCHIVO = [];
                var Longito = data.FileEncode.length;
                var looper = parseInt(Longito / 100) + 1;
                /*for (var i = 0; i <= looper; i++) {
                var Linea = {
                  "ZLINEA": row.FileEncode.substring(i * 100, 100 * i + 100).toString()
                };
                row.XmlEncode.ARCHIVO.push(Linea);
              }*/
                counter++;
              });
              self
                .getView()
                .getModel("localModel")
                .setProperty("/preRegistro", preRegistro);
              self.getView().getModel("localModel").refresh();
              sap.m.MessageToast.show("Se toman datos de XML");
              //util.popups.showToast("Información", "Se toman datos de XML", 4, false, "bottomCenter");
            } else {
              //util.popups.showToast("Error", "No se toman datos de XML, Verificar Datos de Sunat", 2, false, "bottomCenter");
              utilPopUps.onMessageWarningDialogPress3(
                "No se toman datos de XML, Verificar Datos de Sunat"
              );
            }

            self.getView().getModel("modelLog").setData(aMensajes);
            self._getDialog().open();

            sap.ui.core.BusyIndicator.hide();
          } else {
            //
            if (consultarSunatResponse.message.includes("404")) {
              // util.popups.showToast("Por favor reintentar en unos minutos, ", "Servicio Sunat no disponible  \n" + dataresponse.oAuditResponse
              //   .sMessage, 2, true);
              utilPopUps.onMessageWarningDialogPress3(
                "Por favor reintentar en unos minutos, ",
                "Servicio Sunat no disponible"
              );
            } else {
              //util.popups.showToast("Error", "Error al comprobar Comprobante Sunat \n" + dataresponse.oAuditResponse.sMessage, 2, true);
              utilPopUps.onMessageWarningDialogPress3(
                "Error al comprobar Comprobante Sunat \n" +
                  consultarSunatResponse.message
              );
            }
            sap.ui.core.BusyIndicator.hide();
          }

          //});
          return;
        },

        /////////////////////////////////////////////////////////// ------------>>>>>>>>>>>  XML ECUADOR
        ///////////////////////////////////////////////////////////
        ////////// DATOS ARCHVIVO XML /////////
        handleFileUploadXMLEcuador: function () {
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          var fU = this.getView().byId("idfileUploaderXML");
          var domRef = fU.getFocusDomRef();
          var file =
            domRef.files == undefined ? fU.FUEl.files[0] : domRef.files[0];
          var Data = {};
          Data.nombreArchivoXML = file.name; //.split(/[\\/]/g).pop().split('.')[0].replace(/ /g, '');
          Data.sizeArchivoXML = (file.size / 1024).toFixed(2);
          Data.descriArchivoXML = file.name.replace(/ /g, "");
          Data.tipoArchivoXML = file.name.split(".").pop().toLowerCase();
          // Validar que el archivo no sea mayor a 10mb.
          if (file.size > 1000000) {
            $.confirm({
              title: "Tamaño máximo",
              content:
                "El documento supera el tamaño maximo (1024Kb). <br>  " +
                "Tamaño actual es : " +
                (file.size / 1024).toFixed(2) +
                " Kb.",
              theme: "supervan",
              buttons: {
                Aceptar: function () {
                  sap.ui.core.BusyIndicator.hide();
                  this.close();
                  return false;
                },
              },
            });
            return false;
          }
          // Create Base64 Object
          var execution = function () {
            if (file) {
              var reader = new FileReader();
              reader.onload = function (readerEvt) {
                var binaryString = readerEvt.target.result.toString();
                Data.FileEncode = btoa(binaryString).toString();

                that.onAdjuntarXMLEcuador(Data, binaryString);
              };
              reader.readAsBinaryString(file);
            }
          }; // Funcion execution
          sap.ui.core.BusyIndicator.show();
          setTimeout(function () {
            execution();
          }, 800);
        },

        // Eliminar adjunto.
        onpressEliminarXML: function (oEvent) {
          var preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          var IndexOf = oEvent.getSource().data("indexOf");
          preRegistro.dataAttachedXML = [];
          preRegistro.NRO_SERIE = "";
          preRegistro.NRO_COMPROBANTE = "";
          preRegistro.FECHA_EMISION = new Date();
          preRegistro.Editable = true;
          preRegistro.EDITABLE_DETRACCION = true;

          const sociedadActual = this.getView()
            .getModel("localModel")
            .getProperty("/sociedadActual");
          let IMPUESTOIMPORTE = 0;
          let IMPORTE = 0;
          if (sociedadActual == "BO") {
            let selectedRowsPreFactura = this.getView()
              .getModel("localModel")
              .getData().selectedRowsPreFactura;
            selectedRowsPreFactura.forEach((element) => {
              IMPORTE = IMPORTE + parseFloat(element.IMPORTE);
            });
            preRegistro.IMPORTE = IMPORTE;
            preRegistro.IMPUESTOIMPORTE = IMPUESTOIMPORTE;
          }

          this.getView().getModel("localModel").refresh();
        },

        /********************PDF***************** */
        // handleFileUploadPrueba: function () {
        //   sap.ui.core.BusyIndicator.show(0);
        //   var that = this;
        //   var fU = this.getView().byId("idfileUploaderDocs");
        //   var domRef = fU.getFocusDomRef();
        //   var file =
        //     domRef.files == undefined ? fU.FUEl.files[0] : domRef.files[0];

        //   var Data = {};
        //   Data.nombreArchivoDoc = file.name; //.split(/[\\/]/g).pop().split('.')[0];
        //   Data.sizeArchivoDoc = (file.size / 1024).toFixed(2);
        //   Data.fileSizeDoc = file.size;
        //   Data.descriArchivoDoc = file.name;
        //   Data.tipoArchivoDoc = file.name.split(".").pop().toLowerCase();
        //   Data.tipoArchivoDocPrueba = file.name.split(".").pop().toUpperCase();
        //   Data.selectClaseDoc = "";
        //   Data.enabledSelectClaseDoc = true;
        //   Data.listaTipoDocumento = [];
        //   // Validar que el archivo no sea mayor a 10mb.
        //   //TOOD:REVISAR

        //   const aEncontrado = this.getView()
        //     .getModel("localModel")
        //     .getData()
        //     .listaAdjuntosTipoArchivoXTipoEmisor.filter(function (item, index) {
        //       return item.DESCRIPCION == Data.tipoArchivoDoc.toUpperCase();
        //     });
        //   const listaTipoDocumentoGlobal = this.getView()
        //     .getModel("localModel")
        //     .getData().listaTipoDocumentoGlobal;

        //   if (aEncontrado.length == 1) {
        //     Data.enabledSelectClaseDoc = false;
        //     Data.selectClaseDoc = aEncontrado[0].VALOR;
        //     Data.listaTipoDocumento = listaTipoDocumentoGlobal.filter(function (
        //       item,
        //       index
        //     ) {
        //       return item.key == aEncontrado[0].VALOR;
        //     });
        //   } else {
        //     Data.listaTipoDocumento.push({
        //       key: "",
        //       text: "--Seleccione--",
        //     });
        //     for (let index = 0; index < aEncontrado.length; index++) {
        //       const element = aEncontrado[index];

        //       const aEncontradoDoc = listaTipoDocumentoGlobal.filter(function (
        //         item,
        //         index
        //       ) {
        //         return item.key == element.VALOR;
        //       });
        //       if (aEncontradoDoc.length > 0) {
        //         Data.listaTipoDocumento.push(aEncontradoDoc[0]);
        //       }
        //     }
        //   }

        //   let totalSizePdfUploaded = this.getView()
        //     .getModel("localModel")
        //     .getProperty("/totalSizePdfUploaded");
        //   totalSizePdfUploaded =
        //     parseFloat(Data.fileSize) + totalSizePdfUploaded;

        //   let { maxMBtotalSizePdfUploaded, maxtotalSizePdfUploaded } =
        //     this.getView().getModel("localModel").getData();

        //   if (totalSizePdfUploaded > maxtotalSizePdfUploaded) {
        //     sap.ui.core.BusyIndicator.hide();
        //     utilPopUps.messageBox(
        //       `El suma total del tamaño de todos los PDF cargados supera el tamaño maximo de  ${maxMBtotalSizePdfUploaded}.\n  `,
        //       "A",
        //       function () {
        //         // do nothing...
        //       }
        //     );
        //     return;
        //   }

        //   if (Data.fileSize > maxtotalSizePdfUploaded) {
        //     sap.ui.core.BusyIndicator.hide();
        //     utilPopUps.messageBox(
        //       `El documento supera el tamaño maximo ${maxMBtotalSizePdfUploaded}.\n  ` +
        //         "Tamaño actual es : " +
        //         (Data.fileSize / 1024).toFixed(2) +
        //         " Kb.",
        //       "A",
        //       function () {
        //         // do nothing...
        //       }
        //     );

        //     // $.confirm({
        //     //   title: 'Tamaño máximo',
        //     //   content:
        //     //     'El documento supera el tamaño maximo (1024Kb). <br>  ' +
        //     //     'Tamaño actual es : ' +
        //     //     (file.size / 1024).toFixed(2) +
        //     //     ' Kb.',
        //     //   theme: 'supervan',
        //     //   buttons: {
        //     //     Aceptar: function () {
        //     //       sap.ui.core.BusyIndicator.hide();
        //     //       this.close();
        //     //       return false;
        //     //     },
        //     //   },
        //     // });
        //     return false;
        //   } else {
        //     this.getView()
        //       .getModel("localModel")
        //       .setProperty("/totalSizePdfUploaded", totalSizePdfUploaded);
        //   }
        //   // Create Base64 Object
        //   var execution = function () {
        //     if (file) {
        //       var reader = new FileReader();
        //       reader.onload = function (readerEvt) {
        //         var binaryString = readerEvt.target.result.toString();
        //         Data.FileEncode = btoa(binaryString).toString();
        //         that.onAdjuntarPDFPrueba(Data);
        //       };
        //       reader.readAsBinaryString(file);
        //     }
        //   }; // Funcion execution
        //   sap.ui.core.BusyIndicator.show();
        //   setTimeout(function () {
        //     execution();
        //   }, 800);
        // },

        handleFileUploadPrueba: function () {
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          var fU = this.getView().byId("idfileUploaderDocs");
          var domRef = fU.getFocusDomRef();
          var file =
            domRef.files == undefined ? fU.FUEl.files[0] : domRef.files[0];

          var Data = {};
          Data.nombreArchivoDoc = file.name; //.split(/[\\/]/g).pop().split('.')[0];
          Data.sizeArchivoDoc = (file.size / 1024).toFixed(2);
          Data.fileSizeDoc = file.size;
          Data.descriArchivoDoc = file.name;
          Data.tipoArchivoDoc = file.name.split(".").pop().toLowerCase();
          Data.tipoArchivoDocPrueba = file.name.split(".").pop().toUpperCase();
          Data.selectClaseDoc = "";
          Data.enabledSelectClaseDoc = true;
          Data.listaTipoDocumento = [];
          // Validar que el archivo no sea mayor a 10mb.

          const aEncontrado = this.getView()
            .getModel("localModel")
            .getData()
            .listaAdjuntosTipoArchivoXTipoEmisor.filter(function (item, index) {
              return item.DESCRIPCION == Data.tipoArchivoDoc.toUpperCase();
            });

          const listaTipoDocumentoGlobal = this.getView()
            .getModel("localModel")
            .getData().listaTipoDocumentoGlobal;

          const uniqueEncontrado = Array.from(
            new Map(aEncontrado.map((item) => [item.VALOR, item])).values()
          );

          if (uniqueEncontrado.length == 1) {
            Data.enabledSelectClaseDoc = false;
            Data.selectClaseDoc = uniqueEncontrado[0].VALOR;
            Data.listaTipoDocumento = listaTipoDocumentoGlobal.filter(function (
              item
            ) {
              return item.key == uniqueEncontrado[0].VALOR;
            });
          } else {
            Data.listaTipoDocumento.push({
              key: "",
              text: "--Seleccione--",
            });

            for (let index = 0; index < uniqueEncontrado.length; index++) {
              const element = uniqueEncontrado[index];

              const aEncontradoDoc = listaTipoDocumentoGlobal.filter(function (
                item
              ) {
                return item.key == element.VALOR;
              });

              if (aEncontradoDoc.length > 0) {
                Data.listaTipoDocumento.push(aEncontradoDoc[0]);
              }
            }
          }

          // Límite en bytes (10 MB)
          const maxFileSize = 10 * 1024 * 1024;

          // Validar tamaño individual
          if (Data.fileSizeDoc > maxFileSize) {
            sap.ui.core.BusyIndicator.hide();
            utilPopUps.messageBox(
              `El archivo supera el tamaño máximo permitido de 10 MB.\n` +
                `Tamaño actual: ${(Data.fileSizeDoc / (1024 * 1024)).toFixed(
                  2
                )} MB`,
              "A",
              function () {
                fU.setValue(""); // limpiar input
              }
            );
            return false;
          }

          // Validar suma total de archivos
          let totalSizePdfUploaded =
            this.getView()
              .getModel("localModel")
              .getProperty("/totalSizePdfUploaded") || 0;

          totalSizePdfUploaded += Data.fileSizeDoc;

          const maxTotalSize = 10 * 1024 * 1024; // 10 MB

          if (totalSizePdfUploaded > maxTotalSize) {
            sap.ui.core.BusyIndicator.hide();
            utilPopUps.messageBox(
              `La suma total de todos los archivos cargados supera el límite máximo de 10 MB.`,
              "A",
              function () {
                fU.setValue(""); // limpiar input
              }
            );
            return false;
          }

          // Guardar total actualizado
          this.getView()
            .getModel("localModel")
            .setProperty("/totalSizePdfUploaded", totalSizePdfUploaded);

          // Create Base64 Object
          var execution = function () {
            if (file) {
              var reader = new FileReader();
              reader.onload = function (readerEvt) {
                var binaryString = readerEvt.target.result.toString();
                Data.FileEncode = btoa(binaryString).toString();
                that.onAdjuntarPDFPrueba(Data);
              };
              reader.readAsBinaryString(file);
            }
          }; // Funcion execution
          sap.ui.core.BusyIndicator.show();
          setTimeout(function () {
            execution();
          }, 800);
        },

        handleFileUploadPrueba2: function (file) {
          sap.ui.core.BusyIndicator.show(0);
          var that = this;

          var Data = {};
          Data.nombreArchivoDoc = file.name; //.split(/[\\/]/g).pop().split('.')[0];
          Data.sizeArchivoDoc = (file.size / 1024).toFixed(2);
          Data.fileSizeDoc = file.size;
          Data.descriArchivoDoc = file.name;
          Data.tipoArchivoDoc = file.name.split(".").pop().toLowerCase();
          Data.tipoArchivoDocPrueba = file.name.split(".").pop().toUpperCase();
          Data.selectClaseDoc = "";
          Data.enabledSelectClaseDoc = true;
          Data.listaTipoDocumento = [];
          // Validar que el archivo no sea mayor a 10mb.
          //TOOD:REVISAR

          const aEncontrado = this.getView()
            .getModel("localModel")
            .getData()
            .listaAdjuntosTipoArchivoXTipoEmisor.filter(function (item, index) {
              return item.DESCRIPCION == Data.tipoArchivoDoc.toUpperCase();
            });
          const listaTipoDocumentoGlobal = this.getView()
            .getModel("localModel")
            .getData().listaTipoDocumentoGlobal;

          if (aEncontrado.length == 1) {
            Data.enabledSelectClaseDoc = false;
            Data.selectClaseDoc = aEncontrado[0].VALOR;
            Data.listaTipoDocumento = listaTipoDocumentoGlobal.filter(function (
              item,
              index
            ) {
              return item.key == aEncontrado[0].VALOR;
            });
          } else {
            Data.listaTipoDocumento.push({
              key: "",
              text: "--Seleccione--",
            });
            for (let index = 0; index < aEncontrado.length; index++) {
              const element = aEncontrado[index];

              const aEncontradoDoc = listaTipoDocumentoGlobal.filter(function (
                item,
                index
              ) {
                return item.key == element.VALOR;
              });
              if (aEncontradoDoc.length > 0) {
                Data.listaTipoDocumento.push(aEncontradoDoc[0]);
              }
            }
          }

          let totalSizePdfUploaded = this.getView()
            .getModel("localModel")
            .getProperty("/totalSizePdfUploaded");
          totalSizePdfUploaded =
            parseFloat(Data.fileSize) + totalSizePdfUploaded;

          let { maxMBtotalSizePdfUploaded, maxtotalSizePdfUploaded } =
            this.getView().getModel("localModel").getData();

          if (totalSizePdfUploaded > maxtotalSizePdfUploaded) {
            sap.ui.core.BusyIndicator.hide();
            utilPopUps.messageBox(
              `El suma total del tamaño de todos los PDF cargados supera el tamaño maximo de  ${maxMBtotalSizePdfUploaded}.\n  `,
              "A",
              function () {
                // do nothing...
              }
            );
            return;
          }

          if (Data.fileSize > maxtotalSizePdfUploaded) {
            sap.ui.core.BusyIndicator.hide();
            utilPopUps.messageBox(
              `El documento supera el tamaño maximo ${maxMBtotalSizePdfUploaded}.\n  ` +
                "Tamaño actual es : " +
                (Data.fileSize / 1024).toFixed(2) +
                " Kb.",
              "A",
              function () {
                // do nothing...
              }
            );

            // $.confirm({
            //   title: 'Tamaño máximo',
            //   content:
            //     'El documento supera el tamaño maximo (1024Kb). <br>  ' +
            //     'Tamaño actual es : ' +
            //     (file.size / 1024).toFixed(2) +
            //     ' Kb.',
            //   theme: 'supervan',
            //   buttons: {
            //     Aceptar: function () {
            //       sap.ui.core.BusyIndicator.hide();
            //       this.close();
            //       return false;
            //     },
            //   },
            // });
            return false;
          } else {
            this.getView()
              .getModel("localModel")
              .setProperty("/totalSizePdfUploaded", totalSizePdfUploaded);
          }
          // Create Base64 Object
          Data.FileEncode = file.content; //btoa(binaryString).toString();

          this.onAdjuntarPDFPrueba(Data);
        },

        onAdjuntarPDFPrueba: function (data) {
          var preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          if (!(preRegistro.dataAttached && preRegistro.dataAttached.length)) {
            preRegistro.dataAttached = [];
          }
          preRegistro.dataAttached.push(data);

          // Reorganizar
          var counter = 0;
          preRegistro.dataAttached.forEach(function (row) {
            counter++;
            row.nroDoc = String(counter).padStart(3, "0");
            row.indexDoc = counter;
            row.XmlEncode = [];
            row.XmlEncode.ARCHIVO = [];
            var Longito = data.FileEncode.length;
            var looper = parseInt(Longito / 100) + 1;
            /*for (var i = 0; i <= looper; i++) {
            var Linea = {
              "ZLINEA": row.FileEncode.substring(i * 100, 100 * i + 100).toString()
            };
            row.XmlEncode.ARCHIVO.push(Linea);
          }*/
          });
          this.getView()
            .getModel("localModel")
            .setProperty("/preRegistro", preRegistro);
          //this.getView().setModel(new JSONModel(preRegistro), "preRegistro");
		  this.actualizarClasesDisponibles();
          sap.ui.core.BusyIndicator.hide();
        },
        // Eliminar adjunto.
        onpressEliminarPDFPrueba: function (oEvent) {
          const self = this;
          var preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          var IndexOf = oEvent.getSource().data("indexOf");

          let sizeArchivo = parseFloat(
            oEvent.getSource().getBindingContext("localModel").getObject()
              .fileSize
          );
          utilPopUps.messageBox(
            "¿Esta seguro que desea eliminar el PDF?.",
            "C",
            function () {
              // totalSizePdfUploaded
              let totalSizePdfUploaded = self
                .getView()
                .getModel("localModel")
                .getProperty("/totalSizePdfUploaded");

              let lastTotalSizePdfUploaded = totalSizePdfUploaded - sizeArchivo;

              self
                .getView()
                .getModel("localModel")
                .setProperty("/totalSizePdfUploaded", lastTotalSizePdfUploaded);
              preRegistro.dataAttached.splice(IndexOf, 1);

              self.getView().getModel("localModel").refresh();
            }
          );
        },

        /****************************XML*************** */
        handleFileUploadXMLPrueba: function (oParam) {
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          // var fU = this.getView().byId("idfileUploaderDocs");
          // var fU = oParam.fileUpload;
          // var domRef = fU.getFocusDomRef();
          var file = oParam.file;
          // domRef.files == undefined ? fU.FUEl.files[0] : domRef.files[0];
          var Data = {};
          Data.nombreArchivoDoc = file.name; //.split(/[\\/]/g).pop().split('.')[0].replace(/ /g, '');
          Data.sizeArchivoDoc = (file.size / 1024).toFixed(2);
          Data.descriArchivoDoc = file.name.replace(/ /g, "");
          Data.tipoArchivoDoc = file.name.split(".").pop().toLowerCase();
          Data.tipoArchivoDocPrueba = file.name.split(".").pop().toUpperCase();
          Data.selectClaseDoc = "";
          Data.enabledSelectClaseDoc = true;
          Data.listaTipoDocumento = [];
          //TOOD:REVISAR

          const aEncontrado = this.getView()
            .getModel("localModel")
            .getData()
            .listaAdjuntosTipoArchivoXTipoEmisor.filter(function (item, index) {
              return item.DESCRIPCION == Data.tipoArchivoDoc.toUpperCase();
            });
          const listaTipoDocumentoGlobal = this.getView()
            .getModel("localModel")
            .getData().listaTipoDocumentoGlobal;

          if (aEncontrado.length == 1) {
            Data.enabledSelectClaseDoc = false;
            Data.selectClaseDoc = aEncontrado[0].VALOR;
            Data.listaTipoDocumento = listaTipoDocumentoGlobal.filter(function (
              item,
              index
            ) {
              return item.key == aEncontrado[0].VALOR;
            });
          } else {
            for (let index = 0; index < aEncontrado.length; index++) {
              const element = aEncontrado[index];

              const aEncontrado = listaTipoDocumentoGlobal.filter(function (
                item,
                index
              ) {
                return item.key == element.VALOR;
              });
              Data.listaTipoDocumento.push(aEncontrado[0]);
            }
          }

          // Validar que el archivo no sea mayor a 10mb.
          if (file.size > 1000000) {
            $.confirm({
              title: "Tamaño máximo",
              content:
                "El documento supera el tamaño maximo (1024Kb). <br>  " +
                "Tamaño actual es : " +
                (file.size / 1024).toFixed(2) +
                " Kb.",
              theme: "supervan",
              buttons: {
                Aceptar: function () {
                  sap.ui.core.BusyIndicator.hide();
                  this.close();
                  return false;
                },
              },
            });
            return false;
          }
          // Create Base64 Object
          var execution = function () {
            if (file) {
              var reader = new FileReader();
              reader.onload = function (readerEvt) {
                var binaryString = readerEvt.target.result.toString();
                Data.FileEncode = btoa(binaryString).toString();

                that.onAdjuntarXMLPrueba(Data, binaryString);
              };
              reader.readAsBinaryString(file);
            }
          }; // Funcion execution
          sap.ui.core.BusyIndicator.show();
          setTimeout(function () {
            execution();
          }, 800);
        },

        handleFileUploadXMLPrueba2: function (oParam) {
          sap.ui.core.BusyIndicator.show(0);
          var that = this;
          // var fU = this.getView().byId("idfileUploaderDocs");
          // var fU = oParam.fileUpload;
          // var domRef = fU.getFocusDomRef();
          var file = oParam.file;
          // domRef.files == undefined ? fU.FUEl.files[0] : domRef.files[0];
          var Data = {};
          Data.nombreArchivoDoc = file.name;
          Data.FileEncode = file.content; //.split(/[\\/]/g).pop().split('.')[0].replace(/ /g, '');
          Data.sizeArchivoDoc = (file.size / 1024).toFixed(2);
          Data.descriArchivoDoc = file.name.replace(/ /g, "");
          Data.tipoArchivoDoc = file.name.split(".").pop().toLowerCase();
          Data.tipoArchivoDocPrueba = file.name.split(".").pop().toUpperCase();
          Data.selectClaseDoc = "";
          Data.enabledSelectClaseDoc = true;
          Data.listaTipoDocumento = [];
          //TOOD:REVISAR

          const aEncontrado = this.getView()
            .getModel("localModel")
            .getData()
            .listaAdjuntosTipoArchivoXTipoEmisor.filter(function (item, index) {
              return item.DESCRIPCION == Data.tipoArchivoDoc.toUpperCase();
            });
          const listaTipoDocumentoGlobal = this.getView()
            .getModel("localModel")
            .getData().listaTipoDocumentoGlobal;

          if (aEncontrado.length == 1) {
            Data.enabledSelectClaseDoc = false;
            Data.selectClaseDoc = aEncontrado[0].VALOR;
            Data.listaTipoDocumento = listaTipoDocumentoGlobal.filter(function (
              item,
              index
            ) {
              return item.key == aEncontrado[0].VALOR;
            });
          } else {
            for (let index = 0; index < aEncontrado.length; index++) {
              const element = aEncontrado[index];

              const aEncontrado = listaTipoDocumentoGlobal.filter(function (
                item,
                index
              ) {
                return item.key == element.VALOR;
              });
              Data.listaTipoDocumento.push(aEncontrado[0]);
            }
          }

          // Validar que el archivo no sea mayor a 10mb.
          if (file.size > 1000000) {
            $.confirm({
              title: "Tamaño máximo",
              content:
                "El documento supera el tamaño maximo (1024Kb). <br>  " +
                "Tamaño actual es : " +
                (file.size / 1024).toFixed(2) +
                " Kb.",
              theme: "supervan",
              buttons: {
                Aceptar: function () {
                  sap.ui.core.BusyIndicator.hide();
                  this.close();
                  return false;
                },
              },
            });
            return false;
          }

          // that.onAdjuntarXMLPrueba(Data, file.content);
          // Create Base64 Object
          var execution = function () {
            if (Data.FileEncode) {
              var binaryString = atob(Data.FileEncode);
              that.onAdjuntarXMLPrueba(Data, binaryString);
            }
          }; // Funcion execution
          sap.ui.core.BusyIndicator.show();
          setTimeout(function () {
            execution();
          }, 800);
        },
        onAdjuntarXMLPrueba: async function (data, dataxml) {
          var self = this;

          self._LongSerie = self
            .getView()
            .getModel("localModel")
            .getProperty("/LONGSERIE"); // 5;
          self._LongCorrelativo = self
            .getView()
            .getModel("localModel")
            .getProperty("/LONGCORRELATIVO"); //7;
          self
            .getView()
            .setModel(new sap.ui.model.json.JSONModel([]), "modelLog");
          var estados_comprobante = this.getView()
            .getModel("localModel")
            .getProperty("/EstadosComprobante");
          var estados_ruc = this.getView()
            .getModel("localModel")
            .getProperty("/EstadosRuc");
          var estados_domicilio = this.getView()
            .getModel("localModel")
            .getProperty("/EstadosDomicilio");
          var constantes = this.getView()
            .getModel("localModel")
            .getProperty("/Constantes");
          var flagComprobante = false;
          var flagRuc = false;
          var flagDomicilio = false;
          var diferencia = 0;
          var preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          var rucLogin = this.getView().getModel("localModel").getData()
            .ProveedorSeleccionado.usuario;
          //this.getView().getModel('localModel').getProperty('/infoUsuario').USUARIO;

          // var datos_usuario = this.getView().getModel('localModel').getProperty('/infoUsuario');
          var datos_usuario = this.getView()
            .getModel("localModel")
            .getProperty("/ProveedorSeleccionado");

          //FISICO
          if (datos_usuario.CODIGO_TIPO_EMISOR == "F") {
            //util.popups.showToast("Error", "Tipo de Emisor Fisico, no se permite adjuntar XML", 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "Tipo de Emisor Fisico, no se permite adjuntar XML"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }

          var formatPad = function (num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
          };

          //VALORES DEL XML
          var parser = new DOMParser();
          try {
            // Try to convert to utf-8
            dataxml = decodeURIComponent(escape(dataxml)).trim();
            // If the conversion succeeds, text is not utf-8
          } catch (e) {
            dataxml = dataxml;
          }
          dataxml = dataxml.replace(
            /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm,
            ""
          );
          var xmlDoc = parser.parseFromString(dataxml, "text/xml");
          var oModelX = new sap.ui.model.xml.XMLModel();
          _registerXmlNamespaces(oModelX, xmlDoc);
          oModelX.attachRequestCompleted(function () {
            var xmlStr = oModelX.getXML();
            //console.log(xmlStr); // Do what ever you want with your xml string
          });
          oModelX.setData(xmlDoc);
          //console.log("MODELO", oModelX);

          //---amayuri 26/11/2021
          var oSerializer = new XMLSerializer();
          var sXML = oSerializer.serializeToString(xmlDoc);

          if (sXML.includes(rucLogin)) {
            var rucXml = rucLogin; // se hace la validacion con el ruc logeado
          } else {
            // XML no válido, RUC del XML no coincide con el RUC del usuario logueado
            var oLocalModel = this.getView().getModel("localModel");
            var preRegistro = oLocalModel.getProperty("/preRegistro");

            // 🔹 Limpiar solo los campos necesarios
            preRegistro.NRO_SERIE = "";
            preRegistro.NRO_COMPROBANTE = "";
            preRegistro.TIPO_DETRACCION = "";
            preRegistro.Editable = true;
            preRegistro.EDITABLE_DETRACCION = true;
            preRegistro.FECHA_EMISION = new Date();

            oLocalModel.setProperty("/preRegistro", preRegistro);
            oLocalModel.refresh();
            //util.popups.showToast("Error", "XML no válido, RUC del XML no coincide con el RUC del usuario logueado", 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "XML no válido, RUC del XML no coincide con el RUC del Proveedor Seleccionado"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          //---

          // cvc se comenta
          /*var rucXml = oModelX.getProperty("/cac:Signature/cbc:ID");
        let isnum = /^\d+$/.test(rucXml);
        if (rucXml.length != 11 || isnum == false) {
          rucXml = oModelX.getProperty("/cac:Signature/cac:SignatoryParty/cac:PartyIdentification/cbc:ID");
        }*/
          //end cvc

          var fechaXml = oModelX.getProperty("/cbc:IssueDate");
          var importeXml = oModelX.getProperty(
            "/cac:LegalMonetaryTotal/cbc:PayableAmount"
          );
          var monedaXml = oModelX.getProperty("/cbc:DocumentCurrencyCode");
          var serieCorrelativoXml = oModelX.getProperty("/cbc:ID");
          var rucSociedad = oModelX.getProperty(
            "/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID"
          );
          let TIPO_DETRACCION_DEFAULT = null;
          let EDITABLE_DETRACCION = true;
          if (
            this.getView()
              .getModel("localModel")
              .getProperty("/sociedadActual") == "PE"
          ) {
            // var codDetraccion = oModelX.getProperty(
            //   "/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/tci:AdditionalInformation/cac:PaymentTerms/cbc:PaymentMeansID"
            // );

            // var codDetraccion = oModelX.getProperty(
            //   "/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/biz:AdditionalInformation/cac:PaymentTerms/cbc:PaymentMeansID"
            // );
            // if (!codDetraccion) {
            //   var codDetraccion2 = oModelX.getProperty(
            //     "/cac:PaymentTerms/cbc:PaymentMeansID"
            //   );
            //   codDetraccion = codDetraccion2;
            // }
            let listXmlDetraccion = [
              "/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/tci:AdditionalInformation/cac:PaymentTerms/cbc:PaymentMeansID",
              "/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/biz:AdditionalInformation/cac:PaymentTerms/cbc:PaymentMeansID",
              "/cac:PaymentTerms/cbc:PaymentMeansID",
            ];
            for (let index = 0; index < listXmlDetraccion.length; index++) {
              const pathXml = listXmlDetraccion[index];
              var codDetraccion = oModelX.getProperty(pathXml);
              const aEcontrado = this.getView()
                .getModel("localModel")
                .getProperty("/listaDetraccionHomologacion")
                .filter(function (item, index) {
                  return item.CODIGO_MAESTRO_DETALLE == codDetraccion;
                });
              if (aEcontrado.length > 0) {
                break;
              }
            }

            if (codDetraccion.length > 0) {
              const aEcontrado = this.getView()
                .getModel("localModel")
                .getProperty("/listaDetraccionHomologacion")
                .filter(function (item, index) {
                  return item.CODIGO_MAESTRO_DETALLE == codDetraccion;
                });
              if (aEcontrado.length > 0) {
                // utilPopUps.messageBox(
                //   'No se encontró información de la detracción del xml. Por favor, registrarla en la tabla de homologación',
                //   'A',
                //   function () {
                //     // do nothing...
                //   }
                // );
                // } else {

                const { CAMPO, VALOR } = aEcontrado[0] || {};
                TIPO_DETRACCION_DEFAULT =
                  CAMPO && VALOR ? `${CAMPO}-${VALOR}` : CAMPO || VALOR || "";
                EDITABLE_DETRACCION = false;
              }
            }
          }

          //var listaRucSociedades = this.getView().getModel("localModel").getProperty("/RucSociedades");
          var datosSociedad = this.getView()
            .getModel("localModel")
            .getProperty("/datosSociedad");
          //Validacion del ruc por sociedad
          var flagErrorRucSociedad = false;

          if (rucSociedad != datosSociedad[0].CAMPO) {
            flagErrorRucSociedad = true;
          }

          if (flagErrorRucSociedad) {
            utilPopUps.onMessageWarningDialogPress3(
              "Ruc de sociedad no valido"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          //Fin validacion
          if (serieCorrelativoXml != undefined) {
            if (
              (rucXml == undefined || rucXml == "") &&
              serieCorrelativoXml[0] == "E"
            ) {
              rucXml = this.getView().getModel("localModel").getData()
                .ProveedorSeleccionado.usuario;
              //this.getView().getModel('localModel').getProperty('/infoUsuario').USUARIO;
            }
          }

          if (
            rucXml == undefined ||
            rucXml == "" ||
            fechaXml == undefined ||
            fechaXml == "" ||
            importeXml == undefined ||
            importeXml == "" ||
            monedaXml == undefined ||
            monedaXml == "" ||
            serieCorrelativoXml == undefined ||
            serieCorrelativoXml == ""
          ) {
            //util.popups.showToast("Error", "XML no válido, no cuenta con los datos necesarios", 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "XML no válido, no cuenta con los datos necesarios"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          //VALIDAR MONEDA E IMPORTE
          //validar consntante de diferencia

          constantes.forEach(function (c) {
            if (c.CAMPO == "diferenciaMonto") {
              diferencia = c.VALOR;
            }
          });
          var importePantalla = this.getView()
            .byId("IMPORTE")
            .getValue()
            .replace(",", "");
          importePantalla = importePantalla.replace("'", "");
          var diferenciaReal = Math.abs(
            (parseFloat(importeXml) - parseFloat(importePantalla)).toFixed(2)
          );
          if (
            !(monedaXml == preRegistro.MONEDA && diferenciaReal <= diferencia)
          ) {
            //util.popups.showToast("Error", "XML no válido, Importe y/o Moneda diferente. " + importeXml + " " + monedaXml, 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "XML no válido, Importe y/o Moneda diferente. "
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }

          var datos = {
            numRuc: rucXml,
            sRuc: rucXml,
            sociedad: this.getView()
              .getModel("localModel")
              .getProperty("/filtrosSociedad"),
            codComp: "01",
            numeroSerie: serieCorrelativoXml.split("-")[0].replace(/^0+/, ""),
            numero: serieCorrelativoXml.split("-")[1].replace(/^0+/, ""),
            fechaEmision: fechaXml.split("-").reverse().join("/"),
            monto: importeXml,
            rucSociedad: this.getView()
              .getModel("localModel")
              .getProperty("/datosSociedad")[0].VALOR,
          };

          /// PRUEBA
          // var datos =
          // {
          //   "numRuc": "10077006309",
          //   "codComp": "01",
          //   "numeroSerie": "F003",
          //   "numero": "39426",
          //   "fechaEmision": "05/08/2023",
          //   "monto": "16.00"
          // }
          //

          let consultarSunatResponse = await self.consultarSunat(datos);

          //models.ValidarComprobante(self, datos, function (dataresponse) {
          if (consultarSunatResponse.code === 1) {
            var aMensajes = [];
            var oMensaje = {};
            var response = consultarSunatResponse.results.consultarSunat;
            if (Object.keys(response).length < 3) {
              sap.ui.core.BusyIndicator.hide();

              utilPopUps.onMessageWarningDialogPress3(
                "No se logró validar el XML por demora del Servidor SUNAT. Por favor, intentarlo más tarde."
              );
              return;
            }
            //estadoCp
            oMensaje = {};
            oMensaje.item = 1;
            oMensaje.sMessage = "Estado de Comprobante";
            var aUniEstado = estados_comprobante.filter(function (item) {
              return item.CAMPO == response.estadoCp;
            });
            if (aUniEstado.length > 0) {
              if (aUniEstado[0].DESCRIPCION == "OK") {
                oMensaje.estado =
                  aUniEstado[0].CAMPO + " " + aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://accept";
                oMensaje.state = "Success";
                flagComprobante = true;
              } else {
                oMensaje.estado = aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://error";
                oMensaje.state = "Error";
              }
            } else {
              oMensaje.estado = "Sin Respuesta";
              oMensaje.icon = "sap-icon://alert";
              oMensaje.state = "Warning";
            }
            aMensajes.push(oMensaje);

            //estadoRuc
            oMensaje = {};
            oMensaje.item = 2;
            oMensaje.sMessage = "Estado de Contribuyente";
            var aUniEstado = estados_ruc.filter(function (item) {
              return item.CAMPO == response.estadoRuc;
            });
            if (aUniEstado.length > 0) {
              if (aUniEstado[0].DESCRIPCION == "OK") {
                oMensaje.estado =
                  aUniEstado[0].CAMPO + " " + aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://accept";
                oMensaje.state = "Success";
                flagRuc = true;
              } else {
                oMensaje.estado = aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://error";
                oMensaje.state = "Error";
              }
            } else {
              oMensaje.estado = "Sin Respuesta";
              oMensaje.icon = "sap-icon://alert";
              oMensaje.state = "Warning";
            }
            aMensajes.push(oMensaje);

            //Domicilio
            oMensaje = {};
            oMensaje.item = 3;
            oMensaje.sMessage = "Condicion de Domicilio Contribuyente";
            var aUniEstado = estados_domicilio.filter(function (item) {
              return item.CAMPO == response.condDomiRuc;
            });
            if (aUniEstado.length > 0) {
              if (aUniEstado[0].DESCRIPCION == "OK") {
                oMensaje.estado =
                  aUniEstado[0].CAMPO + " " + aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://accept";
                oMensaje.state = "Success";
                flagDomicilio = true;
              } else {
                oMensaje.estado = aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://error";
                oMensaje.state = "Error";
              }
            } else {
              oMensaje.estado = "Sin Respuesta";
              oMensaje.icon = "sap-icon://alert";
              oMensaje.state = "Warning";
            }
            aMensajes.push(oMensaje);

            if (flagComprobante && flagRuc && flagDomicilio) {
              preRegistro.NRO_SERIE = serieCorrelativoXml.split("-")[0];
              preRegistro.NRO_SERIE = preRegistro.NRO_SERIE.replace(/\s/g, "");
              preRegistro.NRO_SERIE = preRegistro.NRO_SERIE.replace(/^0+/, "");
              preRegistro.NRO_SERIE = formatPad(
                preRegistro.NRO_SERIE,
                self._LongSerie
              );
              preRegistro.NRO_COMPROBANTE = serieCorrelativoXml.split("-")[1];
              preRegistro.NRO_COMPROBANTE = preRegistro.NRO_COMPROBANTE.replace(
                /\s/g,
                ""
              );
              preRegistro.NRO_COMPROBANTE = preRegistro.NRO_COMPROBANTE.replace(
                /^0+/,
                ""
              );
              preRegistro.NRO_COMPROBANTE = formatPad(
                preRegistro.NRO_COMPROBANTE,
                self._LongCorrelativo
              );
              preRegistro.FECHA_EMISION = new Date(
                fechaXml.split("-").join("/")
              );
              preRegistro.Editable = false;

              preRegistro.IMPORTE = importeXml;

              if (TIPO_DETRACCION_DEFAULT !== null) {
                this.getView()
                  .getModel("localModel")
                  .setProperty(
                    "/preRegistro/TIPO_DETRACCION",
                    TIPO_DETRACCION_DEFAULT
                  );

                this.getView()
                  .getModel("localModel")
                  .setProperty(
                    "/preRegistro/EDITABLE_DETRACCION",
                    EDITABLE_DETRACCION
                  );
              }
              //ADJUNTAR ARCHIVO
              data.dataxml = dataxml;
              if (
                !(preRegistro.dataAttached && preRegistro.dataAttached.length)
              ) {
                preRegistro.dataAttached = [];
              }
              preRegistro.dataAttached.push(data);

              // Reorganizar
              var counter = 0;
              preRegistro.dataAttached.forEach(function (row) {
                row.nroDoc = "0" + (counter + 1) * 10;
                row.indexDoc = counter;
                row.XmlEncode = [];
                row.XmlEncode.ARCHIVO = [];
                var Longito = data.FileEncode.length;
                var looper = parseInt(Longito / 100) + 1;
                /*for (var i = 0; i <= looper; i++) {
                var Linea = {
                  "ZLINEA": row.FileEncode.substring(i * 100, 100 * i + 100).toString()
                };
                row.XmlEncode.ARCHIVO.push(Linea);
              }*/
                counter++;
              });
              self
                .getView()
                .getModel("localModel")
                .setProperty("/preRegistro", preRegistro);
              self.getView().getModel("localModel").refresh();
              sap.m.MessageToast.show("Se toman datos de XML");
              //util.popups.showToast("Información", "Se toman datos de XML", 4, false, "bottomCenter");
            } else {
              //util.popups.showToast("Error", "No se toman datos de XML, Verificar Datos de Sunat", 2, false, "bottomCenter");
              utilPopUps.onMessageWarningDialogPress3(
                "No se toman datos de XML, Verificar Datos de Sunat"
              );
            }

            self.getView().getModel("modelLog").setData(aMensajes);
            self._getDialog().open();

            sap.ui.core.BusyIndicator.hide();
          } else {
            //
            if (consultarSunatResponse.message.includes("404")) {
              // util.popups.showToast("Por favor reintentar en unos minutos, ", "Servicio Sunat no disponible  \n" + dataresponse.oAuditResponse
              //   .sMessage, 2, true);
              utilPopUps.onMessageWarningDialogPress3(
                "Por favor reintentar en unos minutos, ",
                "Servicio Sunat no disponible"
              );
            } else {
              //util.popups.showToast("Error", "Error al comprobar Comprobante Sunat \n" + dataresponse.oAuditResponse.sMessage, 2, true);
              utilPopUps.onMessageWarningDialogPress3(
                "Error al comprobar Comprobante Sunat \n" +
                  consultarSunatResponse.message
              );
            }
            sap.ui.core.BusyIndicator.hide();
          }

          //});
          return;
        },

        onAdjuntarXMLPrueba2: async function (data, dataxml) {
          var self = this;

          self._LongSerie = self
            .getView()
            .getModel("localModel")
            .getProperty("/LONGSERIE"); // 5;
          self._LongCorrelativo = self
            .getView()
            .getModel("localModel")
            .getProperty("/LONGCORRELATIVO"); //7;
          self
            .getView()
            .setModel(new sap.ui.model.json.JSONModel([]), "modelLog");
          var estados_comprobante = this.getView()
            .getModel("localModel")
            .getProperty("/EstadosComprobante");
          var estados_ruc = this.getView()
            .getModel("localModel")
            .getProperty("/EstadosRuc");
          var estados_domicilio = this.getView()
            .getModel("localModel")
            .getProperty("/EstadosDomicilio");
          var constantes = this.getView()
            .getModel("localModel")
            .getProperty("/Constantes");
          var flagComprobante = false;
          var flagRuc = false;
          var flagDomicilio = false;
          var diferencia = 0;
          var preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          var rucLogin = this.getView().getModel("localModel").getData()
            .ProveedorSeleccionado.usuario;
          //this.getView().getModel('localModel').getProperty('/infoUsuario').USUARIO;

          // var datos_usuario = this.getView().getModel('localModel').getProperty('/infoUsuario');
          var datos_usuario = this.getView()
            .getModel("localModel")
            .getProperty("/ProveedorSeleccionado");

          //FISICO
          if (datos_usuario.CODIGO_TIPO_EMISOR == "F") {
            //util.popups.showToast("Error", "Tipo de Emisor Fisico, no se permite adjuntar XML", 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "Tipo de Emisor Fisico, no se permite adjuntar XML"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }

          var formatPad = function (num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
          };

          //VALORES DEL XML
          var parser = new DOMParser();
          try {
            dataxml = dataxml.trim(); // Eliminar espacios y saltos de línea innecesarios
            // Elimina cualquier carácter no válido en el XML, si es necesario
            dataxml = dataxml.replace(/[^a-zA-Z0-9\s<>\-\/\!]/g, "");

            // Intentamos parsear el XML
            var xmlDoc = parser.parseFromString(dataxml, "application/xml");

            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
              throw new Error("Error al parsear el XML");
            }
          } catch (e) {
            dataxml = dataxml;
          }

          var oModelX = new sap.ui.model.xml.XMLModel();
          _registerXmlNamespaces(oModelX, xmlDoc);
          oModelX.attachRequestCompleted(function () {
            var xmlStr = oModelX.getXML();
            //console.log(xmlStr); // Do what ever you want with your xml string
          });
          oModelX.setData(xmlDoc);
          //console.log("MODELO", oModelX);

          //---amayuri 26/11/2021
          var oSerializer = new XMLSerializer();
          var sXML = oSerializer.serializeToString(xmlDoc);

          if (sXML.includes(rucLogin)) {
            var rucXml = rucLogin; // se hace la validacion con el ruc logeado
          } else {
            //util.popups.showToast("Error", "XML no válido, RUC del XML no coincide con el RUC del usuario logueado", 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "XML no válido, RUC del XML no coincide con el RUC del Proveedor Seleccionado"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          //---

          // cvc se comenta
          /*var rucXml = oModelX.getProperty("/cac:Signature/cbc:ID");
        let isnum = /^\d+$/.test(rucXml);
        if (rucXml.length != 11 || isnum == false) {
          rucXml = oModelX.getProperty("/cac:Signature/cac:SignatoryParty/cac:PartyIdentification/cbc:ID");
        }*/
          //end cvc

          var fechaXml = oModelX.getProperty("/cbc:IssueDate");
          var importeXml = oModelX.getProperty(
            "/cac:LegalMonetaryTotal/cbc:PayableAmount"
          );
          var monedaXml = oModelX.getProperty("/cbc:DocumentCurrencyCode");
          var serieCorrelativoXml = oModelX.getProperty("/cbc:ID");
          var rucSociedad = oModelX.getProperty(
            "/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID"
          );
          let TIPO_DETRACCION_DEFAULT = null;
          let EDITABLE_DETRACCION = true;
          if (
            this.getView()
              .getModel("localModel")
              .getProperty("/sociedadActual") == "PE"
          ) {
            var codDetraccion = oModelX.getProperty(
              "/ext:UBLExtensions/ext:UBLExtension/ext:ExtensionContent/biz:AdditionalInformation/cac:PaymentTerms/cbc:PaymentMeansID"
            );
            if (!codDetraccion) {
              var codDetraccion2 = oModelX.getProperty(
                "/cac:PaymentTerms/cbc:PaymentMeansID"
              );
              codDetraccion = codDetraccion2;
            }

            if (codDetraccion.length > 0) {
              const aEcontrado = this.getView()
                .getModel("localModel")
                .getProperty("/listaDetraccionHomologacion")
                .filter(function (item, index) {
                  return item.CODIGO_MAESTRO_DETALLE == codDetraccion;
                });
              if (aEcontrado.length > 0) {
                // utilPopUps.messageBox(
                //   'No se encontró información de la detracción del xml. Por favor, registrarla en la tabla de homologación',
                //   'A',
                //   function () {
                //     // do nothing...
                //   }
                // );
                // } else {
                // const TIPO_DETRACCION_DEFAULT = aEcontrado[0].VALOR;

                // this.getView()
                //   .getModel("localModel")
                //   .setProperty(
                //     "/preRegistro/TIPO_DETRACCION",
                //     TIPO_DETRACCION_DEFAULT
                //   );

                // this.getView()
                //   .getModel("localModel")
                //   .setProperty("/preRegistro/EDITABLE_DETRACCION", false);

                const { CAMPO, VALOR } = aEcontrado[0] || {};
                TIPO_DETRACCION_DEFAULT =
                  CAMPO && VALOR ? `${CAMPO}-${VALOR}` : CAMPO || VALOR || "";
                EDITABLE_DETRACCION = false;
              }
            }
          }

          //var listaRucSociedades = this.getView().getModel("localModel").getProperty("/RucSociedades");
          var datosSociedad = this.getView()
            .getModel("localModel")
            .getProperty("/datosSociedad");
          //Validacion del ruc por sociedad
          var flagErrorRucSociedad = false;

          if (rucSociedad != datosSociedad[0].CAMPO) {
            flagErrorRucSociedad = true;
          }

          if (flagErrorRucSociedad) {
            utilPopUps.onMessageWarningDialogPress3(
              "Ruc de sociedad no valido"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          //Fin validacion
          if (serieCorrelativoXml != undefined) {
            if (
              (rucXml == undefined || rucXml == "") &&
              serieCorrelativoXml[0] == "E"
            ) {
              rucXml = this.getView().getModel("localModel").getData()
                .ProveedorSeleccionado.usuario;
              //this.getView().getModel('localModel').getProperty('/infoUsuario').USUARIO;
            }
          }

          if (
            rucXml == undefined ||
            rucXml == "" ||
            fechaXml == undefined ||
            fechaXml == "" ||
            importeXml == undefined ||
            importeXml == "" ||
            monedaXml == undefined ||
            monedaXml == "" ||
            serieCorrelativoXml == undefined ||
            serieCorrelativoXml == ""
          ) {
            //util.popups.showToast("Error", "XML no válido, no cuenta con los datos necesarios", 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "XML no válido, no cuenta con los datos necesarios"
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          //VALIDAR MONEDA E IMPORTE
          //validar consntante de diferencia

          constantes.forEach(function (c) {
            if (c.CAMPO == "diferenciaMonto") {
              diferencia = c.VALOR;
            }
          });
          var importePantalla = this.getView()
            .byId("IMPORTE")
            .getValue()
            .replace(",", "");
          importePantalla = importePantalla.replace("'", "");
          var diferenciaReal = Math.abs(
            (parseFloat(importeXml) - parseFloat(importePantalla)).toFixed(2)
          );
          if (
            !(monedaXml == preRegistro.MONEDA && diferenciaReal <= diferencia)
          ) {
            //util.popups.showToast("Error", "XML no válido, Importe y/o Moneda diferente. " + importeXml + " " + monedaXml, 2, true);
            utilPopUps.onMessageWarningDialogPress3(
              "XML no válido, Importe y/o Moneda diferente. "
            );
            sap.ui.core.BusyIndicator.hide();
            return;
          }

          var datos = {
            numRuc: rucXml,
            sRuc: rucXml,
            sociedad: this.getView()
              .getModel("localModel")
              .getProperty("/filtrosSociedad"),
            codComp: "01",
            numeroSerie: serieCorrelativoXml.split("-")[0].replace(/^0+/, ""),
            numero: serieCorrelativoXml.split("-")[1].replace(/^0+/, ""),
            fechaEmision: fechaXml.split("-").reverse().join("/"),
            monto: importeXml,
            rucSociedad: this.getView()
              .getModel("localModel")
              .getProperty("/datosSociedad")[0].VALOR,
          };

          /// PRUEBA
          // var datos =
          // {
          //   "numRuc": "10077006309",
          //   "codComp": "01",
          //   "numeroSerie": "F003",
          //   "numero": "39426",
          //   "fechaEmision": "05/08/2023",
          //   "monto": "16.00"
          // }
          //

          let consultarSunatResponse = await self.consultarSunat(datos);

          //models.ValidarComprobante(self, datos, function (dataresponse) {
          if (consultarSunatResponse.code === 1) {
            var aMensajes = [];
            var oMensaje = {};
            var response = consultarSunatResponse.results.consultarSunat;
            if (Object.keys(response).length < 3) {
              sap.ui.core.BusyIndicator.hide();

              utilPopUps.onMessageWarningDialogPress3(
                "No se logró validar el XML por demora del Servidor SUNAT. Por favor, intentarlo más tarde."
              );
              return;
            }
            //estadoCp
            oMensaje = {};
            oMensaje.item = 1;
            oMensaje.sMessage = "Estado de Comprobante";
            var aUniEstado = estados_comprobante.filter(function (item) {
              return item.CAMPO == response.estadoCp;
            });
            if (aUniEstado.length > 0) {
              if (aUniEstado[0].DESCRIPCION == "OK") {
                oMensaje.estado =
                  aUniEstado[0].CAMPO + " " + aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://accept";
                oMensaje.state = "Success";
                flagComprobante = true;
              } else {
                oMensaje.estado = aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://error";
                oMensaje.state = "Error";
              }
            } else {
              oMensaje.estado = "Sin Respuesta";
              oMensaje.icon = "sap-icon://alert";
              oMensaje.state = "Warning";
            }
            aMensajes.push(oMensaje);

            //estadoRuc
            oMensaje = {};
            oMensaje.item = 2;
            oMensaje.sMessage = "Estado de Contribuyente";
            var aUniEstado = estados_ruc.filter(function (item) {
              return item.CAMPO == response.estadoRuc;
            });
            if (aUniEstado.length > 0) {
              if (aUniEstado[0].DESCRIPCION == "OK") {
                oMensaje.estado =
                  aUniEstado[0].CAMPO + " " + aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://accept";
                oMensaje.state = "Success";
                flagRuc = true;
              } else {
                oMensaje.estado = aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://error";
                oMensaje.state = "Error";
              }
            } else {
              oMensaje.estado = "Sin Respuesta";
              oMensaje.icon = "sap-icon://alert";
              oMensaje.state = "Warning";
            }
            aMensajes.push(oMensaje);

            //Domicilio
            oMensaje = {};
            oMensaje.item = 3;
            oMensaje.sMessage = "Condicion de Domicilio Contribuyente";
            var aUniEstado = estados_domicilio.filter(function (item) {
              return item.CAMPO == response.condDomiRuc;
            });
            if (aUniEstado.length > 0) {
              if (aUniEstado[0].DESCRIPCION == "OK") {
                oMensaje.estado =
                  aUniEstado[0].CAMPO + " " + aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://accept";
                oMensaje.state = "Success";
                flagDomicilio = true;
              } else {
                oMensaje.estado = aUniEstado[0].VALOR;
                oMensaje.icon = "sap-icon://error";
                oMensaje.state = "Error";
              }
            } else {
              oMensaje.estado = "Sin Respuesta";
              oMensaje.icon = "sap-icon://alert";
              oMensaje.state = "Warning";
            }
            aMensajes.push(oMensaje);

            if (flagComprobante && flagRuc && flagDomicilio) {
              preRegistro.NRO_SERIE = serieCorrelativoXml.split("-")[0];
              preRegistro.NRO_SERIE = preRegistro.NRO_SERIE.replace(/\s/g, "");
              preRegistro.NRO_SERIE = preRegistro.NRO_SERIE.replace(/^0+/, "");
              preRegistro.NRO_SERIE = formatPad(
                preRegistro.NRO_SERIE,
                self._LongSerie
              );
              preRegistro.NRO_COMPROBANTE = serieCorrelativoXml.split("-")[1];
              preRegistro.NRO_COMPROBANTE = preRegistro.NRO_COMPROBANTE.replace(
                /\s/g,
                ""
              );
              preRegistro.NRO_COMPROBANTE = preRegistro.NRO_COMPROBANTE.replace(
                /^0+/,
                ""
              );
              preRegistro.NRO_COMPROBANTE = formatPad(
                preRegistro.NRO_COMPROBANTE,
                self._LongCorrelativo
              );
              preRegistro.FECHA_EMISION = new Date(
                fechaXml.split("-").join("/")
              );
              preRegistro.Editable = false;

              preRegistro.IMPORTE = importeXml;

              //Se implementa o cambia de lugar el set por que se debe de hacer despues de pasar la validacion de moneda e importe
              if (TIPO_DETRACCION_DEFAULT !== null) {
                this.getView()
                  .getModel("localModel")
                  .setProperty(
                    "/preRegistro/TIPO_DETRACCION",
                    TIPO_DETRACCION_DEFAULT
                  );

                this.getView()
                  .getModel("localModel")
                  .setProperty(
                    "/preRegistro/EDITABLE_DETRACCION",
                    EDITABLE_DETRACCION
                  );
              }

              //ADJUNTAR ARCHIVO
              data.dataxml = dataxml;
              if (
                !(preRegistro.dataAttached && preRegistro.dataAttached.length)
              ) {
                preRegistro.dataAttached = [];
              }
              preRegistro.dataAttached.push(data);

              // Reorganizar
              var counter = 0;
              preRegistro.dataAttached.forEach(function (row) {
                row.nroDoc = "0" + (counter + 1) * 10;
                row.indexDoc = counter;
                row.XmlEncode = [];
                row.XmlEncode.ARCHIVO = [];
                var Longito = data.FileEncode.length;
                var looper = parseInt(Longito / 100) + 1;
                /*for (var i = 0; i <= looper; i++) {
                var Linea = {
                  "ZLINEA": row.FileEncode.substring(i * 100, 100 * i + 100).toString()
                };
                row.XmlEncode.ARCHIVO.push(Linea);
              }*/
                counter++;
              });
              self
                .getView()
                .getModel("localModel")
                .setProperty("/preRegistro", preRegistro);
              self.getView().getModel("localModel").refresh();
              sap.m.MessageToast.show("Se toman datos de XML");
              //util.popups.showToast("Información", "Se toman datos de XML", 4, false, "bottomCenter");
            } else {
              //util.popups.showToast("Error", "No se toman datos de XML, Verificar Datos de Sunat", 2, false, "bottomCenter");
              utilPopUps.onMessageWarningDialogPress3(
                "No se toman datos de XML, Verificar Datos de Sunat"
              );
            }

            self.getView().getModel("modelLog").setData(aMensajes);
            self._getDialog().open();

            sap.ui.core.BusyIndicator.hide();
          } else {
            //
            if (consultarSunatResponse.message.includes("404")) {
              // util.popups.showToast("Por favor reintentar en unos minutos, ", "Servicio Sunat no disponible  \n" + dataresponse.oAuditResponse
              //   .sMessage, 2, true);
              utilPopUps.onMessageWarningDialogPress3(
                "Por favor reintentar en unos minutos, ",
                "Servicio Sunat no disponible"
              );
            } else {
              //util.popups.showToast("Error", "Error al comprobar Comprobante Sunat \n" + dataresponse.oAuditResponse.sMessage, 2, true);
              utilPopUps.onMessageWarningDialogPress3(
                "Error al comprobar Comprobante Sunat \n" +
                  consultarSunatResponse.message
              );
            }
            sap.ui.core.BusyIndicator.hide();
          }

          //});
          return;
        },

        handleFileUploadDocsAutomatico: function (oEvent) {
          let preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          if (!(preRegistro.dataAttached && preRegistro.dataAttached.length)) {
            preRegistro.dataAttached = [];
          }
          this.getView()
            .getModel("localModel")
            .setProperty("/preRegistro", preRegistro);

          //              // 1. Obtener solo los adjuntos seleccionados
          let listaAdjuntos =
            this.getView()
              .getModel("localModel")
              .getProperty("/listaAdjuntosSeleccionados") || []; // Usar seleccionados

          if (listaAdjuntos.length === 0) {
            console.log("No hay adjuntos seleccionados.");
            // MessageBox.warning("No hay adjuntos seleccionados para cargar.");
            util.utilPopUps.messageBox(
              "No hay adjuntos seleccionados para cargar.",
              "A",
              function () {}
            );
            return;
          }

          // 2. Procesar todos los adjuntos seleccionados
          for (let index = 0; index < listaAdjuntos.length; index++) {
            const element = listaAdjuntos[index];

            const file = {
              name: element.file_name,
              size: 1024,
              content: element.content,
            };

            if (!file) {
              console.log("No file selected");
              continue; // Si no hay archivo, pasar al siguiente
            }

            const fileExtension = file.name.split(".").pop().toLowerCase();

            const listaAdjuntosTipoArchivoXTipoEmisor = this.getView()
              .getModel("localModel")
              .getData().listaAdjuntosTipoArchivoXTipoEmisor;
            const extensionesPermitidas =
              listaAdjuntosTipoArchivoXTipoEmisor.map((item) =>
                item.DESCRIPCION.toLowerCase()
              );
            const encontrado = extensionesPermitidas.includes(fileExtension);
            if (!encontrado) {
              return util.utilPopUps.messageBox(
                "El tipo de archivo que está intentando subir no está permitido.",
                "A",
                function () {}
              );
              // MessageBox.warning(
              //   "El tipo de archivo que está intentando subir no está permitido."
              // );
            }

            if (preRegistro.dataAttached.length == 0) {
              if (fileExtension === "xml") {
                this.handleFileUploadXMLPrueba2({ file: file });
              } else {
                this.handleFileUploadPrueba2(file);
              }
            } else {
              const aEncontradosXML = preRegistro.dataAttached.filter(function (
                item,
                index
              ) {
                return item.tipoArchivoDoc == "xml";
              });

              if (aEncontradosXML.length > 0 && fileExtension == "xml") {
                MessageBox.warning(
                  "Ya existe un archivo XML subido. ¿Desea sobrescribirlo?",
                  {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function (oAction) {
                      if (oAction === MessageBox.Action.OK) {
                        const aEncontradosNoXML =
                          preRegistro.dataAttached.filter(function (
                            item,
                            index
                          ) {
                            return item.tipoArchivoDoc != "xml";
                          });
                        preRegistro.dataAttached = aEncontradosNoXML;
                        this.getView()
                          .getModel("localModel")
                          .setProperty("/preRegistro", preRegistro);

                        this.handleFileUploadXMLPrueba({ file: file });
                        console.log("Archivo XML sobrescrito.");
                      } else {
                        console.log("Sobrescritura del archivo XML cancelada.");
                        event.target.value = "";
                      }
                    }.bind(this),
                  }
                );
              } else {
                if (fileExtension === "xml") {
                  this.handleFileUploadXMLPrueba({ file: file });
                } else {
                  this.handleFileUploadPrueba2(file);
                }
              }
            }
          }
        },

        handleFileUploadDocs: function (oEvent) {
          debugger;
          var fU = this.getView().byId("idfileUploaderDocs");
          var domRef = fU.getFocusDomRef();
          var file =
            domRef.files == undefined ? fU.FUEl.files[0] : domRef.files[0];

          let preRegistro = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro");
          if (!(preRegistro.dataAttached && preRegistro.dataAttached.length)) {
            preRegistro.dataAttached = [];
          }
          this.getView()
            .getModel("localModel")
            .setProperty("/preRegistro", preRegistro);

          if (!file) {
            console.log("No file selected");
            return;
          }

          const fileExtension = file.name.split(".").pop().toLowerCase();

          // const listaAdjuntosTipoArchivoXTipoEmisor = this.getView()
          //   .getModel("localModel")
          //   .getData().listaAdjuntosTipoArchivoXTipoEmisor;
          // const extensionesPermitidas = listaAdjuntosTipoArchivoXTipoEmisor.map(
          //   (item) => item.DESCRIPCION.toLowerCase()
          // );
          // const encontrado = extensionesPermitidas.includes(fileExtension);
          // if (!encontrado) {
          //   return util.utilPopUps.messageBox(
          //     "El tipo de archivo que está intentando subir no está permitido.",
          //     "A",
          //     function () {}
          //   );
          //   //  MessageBox.warning(
          //   //   "El tipo de archivo que está intentando subir no está permitido."
          //   // );
          // }

          const listaTipoDocumentoGlobal = this.getView()
            .getModel("localModel")
            .getProperty("/listaTipoDocumentoGlobal");

          const codigosDocumentosPermitidos = listaTipoDocumentoGlobal.map(
            (item) => item.key
          );

          const listaTM0002 = this.getView()
            .getModel("localModel")
            .getData().listaAdjuntosTipoArchivoXTipoEmisor;

          const extensionesPermitidas = listaTM0002
            .filter((item) => codigosDocumentosPermitidos.includes(item.VALOR))
            .map((item) => item.DESCRIPCION.toLowerCase());

          const oProveedor = this.getView()
            .getModel("localModel")
            .getProperty("/ProveedorSeleccionado");

          const listaTipoEmisor = this.getView()
            .getModel("localModel")
            .getProperty("/listaTipoEmisor");

          const aEncontradoTipoEmisor = listaTipoEmisor.find(
            (item) => item.CAMPO == oProveedor.TIPO_EMISOR
          );
          const esEmisorElectronico =
            aEncontradoTipoEmisor?.DESCRIPCION === "Emisor Electrónico";
          if (
            !extensionesPermitidas.includes(fileExtension) &&
            !(fileExtension === "xml" && esEmisorElectronico)
          ) {
            return util.utilPopUps.messageBox(
              "El tipo de archivo que está intentando subir no está permitido.",
              "A",
              function () {}
            );
          }

          if (preRegistro.dataAttached.length == 0) {
            if (fileExtension === "xml") {
              this.handleFileUploadXMLPrueba({ file: file });
            } else {
              this.handleFileUploadPrueba();
            }
          } else {
            const aEncontradosXML = preRegistro.dataAttached.filter(function (
              item,
              index
            ) {
              return item.tipoArchivoDoc == "xml";
            });

            if (aEncontradosXML.length > 0 && fileExtension == "xml") {
              MessageBox.warning(
                "Ya existe un archivo XML subido. ¿Desea sobrescribirlo?",
                {
                  actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                  onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                      const aEncontradosNoXML = preRegistro.dataAttached.filter(
                        function (item, index) {
                          return item.tipoArchivoDoc != "xml";
                        }
                      );
                      preRegistro.dataAttached = aEncontradosNoXML;
                      this.getView()
                        .getModel("localModel")
                        .setProperty("/preRegistro", preRegistro);

                      this.handleFileUploadXMLPrueba({ file: file });
                      console.log("Archivo XML sobrescrito.");
                    } else {
                      console.log("Sobrescritura del archivo XML cancelada.");
                      event.target.value = "";
                    }
                  }.bind(this),
                }
              );
            } else {
              if (fileExtension === "xml") {
                this.handleFileUploadXMLPrueba({ file: file });
              } else {
                this.handleFileUploadPrueba();
              }
            }
          }
          return;
        },

        onpressEliminarDocs: function (oEvent) {
          var oModel = this.getView().getModel("localModel");
          var preRegistro = oModel.getProperty("/preRegistro");

          var oSelectedItem = oEvent
            .getSource()
            .getBindingContext("localModel");

          if (oSelectedItem) {
            let limpiarCampos = false;
            var sPath = oSelectedItem.getPath();

            var iIndex = sPath.split("/").pop();

            if (
              Array.isArray(preRegistro.dataAttached) &&
              iIndex >= 0 &&
              iIndex < preRegistro.dataAttached.length
            ) {
              var fileToDelete = preRegistro.dataAttached[iIndex];
              if (fileToDelete.tipoArchivoDoc == "xml") {
                limpiarCampos = true;
              }
              // 🔹 Restar su peso al total acumulado
              let totalSizePdfUploaded =
                oModel.getProperty("/totalSizePdfUploaded") || 0;

              if (fileToDelete.fileSizeDoc) {
                totalSizePdfUploaded -= fileToDelete.fileSizeDoc;
                if (totalSizePdfUploaded < 0) totalSizePdfUploaded = 0; // seguridad
              }

              // 🔹 Actualizar en el modelo
              oModel.setProperty("/totalSizePdfUploaded", totalSizePdfUploaded);

              preRegistro.dataAttached.splice(iIndex, 1); // Elimina el elemento en el índice específico

              preRegistro.dataAttached.forEach(function (doc, idx) {
                const newNroDoc = idx + 1;
                doc.nroDoc = String(newNroDoc).padStart(3, "0");
                doc.indexDoc = newNroDoc;
              });
            }

            if (limpiarCampos) {
              preRegistro.NRO_SERIE = "";
              preRegistro.NRO_COMPROBANTE = "";
              preRegistro.TIPO_DETRACCION = "";

              // Muy importante 👉 asegurarse de que sigan editables
              preRegistro.Editable = true;
              preRegistro.EDITABLE_DETRACCION = true;
              preRegistro.FECHA_EMISION = new Date();
            }
			this.actualizarClasesDisponibles();
            oModel.refresh(true);
          }
        },

        handleTypeMissmatchXML: function (oEvent) {
          var aFileTypes = oEvent.getSource().getFileType();
          jQuery.each(aFileTypes, function (key, value) {
            aFileTypes[key] = "*." + value;
          });
          var sSupportedFileTypes = aFileTypes.join(", ");
          sap.m.MessageToast.show(
            "El tipo de documento *." +
              oEvent.getParameter("fileType") +
              " no es soportado. Seleccione unicamente los siguientes tipos : " +
              sSupportedFileTypes
          );
        },
        _getDialog: function () {
          if (!this._oDialog) {
            this._oDialog = sap.ui.xmlfragment(
              "paltarumi.portalweb.registroprefactura..view.fragment.Log",
              this
            );
            this.getView().addDependent(this._oDialog);
          }
          return this._oDialog;
        },
        onCloseDialog: function () {
          //this._getDialog().close();
          if (this._getDialog()) {
            this._getDialog().destroy(true);
            this._oDialog = undefined;
          }
        },
        // viewImage: function (oEvent) {
        //   var name = oEvent.getSource().mProperties.title;
        //   //var id = oEvent.getSource().data("data");
        //   var tipo = this.getFileType(name);

        //   var preRegistro = this.getView()
        //     .getModel("localModel")
        //     .getProperty("/preRegistro");
        //   var IndexOf = oEvent.getSource().data("indexOf");
        //   //

        //   if (tipo == "pdf") {
        //     var archivo = preRegistro.dataAttached[IndexOf].FileEncode;
        //     let pdfWindow = window.open("");
        //     pdfWindow.document.write(
        //       "<iframe  width='100%' height='100%' src='data:application/" +
        //         tipo +
        //         ";base64, " +
        //         encodeURI(archivo) +
        //         "'></iframe>"
        //     );
        //   } else if (tipo === "docx" || tipo === "doc") {
        //     // Asegúrate de que 'archivo' es una cadena de base64 válida
        //     try {
        //       var archivo = preRegistro.dataAttached[IndexOf].FileEncode;
        //       // Decodificar el archivo de base64 a un Blob
        //       var byteCharacters = atob(archivo);
        //       var byteNumbers = new Array(byteCharacters.length);
        //       for (var i = 0; i < byteCharacters.length; i++) {
        //         byteNumbers[i] = byteCharacters.charCodeAt(i);
        //       }
        //       var byteArray = new Uint8Array(byteNumbers);
        //       var blob = new Blob([byteArray], {
        //         type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        //       });

        //       // Crear un enlace para descargar el archivo
        //       var url = URL.createObjectURL(blob);
        //       var pom = document.createElement("a");
        //       pom.setAttribute("href", url);
        //       pom.setAttribute(
        //         "download",
        //         name + (tipo === "docx" ? ".docx" : ".doc")
        //       );
        //       document.body.appendChild(pom);
        //       pom.click();
        //       document.body.removeChild(pom);
        //       URL.revokeObjectURL(url); // Libera los recursos
        //     } catch (e) {
        //       console.error("Error decoding base64:", e);
        //     }
        //   } else if (tipo === "png" || tipo === "jpg" || tipo === "jpeg") {
        //     var archivo = preRegistro.dataAttached[IndexOf].FileEncode; // Suponiendo que el archivo está codificado
        //     let imgWindow = window.open("");
        //     imgWindow.document.write(
        //       "<html><head><title>" +
        //         name +
        //         "</title></head><body style='text-align: center;'>" +
        //         "<img src='data:image/" +
        //         tipo +
        //         ";base64," +
        //         encodeURI(archivo) +
        //         "' style='max-width: 100%; height: auto;'/>" +
        //         "<br>" +
        //         "<a href='data:image/" +
        //         tipo +
        //         ";base64," +
        //         encodeURI(archivo) +
        //         "' download='" +
        //         name +
        //         "." +
        //         tipo +
        //         "' style='display: inline-block; margin-top: 10px; padding: 10px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;'>Descargar Imagen</a>" +
        //         "</body></html>"
        //     );
        //   } else {
        //     var archivo = preRegistro.dataAttached[IndexOf].dataxml;
        //     //archivo = archivo.replace(/</g, "&lt;")
        //     //archivo = archivo.replace(/>/g, "&gt;")
        //     //let pdfWindow = window.open("text/xml")
        //     //pdfWindow.document.write(archivo);

        //     //VISUALIZAR
        //     if (!archivo.includes("stylesheet")) {
        //       let blob = new Blob([archivo], {
        //         type: "text/xml",
        //       });
        //       let url = URL.createObjectURL(blob);
        //       window.open(url);
        //       URL.revokeObjectURL(url); //Releases the resources
        //     }

        //     //DESCARGAR
        //     var filename = name + ".xml";
        //     var pom = document.createElement("a");
        //     var bb = new Blob([archivo], {
        //       type: "text/plain",
        //     });

        //     pom.setAttribute("href", window.URL.createObjectURL(bb));
        //     pom.setAttribute("download", filename);

        //     pom.dataset.downloadurl = [
        //       "text/plain",
        //       pom.download,
        //       pom.href,
        //     ].join(":");
        //     pom.draggable = true;
        //     pom.classList.add("dragout");

        //     pom.click();
        //   }

        //   /*window.open("data:application/pdf," + encodeURI(preRegistro.dataAttached[IndexOf].FileEncode),"_blank",
        //   "toolbar=yes,top=500,left=500,width=400,height=400");*/

        //   /*window.open("/ProvyCajasDB/Service/CargaArchivo/MostrarArchivoCnService.xsjs?NameDocumento=" + name + "&IdDocumento=" + id +
        //   "&tipoDoc=" + tipo,
        //   "_blank",
        //   "toolbar=yes,top=500,left=500,width=400,height=400");*/
        // },

        viewImage: async function (oEvent) {
          // Obtener los parámetros necesarios desde el modelo
          const CODIGO_MAESTRO_DETALLE_SOCIEDAD = this.getView()
            .getModel("localModel")
            .getData().datosSociedad[0].CODIGO_MAESTRO_DETALLE;
          const ruc = this.getView()
            .getModel("localModel")
            .getProperty("/datosCabecera").RUC;
          let CORRELATIVO_SCP = this.getView()
            .getModel("localModel")
            .getProperty("/selectedRowsPreFacturaDetalle")[0].CORRELATIVO_SCP;
          const ID_ADJUNTO = oEvent
            .getSource()
            .getBindingContext("localModel")
            .getObject().UUID_ADJUNTO;
          const TIPO = oEvent
            .getSource()
            .getBindingContext("localModel")
            .getObject().TIPO;

          // Verificar que todos los parámetros necesarios están presentes
          if (
            !(
              CODIGO_MAESTRO_DETALLE_SOCIEDAD &&
              ruc &&
              CORRELATIVO_SCP &&
              ID_ADJUNTO &&
              TIPO
            )
          ) {
            // MessageBox.warning("No se puede consultar el contenido del documento.");
            util.utilPopUps.messageBox(
              "No se puede consultar el contenido del documento.",
              "A",
              function () {}
            );
            return;
          }

          let path = `/${ruc}/${CORRELATIVO_SCP}/${ID_ADJUNTO}.${TIPO.toLowerCase()}`;
          const NOMBRE_ADJUNTO = oEvent
            .getSource()
            .getBindingContext("localModel")
            .getObject().NOMBRE_ADJUNTO;

          var tipoPrueba = TIPO.toLowerCase();
          // Llamar al servicio para obtener el archivo en base64
          const procesoGetFileResponse = await this.procesoGetFile(
            path,
            tipoPrueba
          );
          if (procesoGetFileResponse) {
            const base64 = procesoGetFileResponse.getFile.base64;
            const tipoExtension = procesoGetFileResponse.getFile.extension;
            const urlArchivo = procesoGetFileResponse.getFile.urlArchivo;
            try {
              sap.ui.core.BusyIndicator.show(0);
              // Decodificar el archivo base64 y abrirlo según su tipo
              if (tipoExtension === "pdf") {
                const binaryData = atob(base64);
                const length = binaryData.length;
                const bytes = new Uint8Array(length);
                for (let i = 0; i < length; i++) {
                  bytes[i] = binaryData.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: "application/pdf" });
                const blobURL = URL.createObjectURL(blob);
                window.open(blobURL, "_blank");
                URL.revokeObjectURL(blobURL); // Limpiar URL de Blob
              } else if (tipoExtension === "xml") {
                const xmlText = atob(base64);
                const blob = new Blob([xmlText], { type: "text/xml" });
                const blobURL = URL.createObjectURL(blob);
                window.open(blobURL, "_blank");
                URL.revokeObjectURL(blobURL); // Limpiar URL de Blob
              } else {
                window.open(urlArchivo, "_blank");
              }
            } catch (error) {
              console.error("Error al abrir el archivo", error);
            } finally {
              sap.ui.core.BusyIndicator.hide();
            }
          } else {
            // MessageBox.warning(
            //   "No se pudo cargar el archivo, consultar más tarde."
            // );
            util.utilPopUps.messageBox(
              "No se pudo cargar el archivo, consultar más tarde.",
              "A",
              function () {}
            );
          }
        },

        getFileType: function (filename) {
          // Extraer la extensión del archivo
          var extension = filename.split(".").pop().toLowerCase();

          // Determinar el tipo basado en la extensión
          if (extension === "pdf") {
            return "pdf";
          } else if (extension === "xml") {
            return "xml";
          } else if (extension === "png") {
            return "png";
          } else if (extension === "jpg") {
            return "jpg";
          } else if (extension === "jpge") {
            return "jpge";
          } else if (extension === "doc") {
            return "doc";
          } else if (extension === "docx") {
            return "docx";
          } else {
            return "unknown"; // Maneja otros tipos si es necesario
          }
        },
        ////////////////////////// GRABAR PERU ///////////////////////
        //////////////////////////////////////////////////////////////
        onPressGenerarRegistroFactura: async function () {
          try {
            var self = this;
            var response;
            self
              .getView()
              .setModel(new sap.ui.model.json.JSONModel([]), "modelLog");
            var preRegistro = this.getView()
              .getModel("localModel")
              .getProperty("/preRegistro");
            var aConstantes = this.getView()
              .getModel("localModel")
              .getProperty("/CONSTANTES");
            //var aAdjuntosPDF = this.getView().getModel("localModel").getProperty("/AdjuntosPDF");
            //var aAdjuntosXML = this.getView().getModel("localModel").getProperty("/AdjuntosXML");
            var serie = this.getView()
              .byId("NRO_SERIE")
              .getValue()
              .replace(/^(0+)/g, "");

            var correlativo = this.getView()
              .byId("COMPROBANTE")
              .getValue()
              .replace(/^(0+)/g, "");

            // Validar que número de serie y correlativo estén llenos
            if (!serie || !correlativo) {
              // MessageBox.warning(
              //   "Error: El número de serie y el correlativo son obligatorios."
              // );
              util.utilPopUps.messageBox(
                "El número de serie y el correlativo son obligatorios.",
                "E",
                function () {}
              );
              return;
            }

            var rucLogin = this.getView().getModel("localModel").getData()
              .ProveedorSeleccionado.usuario; //this.getView().getModel('localModel').getProperty('/infoUsuario').USUARIO;
            var datos_usuario = this.getView()
              .getModel("localModel")
              .getData().ProveedorSeleccionado;

            //var sociedad = this.getView().getModel("localModel").getProperty("/SociedadEscogida");
            var datosSociedad = this.getView()
              .getModel("localModel")
              .getProperty("/datosSociedad");
            //var datos_usuario = this.getView().getModel("localModel").getProperty("/DatosUsuario");
            var estados_comprobante = this.getView()
              .getModel("localModel")
              .getProperty("/EstadosComprobante");
            var estados_ruc = this.getView()
              .getModel("localModel")
              .getProperty("/EstadosRuc");
            var estados_domicilio = this.getView()
              .getModel("localModel")
              .getProperty("/EstadosDomicilio");
            var flagComprobante = false;
            var flagRuc = false;
            var flagDomicilio = false;
            var flagAdjuntoPDF = false;
            var flagAdjuntoXML = false;
            var tipoEmisor = datos_usuario.CODIGO_TIPO_EMISOR;

            /*aConstantes.forEach(function (cons) {
            if (cons.CAMPO === "DOC_ADJUNTO" && cons.VALOR_LOW === "X" && cons.BUKRS === sociedad) {
              flagAdjunto = true;
            }
          })*/
            // aAdjuntosPDF.forEach(function (a) {
            //   if (a.Campo == sociedad && a.CodigoSap == "X") {
            flagAdjuntoPDF = true;
            //   }
            // })
            // aAdjuntosXML.forEach(function (a) {
            //   if (a.Campo == sociedad && a.CodigoSap == "X") {
            flagAdjuntoXML = true;
            //   }

            preRegistro.dataAttachedPDF = [];
            // })
            preRegistro.dataAttachedXML = [];

            if (this.onValidaccion()) {
              //VALIDAR SI ES obligatorio el pdf
              if (flagAdjuntoPDF) {
                if (
                  !(
                    preRegistro.dataAttached &&
                    preRegistro.dataAttached.length > 0
                  )
                ) {
                  utilPopUps.messageBox(
                    " Adjunte los documentos para continuar",
                    "E",
                    function () {}
                  );
                  // sap.m.MessageToast.show(
                  //   "Error: No se puede registrar, por favor adjunte los documentos relacionados al comprobante"
                  // );
                  //util.popups.showToast("Error", "No se puede Registrar, Por favor adjuntar un archivo PDF del comprobante", 2, false);
                  return;
                }

                let claseDocumentoNoSeleccionada =
                  preRegistro.dataAttached.some(function (item) {
                    return (
                      !item.selectClaseDoc || item.selectClaseDoc.trim() === ""
                    );
                  });

                if (claseDocumentoNoSeleccionada) {
                  // MessageBox.warning(
                  //   "Error: Todos los documentos deben tener una clase de documento seleccionada."
                  // );
                  util.utilPopUps.messageBox(
                    "Todos los documentos deben tener una clase de documento seleccionada.",
                    "E",
                    function () {}
                  );
                  return;
                }
				
				const faltantes = this.validarDocumentosObligatorios(
				  preRegistro.dataAttached,
				  tipoEmisor == "E"
				);
				if (faltantes.length > 0) {
				  util.utilPopUps.messageBox(
					"Para guardar la factura debe adjuntar y clasificar los siguientes documentos:\n- " +
					  faltantes.join("\n- "),
					"A",
					function () {}
				  );
				  return;
				}
              }
			  
			  if (location.hostname === "localhost" || window.USE_MOCK) {
				  await this.guardarLocal(preRegistro);
				  util.utilPopUps.messageBox(
					"Factura guardada localmente (no se envió al servidor).",
					"S",
					function () {
					  self.onCloseCrearPreFacturaPeru();
					}
				  );
				  return;
				}

              preRegistro.dataAttachedPDF = preRegistro.dataAttached.filter(
                function (item, index) {
                  return item.tipoArchivoDoc == "pdf";
                }
              );

              preRegistro.dataAttachedXML = preRegistro.dataAttached.filter(
                function (item, index) {
                  return item.tipoArchivoDoc == "xml";
                }
              );

              let listaTipoDocumentoHijo = this.getView()
                .getModel("localModel")
                .getProperty("/listaTipoDocumentoHijo");
              //si es fisico, la serie no debe ser E o F
              if (tipoEmisor == "F") {
                if (serie.length > 0 && (serie[0] == "E" || serie[0] == "F")) {
                  util.utilPopUps.messageBox(
                    "No se puede registrar comprobantes electrónicos, proveedor no es emisor electrónico",
                    "E",
                    function () {}
                  );
                  //util.popups.showToast("Error", "No se puede registrar comprobantes electrónicos, proveedor no es emisor electrónico.", 2, false);
                  return;
                }
                // const tieneFactura = preRegistro.dataAttached.some(
                //   (item) =>
                //     item.selectClaseDoc &&
                //     (item.selectClaseDoc.trim() === "06" ||
                //       item.selectClaseDoc.trim() === "07" ||
                //       item.selectClaseDoc.trim() === "08")
                // );
                const tieneFactura = preRegistro.dataAttached.some(
                  (item) =>
                    item.selectClaseDoc &&
                    listaTipoDocumentoHijo.some(
                      (doc) =>
                        doc.CODIGO_MAESTRO_DETALLE.trim() ===
                          item.selectClaseDoc.trim() &&
                        doc.DESCRIPCION?.trim() === "Documento Factura"
                    )
                );

                if (!tieneFactura) {
                  util.utilPopUps.messageBox(
                    "Debe adjuntar al menos una factura.",
                    "A",
                    function () {}
                  );
                  return;
                }
              }

              //si es electronicio, la serie debe ser E o F
              if (tipoEmisor == "E") {
                if (
                  !(serie.length > 0 && (serie[0] == "E" || serie[0] == "F"))
                ) {
                  util.utilPopUps.messageBox(
                    "No se puede registrar comprobantes físicos, proveedor es emisor electrónico",
                    "E",
                    function () {}
                  );

                  //util.popups.showToast("Error", "No se puede registrar comprobantes físicos, proveedor es emisor electrónico.", 2, false);
                  return;
                }
              }
              //preRegistro.dataAttachedXML.filter()
              //si es electronico debe validar que se ahya adjuntando XML
              if (tipoEmisor == "E" && flagAdjuntoXML) {
                const tieneXML = preRegistro.dataAttached.some(
                  (item) =>
                    item.tipoArchivoDoc &&
                    item.tipoArchivoDoc.toLowerCase() === "xml"
                );
                // const tieneFactura = preRegistro.dataAttached.some(
                //   (item) =>
                //     item.selectClaseDoc &&
                //     ["06", "07", "08"].includes(item.selectClaseDoc.trim())
                // );
                const tieneFactura = preRegistro.dataAttached.some(
                  (item) =>
                    item.selectClaseDoc &&
                    listaTipoDocumentoHijo.some(
                      (doc) =>
                        doc.CODIGO_MAESTRO_DETALLE.trim() ===
                          item.selectClaseDoc.trim() &&
                        doc.DESCRIPCION?.trim() === "Documento Factura"
                    )
                );
                if (!tieneXML && !tieneFactura) {
                  sap.m.MessageToast.show(
                    "Error No se puede Registrar, Por favor adjuntar al menos un archivo XML del comprobante y Factura"
                  );
                  return;
                } else if (!tieneXML || !tieneFactura) {
                  let mensaje = [];
                  if (!tieneXML) {
                    mensaje.push(
                      "Debe adjuntar al menos un archivo XML del comprobante"
                    );
                  }
                  if (!tieneFactura) {
                    mensaje.push("Debe adjuntar al menos una factura.");
                  }
                  util.utilPopUps.messageBox(
                    mensaje.join("\n"),
                    "A",
                    function () {}
                  );
                  return;
                }
              }

              //si es electronico
              if (
                tipoEmisor == "E" &&
                serie.length > 0 &&
                (serie[0] == "E" || serie[0] == "F")
              ) {
                sap.ui.core.BusyIndicator.show();
                ////////
                var ruc = this.getView().getModel("localModel").getData()
                  .ProveedorSeleccionado.usuario;
                //this.getView().getModel('localModel').getProperty('/infoUsuario').USUARIO;

                var correlativo = this.getView()
                  .byId("COMPROBANTE")
                  .getValue()
                  .replace(/^(0+)/g, "");
                var fecha = this.getView()
                  .byId("FECHA_EMISION")
                  .getValue()
                  .split("-")
                  .join("/");
                var importe = this.getView().byId("IMPORTE").getValue();
                importe = importe.replace(",", "");
                importe = importe.replace("'", "");
                var datos = {
                  numRuc: ruc,
                  codComp: "01",
                  numeroSerie: serie,
                  numero: correlativo,
                  fechaEmision: fecha,
                  monto: importe,
                  rucSociedad: this.getView()
                    .getModel("localModel")
                    .getProperty("/datosSociedad")[0].VALOR,
                };
                /// PRUEBA
                // var datos =
                // {
                //   "numRuc": "10077006309",
                //   "codComp": "01",
                //   "numeroSerie": "F003",
                //   "numero": "39426",
                //   "fechaEmision": "05/08/2023",
                //   "monto": "16.00"
                // }
                let consultarSunatResponse = await self.consultarSunat(datos);

                if (consultarSunatResponse.code === 1) {
                  var aMensajes = [];
                  var oMensaje = {};
                  var response = consultarSunatResponse.results.consultarSunat;
                  //estadoCp

                  var aUniEstado = estados_comprobante.filter(function (item) {
                    return item.CAMPO == response.estadoCp;
                  });
                  if (aUniEstado.length > 0) {
                    if (aUniEstado[0].DESCRIPCION == "OK") {
                      flagComprobante = true;
                    }
                  }

                  //estadoRuc

                  var aUniEstado = estados_ruc.filter(function (item) {
                    return item.CAMPO == response.estadoRuc;
                  });
                  if (aUniEstado.length > 0) {
                    if (aUniEstado[0].DESCRIPCION == "OK") {
                      flagRuc = true;
                    }
                  }

                  //Domicilio

                  var aUniEstado = estados_domicilio.filter(function (item) {
                    return item.CAMPO == response.condDomiRuc;
                  });
                  if (aUniEstado.length > 0) {
                    if (aUniEstado[0].DESCRIPCION == "OK") {
                      flagDomicilio = true;
                    }
                  }

                  if (flagComprobante && flagRuc && flagDomicilio) {
                    /*if (flagAdjunto) {
                    if (preRegistro.dataAttached.length > 0) {*/

                    //MCA verifica sociedad grabada en modelo Proveedor
                    var sociedad = datosSociedad[0].CODIGO_MAESTRO_DETALLE;
                    var tipoEmisor = datos_usuario.CODIGO_TIPO_EMISOR;
                    preRegistro.TIPO_EMISOR = tipoEmisor;
                    //if (sociedad === undefined || sociedad === null || sociedad === '') {
                    this.getView()
                      .getModel("localModel")
                      .setProperty(
                        "/Proveedor/Sociedad",
                        datosSociedad[0].VALOR
                      );
                    //}

                    response = await self.RegistroPreliminar(self, preRegistro);
                    // return;
                    if (response != undefined) {
                      if (response.code == 1) {
                        let bloques = 3;
                        let finalAnswer;

                        var aAdjuntos = [];
                        const aImagenes = preRegistro.dataAttached;

                        // Crea la estructura de entrada
                        if (aImagenes && aImagenes.length > 0) {
                          for (
                            let indice = 0;
                            indice < aImagenes.length;
                            indice++
                          ) {
                            if (
                              !aImagenes[indice].selectClaseDoc ||
                              aImagenes[indice].selectClaseDoc.trim() === ""
                            ) {
                              // MessageBox.warning(
                              //   "Error: La clase de documento no puede estar vacía"
                              // );
                              util.utilPopUps.messageBox(
                                "La clase de documento no puede estar vacía",
                                "E",
                                function () {}
                              );
                              return; // Salir de la función si hay un error
                            }
                            var json = {
                              sNombreArchivo:
                                aImagenes[indice].nombreArchivoDoc,
                              sBase64String: aImagenes[indice].FileEncode,
                              sExtencion:
                                "document/" + aImagenes[indice].tipoArchivoDoc,
                              sSelectClaseDoc: aImagenes[indice].selectClaseDoc,
                            };

                            aAdjuntos.push(json);
                          }
                        }

                        const listaEnvioBloques =
                          util.utilUI.listaAdjuntosxBloque(aAdjuntos, bloques);

                        //LLamar al otro servicio
                        const correlativoSCP = response.results.CORRELATIVO_SCP;
                        const listaPostRegPreliminar =
                          response.results.listaPostRegPreliminar;

                        const promesas = listaEnvioBloques.map(
                          async (adjuntoBloque) => {
                            let oParam = {
                              adjuntos: adjuntoBloque,
                              ruc: ruc,
                              correlativoSCP: correlativoSCP,
                              listaPostRegPreliminar: listaPostRegPreliminar,
                            };

                            //llamar servicio
                            let response = await service.servicePost(
                              constantes.services.registrarAdjuntosXBloque,
                              oParam,
                              self
                            );
                            return response;
                          }
                        );

                        let findResult = await Promise.all(promesas);

                        utilPopUps.messageBox(
                          "Se ha registrado el comprobante " +
                            response.results.cabeceraComprobante
                              .NRO_COMPROBANTE +
                            " , con correlativo : " +
                            response.results.CORRELATIVO_SCP,
                          "S",
                          function () {
                            self.onCloseCrearPreFacturaPeru();
                            self.onSearch();
                          }
                        );
                      } else {
                        //utilPopUps.onMessageWarningDialogPress3("Error Proceso PreFactura " + response.message);
                        utilHttp.validarRespuestaServicio(response);
                      }
                    }

                    self
                      .getView()
                      .getModel("localModel")
                      .setProperty("/preRegistro", preRegistro);
                    self.getView().getModel("localModel").refresh();
                    //util.popups.showToast("Información", "Verificación Comprobante Sunat exitosa", 4, false, "bottomCenter");
                    //sap.ui.core.BusyIndicator.hide();
                  } else {
                    //self.getView().getModel("modelLog").setData(aMensajes);
                    //self._getDialog().open();
                    //util.popups.showToast("Error", "No se puede Registrar, Verificar Datos de Sunat", 2, false, "bottomCenter");
                    utilPopUps.onMessageWarningDialogPress3(
                      "No se puede Registrar, Verificar Datos de Sunat"
                    );
                    sap.ui.core.BusyIndicator.hide();
                  }
                } else {
                  //
                  // if (dataresponse.oAuditResponse.sMessage.includes('404')) {
                  //   // util.popups.showToast("Servicio de SUNAT no disponible, por favor reintentar en unos minutos, ",
                  //   //   "Servicio Sunat no disponible  \n" + dataresponse.oAuditResponse
                  //   //   .sMessage, 2, true);
                  //   utilPopUps.onMessageWarningDialogPress3(
                  //     'Servicio de SUNAT no disponible, por favor reintentar en unos minutos, ',
                  //     'Servicio Sunat no disponible \n' + consultarSunatResponse.message
                  //   );
                  // } else {
                  //   //util.popups.showToast("Error", "Error al comprobar Comprobante Sunat \n" + dataresponse.oAuditResponse.sMessage, 2, true);
                  //   utilPopUps.onMessageWarningDialogPress3(
                  //     'Error al comprobar Comprobante Sunat \n' + consultarSunatResponse.message
                  //   );
                  // }

                  utilPopUps.messageBox(
                    "Servicio de SUNAT no disponible, por favor reintentar en unos minutos.",
                    "E",
                    function () {
                      // do nothing...
                    }
                  );
                  sap.ui.core.BusyIndicator.hide();
                }
              } else {
                var ruc = this.getView().getModel("localModel").getData()
                  .ProveedorSeleccionado.usuario;
                ////////

                /*if (flagAdjuntoPDF) {
                if (preRegistro.dataAttached.length > 0) {*/

                //MCA verifica sociedad grabada en modelo Proveedor
                var sociedad = datosSociedad[0].CODIGO_MAESTRO_DETALLE;

                this.getView()
                  .getModel("localModel")
                  .setProperty("/Proveedor/Sociedad", datosSociedad[0].VALOR);

                var tipoEmisor = datos_usuario.CODIGO_TIPO_EMISOR;
                preRegistro.TIPO_EMISOR = tipoEmisor;

                response = await self.RegistroPreliminar(this, preRegistro);
                // return;
                if (response != undefined) {
                  if (response.code == 1) {
                    let bloques = 3;
                    var aAdjuntos = [];
                    const aImagenes = preRegistro.dataAttached;

                    // Crea la estructura de entrada
                    if (aImagenes && aImagenes.length > 0) {
                      for (
                        let indice = 0;
                        indice < aImagenes.length;
                        indice++
                      ) {
                        if (
                          !aImagenes[indice].selectClaseDoc ||
                          aImagenes[indice].selectClaseDoc.trim() === ""
                        ) {
                          // MessageBox.warning(
                          //   "Error: La clase de documento no puede estar vacía"
                          // );
                          util.utilPopUps.messageBox(
                            "La clase de documento no puede estar vacía",
                            "E",
                            function () {}
                          );
                          return; // Salir de la función si hay un error
                        }
                        var json = {
                          sNombreArchivo: aImagenes[indice].nombreArchivoDoc,
                          sBase64String: aImagenes[indice].FileEncode,
                          sExtencion:
                            "document/" + aImagenes[indice].tipoArchivoDoc,
                          sSelectClaseDoc: aImagenes[indice].selectClaseDoc,
                        };

                        aAdjuntos.push(json);
                      }
                    }

                    const listaEnvioBloques = util.utilUI.listaAdjuntosxBloque(
                      aAdjuntos,
                      bloques
                    );

                    //LLamar al otro servicio
                    const correlativoSCP = response.results.CORRELATIVO_SCP;
                    const listaPostRegPreliminar =
                      response.results.listaPostRegPreliminar;

                    const promesas = listaEnvioBloques.map(
                      async (adjuntoBloque) => {
                        let oParam = {
                          adjuntos: adjuntoBloque,
                          ruc: ruc,
                          correlativoSCP: correlativoSCP,
                          listaPostRegPreliminar: listaPostRegPreliminar,
                        };

                        //llamar servicio
                        let response = await service.servicePost(
                          constantes.services.registrarAdjuntosXBloque,
                          oParam,
                          self
                        );
                        return response;
                      }
                    );

                    let findResult = await Promise.all(promesas);
                    utilPopUps.messageBox(
                      "Se ha registrado el comprobante " +
                        response.results.cabeceraComprobante.NRO_COMPROBANTE +
                        " , con correlativo : " +
                        response.results.CORRELATIVO_SCP,
                      "S",
                      function () {
                        self.onCloseCrearPreFacturaPeru();
                        self.onSearch();
                      }
                    );
                  } else {
                    //utilPopUps.onMessageWarningDialogPress3("Error Proceso PreFactura " + response.message);
                    utilHttp.validarRespuestaServicio(response);
                  }
                }
              }
            }
          } catch (error) {
            console.log("error", error);
            utilPopUps.onMessageWarningDialogPress3(
              "Error Proceso onPressGenerarRegistroFactura " + error.toString()
            );
          } finally {
          }
        },
		
		actualizarClasesDisponibles: function () {
		  const lm = this.getView().getModel("localModel");
		  const pre = lm.getProperty("/preRegistro");
		  const docs = (pre && pre.dataAttached) || [];
		  const pdfs = docs.filter(
			(d) => (d.tipoArchivoDoc || "").toLowerCase() === "pdf"
		  );

		  pdfs.forEach((d) => {
			// Guarda la lista completa la primera vez
			if (!d.listaTipoDocumentoBase) {
			  d.listaTipoDocumentoBase = (d.listaTipoDocumento || []).slice();
			}
			// Clases ya elegidas en OTROS pdf
			const usadas = pdfs
			  .filter((o) => o !== d && o.selectClaseDoc)
			  .map((o) => o.selectClaseDoc);

			d.listaTipoDocumento = d.listaTipoDocumentoBase.filter(
			  (i) => !i.key || !usadas.includes(i.key)
			);
		  });

		  lm.refresh(true);
		},

		onCambiarClaseDoc: function () {
		  this.actualizarClasesDisponibles();
		},
		
		guardarLocal: function (preRegistro) {
		  const lm = this.getView().getModel("localModel");
		  const registro = {
			fecha: new Date().toISOString(),
			serie: preRegistro.NRO_SERIE,
			comprobante: preRegistro.NRO_COMPROBANTE,
			fechaEmision: preRegistro.FECHA_EMISION,
			importe: preRegistro.IMPORTE,
			moneda: preRegistro.MONEDA,
			proveedor: lm.getProperty("/ProveedorSeleccionado"),
			partes: lm.getProperty("/selectedRowsPreFactura"),
			documentos: (preRegistro.dataAttached || []).map((d) => ({
			  nombre: d.nombreArchivoDoc,
			  tipo: d.tipoArchivoDoc,
			  clase: d.selectClaseDoc,
			  base64: d.FileEncode,
			})),
		  };
		  return new Promise((resolve, reject) => {
			const open = indexedDB.open("prefacturas-local", 1);
			open.onupgradeneeded = () =>
			  open.result.createObjectStore("registros", { keyPath: "id", autoIncrement: true });
			open.onerror = () => reject(open.error);
			open.onsuccess = () => {
			  const tx = open.result.transaction("registros", "readwrite");
			  tx.objectStore("registros").add(JSON.parse(JSON.stringify(registro)));
			  tx.oncomplete = () => resolve();
			  tx.onerror = () => reject(tx.error);
			};
		  });
		},
		
		validarDocumentosObligatorios: function (aAdjuntos, requiereXml) {
		  const norm = (s) =>
			(s || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
		  const lista = this.getView().getModel("localModel").getProperty("/listaTipoDocumentoGlobal") || [];
		  const textoDe = (key) => {
			const f = lista.find((i) => i.key === key);
			return f ? norm(f.text) : "";
		  };

		  const requeridos = [
			{ etiqueta: "Factura (PDF)", ext: "pdf", ok: (t) => t.includes("factura") },
			{ etiqueta: "Orden de Compra (PDF)", ext: "pdf", ok: (t) => t.includes("orden de compra") },
			{ etiqueta: "Guía de remisión (PDF)", ext: "pdf", ok: (t) => t.includes("remision") },
		  ];
		  if (requiereXml) {
			requeridos.push({ etiqueta: "XML del comprobante", ext: "xml", ok: () => true });
		  }

		  return requeridos
			.filter((r) => !aAdjuntos.some((a) =>
			  (a.tipoArchivoDoc || "").toLowerCase() === r.ext && r.ok(textoDe(a.selectClaseDoc))))
			.map((r) => r.etiqueta);
		},

        // ================================================    [ VALIDADOR DE FORMULARIO ]
        onValidaccion: function (pais) {
          if (!pais) {
            pais = "PE";
          }
          // validacion de los input's
          var booleano = false;
          //var txtNroserie = this.getView().byId('NRO_SERIE');
          var txtNrocomprobante = this.getView().byId("COMPROBANTE");
          var txtFechabase = this.getView().byId("FECHA_BASE");
          var txtFechaemision = this.getView().byId("FECHA_EMISION");
          // Validacion si existe los preRegistro
          var dataAttached = this.getView()
            .getModel("localModel")
            .getProperty("/preRegistro").dataAttached;
          var cobClasedocumento = this.getView()
            .byId("ncboClaseDocumento")
            .getSelectedKey();
          // var cboCondicionpago = this.getView().byId("cboCondicionPago").getSelectedKey();
          if (pais == "PE") {
            var txtNroserie = this.getView().byId("NRO_SERIE");
            //var cboTipoimpuesto = this.getView().byId('cboTipoImpuesto').getSelectedKey();
            var cboDetraccion = this.getView()
              .byId("cboDetraccion")
              .getSelectedKey();
          }

          // var cboTiporetencion = this.getView().byId("cboRetencionIGV").getSelectedKey();
          // Validacion del texto numero de serie.
          if (pais == "PE") {
            if (utilController.isVacio(txtNroserie.getValue())) {
              txtNroserie.setValueState(sap.ui.core.ValueState.Error);
              this.mensajeObligatorio();
              txtNroserie.setValueStateText("Ingrese numero de serie.");
              // booleano = true;
              return false;
            }
          }
          // Validacion del texto numero de comprobante.
          if (utilController.isVacio(txtNrocomprobante.getValue())) {
            txtNrocomprobante.setValueState(sap.ui.core.ValueState.Error);
            this.mensajeObligatorio();
            txtNrocomprobante.setValueStateText(
              "Ingrese número de comprobante."
            );
            // booleano = true;
            return false;
          }
          // Validacion del texto numero de comprobante.
          if (utilController.isVacio(txtFechaemision.getValue())) {
            txtFechaemision.setValueState(sap.ui.core.ValueState.Error);
            this.mensajeObligatorio();
            txtFechaemision.setValueStateText("Ingrese una fecha válida.");
            // booleano = true;
            return false;
          }

          //cvc 260520
          var sFecha = txtFechaemision.getValue();
          var fechaa = sFecha.split("-");
          sFecha = fechaa[1] + "-" + fechaa[0] + "-" + fechaa[2];
          var fechae = new Date(sFecha);
          var fecha4 = new Date();
          var localModel = this.getView().getModel("localModel");
          var meses = localModel.getProperty("/ValorMeses");
          fecha4.setMonth(fecha4.getMonth() - parseInt(meses, 10));

          if (fechae < fecha4) {
            // MessageBox.error(
            //   "La fecha del comprobante es anterior al plazo permitido (" +
            //     meses +
            //     " meses), por favor verifique la fecha."
            // );
            util.utilPopUps.messageBox(
              "La fecha del comprobante es anterior al plazo permitido (" +
                meses +
                " meses), por favor verifique la fecha.",
              "E",
              function () {}
            );
            return false;
          }
          //cvc 260520

          if (cobClasedocumento === "") {
            //Utilities.fnErrorMensaje("Seleccione la Clase de Documento.");
            utilPopUps.onMessageWarningDialogPress3(
              "Seleccione la Clase de Documento."
            );
            // booleano = true;
            return false;
          }
          if (pais == "PE") {
            // if (cboTipoimpuesto === '') {
            //   //Utilities.fnErrorMensaje("Seleccione el Indicador de Impuesto.");
            //   utilPopUps.onMessageWarningDialogPress3('Seleccione el Indicador de Impuesto.');
            //   // booleano = true;
            //   return false;
            // }
            // if (cboDetraccion === '') {
            //   //Utilities.fnErrorMensaje("Seleccione el Indicador de Impuesto.");
            //   utilPopUps.onMessageWarningDialogPress3('Seleccione la Detracción.');
            //   // booleano = true;
            //   return false;
            // }
          }
          // todo acctivar validacion
          /*	if (dataAttached.length === 0) {
            Utilities.fnErrorMensaje("No existen archivos adjuntos.");
            booleano = true;
          }*/

          // Validar
          if (booleano) {
            return false;
          } else {
            return true;
          }
        },
        mensajeObligatorio: function () {
          /*sap.m.MessageToast.show("Por favor, complete todos los campos obligatorios.", {
          at: "center center",
        });*/
          //util.popups.showToast("Warning", "Por favor, complete todos los campos obligatorios.", 3, false);
          utilPopUps.onMessageWarningDialogPress3(
            "Por favor, complete todos los campos obligatorios."
          );
        },

        mensajeObligatorioCustom: function (message) {
          /*sap.m.MessageToast.show("Por favor, complete todos los campos obligatorios.", {
          at: "center center",
        });*/
          //util.popups.showToast("Warning", "Por favor, complete todos los campos obligatorios.", 3, false);
          utilPopUps.onMessageWarningDialogPress3(message);
        },

        onTestPP: async function () {
          this.onProcesoTest();
        },

        onValueHelpConfirm: async function (oEvent) {
          var aContexts = oEvent.getParameter("selectedContexts");
          let ProveedorSeleccionado = {
            nombre: "",
            apellido: "",
            razonSocial: "",
            usuario: "",
          };
          if (aContexts && aContexts.length) {
            const obj = aContexts[0].getObject();
            // ProveedorSeleccionado.nombre = obj.nombres;
            // ProveedorSeleccionado.apellido = obj.apellidos;
            // ProveedorSeleccionado.razonSocial = obj.razonSocial;
            // ProveedorSeleccionado.usuario = obj.usuario;

            let objProvSel = {
              //datosProveedor
              nombre: obj.nombres,
              apellido: obj.apellidos,
              razonSocial: obj.razonSocial,
              usuario: obj.usuario,
              //oInfoUsuario
              ID_ESTADO: 1,
              CORREO: obj.correo,
              NOMBRE: obj.nombres,
              APELLIDO: obj.apellidos,
              RUC: "",
              USUARIO: obj.usuario,
              RAZON_SOCIAL: obj.razonSocial,
              CODIGO_TIPO_EMISOR: obj.tipoDeEmisor,
              LISTA_ROLES: obj.listaCodRolesDescripcion,
              DESC_ROLES: obj.listaRolesDescripcion,
              TIPO_EMISOR: obj.tipoDeEmisor,
            };

            const CODIGO_TIPO_EMISOR = objProvSel.CODIGO_TIPO_EMISOR;

            const listaTipoEmisor = this.getView()
              .getModel("localModel")
              .getProperty("/listaTipoEmisor");

            const listaAdjuntosTipoArchivoXTipoEmisorGlobal = this.getView()
              .getModel("localModel")
              .getProperty("/listaAdjuntosTipoArchivoXTipoEmisorGlobal");

            const aEncontradoTipoEmisor = listaTipoEmisor.filter(function (
              item,
              index
            ) {
              return item.CAMPO == CODIGO_TIPO_EMISOR;
            });
            let listaAdjuntosTipoArchivoXTipoEmisor = [];
            listaAdjuntosTipoArchivoXTipoEmisor =
              listaAdjuntosTipoArchivoXTipoEmisorGlobal.filter(function (
                item,
                index
              ) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[5] &&
                  item.concat_cod_father_cod_hijo ==
                    aEncontradoTipoEmisor[0].CODIGO_MAESTRO_CABECERA +
                      "-" +
                      aEncontradoTipoEmisor[0].CODIGO_MAESTRO_DETALLE
                );
              });

            this.getView()
              .getModel("localModel")
              .setProperty(
                "/listaAdjuntosTipoArchivoXTipoEmisor",
                listaAdjuntosTipoArchivoXTipoEmisor
              );

            this.getView()
              .getModel("localModel")
              .setProperty("/ProveedorSeleccionado", objProvSel);
            this.getView()
              .getModel("localModel")
              .setProperty("/ProveedorSeleccionadoVisible", true);
            await this.consultarListaEmpresas();
          } else {
            this.getView()
              .getModel("localModel")
              .setProperty("/ProveedorSeleccionado");
            this.getView()
              .getModel("localModel")
              .setProperty("/ProveedorSeleccionadoVisible", false);
            MessageToast.show("No new item was selected.");
          }
          oEvent.getSource().getBinding("items").filter([]);
        },

        // onValueHelpRequest: async function () {
        //
        //   this.getView()
        //     .getModel("localModel")
        //     .setProperty("/paginacionFiltrosUsuario/pagina", 1);

        //   let { filtros: filtrosTot } = models
        //     .localModel()
        //     .getData().paginacionFiltrosUsuario;
        //   let filtros = filtrosTot[0];

        //   filtros = {
        //     ...filtros,
        //     ...{
        //       filtroBuscar: this.getView().byId("proveedorInput").getValue(),
        //     },
        //   };

        //   this.getView()
        //     .getModel("localModel")
        //     .setProperty("/paginacionFiltrosUsuario/filtros", [filtros]);

        //   const { paginacionFiltrosUsuario } = this.getView()
        //     .getModel("localModel")
        //     .getData();
        //   await this.onObtenerUsuariosPaginado(
        //     paginacionFiltrosUsuario.pagina,
        //     paginacionFiltrosUsuario.filtros
        //   );

        //   if (!this.oMPDialogBusquedaProv) {
        //     this.oMPDialogBusquedaProv = this.loadFragment({
        //       name: "paltarumi.portalweb.registroprefactura.view.fragment.BusquedaProveedor",
        //     });
        //   }
        //   this.oMPDialogBusquedaProv.then(
        //     function (oDialogBusquedaProv) {
        //       this.oDialogBusquedaProv = oDialogBusquedaProv;
        //       this.oDialogBusquedaProv.open();
        //     }.bind(this)
        //   );
        // },
        onValueHelpRequest: async function () {
          const oView = this.getView();
          const oLocalModel = oView.getModel("localModel");

          oLocalModel.setProperty("/paginacionFiltrosUsuario/pagina", 1);

          let { filtros: filtrosTot } =
            oLocalModel.getData().paginacionFiltrosUsuario;
          let filtros = filtrosTot[0] || {};

          const proveedorSeleccionado = oView
            .byId("proveedorInput")
            .getValue()
            .trim();

          if (proveedorSeleccionado) {
            oView.byId("proveedorInput").setValue("");
            filtros.filtroBuscar = "";
          } else {
            filtros.filtroBuscar = proveedorSeleccionado;
          }

          oLocalModel.setProperty("/paginacionFiltrosUsuario/filtros", [
            filtros,
          ]);

          const { paginacionFiltrosUsuario } = oLocalModel.getData();
          await this.onObtenerUsuariosPaginado(
            paginacionFiltrosUsuario.pagina,
            paginacionFiltrosUsuario.filtros
          );

          if (!this.oMPDialogBusquedaProv) {
            this.oMPDialogBusquedaProv = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.BusquedaProveedor",
            });
          }

          this.oMPDialogBusquedaProv.then(
            function (oDialogBusquedaProv) {
              this.oDialogBusquedaProv = oDialogBusquedaProv;
              this.oDialogBusquedaProv.open();
            }.bind(this)
          );
        },
        /** ---------------------- Configuración de columnas ---------------------- */
        onInicialiarColumansDinamicasTabla: function () {
          util.utilController.onInicialiarColumansDinamicasTabla(
            this,
            "tblPreRegistro",
            "/listaColunasDinamicasTablaXVisiblidad"
          );
          return;
        },
        onConfigurarColumnasMejorado: async function () {
          util.utilController.onConfigurarColumnasMejorado(
            this,
            "paltarumi.portalweb.registroprefactura.view.fragment.ConfigurarColumnaTabla",
            "/listaColumnasTablaAplicar",
            "/listaColunasDinamicasTablaXVisiblidad"
          );
        },
        onAplicarConfiguracion: function () {
          util.utilController.onAplicarConfiguracion(
            this,
            "/listaColunasDinamicasTablaXVisiblidad"
          );
        },

        onResetConfiguracion: function () {
          util.utilController.onResetConfiguracion(
            this,
            "/listaColunasDinamicasTablaXVisiblidad"
          );
        },

        onCloseConfigurarColumnas: function () {
          util.utilController.onCloseConfigurarColumnas(
            this.oDialogConfigColumn
          );
        },
        /** ---------------------- Configuración de columnas ---------------------- */

        exportarExcel: function () {
          var that = this;
          this.getView().getModel("localModel").refresh();
          var listaSAP = this.getView()
            .getModel("localModel")
            .getProperty("/ListaComprobantes");
          listaSAP.forEach((itemSAP) => {
            itemSAP.FECHA_ENTREGA1 = formatter.formatoFecha(
              itemSAP.FECHA_ENTREGA
            );
          });

          this.getView()
            .getModel("localModel")
            .setProperty("/ListaComprobantes", listaSAP);

          var proveedor = this.getView()
            .getModel("localModel")
            .getProperty("/ProveedorSeleccionado");

          var ruc = proveedor.USUARIO || "";
          var razonSocial = proveedor.RAZON_SOCIAL || "";

          var subtitulo = "Proveedor: " + ruc + " - " + razonSocial;

          var arrayColumTabla = [
            {
              name: "PARTE DE INGRESO",
              model: "NRO_PARTE_ENTRADA",
            },
            {
              name: "HOJA DE ENTRADA",
              model: "HES",
            },
            {
              name: "NOTA ENTREGA",
              model: "NRO_GUIA_REMISION",
            },
            {
              name: "POSICION",
              model: "POS_PARTE_ENTRADA",
            },
            {
              name: "FECHA CONTABILIZACION",
              model: "FECHA_ENTREGA1",
            },
            {
              name: "ARTICULO / SERVICIO",
              model: "ARTICULO_DESC",
            },
            {
              name: "CANTIDAD ENTREGA",
              model: "CANTIDAD_ENTREGADA",
            },
            {
              name: "UNIDAD",
              model: "UNIDAD_MEDIDA",
            },
            {
              name: "IMPORTE",
              model: "IMPORTE",
            },
            {
              name: "MONEDA",
              model: "MONEDA",
            },
            {
              name: "ORDEN COMPRA",
              model: "PEDIDO_REFERENCIA",
            },
            {
              name: "COMPROBANTE",
              model: "NRO_COMPROBANTE",
            },
            {
              name: "CORRELATIVO SCP",
              model: "CORRELATIVO_SCP",
            },
            {
              name: "EJERCICIO",
              model: "EJERCICIO",
            },
            {
              name: "MOTIVO RECHAZO",
              model: "COMENTARIO",
            },
            {
              name: "FECHA DE REGISTRO",
              model: "FECHA_REGISTRO",
            },
            {
              name: "FECHA DE RECHAZO",
              model: "FECHA_RECHAZO",
            },
          ];
          //historialpagov2

          util.utilUI.crearExcel(
            this,
            "localModel",
            "ListaComprobantes",
            [],
            "newModel",
            "newTabla",
            arrayColumTabla,
            {
              titulo: "Listado PreRegistro",
              subtitulo: subtitulo,
            },
            "PreRegistro_"
          );
        },

        // onChangeSociedad: async function (oEvent) {
        //   var selectedKey = oEvent.getParameter("selectedItem").getKey();
        //   // Activa todos los ComboBox
        //   this.getView().byId("proveedorInput").setEnabled(true);
        //   this.getView().byId("mcRolMainView2").setEnabled(true);
        //
        //   await this.obtenerDatosMaestros();
        // },

        onAbrirBuzón: async function () {
          if (
            this.getView().getModel("localModel").getData().filtrosSociedad
              .length == 0
          ) {
            util.utilPopUps.messageBox(
              "No ha seleccionado una sociedad.",
              "A",
              function () {}
            );
            return;
          }

          await this.consultarCorreos();

          if (!this.oMPDialogAbrirBuzon) {
            this.oMPDialogAbrirBuzon = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.AbrirBuzon",
            });
          }
          this.oMPDialogAbrirBuzon.then(
            function (oDialogAbrirBuzon) {
              this.oDialogAbrirBuzon = oDialogAbrirBuzon;
              this.oDialogAbrirBuzon.open();
            }.bind(this)
          );
          ////////////////////// ////////////////////////////////////////// --------->>>>>>>>> LOGICA BOLIVIA
          /////////////////////////////////////////////////////////////////
        },

        onCloseAbrirBuzón: function () {
          this.oDialogAbrirBuzon.close();
        },

        onPopoverDocumentos: async function (oEvent) {
          const oSelectRow = oEvent
            .getSource()
            .getParent()
            .getBindingContext("localModel")
            .getObject();

          await this.consultarAdjuntos(oSelectRow);

          const oButtonDocumentos = oEvent.getSource();

          if (!this.oPopoverDocumentos) {
            this.oPopoverDocumentos = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.PopoverDocumentos",
            });
          }
          this.oPopoverDocumentos.then(
            function (oPop) {
              this.pPopover = oPop;
              oPop.openBy(oButtonDocumentos);
            }.bind(this)
          );
        },

        onSeleccionFilaDoc: async function (oEvent) {
          var oSelectedItem = oEvent.getParameter("listItem");
          var oContext = oSelectedItem.getBindingContext("localModel");
          var oSelectedData = oContext.getObject();

          await this.consultarAdjuntos(oSelectedData);
          // Obtener los documentos del correo seleccionado
          var aDocuments = oSelectedData.number_attachments;

          // Actualizar el localModel con los documentos seleccionados
          var oLocalModel = this.getView().getModel("localModel");
          oLocalModel.setProperty("/documentosSeleccionados", aDocuments);
        },

        onShowDocuments: function () {
          if (!this.oMPDialogAbrirAdjunto) {
            this.oMPDialogAbrirAdjunto = this.loadFragment({
              name: "paltarumi.portalweb.registroprefactura.view.fragment.AbrirAdjunto",
            });
          }
          this.oMPDialogAbrirAdjunto.then(
            function (oDialogAbrirAdjunto) {
              this.oDialogAbrirAdjunto = oDialogAbrirAdjunto;
              this.oDialogAbrirAdjunto.open();
            }.bind(this)
          );
          ////////////////////// ////////////////////////////////////////// --------->>>>>>>>> LOGICA BOLIVIA
          /////////////////////////////////////////////////////////////////
        },

        onCloseShowDocuments: function () {
          this.oDialogAbrirAdjunto.close();
        },

        onSeleccionarAdjunto: function () {
          var oLocalModel = this.getView().getModel("localModel");
          var aDocuments = oLocalModel.getProperty("/documentosSeleccionados");

          this.onShowDocuments();
        },

        onPressSeleccionarAdjunto: function () {
          const oModel = this.getView().getModel("localModel");

          // Obtener las filas seleccionadas de la tabla de adjuntos
          const oTable = this.getView()
            .byId("dialogAgregarFactura")
            .getContent()[0];
          const aSelectedItems = oTable.getSelectedItems();

          if (aSelectedItems.length === 0) {
            sap.m.MessageToast.show("No se han seleccionado adjuntos.");
            return;
          }

          // Guardar las filas seleccionadas en el modelo
          const aFilasSeleccionadas = aSelectedItems.map((oItem) => {
            return oItem.getBindingContext("localModel").getObject();
          });

          oModel.setProperty("/filasSeleccionadas", aFilasSeleccionadas);
          console.log("Filas seleccionadas:", aFilasSeleccionadas);

          // Cerrar los diálogos
          this.onCloseShowDocuments();
          this.onCloseAbrirBuzón();

          // MessageBox.success(
          //   "Adjuntos seleccionados para la carga automática."
          // );
          util.utilPopUps.messageBox(
            "Adjuntos seleccionados para la carga automática.",
            "S",
            function () {}
          );
        },

        onSelectionChange: function () {
          const oTable = this.byId("tblAdjuntos");
          const aSelectedItems = oTable.getSelectedItems(); // Obtiene todas las filas seleccionadas

          const aSelectedData = [];

          // Recorre todas las filas seleccionadas y extrae los datos
          aSelectedItems.forEach((item) => {
            const oContext = item.getBindingContext("localModel");
            const oData = oContext.getObject();
            aSelectedData.push(oData); // Agrega la fila seleccionada a la lista
          });

          // Almacena las filas seleccionadas en el modelo
          const oModel = this.getView().getModel("localModel");
          oModel.setProperty("/filasSeleccionadas", aSelectedData);

          console.log("Filas seleccionadas:", aSelectedData);
        },
        onAbrirDetalleComprobante: async function (oEvent) {
          let aSeleccionados = this.getView()
            .byId("tblPreRegistro")
            .getSelectedContexts();
          let oModel = this.getView().getModel("localModel");
          let selectedRowPreFacturas = [];
          var oTable = this.getView().byId("tblPreRegistro");
          var sCorrelativoSCP = "";

          if (aSeleccionados.length === 0) {
            util.utilPopUps.messageBox(
              "Por favor, elija al menos un registro",
              "A",
              function () {}
            );
            return;
          }
          // let selectedRows = [];
          // selectedRows = aSeleccionados.map(function (item, index) {
          //   return item.getObject();
          // });

          //SE COMENTA TEMPORALMENTE
          let sociedadActual = this.getView()
            .getModel("localModel")
            .getProperty("/datosSociedad")[0].SOCIEDAD_ACTUAL;

          let fImporte = 0;
          let sImporte = "0.00";
          let fIgv = 0;
          let sIgv = "0.00";

          const oNumberFormat = NumberFormat.getFloatInstance({
            minFractionDigits: 2,
            maxFractionDigits: 2,
            decimals: 2,
            groupingEnabled: true,
            groupingSeparator: ",",
            decimalSeparator: ".",
          });
          let fechacont = moment(new Date(), "DD/MM/YYYY");
          let datosCabecera = this.getView()
            .getModel("localModel")
            .getProperty("/datosCabecera");

          aSeleccionados.forEach((element, index) => {
            const path = element.getPath();
            const obj = {
              ...this.getView().getModel("localModel").getProperty(path),
            };
            sCorrelativoSCP = obj.CORRELATIVO_SCP;
          });

          //Obtener los registros desagrupado de ese registro
          var listaCorrelativoSCP = [];
          listaCorrelativoSCP.push(sCorrelativoSCP);
          var listaPreRegistroFactura = await this.onConsultarRegistroFactura({
            filtros: [
              {
                listaCorrelativoSCP,
              },
            ],
          });
          console.log("LISTAAAA", listaPreRegistroFactura);
          selectedRowPreFacturas = listaPreRegistroFactura.comprobantes;

          let importesinigv = selectedRowPreFacturas[0].AMOUNT;
          let igv = parseFloat(selectedRowPreFacturas[0].TAX_AMOUNT);
          let importeconigv = parseFloat(importesinigv) + parseFloat(igv);
          datosCabecera.sFechaContable = fechacont.format("DD/MM/YYYY");
          datosCabecera.sFechaEmision = fechacont.format("DD/MM/YYYY");
          datosCabecera.NRO_SERIE = selectedRowPreFacturas[0].SERIE;
          datosCabecera.RUC = selectedRowPreFacturas[0].RUC;
          datosCabecera.glosaFactura = "";
          datosCabecera.correlativo = selectedRowPreFacturas[0].CORRELATIVO;
          datosCabecera.NRO_COMPROBANTE = selectedRowPreFacturas[0].COMPROBANTE;
          datosCabecera.clasedocumentoSAP =
            selectedRowPreFacturas[0].CLASE_DOCUMENTO_SAP;
          datosCabecera.comentario = selectedRowPreFacturas[0].COMENTARIO
            ? selectedRowPreFacturas[0].COMENTARIO
            : "";
          let usuario = this.getView()
            .getModel("localModel")
            .getProperty("/infoUsuario");
          datosCabecera.username = usuario.USUARIO;
          datosCabecera.FECHA_EMISION = new Date(
            selectedRowPreFacturas[0].FECHA.split("-").reverse().join("/")
          );
          datosCabecera.FECHA_BASE = selectedRowPreFacturas[0].FECHA_BASE
            ? new Date(
                selectedRowPreFacturas[0].FECHA_BASE.split("-")
                  .reverse()
                  .join("/")
              )
            : new Date();
          datosCabecera.FECHA_BASE1 = selectedRowPreFacturas[0].FECHA_BASE
            ? new Date(
                selectedRowPreFacturas[0].FECHA_BASE.split("-")
                  .reverse()
                  .join("/")
              )
            : new Date();

          datosCabecera.importesinigv = importesinigv;
          datosCabecera.MONEDA = selectedRowPreFacturas[0].CURRENCY;

          datosCabecera.IMPORTE =
            selectedRowPreFacturas[0].IMPORTE_TOTAL.length == 0
              ? importeconigv
              : parseFloat(selectedRowPreFacturas[0].IMPORTE_TOTAL);
          datosCabecera.IMPUESTOIMPORTE =
            selectedRowPreFacturas[0].TAX_AMOUNT_CAB_TOTAL == null
              ? parseFloat(igv)
              : parseFloat(selectedRowPreFacturas[0].TAX_AMOUNT_CAB_TOTAL);
          //selectedRowPreFacturas[0].TAX_AMOUNT_TOTAL;

          datosCabecera.clasedocumento_original =
            selectedRowPreFacturas[0].CLASE_DOCUMENTO;
          datosCabecera.clasedocumento =
            selectedRowPreFacturas[0].CLASE_DOCUMENTO;
          datosCabecera.CONDICIONPAGO =
            selectedRowPreFacturas[0].CONDICION_PAGO;
          datosCabecera.indicadorimpuesto = selectedRowPreFacturas[0].TAX_CODE;
          datosCabecera.TIPO_DETRACCION =
            selectedRowPreFacturas[0].DETRACCION ?? "";
          datosCabecera.BELNR = selectedRowPreFacturas[0].BELNR;

          // if (sociedadActual == "PE") {
          //   if (
          //     datosCabecera.TIPO_DETRACCION.length == 0 &&
          //     datosCabecera.indicadorimpuesto != "C0"
          //   ) {
          //     datosCabecera.retencion =
          //       await this.procesoConsultarCodigoRetencion(usuario);
          //   } else {
          //     datosCabecera.retencion = "";
          //   }
          // } else {
          //   datosCabecera.retencion = selectedRowPreFacturas[0].RETENCION;
          // }

          datosCabecera.id_registropreliminar = selectedRowPreFacturas[0].ID;
          datosCabecera.mblnr = selectedRowPreFacturas[0].MBLNR;
          datosCabecera.mjahr = selectedRowPreFacturas[0].MJAHR;
          datosCabecera.zeile = selectedRowPreFacturas[0].ZEILE;
          datosCabecera.clvref1 = 0;
          datosCabecera.clvref2 = datosCabecera.FECHA_EMISION; //selectedRowPreFacturas[0].FECHA_EMISION;
          datosCabecera.claveacceso = selectedRowPreFacturas[0].CLAVE_ACCESO;
          datosCabecera.idestadoregistro =
            selectedRowPreFacturas[0].ID_ESTADO_REG_PRELIMINAR;
          fIgv = 0.18 * fImporte;
          sImporte = oNumberFormat.format(
            parseFloat(fImporte + fIgv).toFixed(2)
          );
          sIgv = oNumberFormat.format(parseFloat(fIgv).toFixed(2));
          datosCabecera.sImporte = sImporte;
          datosCabecera.fImporte = fImporte;
          datosCabecera.fIgv = fIgv;
          datosCabecera.sIgv = sIgv;

          // this.consultarGlosa();

          if (sociedadActual == "PE") {
            datosCabecera.NRO_SERIE = selectedRowPreFacturas[0].SERIE;
            this.getView()
              .getModel("localModel")
              .setProperty("/preRegistro", datosCabecera);
            this.getView()
              .getModel("localModel")
              .setProperty(
                "/selectedRowsPreFacturaDetalle",
                selectedRowPreFacturas
              );
            this.getView().getModel("localModel").refresh(true);
            this.consultarDetraccion();
            if (!this.oMPDialogDetallePreFacturaPeru) {
              this.oMPDialogDetallePreFacturaPeru = this.loadFragment({
                name: "paltarumi.portalweb.registroprefactura.view.fragment.DetallePreFacturaPeru",
              });
            }
            this.oMPDialogDetallePreFacturaPeru.then(
              function (oDialogDetallePreFacturaPeru) {
                this.oDialogDetallePreFacturaPeru =
                  oDialogDetallePreFacturaPeru;
                this.oDialogDetallePreFacturaPeru.open();
                // === BLOQUEO AUTOMÁTICO DE COMBO DETRACCIÓN ===
                const oView = this.getView();
                const oCombo = Fragment.byId(oView.getId(), "cboDetraccion");

                if (oCombo) {
                  const sDetraccion = oView
                    .getModel("localModel")
                    .getProperty("/datosCabecera/TIPO_DETRACCION");

                  // Si ya tiene detracción, bloquear
                  if (sDetraccion && sDetraccion.trim() !== "") {
                    oCombo.setEnabled(false);
                  } else {
                    oCombo.setEnabled(true);
                  }
                }
              }.bind(this)
            );
            this.getView().byId("tblPreRegistro").removeSelections();
            ////////////////////// ////////////////////////////////////////// --------->>>>>>>>> LOGICA BOLIVIA
            /////////////////////////////////////////////////////////////////
          } else if (sociedadActual == "BO") {
            this.getView()
              .getModel("localModel")
              .setProperty("/datosCabecera", datosCabecera);
            this.getView()
              .getModel("localModel")
              .setProperty("/selectedRowPreFacturas", selectedRowPreFacturas);
            this.getView().getModel("localModel").refresh(true);
            if (!this.oMPDialogCreateFacturaBolivia) {
              this.oMPDialogCreateFacturaBolivia = this.loadFragment({
                name: "app.RegistroFactura.view.fragment.RegistrarFacturaBolivia",
              });
            }
            this.oMPDialogCreateFacturaBolivia.then(
              function (oDialogCrearFacturaBolivia) {
                this.oDialogCreateFacturaBolivia = oDialogCrearFacturaBolivia;
                this.oDialogCreateFacturaBolivia.open();
              }.bind(this)
            );
            this.getView().byId("tblRegistro").removeSelections();
            ////////////////////// ////////////////////////////////////////// --------->>>>>>>>> LOGICA ECUADOR
            /////////////////////////////////////////////////////////////////
          } else if (sociedadActual == "EC") {
            selectedRowPreFacturas.forEach(function (item) {
              item.ITEM_TEXT = "";
            });

            let retencionesResult = await this.getRetencionesEc(
              selectedRowPreFacturas
            );

            if (retencionesResult) {
              if (retencionesResult.consultarRetencionResponse) {
                let retencionesEC = [];
                for (
                  let index = 0;
                  index < retencionesResult.consultarRetencionResponse.length;
                  index++
                ) {
                  let element =
                    retencionesResult.consultarRetencionResponse[index];
                  element.WRBTR = element.WRBTR.trim();
                  if (element.WRBTR.length == 0) {
                    element.WRBTR = "0.00";
                  }
                  retencionesEC.push(element);
                }
                this.getView()
                  .getModel("localModel")
                  .setProperty("/retencionesEC", retencionesEC);
              }
            }
            this.getView()
              .getModel("localModel")
              .setProperty("/datosCabecera", datosCabecera);
            this.getView()
              .getModel("localModel")
              .setProperty("/selectedRowPreFacturas", selectedRowPreFacturas);
            this.getView().getModel("localModel").refresh(true);
            // this.consultarGlosa();
            if (!this.oMPDialogCreateFacturaEcuador) {
              this.oMPDialogCreateFacturaEcuador = this.loadFragment({
                name: "app.RegistroFactura.view.fragment.RegistrarFacturaEcuador",
              });
            }
            this.oMPDialogCreateFacturaEcuador.then(
              function (oDialogCrearFacturaEcuador) {
                this.oDialogCreateFacturaEcuador = oDialogCrearFacturaEcuador;
                this.oDialogCreateFacturaEcuador.open();
              }.bind(this)
            );
            this.getView().byId("tblRegistro").removeSelections();
          } else {
            util.utilPopUps.messageBox(
              "No se encuentra sociedad actual",
              "A",
              function () {}
            );
            return;
          }

          this.consultarAdjuntosXFiltro();
          oModel.setProperty("/listReClase", []);
          oModel.setProperty("/tabSelect", 0);
        },
        onConsultarRegistroFactura: async function (oParam) {
          let self = this;

          return new Promise(async function (resolve, reject) {
            let response = await service.servicePost(
              constantes.services.consultarRegistroPreliminarRegFacturasXFiltro,
              oParam,
              self
            );
            if (response.code == 1) {
              resolve(response.results);
            } else if (response.code == -99) {
              util.utilPopUps.messageBox(
                "La sesión se ha finalizado.",
                "A",
                function () {
                  localStorage.clear();

                  localStorage.clear();
                  const logoutRedirect = self.obtenerUrlRedirectLogin();
                  const callbacklogin = logoutRedirect;
                  window.location.replace(callbacklogin);
                }
              );
            } else {
              resolve(false);
            }
          });
        },
      }
    );
  }
);
