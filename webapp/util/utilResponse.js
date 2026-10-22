sap.ui.define([], function () {
  "use strict";
  return {
    codeSuccess: 1,
    codeWarn: 2,
    codeWarn3: 3,
    codeWarnm3: -3,
    codeWarn101: 101,
    codeWarn17: 17,
    codeError: -1,
    codeErrorNoAutorizado: -99,
    codeError4: -4,
    codeException: -2,
    success: function (idtransaccion, message, results) {
      return {
        code: this.codeSuccess,
        idtransaccion: idtransaccion,
        message: message,
        results: results,
      };
    },
    warn: function (idtransaccion, message, results) {
      return {
        code: this.codeWarn,
        idtransaccion: idtransaccion,
        message: message,
        results: results,
      };
    },
    warnm3: function (idtransaccion, message, results) {
      return {
        code: this.codeWarnm3,
        idtransaccion: idtransaccion,
        message: message,
        results: results,
      };
    },
    warn3: function (idtransaccion, message, results) {
      return {
        code: this.codeWarn3,
        idtransaccion: idtransaccion,
        message: message,
        results: results,
      };
    },

    warn101: function (idtransaccion, message, results) {
      return {
        code: this.codeWarn101,
        idtransaccion: idtransaccion,
        message: message,
        results: results,
      };
    },
    warn17: function (idtransaccion, message, results) {
      return {
        code: this.codeWarn17,
        idtransaccion: idtransaccion,
        message: message,
        results: results,
      };
    },
    error: function (idtransaccion, message, results) {
      return {
        code: this.codeError,
        idtransaccion: idtransaccion,
        message: message,
        results: results,
      };
    },
    errorNoAutorizado: function (idtransaccion, message, results) {
      return {
        code: this.codeErrorNoAutorizado,
        idtransaccion: idtransaccion,
        message: message,
        results: results,
      };
    },
    error4: function (idtransaccion, message, results) {
      return {
        code: this.codeError4,
        idtransaccion: idtransaccion,
        message: message,
        results: results,
      };
    },
    exception: function (idtransaccion, message) {
      return {
        code: this.codeException,
        idtransaccion: idtransaccion,
        message: message,
      };
    },
    errorServicio: function (error, oHeader) {
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
    },
  };
});
