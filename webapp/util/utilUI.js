sap.ui.define(
  ["sap/m/MessageBox", "./utilController"],
  function (MessageBox, utilController) {
    "use strict";
    return {
      console: function (msg) {},
      messageBox: function (msg, icon, title) {
        MessageBox.show(msg, {
          icon: MessageBox.Icon[icon],
          title: title,
          actions: [MessageBox.Action.OK],
          emphasizedAction: MessageBox.Action.OK,
        });
      },
      crearExcel: function (
        self,
        model,
        tabla,
        arrayFiltros,
        newModel,
        newTabla,
        arrayColumTabla,
        tituloExcel,
        nameFile
      ) {
        var that = this;
        var odata = "/" + tabla;
        var results = self.getView().getModel(model).getProperty(odata);
        that.onCreateExcel(
          self,
          results,
          newModel,
          arrayColumTabla,
          tituloExcel,
          nameFile
        );
      },
      onCreateExcel: function (
        self,
        resultados,
        newModel,
        arrayColumTabla,
        tituloExcel,
        nameFile
      ) {
        var rows = resultados;
        //////Inicio Fecha Actual/////////////////////////////////////////////////////////////////////////
        var date = new Date();
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
        var dd = date.getDate().toString();
        var fechaActual =
          (dd[1] ? dd : "0" + dd[0]) +
          "/" +
          (mm[1] ? mm : "0" + mm[0]) +
          "/" +
          yyyy; // padding
        //var fechaAct = (dd[1] ? dd : "0" + dd[0]) + (mm[1] ? mm : "0" + mm[0]) + yyyy; // padding
        ///////Fin Fecha Actual///////////////////////////////////////////////////////////////////////////
        var datefull = fechaActual; //this.formatter.date_full(new Date());
        var html = "";
        var tr = "";
        var th = "";
        var td = "";
        if (typeof tituloExcel === "object") {
          html += "<h2>" + tituloExcel.titulo + "</h2>";
          html += "<h3>" + tituloExcel.subtitulo + "</h3>"; // segunda línea
        } else {
          html += "<h2>" + tituloExcel + "</h2>";
        }
        html = html + "<label>Fecha Reporte: " + datefull + "</label>";
        var columnas = [];
        columnas = arrayColumTabla;
        /*[{
			        						name: "Id",
			        						model: "Id"
			        					   }];*/
        tr += "<tr>";
        for (var l = 0; l < columnas.length; l++) {
          var text = columnas[l].name;
          th +=
            '<th style="background-color: #404040; color: #fff" align="center">' +
            (text ? text : "") +
            "</th>";
        }
        tr += th + "</tr>";

        for (var j = 0; j < rows.length; j++) {
          tr += "<tr>";
          td = "";
          for (var k = 0; k < columnas.length; k++) {
            var item = rows[j][columnas[k].model];
            td +=
              '<td style="background-color: #e6e6e6" align="center">' +
              (item ? item : "") +
              "</td>";
          }
          tr += td + "</tr>";
        }
        html = html + '<table style="width:100%">' + tr + "</table>"; //BORDER=2
        var fileName = nameFile + fechaActual + ".xls";
        //var data_type = 'data:application/vnd.ms-excel';
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
          if (window.navigator.msSaveBlob) {
            var blob = new Blob([html], {
              type: "application/vnd.ms-excel;charset=utf-8;",
            });
            navigator.msSaveBlob(blob, fileName);
          }
        } else {
          var blob2 = new Blob(["\uFEFF" + html], {
            type: "application/vnd.ms-excel;charset=utf-8;",
          });
          var filename = fileName;
          var elem = window.document.createElement("a");
          elem.href = window.URL.createObjectURL(blob2);
          elem.download = filename;
          document.body.appendChild(elem);
          elem.click();
          document.body.removeChild(elem);
        }
      },

      listaAdjuntosxBloque: function (array, tamanio_bloque) {
        const bloques = [];
        for (let i = 0; i < array.length; i += tamanio_bloque) {
          const bloque = array.slice(i, i + tamanio_bloque);
          bloques.push(bloque);
        }
        return bloques;
      },
    };
  }
);
