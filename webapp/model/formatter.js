sap.ui.define([], function () {
  'use strict';
  var Formatter = {
    formatFecha: function (fecha) {
      if (fecha) {
        //console.log("fecha ", fecha);
        //var ts = fecha.split("T")[0];
        //console.log("ts ", ts);
        return moment(new Date(fecha)).format('DD/MM/YYYY');
      }
    },

    formatIconEstado: function (estado) {
      if (estado == 1) {
        return 'sap-icon://message-success';
      } else {
        return 'sap-icon://message-error';
      }
    },
    formatStateEstado: function (estado) {
      if (estado == 1) {
        return 'Success';
      } else {
        return 'Error';
      }
    },
    formatTextEstado: function (estado) {
      if (estado == 1) {
        return 'Activo';
      } else {
        return 'Inactivo';
      }
    },
    formatTextEmisor: function (emisor) {
      if (emisor == 'E') {
        return 'Electrónico';
      } else {
        return 'Fisico';
      }
    },

    isVacio: function (value) {
      if (value === '' || typeof value === 'undefined') {
        return true;
      } else {
        return false;
      }
    },

    formatoArticulo: function (value) {
      if (value !== null && value !== '' && typeof value !== 'undefined') {
        if (/^[0-9]+$/.test(value)) {
          value = parseInt(value, 10);
        }
        return value;
      }
    },

    formatoPosicion: function (value) {
      if (value !== null && value !== '' && typeof value !== 'undefined') {
        return '0' + parseInt(value) * 10;
      }
    },

    fnErrorMensaje: function (mensaje) {
      $.confirm({
        title: 'Error',
        content: mensaje,
        theme: 'supervan',
        buttons: {
          Aceptar: function () {},
        },
      });
    },

    fnMensaje: function (mensaje) {
      $.confirm({
        title: 'Aviso',
        content: mensaje,
        theme: 'supervan',
        buttons: {
          Aceptar: function () {},
        },
      });
    },
    FormatDateOdata: function (fecha) {
      var dt = new Date(fecha);
      return (
        dt.getDate() +
        '/' +
        (dt.getMonth() + 1) +
        '/' +
        dt.getFullYear() +
        ' ' +
        dt.getHours() +
        ':' +
        dt.getMinutes()
      );
    },

    formatoFecha: function (fecha) {
      /*Entra fecha en formato
                        año-mes-día y sale en formato día-mes-año*/
      var mes = [
        '_',
        'ENE',
        'FEB',
        'MAR',
        'ABR',
        'MAY',
        'JUN',
        'JUL',
        'AGO',
        'SET',
        'OCT',
        'NOV',
        'DIC',
      ];
      if (fecha.length === 8) {
        fecha =
          fecha.substring(6, 8) +
          '/' +
          mes[parseInt(fecha.substring(4, 6))] +
          '/' +
          fecha.substring(0, 4);
      } else {
        if (fecha) {
          var string = fecha.split('-');
          if (string[2] === undefined) {
            fecha = string[0];
          } else {
            fecha = string[2] + '/' + mes[parseInt(string[1])] + '/' + string[0];
          }
        }
      }
      return fecha;
    },

    capitalizar: function (value) {
      if (typeof value !== 'undefined' && value !== '') {
        value = value.toLowerCase();
        return value[0].toUpperCase() + value.slice(1);
      }
    },

    formatoCantidad: function (value, decimals, separators) {
      decimals = 1;
      decimals = decimals >= 0 ? parseInt(decimals, 0) : 2;
      separators = separators || [',', "'", '.'];
      var number = (parseFloat(value) || 0).toFixed(decimals);
      if (number.length <= 4 + decimals) {
        return number.replace('.', separators[separators.length - 1]);
      }
      var parts = number.split(/[-.]/);
      value = parts[parts.length > 1 ? parts.length - 2 : 0];
      var result =
        value.substr(value.length - 3, 3) +
        (parts.length > 1 ? separators[separators.length - 1] + parts[parts.length - 1] : '');
      var start = value.length - 6;
      var idx = 0;
      while (start > -3) {
        result =
          (start > 0 ? value.substr(start, 3) : value.substr(0, 3 + start)) +
          separators[idx] +
          result;
        idx = ++idx % 2;
        start -= 3;
      }
      return (parts.length == 3 ? '-' : '') + result + '';
    },

    formatoMoneda: function (value, decimals, separators) {
      decimals = 2;
      decimals = decimals >= 0 ? parseInt(decimals, 0) : 2;
      separators = separators || [',', "'", '.'];
      var number = (parseFloat(value) || 0).toFixed(decimals);
      if (number.length <= 4 + decimals) {
        return number.replace('.', separators[separators.length - 1]);
      }
      var parts = number.split(/[-.]/);
      value = parts[parts.length > 1 ? parts.length - 2 : 0];
      var result =
        value.substr(value.length - 3, 3) +
        (parts.length > 1 ? separators[separators.length - 1] + parts[parts.length - 1] : '');
      var start = value.length - 6;
      var idx = 0;
      while (start > -3) {
        result =
          (start > 0 ? value.substr(start, 3) : value.substr(0, 3 + start)) +
          separators[idx] +
          result;
        idx = ++idx % 2;
        start -= 3;
      }
      return (parts.length == 3 ? '-' : '') + result + '';
    },
  };

  return Formatter;
});
