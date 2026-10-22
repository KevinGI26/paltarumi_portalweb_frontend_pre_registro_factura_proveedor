sap.ui.define(
  ['sap/m/MessageBox', './utilController', 'sap/ui/export/Spreadsheet'],
  function (MessageBox, utilController, Spreadsheet) {
    'use strict';
    return {
      exportSpreadSheetXLSX: function (oTable, aCols, fileName) {
        //let aCols, oRowBinding, oSettings, oSheet, oTable;
        let oSettings;
        let oSheet;

        //return
        //oTable = this.getView().byId("idProductsTable1");
        let oRowBinding = oTable.getBinding('items');
        //aCols = this.createColumnConfigTableProducts();

        oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: 'Level',
          },
          dataSource: oRowBinding,
          fileName: fileName,
          worker: false, // We need to disable worker because we are using a MockServer as OData Service
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },
      isVacio: function (value) {
        if (value === '' || typeof value === 'undefined') {
          return true;
        } else {
          return false;
        }
      },
      convertirFechaDDMMYYY_YYYYMMDD: function (fechaString, separadorInicial, separadorFinal) {
        return (
          fechaString.split(separadorInicial)[2] +
          separadorFinal +
          fechaString.split(separadorInicial)[1] +
          separadorFinal +
          fechaString.split(separadorInicial)[0]
        );
      },

      dateIsValid: function (fecha, separadorInicial, separadorFinal) {
        let date = null;

        if (fecha.split(separadorInicial).length == 3) {
          date = new Date(
            this.convertirFechaDDMMYYY_YYYYMMDD(fecha, separadorInicial, separadorFinal)
          );
        }
        return date instanceof Date && !isNaN(date);
      },
      /** ---------------------- Configuración de columnas ---------------------- */

      onInicialiarColumansDinamicasTabla: function (contexto, idTabla, pathModel) {
        
        const self = contexto;
        const listaColumnas = self.getView().byId(idTabla).getColumns();
        let lista = [];

        listaColumnas.forEach((element, index) => {
          if (element.getProperty('visible')) {
            if (element.mAggregations.header) {
              lista.push({
                idColumnas: element.getId(),
                idConfigColum: 'idConfigColum-' + index,
                text: element.mAggregations.header.getProperty('text'),
                visible: true,
              });
            }
          }
        });
        self.getView().getModel('localModel').setProperty(pathModel, lista);
      },

      onConfigurarColumnasMejorado: async function (
        contexto,
        nameFragment,
        pathListaColumnasAplicar,
        pathlistaColunasDinamicasXVisiblidad
      ) {
        const self = contexto;

        

        if (!self.oMPDialogConfigColumn) {
          self.oMPDialogConfigColumn = self.loadFragment({
            name: nameFragment,
          });
        }
        await self.oMPDialogConfigColumn.then(
          function (oDialogConfigurarColumna) {
            self.oDialogConfigColumn = oDialogConfigurarColumna;
            self.oDialogConfigColumn.open();
          }.bind(self)
        );

        const oContentConfigColumns = self.getView().byId('contentConfigColumns');
        oContentConfigColumns.destroyItems();

        self.getView().getModel('localModel').setProperty(pathListaColumnasAplicar, []);
        const listaColunasDinamicasXVisiblidad = self
          .getView()
          .getModel('localModel')
          .getProperty(pathlistaColunasDinamicasXVisiblidad);

        for (let index = 0; index < listaColunasDinamicasXVisiblidad.length; index++) {
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

      onAplicarConfiguracion: function (contexto, pathlistaColunasDinamicasXVisiblidad) {
        const self = contexto;
        const oContentConfigColumns = self.getView().byId('contentConfigColumns');
        let listaColunasDinamicasXVisiblidad = [
          ...self
            .getView()
            .getModel('localModel')
            .getProperty(pathlistaColunasDinamicasXVisiblidad),
        ];

        for (let index = 0; index < listaColunasDinamicasXVisiblidad.length; index++) {
          const element = listaColunasDinamicasXVisiblidad[index];
          self.getView().byId(element.idColumnas).setVisible(true);
        }

        const aContentItems = oContentConfigColumns.getItems();
        for (let index = 0; index < aContentItems.length; index++) {
          const element = aContentItems[index];
          listaColunasDinamicasXVisiblidad[index].visible = element.getSelected();
        }
        self
          .getView()
          .getModel('localModel')
          .setProperty(pathlistaColunasDinamicasXVisiblidad, listaColunasDinamicasXVisiblidad);

        for (let index = 0; index < listaColunasDinamicasXVisiblidad.length; index++) {
          const element = listaColunasDinamicasXVisiblidad[index];
          self.getView().byId(element.idColumnas).setVisible(element.visible);
        }

        this.onCloseConfigurarColumnas(self.oDialogConfigColumn);
      },

      onResetConfiguracion: function (oContext, pathlistaColunasDinamicasXVisiblidad) {
        const self = oContext;
        let listaColunasDinamicasXVisiblidad = [
          ...self
            .getView()
            .getModel('localModel')
            .getProperty(pathlistaColunasDinamicasXVisiblidad),
        ];

        for (let index = 0; index < listaColunasDinamicasXVisiblidad.length; index++) {
          const element = listaColunasDinamicasXVisiblidad[index];
          element.visible = true;
          self.getView().byId(element.idColumnas).setVisible(true);
        }

        self
          .getView()
          .getModel('localModel')
          .setProperty(pathlistaColunasDinamicasXVisiblidad, listaColunasDinamicasXVisiblidad);

        this.onCloseConfigurarColumnas(self.oDialogConfigColumn);
      },

      onCloseConfigurarColumnas: function (oDialogConfigColumn) {
        oDialogConfigColumn.close();
      },
      /** ---------------------- Configuración de columnas ---------------------- */
    };
  }
);
