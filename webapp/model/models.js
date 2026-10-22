sap.ui.define(
  ["sap/ui/model/json/JSONModel", "sap/ui/Device"],
  /**
   * provide app-view type models (as in the first "V" in MVVC)
   *
   * @param {typeof sap.ui.model.json.JSONModel} JSONModel
   * @param {typeof sap.ui.Device} Device
   *
   * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
   */
  function (JSONModel, Device) {
    "use strict";

    return {
      createDeviceModel: function () {
        const oModel = new JSONModel(Device);
        oModel.setDefaultBindingMode("OneWay");
        return oModel;
      },

      localModel: function () {
        const oParam = {
          paginacionFiltrosUsuario: {
            pagina: 1,
            cantidadRegTotales: 0,
            filtroBuscar: "",
            filtros: [
              {
                filtroRoles: ["01"],
                filtrosTipoEmisor: [],
                filtroBuscar: "",
              },
            ],
          },
          totalSizePdfUploaded: 0,
          maxtotalSizePdfUploaded: 5242880,
          lineaMensaje: "",
          bValidLineaMensaje: false,

          datosSociedad: [],
          filtrosSociedad: "",
          ProveedorSeleccionado: {
            nombre: "",
            apellido: "",
            razonSocial: "",
            usuario: "",
          },
          ProveedorSeleccionadoVisible: false,
          bEnabledSociedadEncontrada: false,
          //sociedadActual: 'EC',
          sociedadActual: "",
          listaSerieCorrelativo:[],
          listaSociedadesMaestra: [],
          datosProveedor: {
            nombreproveedor: "",
            ruc: "",
            direccion: "",
          },

          filtrosEstadoRegistro: [],
          sociedadCabecera: "",
          filtrosDetraccion: [],

          ListaComprobantes: [],

          buscarDocumentos: "",
          selectProveedor: "0",
          search: "",
          selectTipoEstados: "0",
          selectTipoExportData: "0",
          selectClaseDocumento: "0",
          selectDetraccion: "0",
          tabSelect: "0",
          fechaPrueba: "06/06/1992",
          selectedRowPreFactura: {},
          selectedRowsPreFactura: [],
          fileName: "",

          datosCabecera: {
            fImporte: 0,
            sImporte: "0.00",
            fIgv: 0,
            sIgv: "0.00",
            sFechaContable: "",
            sFechaEmision: "",

            selectComboDetraccion: "",
            nroserie: "",
            correlativo: "",
          },
          preRegistro: {
            dataAttached: [],
            dataAttachedXML: [],
          },

          // filtros: {
          //   fFechaEmision: '',
          //   fFechamasuno: '',
          // },

          filtros: {
            fFechaEmision: moment(new Date()).format("DD/MM/YYYY"),
            fFechamasuno: moment(new Date()).format("DD/MM/YYYY"),
            // estadoPago: [],
          },

          comboClaseDocumento: [
            {
              id: "0",
              name: "01 - Factura",
            },
            {
              id: "1",
              name: "02 - Boleta",
            },
          ],

          comboDetraccion: [],

          comboProveedor: [
            {
              id: "0",
              name: "--Seleccione--",
            },
            {
              id: "1",
              name: "Proveedor Empresa SAC",
            },
            {
              id: "2",
              name: "DARIO AYARZA S.A.C.",
            },
          ],

          comboTipoEstados: [
            {
              id: "0",
              name: "--Seleccione--",
            },
            {
              id: "1",
              name: "Con Factura",
            },
            {
              id: "2",
              name: "Sin Factura",
            },
          ],

          comboTipoExportData: [
            {
              id: "0",
              name: "Microsoft Excel (*.xlsx)",
            },
          ],

          tablaPreRegistros: [],
          addPreRegistros: {
            id: "",
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
          },
          editPreRegistros: {
            id: "",
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
          },
          listaSociedad: [],
          listaMultipleEstadoRegistro: [],
          listaColumnasAplicar: [],
          domRefAdjunto : null,

          listaBuzon: [
            {
                id: "1",
                nameAsunto: "Factura 1",
                fechaRecibida: "2024-07-10",
                documentos: 
                  {id:"1",
                    nombre:"Doc1.pdf",
                    tipo:"pdf"
                  }
                ,
                status: "Pending"
            },
            {
                id: "2",
                nameAsunto: "Factura 2",
                fechaRecibida: "2024-07-11",
                documentos: "Doc2.pdf",
                status: "Approved"
            },
            {
                id: "3",
                nameAsunto: "Factura 3",
                fechaRecibida: "2024-07-12",
                documentos: "Doc3.pdf",
                status: "Rejected"
            }
        ],
        archivos : [ {id : 1,tipo: "xml" },
        { id:2,tipo: "pdf" }]
  
        };

        const oModel = new JSONModel(oParam);
        return oModel;
      },
    };
  }
);
