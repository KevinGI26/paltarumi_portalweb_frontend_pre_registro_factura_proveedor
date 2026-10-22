

/* global moment:true */
sap.ui.define([], function () {
  "use strict";

  let ENV = "prd"

let apiGatewayByEnv = {
  dev: "https://s5q3on8uia.execute-api.us-east-2.amazonaws.com/api/",
  qas: "https://pssjfp37uj.execute-api.us-east-2.amazonaws.com/api/",
  prd: "https://rxapthww62.execute-api.us-east-2.amazonaws.com/api/",
};

  return {
    ambiente: "prd",
    isLocal: true,
    idProyecto: "app.regprefacturascontador",
    codigoProyecto:"04",

    cod_product: "pp",
    subdomain: "seidor_pe-pe-pp-1000-dev",
    schema_db:
      "tenant_{client_alias}-{cod_country}-{cod_product}-{cod_society}-{enviroment}",

    urlApiGatewayLocal: apiGatewayByEnv[ENV] ?? "",
    // "http://localhost:3013/api/",
    destApiGateway:
      "./regprefacturascontador/dest-provwebapigateway",
    destApiSeguridad:
      "./regprefacturascontador/dest-provapiseguridad",

    // token:
    //   "eyJraWQiOiI3XC9TbGFaTHB4eUlBWEFWQ25GbVBwdFBnVTMwSWhFa2s5QXNVeDFWQnlnYz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1MTJiMzU4MC1jMDkxLTcwYTAtOGFhMC00NDBlZTQ1MDc3M2IiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0yX0N1SGJ1UENiWCIsInBob25lX251bWJlcl92ZXJpZmllZCI6ZmFsc2UsImNvZ25pdG86dXNlcm5hbWUiOiJzaXN0ZW1hcyIsIm9yaWdpbl9qdGkiOiJkYjI0ODRjYi1iMTE2LTRhODctYWQ2ZC04YmRhODIzYzczZWYiLCJhdWQiOiI0a3Z2cGwxbHRmajA2NWdmOWUxbXViaG5xYSIsImV2ZW50X2lkIjoiOTU1MDQyZjItYmNhNS00MTk1LWE2ZWEtM2I2NzUyMWU4NmM0IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MjI1NDA3ODMsIm5hbWUiOiJTaXN0ZW1hcyIsInBob25lX251bWJlciI6Iis1MTk4MDU0NTM4NiIsImV4cCI6MTcyMjU1MTU4MywiaWF0IjoxNzIyNTQwNzgzLCJqdGkiOiJkYWZhNDQ5YS0zZjU0LTRhZWMtODkxYi1lMTRmMWY5YWE3YTIiLCJlbWFpbCI6InNpc3RlbWFzLnNlaWRvckB5b3BtYWlsLmNvbSJ9.VzPF8P6RJY9m-bs0ljRgF8AQMAhF-SIKgXuqCKskHXwl80DmSFmkFXXmEBaiTsr0rW8OI8Nl3K0CHZewKNCh2_FjXZWyGMIPCRYmBaPoBUYtk8U5vD7TkSMU__qYpqlaxaZ2WB91dAVLdA-d1U96KxJBBx8lRvlUxo9Dskd2cvSrMHJ--gLaxTT2ht_HgkOb23zCz_-CKrWNOyV0dosjPU5J54iHSmhFYgDJ5xv6Fm9s5_qkJw-CUefDgS0nFTE5GhYhBXPTUsH8NDkFZEMvnI9haKw1CrLG1W974BcBnFhN7i1DyK4ehIRBVKiZVXx88dsSHEX3GkB6BX46zMGqOQ",
    // infoUsuario: {
    //   ID_ESTADO: 1,
    //   CORREO: "KARLA.TORRES@SEIDOR.COM",
    //   NOMBRE: "Karla",
    //   APELLIDO: "Torres",
    //   RUC: "",
    //   USUARIO: "20519999758",
    //   RAZON_SOCIAL: "ALMACENES LA INMACULADA S.A.C.",
    //   CODIGO_TIPO_EMISOR: "E",
    //   CREATED_AT: "2023-09-12T15:23:05.733Z",
    //   CREATED_BY: "anonymous",
    //   MODIFIED_AT: "2023-09-12T15:23:05.733Z",
    //   MODIFIED_BY: "anonymous",
    //   LISTA_ROLES: "01",
    //   DESC_ROLES: "Proveedor",
    //   TIPO_EMISOR: "E",
    // },

    services: {
      obtenerMaestrosDetalleCamposXCabecera:
        "/base/maestro-detalle/obtenerMaestrosDetalleCamposXCabecera",
      procesoConsultarDatosProveedor:
        "/compuesto/integracion/procesoConsultarDatosProveedor",
      procesoConsultarListaDeEmpresas:
        "/compuesto/integracion/procesoConsultarListaDeEmpresas",
      procesoConsultarPartesEntradaProveedor:
        "/compuesto/integracion/procesoConsultarPartesEntradaProveedor",
      procesoConsultarDetraccion:
        "/compuesto/integracion/procesoConsultarDetraccion",
      procesoConsultarImpuesto:
        "/compuesto/integracion/procesoConsultarImpuesto",
      procesoConsultarSunat: "/compuesto/integracion/procesoConsultarSunat",
      procesoConsultarSRI: "/compuesto/integracion/ec/procesoConsultarSRI",
      consultarUserApi: "/userapi",
      procesoRegistroPreliminarPE:
        // "/servicio/integracion/procesoRegistroDocumentoPreliminar",
        "/compuesto/integracion/procesoRegistroDocumentoPreliminar",
      // "/compuesto/integracion/pe/procesoRegistroDocumentoPreliminar",
      procesoRegistroPreliminarEC:
        "/compuesto/integracion/ec/procesoRegistroDocumentoPreliminar",
      procesoRegistroPreliminarBO:
        "/compuesto/integracion/bo/procesoRegistroDocumentoPreliminar",
      procesoConsultarValidarPadron:
        "/compuesto/integracion/procesoConsultarValidarPadron",
      obtenerUsuarioPaginado:
        "/compuesto/usuario/procesoObtenerUsuarioPaginado",

  obtenerUsuariosXFiltro: "/base/usuario/obtenerUsuariosXFiltro",

      registrarAdjuntosXBloque:
        "/compuesto/registro-preliminar/registrarAdjuntosXBloque",

      consultarCorreos: "/base/email/getEmailInfo",

      consultarAdjuntos: "/base/email/getEmailAttachments",

      consultarHistorialRechazoPorId:
        "/base/historial-rechazo/consultarHistorialRechazoPorId",
      consultarRegistroPreliminarRegFacturasXFiltro:
        "/base/registro-preliminar/consultarRegistroPreliminarRegFacturasXFiltro",
      procesoConsultarAdjuntosXFiltro:
        "/base/adjuntos/consultarAdjuntosXFiltro",
      procesoGetFile: "/compuesto/integracion/S3/procesoGetFile",
    },

    // tablaMaestras: [
    //   "T000",
    //   "ESTADO_DE_REGISTRO",
    //   "CONSTANTES",
    //   "rucsociedad",
    //   "adjuntospdf",
    //   "adjuntosxml",
    //   "estado_comprobante",
    //   "estado_ruc",
    //   "estado_domicilio",
    //   "seriecorrelativo",
    //   "BoliviaMoneda",
    //   "detraccion",
    //   "PORCENTAJE_IVA",
    // ],

    tablaMaestras: [
      "TM0004",
      "TM0012",
      "TM0017", // = "CONSTANTES"
      "TM0006",
      "TM0002",
      "TM0002",
      "TLOC02",
      "TLOC02",
      "TLOC02",
      "TM0014",
      "BoliviaMoneda",
      "TM0042",
      "TM0011",
      "TM0001", //Padre
      "TM0008", //Padre
      "TM0010", //Padre
      "TM0005",
      "TH0002",
    ],
    codigoPaisContCompro: "03",
    codigoPaisContContribuyente: "02",
    codigoPaisContDomicilio: "01",
    codigoSerie: "01",
    codigoCorrelativo: "02",
  };
});
