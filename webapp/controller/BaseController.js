sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "paltarumi/portalweb/registroprefactura/model/formatter",
    "../constantes",
    "../estructuras/enviarDatos",
    "../estructuras/recibirDatos",
    "../util/util",
    "../service/service",
    "../util/utilPopUps",
    "../util/utilHttp",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/models",
  ],
  function (
    Controller,
    History,
    UIComponent,
    formatter,
    constantes,
    enviarDatos,
    recibirDatos,
    util,
    service,
    utilPopUps,
    utilHttp,
    Filter,
    FilterOperator,
    models
  ) {
    "use strict";

    return Controller.extend(
      "paltarumi.portalweb.registroprefactura.controller.BaseController",
      {
        formatter: formatter,

        /**
         * Convenience method for getting the view model by name in every controller of the application.
         * @public
         * @param {string} sName the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
          return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model in every controller of the application.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.core.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        /**
         * Convenience method for getting the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Method for navigation to specific view
         * @public
         * @param {string} psTarget Parameter containing the string for the target navigation
         * @param {Object.<string, string>} pmParameters? Parameters for navigation
         * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
         */
        navTo: function (psTarget, pmParameters, pbReplace) {
          this.getRouter().navTo(psTarget, pmParameters, pbReplace);
        },

        getRouter: function () {
          return UIComponent.getRouterFor(this);
        },

        onNavBack: function () {
          const sPreviousHash = History.getInstance().getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.back();
          } else {
            this.getRouter().navTo("appHome", {}, true /* no history*/);
          }
        },
        obtenerDatosMaestros: async function () {
          let self = this;
          // try {
          //constantes.tablaMaestras; // ["T0001"]
          let oParam = {
            listaCodCabMaestras: constantes.tablaMaestras,
          };

          //;
          let response = await service.servicePost(
            constantes.services.obtenerMaestrosDetalleCamposXCabecera,
            oParam,
            self
          );
          if (response.code == 1) {
            //;
            let listaSociedadesMaestra = [];
            let listaMultipleEstadoRegistro = [];
            let listaDetraccionHomologacion = [];
            let listaPorcentajeIVA = [];

            let listaConstantes = [];
            let listSociedadPais = [];
            let listaAdjuntosPDF = [];
            let listaAdjuntosTipoArchivoXTipoEmisor = [];
            let listaAdjuntosTipoArchivoXTipoEmisorGlobal = [];
            let listaEstadoComprobante = [];
            let listaEstadoRuc = [];
            let listaEstadoDomicilio = [];
            let listaSerieCorrelativo = [];
            let listaBoliviaMoneda = [];
            let listaTipoDocumento = [];

            //
            let listaOrdenERP = [];
            let listaTipoDocumentoHijo = [];

            const { obtenerMaestrosDetalleCamposXCabecera } = response.results;
            // const listaUsuarios = recibirDatos.obtenerListaUsuarios(usuarios);
            // self.getView().getModel('localModel').setProperty('/listaUsuarios', listaUsuarios);

            const listApps = obtenerMaestrosDetalleCamposXCabecera.filter(
              function (item, index) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[13]
                );
              }
            );

            listSociedadPais = obtenerMaestrosDetalleCamposXCabecera.filter(
              function (item, index) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[3]
                );
              }
            );

            console.log(listSociedadPais);

            listaSociedadesMaestra =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (item) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[0]
                );
              });
            let oParam = {
              listaSociedadesMaestra: listaSociedadesMaestra,
              listSociedadPais: listSociedadPais,
            };

            listaSociedadesMaestra =
              recibirDatos.obtenerDatosMaestrosSociedad(oParam);

            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaSociedadesMaestra", listaSociedadesMaestra);

            //

            listaOrdenERP = obtenerMaestrosDetalleCamposXCabecera.filter(
              function (item) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[17]
                );
              }
            );

            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaOrdenERP", listaOrdenERP);

            listaTipoDocumentoHijo =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (item) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[16]
                );
              });

            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaTipoDocumentoHijo", listaTipoDocumentoHijo);

            //

            const codigoAppPreRegistroFacturasContador = listApps[9];
            listaMultipleEstadoRegistro =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (
                item,
                index
              ) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[1] &&
                  item.concat_cod_father_cod_hijo ==
                    codigoAppPreRegistroFacturasContador.CODIGO_MAESTRO_CABECERA +
                      "-" +
                      codigoAppPreRegistroFacturasContador.CODIGO_MAESTRO_DETALLE
                );
              });

            listaMultipleEstadoRegistro =
              recibirDatos.obtenerDatosMaestrosEstadoRegistroMultiple(
                listaMultipleEstadoRegistro
              );
            /*---------------------------------------------------------------------------*/
            listaConstantes = obtenerMaestrosDetalleCamposXCabecera.filter(
              function (item, index) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[2]
                );
              }
            );

            console.log(listaConstantes);

            let aEncontradoMensajeLinea1 = [];
            aEncontradoMensajeLinea1 = listaConstantes.filter(function (
              item,
              index
            ) {
              return item.CODIGO_MAESTRO_DETALLE == "linea_reg_fact";
            });
            if (aEncontradoMensajeLinea1.length > 0) {
              self
                .getView()
                .getModel("localModel")
                .setProperty(
                  "/lineaMensaje",
                  aEncontradoMensajeLinea1[0].DESCRIPCION
                );

              self
                .getView()
                .getModel("localModel")
                .setProperty("/bValidLineaMensaje", true);
            } else {
              self
                .getView()
                .getModel("localModel")
                .setProperty("/lineaMensaje", "");
              self
                .getView()
                .getModel("localModel")
                .setProperty("/bValidLineaMensaje", false);
            }

            self
              .getView()
              .getModel("localModel")
              .setProperty("/Constantes", listaConstantes);

            listaAdjuntosPDF = obtenerMaestrosDetalleCamposXCabecera.filter(
              function (item, index) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[4]
                );
              }
            );

            this.getView()
              .getModel("localModel")
              .setProperty("/listaAdjuntosPDF", listaAdjuntosPDF);

            const listaTipoEmisor =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (
                item,
                index
              ) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[14]
                );
              });

            this.getView()
              .getModel("localModel")
              .setProperty("/listaTipoEmisor", listaTipoEmisor);

            listaAdjuntosTipoArchivoXTipoEmisorGlobal =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (
                item,
                index
              ) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[5]
                );
              });

            this.getView()
              .getModel("localModel")
              .setProperty(
                "/listaAdjuntosTipoArchivoXTipoEmisorGlobal",
                listaAdjuntosTipoArchivoXTipoEmisorGlobal
              );

            // const CODIGO_TIPO_EMISOR = this.getView()
            //   .getModel("localModel")
            //   .getData().infoUsuario.CODIGO_TIPO_EMISOR;

            // const aEncontradoTipoEmisor = listaTipoEmisor.filter(function (
            //   item,
            //   index
            // ) {
            //   return item.CAMPO == CODIGO_TIPO_EMISOR;
            // });
            // listaAdjuntosTipoArchivoXTipoEmisor =
            //   obtenerMaestrosDetalleCamposXCabecera.filter(function (
            //     item,
            //     index
            //   ) {
            //     return (
            //       item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[5] &&
            //       item.concat_cod_father_cod_hijo ==
            //         aEncontradoTipoEmisor[0].CODIGO_MAESTRO_CABECERA +
            //           "-" +
            //           aEncontradoTipoEmisor[0].CODIGO_MAESTRO_DETALLE
            //     );
            //   });

            // this.getView()
            //   .getModel("localModel")
            //   .setProperty(
            //     "/listaAdjuntosTipoArchivoXTipoEmisor",
            //     listaAdjuntosTipoArchivoXTipoEmisor
            //   );

            // console.log(listaAdjuntosTipoArchivoXTipoEmisor);

            const listaPaisContribuyenteCompro =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (
                item,
                index
              ) {
                return (
                  item.CODIGO_MAESTRO_CABECERA ==
                    constantes.tablaMaestras[15] &&
                  item.CODIGO_MAESTRO_DETALLE == constantes.codigoPaisContCompro
                );
              });
            if (listaPaisContribuyenteCompro) {
              if (listaPaisContribuyenteCompro.length > 0) {
                var aEncontrado = obtenerMaestrosDetalleCamposXCabecera.filter(
                  function (item, index) {
                    return (
                      item.CODIGO_MAESTRO_CABECERA ==
                        constantes.tablaMaestras[6] &&
                      item.concat_cod_father_cod_hijo ==
                        listaPaisContribuyenteCompro[0]
                          .CODIGO_MAESTRO_CABECERA +
                          "-" +
                          listaPaisContribuyenteCompro[0].CODIGO_MAESTRO_DETALLE
                    );
                  }
                );

                aEncontrado.map(function (item, index) {
                  let obj = { ...item };
                  obj.CAMPO = item.VALOR;
                  obj.VALOR = item.CAMPO;
                  listaEstadoComprobante.push(obj);
                });
              }
            }

            console.log(listaEstadoComprobante);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/EstadosComprobante", listaEstadoComprobante);

            const listaPaisContContribuyente =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (
                item,
                index
              ) {
                return (
                  item.CODIGO_MAESTRO_CABECERA ==
                    constantes.tablaMaestras[15] &&
                  item.CODIGO_MAESTRO_DETALLE ==
                    constantes.codigoPaisContContribuyente
                );
              });
            if (listaPaisContContribuyente) {
              if (listaPaisContContribuyente.length > 0) {
                var aEncontrado = obtenerMaestrosDetalleCamposXCabecera.filter(
                  function (item, index) {
                    return (
                      item.CODIGO_MAESTRO_CABECERA ==
                        constantes.tablaMaestras[6] &&
                      item.concat_cod_father_cod_hijo ==
                        listaPaisContContribuyente[0].CODIGO_MAESTRO_CABECERA +
                          "-" +
                          listaPaisContContribuyente[0].CODIGO_MAESTRO_DETALLE
                    );
                  }
                );

                aEncontrado.map(function (item, index) {
                  let obj = { ...item };
                  obj.CAMPO = item.VALOR;
                  obj.VALOR = item.CAMPO;
                  listaEstadoRuc.push(obj);
                });
              }
            }

            console.log(listaEstadoRuc);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/EstadosRuc", listaEstadoRuc);

            const listaPaisContDomicilio =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (
                item,
                index
              ) {
                return (
                  item.CODIGO_MAESTRO_CABECERA ==
                    constantes.tablaMaestras[15] &&
                  item.CODIGO_MAESTRO_DETALLE ==
                    constantes.codigoPaisContDomicilio
                );
              });
            if (listaPaisContDomicilio) {
              if (listaPaisContDomicilio.length > 0) {
                var aEncontrado = obtenerMaestrosDetalleCamposXCabecera.filter(
                  function (item, index) {
                    return (
                      item.CODIGO_MAESTRO_CABECERA ==
                        constantes.tablaMaestras[6] &&
                      item.concat_cod_father_cod_hijo ==
                        listaPaisContDomicilio[0].CODIGO_MAESTRO_CABECERA +
                          "-" +
                          listaPaisContDomicilio[0].CODIGO_MAESTRO_DETALLE
                    );
                  }
                );

                aEncontrado.map(function (item, index) {
                  let obj = { ...item };
                  obj.CAMPO = item.VALOR;
                  obj.VALOR = item.CAMPO;
                  listaEstadoDomicilio.push(obj);
                });
              }
            }

            console.log(listaEstadoDomicilio);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/EstadosDomicilio", listaEstadoDomicilio);

            listaSerieCorrelativo =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (
                item,
                index
              ) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[9]
                );
              });

            console.log(listaSerieCorrelativo);

            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaSerieCorrelativo", listaSerieCorrelativo);

            self.getView().getModel("localModel").setProperty("/LONGSERIE", 4);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/LONGCORRELATIVO", 8);

            const listaSerie = this.getView()
              .getModel("localModel")
              .getData()
              .listaSerieCorrelativo.filter(function (item, index) {
                return item.CODIGO_MAESTRO_DETALLE == constantes.codigoSerie;
              });
            if (listaSerie.length > 0) {
              const cantidad = parseInt(listaSerie[0].VALOR, 10);
              self
                .getView()
                .getModel("localModel")
                .setProperty("/LONGSERIE", cantidad);
            }
            const listaCorrelativo = this.getView()
              .getModel("localModel")
              .getData()
              .listaSerieCorrelativo.filter(function (item, index) {
                return (
                  item.CODIGO_MAESTRO_DETALLE == constantes.codigoCorrelativo
                );
              });

            if (listaCorrelativo.length > 0) {
              const cantidad = parseInt(listaCorrelativo[0].VALOR, 10);
              self
                .getView()
                .getModel("localModel")
                .setProperty("/LONGCORRELATIVO", cantidad);
            }

            self
              .getView()
              .getModel("localModel")
              .setProperty(
                "/listaMultipleEstadoRegistro",
                listaMultipleEstadoRegistro
              );

            listaBoliviaMoneda = obtenerMaestrosDetalleCamposXCabecera.filter(
              function (item, index) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[10]
                );
              }
            );

            console.log(listaBoliviaMoneda);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaBoliviaMoneda", listaBoliviaMoneda);

            /*---------------------------------------------------------------------------*/

            // const sociedadActual = this.getView()
            //   .getModel('localModel')
            //   .getProperty('/sociedadActual');
            // if (sociedadActual == 'PE') {
            listaDetraccionHomologacion =
              obtenerMaestrosDetalleCamposXCabecera.filter(function (
                item,
                index
              ) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[11]
                );
              });
            // }

            listaPorcentajeIVA = obtenerMaestrosDetalleCamposXCabecera.filter(
              function (item, index) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[12]
                );
              }
            );

            self
              .getView()
              .getModel("localModel")
              .setProperty(
                "/listaDetraccionHomologacionInicial",
                listaDetraccionHomologacion
              );
            /*---------------------------------------------------------------------------*/
            /*Tipo documento */

            listaTipoDocumento = obtenerMaestrosDetalleCamposXCabecera.filter(
              function (item, index) {
                return (
                  item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[16]
                );
              }
            );
            listaTipoDocumento =
              recibirDatos.obtenerDatosMaestrosTipoDocumento(
                listaTipoDocumento
              );
            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaTipoDocumentoGlobal", listaTipoDocumento);

            /************************************************************************ */

            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaPorcentajeIVA", listaPorcentajeIVA);

            // listaDocumentos  = obtenerMaestrosDetalleCamposXCabecera.filter(function (item, index) {
            //   return item.CODIGO_MAESTRO_CABECERA == constantes.tablaMaestras[1];
            // });
            // listaDocumentos = recibirDatos.obtenerDatosMaestros(listaDocumentos);

            // self.getView().getModel('localModel').setProperty('/listaDocumentos', listaDocumentos);
          } else if (response.code == -1) {
            util.utilPopUps.messageBox(
              "No se encontró información de la sociedad en las maestras de las sociedades.",
              "A",
              function () {}
            );
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
            util.utilHttp.validarRespuestaServicio(response);
          }
          // } catch (error) {}
        },
        obtenerUrlRedirectLogin: function () {
          let tenant_name = util.utilHttp.extractTenant();

          if (tenant_name == "seidor-pe-dev-pp") {
            tenant_name = tenant_name.replace("-pp", "");
            tenant_name = tenant_name.replace("-pe", "");
          } else {
            tenant_name = tenant_name.replace("-pp", "");
          }
          const logoutRedirect = `https://${tenant_name}.seidorapps.ai/login`;
          return logoutRedirect;
        },
        consultarDatosProveedor: async function () {
          let self = this;
          // try {
          //constantes.tablaMaestras; // ["T0001"]
          let oParam = enviarDatos.consultarDatosProveedor({
            RUC: this.getView()
              .getModel("localModel")
              .getProperty("/infoUsuario/USUARIO"),
            //DIRECCION: this.getView().getModel('localModel').getProperty('/infoUsuario/DIRECCION'),
          });

          //;
          let response = await service.servicePost(
            constantes.services.procesoConsultarDatosProveedor,
            oParam,
            self
          );
          if (response.code == 1) {
            console.log(response.results);

            let oParam = recibirDatos.consultarDatosProveedor(
              response.results.consultarDatosProveedor.ES_DATOS
            );

            this.getView()
              .getModel("localModel")
              .setProperty("/datosProveedor", oParam);
          } else {
            util.utilHttp.validarRespuestaServicio(response);
          }
        },

        onLimpiarFiltroApplyTabla: function () {
          this.getView().byId("tblPreRegistro").removeSelections();
          let oTable = this.getView().byId("tblPreRegistro");
          let oBinding = oTable.getBinding("items");
          oBinding.filter([]);
        },
        buscarGlobalLive: function () {
          let andFilter = [];
          let orFilter = [];
          var sTerm = this.getView()
            .getModel("localModel")
            .getProperty("/search");

          const seleccion = this.getView()
            .byId("mcRolMainView2")
            .getSelectedItems();
          let filtro = "";
          let aFilter = [];

          if (seleccion.length < 2 && seleccion.length > 0) {
            if (seleccion[0].mProperties.key == "1") {
              andFilter.push(
                new Filter("NRO_COMPROBANTE", FilterOperator.NE, filtro)
              );
            } else if (seleccion[0].mProperties.key == "2") {
              andFilter.push(
                new Filter("NRO_COMPROBANTE", FilterOperator.EQ, filtro)
              );
            }
          }

          if (sTerm.trim() !== "") {
            orFilter.push(
              new Filter("NRO_PARTE_ENTRADA", FilterOperator.Contains, sTerm)
            );
            orFilter.push(
              new Filter("NRO_COMPROBANTE", FilterOperator.Contains, sTerm)
            );
            orFilter.push(
              new Filter("PEDIDO_REFERENCIA", FilterOperator.Contains, sTerm)
            );
            orFilter.push(
              new Filter("ARTICULO", FilterOperator.Contains, sTerm)
            );
            orFilter.push(
              new Filter("NRO_GUIA_REMISION", FilterOperator.Contains, sTerm)
            );
            orFilter.push(new Filter("HES", FilterOperator.Contains, sTerm));
            orFilter.push(
              new Filter("NRO_COMPROBANTE", FilterOperator.Contains, sTerm)
            );
          }

          let oTable = this.getView().byId("tblPreRegistro");
          let oBinding = oTable.getBinding("items");

          if (andFilter.length == 0 && orFilter.length == 0) {
            oBinding.filter([]);
          } else if (andFilter.length > 0 && orFilter.length == 0) {
            oBinding.filter(new sap.ui.model.Filter(andFilter));
          } else if (andFilter.length == 0 && orFilter.length > 0) {
            oBinding.filter(new sap.ui.model.Filter(orFilter));
          } else if (andFilter.length > 0 && orFilter.length > 0) {
            andFilter.push(new sap.ui.model.Filter(orFilter, false));
            oBinding.filter(new sap.ui.model.Filter(andFilter, true));
          }
        },

        consultarPartesEntradaProveedor: async function () {
          let self = this;
          var oMultiComboBox = this.byId("mcRolMainView2");

          // Obtener las claves seleccionadas
          var selectedKeys = oMultiComboBox.getSelectedKeys();

          // Asumimos que quieres la primera clave seleccionada, si hay varias claves seleccionadas
          var estado = selectedKeys.length > 0 ? selectedKeys[0] : "";
          var proveedor = this.getView()
            .getModel("localModel")
            .getProperty("/infoUsuario/USUARIO");
          var fechai = this.getView()
            .byId("idDatePickerInicioCompras")
            .getValue();
          var fechaf = this.getView().byId("idDatePickerFinCompras").getValue();
          // var estado = this.getView().byId("mcRolMainView2").getValue();

          // try {
          //constantes.tablaMaestras; // ["T0001"]

          // if (fechai == undefined || fechai == null || fechai == '') {
          //   utilPopUps.onMessageWarningDialogPress3('Ingresar Rango de Fechas');
          //   return;
          // }

          // if (fechaf == undefined || fechaf == null || fechaf == '') {
          //   utilPopUps.onMessageWarningDialogPress3('Ingresar Rango de Fechas');
          //   return;
          // }

          const { fFechaEmision, fFechamasuno } = this.getView()
            .getModel("localModel")
            .getData().filtros;

          if (!(fFechaEmision && fFechamasuno)) {
            util.utilPopUps.messageBox(
              "La fecha no es válida.",
              "A",
              function () {}
            );
            return;
          }

          let validFechaDesde = util.utilController.dateIsValid(
            fFechaEmision,
            "/",
            "-"
          );
          let validFechaHasta = util.utilController.dateIsValid(
            fFechamasuno,
            "/",
            "-"
          );
          if (validFechaDesde && validFechaHasta) {
            const fechaDesdeYYYY_MM_DD =
              util.utilController.convertirFechaDDMMYYY_YYYYMMDD(
                fFechaEmision,
                "/",
                "-"
              );
            const fechaHastaYYYY_MM_DD =
              util.utilController.convertirFechaDDMMYYY_YYYYMMDD(
                fFechamasuno,
                "/",
                "-"
              );

            if (fechaDesdeYYYY_MM_DD > fechaHastaYYYY_MM_DD) {
              util.utilPopUps.messageBox(
                "La fecha inicial no puede ser mayor a la fecha final.",
                "A",
                function () {}
              );
              return;
            }
          } else {
            util.utilPopUps.messageBox(
              "La fecha no es válida.",
              "A",
              function () {}
            );
            return;
          }

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
          if (
            !this.getView().getModel("localModel").getData()
              .ProveedorSeleccionado ||
            this.getView().getModel("localModel").getData()
              .ProveedorSeleccionado.usuario == 0
          ) {
            util.utilPopUps.messageBox(
              "No ha seleccionado un proveedor.",
              "A",
              function () {}
            );
            return;
          }

          let oParam = enviarDatos.consultarPartesEntradaProveedor({
            IV_STCD1: this.getView().getModel("localModel").getData()
              .ProveedorSeleccionado.usuario, //'20514557111',
            IV_FECINI: fechai, //'01/01/2014',
            IV_FECFIN: fechaf, //'31/12/2022',
            IV_BUKRS: this.getView().getModel("localModel").getData()
              .filtrosSociedad,

            IV_XBLNR: "",
            ESTADO: estado,
          });

          //;
          let response = await service.servicePost(
            //service.servicePostRegistro(
            constantes.services.procesoConsultarPartesEntradaProveedor,
            oParam,
            self
          );

          if (response.code == 1) {
            let partes = response.results.consultarPartesEntradaProveedor;

            const listaClasesPermitidas = this.getView()
              .getModel("localModel")
              .getProperty("/listaOrdenERP")
              .map((item) => item.CAMPO);

            partes = partes.filter((item) =>
              listaClasesPermitidas.includes(item.CLASE_PEDIDO)
            );

            partes.forEach(function (item) {
              item.ARTICULO_DESC = item.ARTICULO
                ? formatter.formatoArticulo(item.ARTICULO) +
                  " - " +
                  item.DESCRIPCION_ARTICULO
                : item.DESCRIPCION_ARTICULO;
            });
            //   partes.sort(function (a, b) {
            //     const fechaA = a.FECHA_REGISTRO || ""; // Maneja valores nulos o indefinidos
            //     const fechaB = b.FECHA_REGISTRO || ""; // Maneja valores nulos o indefinidos

            //     // Comparar las fechas directamente
            //     return fechaB.localeCompare(fechaA);
            // });
            //   console.log(response.results.consultarPartesEntradaProveedor);
            this.getView()
              .getModel("localModel")
              .setProperty(
                "/ListaComprobantes",
                // Pre-registro: ocultar partes que ya tienen comprobante asociado,
                // salvo que el registro haya sido rechazado (estado 2) y pueda re-registrarse.
                recibirDatos
                  .consultarPartesEntradaProveedor2(partes)
                  .filter(function (item) {
                    const tieneComprobante =
                      item.NRO_COMPROBANTE !== undefined &&
                      item.NRO_COMPROBANTE !== null &&
                      String(item.NRO_COMPROBANTE).trim() !== "";
                    return !tieneComprobante || item.ID_ESTADO_REG_PRELIMINAR_STR == "2";
                  })
              );

            this.buscarGlobalLive();
          } else if (response.code == 2) {
            // Limpia toda la tabla aquí
            this.getView()
              .getModel("localModel")
              .setProperty("/ListaComprobantes", []);

            // Opcionalmente, puedes agregar un mensaje para informar al usuario
            util.utilPopUps.messageBox(
              "No se encontro información.",
              "A" // Puedes ajustar el tipo de mensaje según sea necesario
            );
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
            util.utilHttp.validarRespuestaServicio(response);
          }
        },
        consultarDetraccion: async function () {
          let self = this;
          // try {
          //constantes.tablaMaestras; // ["T0001"]

          //;
          let response = await service.serviceGet(
            constantes.services.procesoConsultarDetraccion,
            [],
            self
          );
          if (response.code == 1) {
            let oParam = recibirDatos.obtenerDatosDetraccion(
              //Datos
              response.results.consultarDetraccionResponse
            );
            console.log(response.results.consultarDetraccionResponse);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/ListaDetracciones", oParam);
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
            util.utilHttp.validarRespuestaServicio(response);
          }
        },
        consultarImpuesto: async function () {
          let self = this;
          // try {
          //constantes.tablaMaestras; // ["T0001"]

          //;
          let response = await service.serviceGet(
            constantes.services.procesoConsultarImpuesto,
            [],
            self
          );
          if (response.code == 1) {
            let oParam = recibirDatos.obtenerDatosImpuesto(
              //Datos
              response.results.consultarImpuestoResponse
            );
            console.log(response.results.consultarImpuestoResponse);
            self
              .getView()
              .getModel("localModel")
              .setProperty("/ListaImpuestos", oParam);
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
            util.utilHttp.validarRespuestaServicio(response);
          }
        },
        consultarSunat: async function (oData) {
          let self = this;
          return new Promise(async function (resolve, reject) {
            // try {
            //constantes.tablaMaestras; // ["T0001"]

            //;
            let response = await service.servicePost(
              constantes.services.procesoConsultarSunat,
              oData,
              self
            );
            resolve(response);
          });
          // if (response.code == 1) {
          //
          //   let oParam = recibirDatos.obtenerDatosSunat(
          //     //Datos
          //     response.results.consultarSunat
          //   );
          //   console.log(response.results.consultarSunatResponse);
          //   self.getView().getModel('localModel').setProperty('/ListaImpuestos', oParam);
          // } else {
          //   util.utilHttp.validarRespuestaServicio(response);
          // }
        },
        consultarSRI: async function (oData) {
          let self = this;
          return new Promise(async function (resolve, reject) {
            let response = await service.servicePost(
              constantes.services.procesoConsultarSRI,
              oData,
              self
            );
            resolve(response);
          });
        },
        callApis: async function () {
          // await this.obtenerDatosMaestros();
          // await this.consultarDatosProveedor();
          // await this.consultarListaDeEmpresas();
          this.onFechaDefault();
          //await this.onObtenerUsuariosPaginado(1, []);
        },
        consultarUserApi: async function () {
          //;
          let self = this;

          try {
            let response = await service.serviceGetSeguridad(
              constantes.services.consultarUserApi,
              [],
              self
            );
            if (response.code == 1) {
              const { sToken, oInfoUsuario } = response.results;
              self
                .getView()
                .getModel("localModel")
                .setProperty("/token", sToken);
              self
                .getView()
                .getModel("localModel")
                .setProperty("/infoUsuario", oInfoUsuario);

              self.callApis();
            } else {
              util.utilHttp.validarRespuestaServicio(response);
            }
          } catch (error) {}
        },

        RegistroPreliminar: async function (self, datos) {
          return new Promise(async function (resolve, reject) {
            let url = "";
            var aImagenes = self
              .getView()
              .getModel("localModel")
              .getProperty("/preRegistro/dataAttached");
            var aImagenesXML = self
              .getView()
              .getModel("localModel")
              .getProperty("/preRegistro/dataAttachedXML");
            var aAdjuntos = [];
            // Crea la estructura de entrada
            if (aImagenes && aImagenes.length > 0) {
              aImagenes.forEach(function (elemento, indice) {
                var json = {
                  sNombreArchivo: aImagenes[indice].nombreArchivoDoc,
                  sBase64String: aImagenes[indice].FileEncode,
                  sExtencion: "document/" + aImagenes[indice].tipoArchivoDoc,
                  sSelectClaseDoc: aImagenes[indice].selectClaseDoc,
                };
                aAdjuntos.push(json);
              });
            }
            //Data de XML
            /*
            if (aImagenesXML && aImagenesXML.length > 0) {
              // Crea la estructura de entrada
              aImagenesXML.forEach(function (elemento, indice) {
                var json = {
                  sNombreArchivo: aImagenesXML[indice].nombreArchivoXML,
                  sBase64String: aImagenesXML[indice].FileEncode,
                  sExtencion: "document/" + aImagenesXML[indice].tipoArchivoXML,
                };
                aAdjuntos.push(json);
              });
            }*/
            console.log("...procesando imagenes", aAdjuntos);

            sap.ui.core.BusyIndicator.show(0);
            var registros = enviarDatos.RegistroPreliminar(self, datos);
            var sociedad = self.getView().byId("cbSociedad").getSelectedKey();
            var oData = {
              comprobantes: {},
              adjuntos: {},
              sociedadActual: sociedad,
            };

            oData.comprobantes = registros;
            oData.adjuntos = aAdjuntos;
            //pais = "BO";
            url = constantes.services.procesoRegistroPreliminarPE;

            // let response = await service.serviceDemo(url, oData, self);

            let response = await service.servicePost(url, oData, self);
            resolve(response);
          });
        },

        procesoConsultarValidarPadron: async function (oEvent) {
          let self = this;
          let oParam = {
            RUC: this.getView().getModel("localModel").getData()
              .ProveedorSeleccionado.usuario,
          };

          let response = await service.servicePost(
            constantes.services.procesoConsultarValidarPadron,
            oParam,
            self
          );
          if (response.code == 1) {
            return true;
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
            utilHttp.validarRespuestaServicio(response);
            return false;
          }
        },

        onProcesoTest: async function (oEvent) {
          let self = this;

          let response = await service.serviceGet(
            "/api/compuesto/integracion/pp/",
            {},
            self
          );
          if (response.code == 1) {
            console.log("prueba test");
            return true;
          } else {
            console.log("prueba test err");
            utilHttp.validarRespuestaServicio(response);
            return false;
          }
        },

        /*--------------------------------------USUARIOS------------------------------------------- */
        onSearchUsuarioPaginado: async function (oEvent) {
          this.getView()
            .getModel("localModel")
            .setProperty("/paginacionFiltrosUsuario/pagina", 1);
          this.getView()
            .getModel("localModel")
            .setProperty("/paginacionFiltrosUsuario/filtros", [
              {
                filtroRoles: ["01"],
                filtroBuscar: oEvent.getParameter("value"),
              },
            ]);
          const { paginacionFiltrosUsuario } = this.getView()
            .getModel("localModel")
            .getData();

          await this.onObtenerUsuariosPaginado(
            paginacionFiltrosUsuario.pagina,
            paginacionFiltrosUsuario.filtros
          );
        },
        onObtenerUsuariosPaginado: async function (offset, filtros) {
          var self = this;

          if (offset == 1) {
            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaUsuarios", []);
          }
          try {
            const oParam = {
              pagina: offset, //1,
              filtros: filtros,
            };
            let response = await service.servicePost(
              constantes.services.obtenerUsuarioPaginado,
              oParam,
              self
            );
            if (response.code == 1) {
              this.getView()
                .getModel("localModel")
                .setProperty("/paginacionFiltrosUsuario/pagina", offset);
              const usuarios = response.results.usuarios;
              const listaUsuariosPaginado =
                recibirDatos.obtenerListaUsuarios(usuarios);

              let listaUsuarios = self
                .getView()
                .getModel("localModel")
                .getProperty("/listaUsuarios");
              listaUsuarios = [...listaUsuarios, ...listaUsuariosPaginado];

				listaUsuarios.sort((a, b) =>
				  (a.razonSocial || "").localeCompare(b.razonSocial || "", "es", {
					sensitivity: "base",
				  })
				);

              self
                .getView()
                .getModel("localModel")
                .setProperty("/listaUsuarios", listaUsuarios);
              //;
              if (response.results.pagina < response.results.paginaTotales) {
                self
                  .getView()
                  .getModel("localModel")
                  .setProperty("/visibleButton", true);
              } else {
                self
                  .getView()
                  .getModel("localModel")
                  .setProperty("/visibleButton", false);
              }
              self
                .getView()
                .getModel("localModel")
                .setProperty(
                  "/paginacionFiltrosUsuario/cantidadRegTotales",
                  response.results.cantidadRegTotales
                );
              console.log(
                self
                  .getView()
                  .getModel("localModel")
                  .getProperty("/paginacionFiltrosUsuario")
              );
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
              self
                .getView()
                .getModel("localModel")
                .setProperty("/visibleButton", false);
              util.utilHttp.validarRespuestaServicio(response);
            }
          } catch (error) {
            console.log(error);
          }
        },

        updateStartedListUserPagination: function (oEvent) {
          if (oEvent.getParameters().reason == "Growing") {
            const { paginacionFiltrosUsuario } = this.getView()
              .getModel("localModel")
              .getData();

            this.onObtenerUsuariosPaginado(
              paginacionFiltrosUsuario.pagina + 1,
              paginacionFiltrosUsuario.filtros
            );
          }
        },
        consultarListaEmpresas: async function () {
          let self = this;
          let listaSociedad = [];
          let oParam = {
            RUC: this.getView().getModel("localModel").getData()
              .ProveedorSeleccionado.usuario,
          };

          // this.getView()
          //   .getModel("localModel")
          //   .setProperty(
          //     "/filtrosSociedad",
          //     models.localModel().getData().filtrosSociedad
          //   );

          // this.getView().getModel('localModel').setProperty('/bEnabledSociedadEncontrada', false);

          // this.getView()
          //   .getModel('localModel')
          //   .setProperty('/listaSociedad', models.localModel().getData().listaSociedad);

          this.getView()
            .getModel("localModel")
            .setProperty(
              "/bEnabledSociedadEncontrada",
              models.localModel().getData().bEnabledSociedadEncontrada
            );

          // let response = await service.servicePostRegistro(
          let response = await service.servicePost(
            constantes.services.procesoConsultarListaDeEmpresas,
            oParam,
            self
          );
          if (response.code == 1) {
            console.log(response.results.consultarListaDeEmpresas.ET_DATOS);

            if (response.results.consultarListaDeEmpresas.ET_DATOS.length > 0) {
              listaSociedad = recibirDatos.obtenerDatosMaestrosSAP(
                response.results.consultarListaDeEmpresas.ET_DATOS
              );

              self
                .getView()
                .getModel("localModel")
                .setProperty("/listaSociedad", listaSociedad);

              this.getView()
                .getModel("localModel")
                .setProperty("/bEnabledSociedadEncontrada", true);
            } else {
              util.utilPopUps.messageBox(
                "No se encontraron sociedades cargadas para el proveedor " +
                  this.getView().getModel("localModel").getData()
                    .ProveedorSeleccionado.razonSocial,
                "A",
                function () {}
              );
              return;
            }
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
            util.utilPopUps.messageBox(
              "No se encontraron sociedades cargadas para el proveedor " +
                this.getView().getModel("localModel").getData()
                  .ProveedorSeleccionado.razonSocial,
              "A",
              function () {}
            );
            return;
          }
        },

        consultarCorreos: async function () {
          let self = this;
          let listaCorreos = [];
          let oParam = {};
          let response = await service.serviceGet(
            constantes.services.consultarCorreos,
            oParam,
            self
          );
          if (response.code == 1) {
            listaCorreos = recibirDatos.obtenerListaCorreos(response.results);

            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaCorreos", listaCorreos);
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
          }
        },

        consultarAdjuntos: async function (oSelectedData) {
          let self = this;
          let listaAdjuntos = [];
          let oParam = {
            message_id: oSelectedData.message_id,
          };
          let response = await service.servicePost(
            constantes.services.consultarAdjuntos,
            oParam,
            self
          );
          if (response.code == 1) {
            listaAdjuntos = recibirDatos.obtenerListaAdjuntos(response.results);

            self
              .getView()
              .getModel("localModel")
              .setProperty("/listaAdjuntos", listaAdjuntos);
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
          }
        },

        consultarHistorialRechazoPorId: async function (
          ruc,
          comprobante,
          pedido,
          nro_parte_entrada,
          pos_parte_entrada
        ) {
          let self = this;
          let oParam = {
            ruc: ruc,
            comprobante: comprobante,
            pedido: pedido,
            nro_parte_entrada,
            pos_parte_entrada,
          };

          let response = await service.servicePost(
            constantes.services.consultarHistorialRechazoPorId,
            oParam,
            self
          );
          if (response.code == 1) {
            return response.results;
          } else {
            util.utilHttp.validarRespuestaServicio(response);
            return null;
          }
        },
        consultarAdjuntosXFiltro: async function () {
          let self = this;
          // let listaTipoDocumentoGlobal = [];
          // this.getView()
          //   .getModel("localModel")
          //   .setProperty("/listaTipoDocumentoGlobal", listaTipoDocumentoGlobal);
          // try {
          //constantes.tablaMaestras; // ["T0001"]
          let oParam = {
            filtros: [
              {
                listaRegPreliminarID: [
                  this.getView()
                    .getModel("localModel")
                    .getProperty("/datosCabecera/id_registropreliminar"),
                ],
              },
            ],
          };

          //;
          let response = await service.servicePost(
            constantes.services.procesoConsultarAdjuntosXFiltro,
            oParam,
            self
          );
          if (response.code == 1) {
            // adjuntosRegPreliminarSeleccionadoPDF
            // adjuntosRegPreliminarSeleccionadoXML
            console.log(response.results);

            const listaTipoDocumentoGlobal = this.getView()
              .getModel("localModel")
              .getProperty("/listaTipoDocumentoGlobal");
            console.log("listaTipoDocumentoGlobal:", listaTipoDocumentoGlobal);
            console.log(
              "response.results.adjuntos:",
              response.results.adjuntos
            );
            response.results.adjuntos.map(function (item, index) {
              item.TIPO_CLASE_DOC_DESC = "";
              const aEncontrado = listaTipoDocumentoGlobal.filter(function (
                item2,
                index2
              ) {
                return item.TIPO_CLASE_DOC == item2.key;
              });
              if (aEncontrado.length > 0) {
                item.TIPO_CLASE_DOC_DESC = aEncontrado[0].text;
              }
            });

            response.results.adjuntos = response.results.adjuntos.map(
              (item) => {
                item.TIPO = item.TIPO.toUpperCase();
                return item;
              }
            );

            this.getView()
              .getModel("localModel")
              .setProperty(
                "/preRegistro/dataAttached",
                response.results.adjuntos
              );

            // let adjuntosRegPreliminarSeleccionadoPDF =
            //   response.results.adjuntos.filter(function (item, index) {
            //     return item.TIPO == "pdf";
            //   });
            // this.getView()
            //   .getModel("localModel")
            //   .setProperty(
            //     "/adjuntosRegPreliminarSeleccionadoPDF",
            //     adjuntosRegPreliminarSeleccionadoPDF
            //   );

            // let adjuntosRegPreliminarSeleccionadoXML =
            //   response.results.adjuntos.filter(function (item, index) {
            //     return item.TIPO == "xml";
            //   });
            // this.getView()
            //   .getModel("localModel")
            //   .setProperty(
            //     "/adjuntosRegPreliminarSeleccionadoXML",
            //     adjuntosRegPreliminarSeleccionadoXML
            //   );
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
            util.utilHttp.validarRespuestaServicio(response);
          }
        },
        procesoGetFile: async function (path, tipo) {
          let self = this;
          let oParam = {
            path: path,
            tipo: tipo,
          };

          let response = await service.servicePost(
            constantes.services.procesoGetFile,
            oParam,
            self
          );
          if (response.code == 1) {
            return response.results;
          } else {
            util.utilHttp.validarRespuestaServicio(response);
            return null;
          }
        },
      }
    );
  }
);
