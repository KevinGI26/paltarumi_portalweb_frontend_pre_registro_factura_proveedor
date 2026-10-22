sap.ui.define([], function () {
  "use strict";
  return {
    registrarUsuario: function (oParam) {},
    actualizarUsuario: function (oParam) {},
    eliminarUsuario: function (oParam) {},
    obtenerRolesXUsuario: function (idUsuario) {
      let modData = [];
      let keyValue = "USUARIO_ID=" + idUsuario;
      modData.push(keyValue);
      return modData;
    },
    procesoObtenerRazonSocialXRuc: function (oParam) {
      let obtenerRazonSocial = [];
      let object = {};
      let object2 = {};

      object.STCD1 = oParam;

      obtenerRazonSocial.push(object);

      object2.LT_STCD1 = obtenerRazonSocial;

      return object2;
    },
    onFiltrarTabla: function (buscar, roles) {
      return {
        listaCodigosRoles: roles,
        buscar: buscar,
      };
    },
    consultarDatosProveedor: function (object) {
      return { RUC: object.RUC };
    },
    consultarListaDeEmpresas: function (object) {
      return { RUC: object.RUC };
    },
    consultarPartesEntradaProveedor: function (object) {
      return {
        IV_STCD1: object.IV_STCD1,
        IV_FECINI: object.IV_FECINI,
        IV_FECFIN: object.IV_FECFIN,
        IV_XBLNR: object.IV_XBLNR ?? "",
        IV_BUKRS: object.IV_BUKRS,
        ESTADO: object.ESTADO,
      };
    },

    RegistroPreliminar: function (self, datos) {
      var that = this;
      var txtNroserie = self.getView().byId("NRO_SERIE")
        ? self.getView().byId("NRO_SERIE").getValue()
        : "";
      //var proveedor = self.getView().getModel("localModel").getProperty("/Proveedor");
      var proveedor = self
        .getView()
        .getModel("localModel")
        .getProperty("/ProveedorSeleccionado");
      var datosSociedad = self
        .getView()
        .getModel("localModel")
        .getProperty("/datosSociedad");
      var importeTotal = self.getView().byId("IMPORTE").getValue();
      importeTotal = importeTotal.replace(",", "");
      importeTotal = importeTotal.replace("'", "");
      var servDatos = datos;
      var registros = [];
      let registros2 = [];

      var paisActual = self
        .getView()
        .getModel("localModel")
        .getData().sociedadActual;
      let IMPORTE_FACTURA = "0.0,";

      const { selectedRowsPreFactura } = self
        .getView()
        .getModel("localModel")
        .getData();

      selectedRowsPreFactura.forEach(function (row) {
        var objeto = {};
        objeto.BUKRS = datosSociedad[0].VALOR; //BUKRS;
        objeto.SERIE = txtNroserie ?? ""; //servDatos.NRO_SERIE;
        objeto.CORRELATIVO = servDatos.NRO_COMPROBANTE;
        objeto.FECHA = that.convertDate(servDatos.FECHA_EMISION, "DD-MM-AA");
        objeto.CURRENCY = row.MONEDA;

        objeto.AMOUNT = parseFloat(row.IMPORTE).toFixed(2);

        objeto.NRO_PARTE_ENTRADA = row.NRO_PARTE_ENTRADA;
        objeto.POS_PARTE_ENTRADA = row.POS_PARTE_ENTRADA;

        objeto.MBLNR = row.NRO_DOC_ARTICULO;
        objeto.MJAHR = row.EJERCICIO;
        objeto.ZEILE = row.POS_PARTE_ENTRADA;
        objeto.DOCUMENTO_SAP = "";
        objeto.TAX_CODE = servDatos.TIPO_IMPUESTO;
        objeto.RETENCION = servDatos.TIPO_RETENCION;
        objeto.DETRACCION = servDatos.TIPO_DETRACCION;
        objeto.VIA_PAGO = row.VIA_PAGO;
        objeto.CONDICION_PAGO = row.CONDICIONPAGO;

        objeto.TAX_AMOUNT = row.IMPUESTO.toFixed(2);

        objeto.FECHA_CONT_FACT = that.convertDate(servDatos.FECHA_BASE, "DD-MM-AA");
        objeto.CLASE_DOCUMENTO = servDatos.CLASE_DOCUMENTO;

        // Nuevos campos a considerar
        objeto.NRO_GUIA_REMISION = row.NRO_GUIA_REMISION;
        objeto.FECHA_ENTREGA = row.FECHA_ENTREGA;

        objeto.ARTICULO = "";
        if (row.ARTICULO) {
          let numStr = row.ARTICULO;
          let result = numStr.replace(/^0+/, "");
          objeto.ARTICULO = result;
        }
        objeto.DESCRIPCION_ARTICULO = row.DESCRIPCION_ARTICULO;
        objeto.CANTIDAD_ENTREGADA = row.CANTIDAD_ENTREGADA;
        objeto.PEDIDO_REFERENCIA = row.PEDIDO_REFERENCIA;
        if (paisActual == "PE") {
          if (objeto.SERIE) {
            objeto.NRO_COMPROBANTE =
              objeto.CLASE_DOCUMENTO +
              "-" +
              objeto.SERIE +
              "-" +
              objeto.CORRELATIVO;
          } else {
            objeto.NRO_COMPROBANTE = "";
          }
        } else if (paisActual == "BO") {
          objeto.NRO_COMPROBANTE =
            objeto.CLASE_DOCUMENTO + "-" + objeto.CORRELATIVO;
        } else {
          objeto.NRO_COMPROBANTE = objeto.CORRELATIVO;
        }

        objeto.IMPORTE_FACTURA = IMPORTE_FACTURA;

        objeto.UNIDAD_MEDIDA = row.UNIDAD_MEDIDA;
        objeto.CLAVE_ACCESO = servDatos.CLAVE_ACCESO ?? "";
        objeto.RUC = proveedor.USUARIO;
        objeto.RAZON_SOCIAL = proveedor.RAZON_SOCIAL;

        objeto.IMPORTETOTAL = importeTotal;

        objeto.IMPORTE_TOTAL = importeTotal;

        objeto.TAX_AMOUNT_CAB_TOTAL = parseFloat(
          servDatos.IMPUESTOIMPORTE
        ).toFixed(2);

        objeto.ID_ESTADO_REG_PRELIMINAR_STR = objeto.ID_ESTADO_REG_PRELIMINAR
          ? objeto.ID_ESTADO_REG_PRELIMINAR.toString()
          : "1";
        objeto.IdAnterior = row.IdAnterior;
        objeto.TAX_POSICION = row.TIPO_IMPUESTO;

        objeto.EKGRP = row.EKGRP ?? "";
        objeto.EKNAM = row.EKNAM ?? "";

        objeto.EBELP = row.POS_PED_REFERENCIA ?? "";

        objeto.HES = row.HES ?? "";

        objeto.HES_POS = row.HES_POS ?? "";
        debugger
        objeto.TIPO_EMISOR =
          proveedor.CODIGO_TIPO_EMISOR || datos.TIPO_EMISOR || "";

        registros.push(objeto);
      });

      return registros;
    },
    pad: function (n, length) {
      //Añadir ceros a la izquierda, length tamaño final que debe tener
      var n = n.toString();
      while (n.length < length) {
        n = "0" + n;
      }
      return n;
    },
    convertDate: function (fecha, formato) {
      var fechaConvert = "";
      var separador = "";
      var parte1 = "";
      var parte2 = "";
      var parte3 = "";
      var format = "";
      var format1 = formato.split("/");
      var format2 = formato.split("-");
      var format3 = formato.split(".");
      var fechaMod = new Date(JSON.parse(JSON.stringify(fecha)));
      //fechaMod.setMonth(fechaMod.getMonth() + 1);
      var anio = fechaMod.getFullYear();
      var mes = this.pad(fechaMod.getMonth() + 1, 2); //this.pad(fechaMod.getMonth() == 0 ? 12 : fechaMod.getMonth(), 2);
      var dia = this.pad(fechaMod.getDate(), 2);
      if (format1.length === 3) {
        format = format1;
        separador = "/";
      }
      if (format2.length === 3) {
        format = format2;
        separador = "-";
      }
      if (format3.length === 3) {
        format = format3;
        separador = ".";
      }
      if (format[0] == "DD") {
        parte1 = dia;
        if (format[1] == "MM") {
          parte2 = mes;
          parte3 = anio;
        }
        if (format[1] == "AA") {
          parte2 = anio;
          parte3 = mes;
        }
      }
      if (format[0] == "MM") {
        parte1 = mes;
        if (format[1] == "DD") {
          parte2 = dia;
          parte3 = anio;
        }
        if (format[1] == "AA") {
          parte2 = anio;
          parte3 = dia;
        }
      }
      if (format[0] == "AA") {
        parte1 = anio;
        if (format[1] == "MM") {
          parte2 = mes;
          parte3 = dia;
        }
        if (format[1] == "DD") {
          parte2 = dia;
          parte3 = mes;
        }
      }
      fechaConvert = parte1 + separador + parte2 + separador + parte3; //anio + "-" + mes + "-" + dia;
      return fechaConvert;
    },
  };
});
