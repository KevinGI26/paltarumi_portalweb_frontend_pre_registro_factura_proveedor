sap.ui.define(
  [
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Dialog",
    "sap/ui/layout/VerticalLayout",
  ],
  function (
    MessageBox,
    MessageToast,
    Text,
    Button,
    Input,
    Dialog,
    VerticalLayout
  ) {
    "use strict";
    return {
      onMensajeGeneral: function (self, mensaje) {
        var dialog = new sap.m.Dialog({
          title: "Mensaje",
          type: "Message",
          content: new sap.m.Text({
            text: mensaje,
          }),
          beginButton: new sap.m.Button({
            text: "Cerrar",
            press: function () {
              dialog.close();
            }.bind(self),
          }),
          afterClose: function () {
            dialog.destroy();
          },
        });
        dialog.open();
      },
      onMensajeDetalle: function (self, mensaje, oFilaSeleccionada) {
        var dialog = new sap.m.Dialog({
          title: "Mensaje",
          type: "Message",
          content: new sap.m.Text({ text: mensaje }),
          beginButton: new sap.m.Button({
            text: "Ver Detalle",
            press: function () {
              dialog.close();

              const oTable = self.getView().byId("tblPreRegistro");
              const oBinding = oTable.getBinding("items");

              if (oFilaSeleccionada && oBinding) {
                const aItems = oTable.getItems();
                aItems.forEach((oItem) => {
                  const oData = oItem
                    .getBindingContext("localModel")
                    .getObject();

                  if (
                    oData.CORRELATIVO_SCP === oFilaSeleccionada.CORRELATIVO_SCP
                  ) {
                    oTable.removeSelections(true);
                    oTable.setSelectedItem(oItem, true);
                  }
                });
              }

              self.onAbrirDetalleComprobante();
            }.bind(self),
          }),
          endButton: new sap.m.Button({
            text: "Cerrar",
            press: function () {
              dialog.close();
            }.bind(self),
          }),
          afterClose: function () {
            dialog.destroy();
          },
        });

        dialog.open();
      },
      onMessageWarningDialogPressExit_AndExit: function (
        idTransaccion,
        mensaje,
        callback
      ) {
        var that = this;
        var dialog = new sap.m.Dialog({
          id: "dglExitoso",
          title: "Mensaje", ///////
          type: "Message",
          state: "Success",
          contentWidth: "25rem",
          content: new sap.ui.layout.VerticalLayout({
            id: "idVertical",
            content: [
              new sap.m.Text({
                text: mensaje + "\n" + "\n",
                textAlign: "Center",
                id: "txtMensaje",
              }),
              new sap.m.Input({
                value: idTransaccion,
                enabled: false,
                id: "inputTranscaccion",
                class: "tamaniotexto",
              }),
            ],
          }),
          beginButton: new sap.m.Button({
            visible: false,
            icon: "sap-icon://copy",
            id: "btnidTransaccion",
            tooltip: "Copiar código de transaccion al portapapeles",
            press: function () {
              that.copyToClipboard(idTransaccion);
            },
          }),
          endButton: new sap.m.Button({
            text: "Salir",
            press: function () {
              var aplicacion = "#";
              var accion = "";
              dialog.destroy();
              //
              //that.regresarAlLaunchpad(aplicacion, accion);
              callback();
              //that.recalcularComprobanteDesdeHana(self);
            },
          }),
          afterClose: function () {
            dialog.destroy();
          },
        });

        dialog.open();
      },
      onMessageErrorDialogPress: function (idTransaccion) {
        var mensaje = "Ocurrió un error en el servicio";
        var that = this;
        var dialog = new sap.m.Dialog({
          id: "dglExitoso",
          title: "Error",
          type: "Message",
          state: "Error",
          contentWidth: "25rem",
          content: new sap.ui.layout.VerticalLayout({
            id: "idVertical",
            content: [
              new sap.m.Text({
                text: mensaje + "\n" + "\n",
                textAlign: "Center",
                //id: 'txtMensaje'
              }),
              new sap.m.Input({
                value: idTransaccion,
                enabled: false,
                id: "inputTranscaccion",
                class: "tamaniotexto",
              }),
            ],
          }),
          beginButton: new sap.m.Button({
            icon: "sap-icon://copy",
            id: "btnidTransaccion",
            tooltip: "Copiar código de transaccion al portapapeles",
            press: function () {
              that.copyToClipboard(idTransaccion);
            },
          }),
          endButton: new sap.m.Button({
            text: "Cerrar",
            press: function () {
              dialog.close();
            },
          }),
          afterClose: function () {
            dialog.destroy();
          },
        });
        dialog.open();
      },
      onMessageWarningDialogPress: function (idTransaccion, mensaje) {
        var that = this;
        var dialog = new Dialog({
          id: "dglExitoso",
          title: "Advertencia",
          type: "Message",
          state: "Warning",
          contentWidth: "25rem",
          content: new sap.ui.layout.VerticalLayout({
            id: "idVertical",
            content: [
              new sap.m.Text({
                text: mensaje + "\n" + "\n",
                textAlign: "Center",
                //id: 'txtMensaje'
              }),
            ],
          }),
          beginButton: new sap.m.Button({
            text: "Cerrar",
            type: "Emphasized",
            press: function () {
              dialog.close();
            },
          }),
          afterClose: function () {
            dialog.destroy();
          },
        });
        dialog.open();
      },
      onMessageWarningDialogPressExit: function (idTransaccion, mensaje) {
        var that = this;
        var dialog = new sap.m.Dialog({
          id: "dglExitoso",
          title: "Advertencia",
          type: "Message",
          state: "Warning",
          contentWidth: "320px",
          content: new sap.ui.layout.VerticalLayout({
            id: "idVertical",
            content: [
              new sap.m.Text({
                text: mensaje,
                textAlign: "Center",
                id: "txtMensaje",
              }),
            ],
          }),
          beginButton: new sap.m.Button({
            text: "Cerrar",
            type: "Emphasized",
            press: function () {
              var aplicacion = "#";
              var accion = "";
              that.regresarAlLaunchpad(aplicacion, accion);

              dialog.close();
            },
          }),
          afterClose: function () {
            dialog.destroy();
          },
        });
        dialog.open();
      },
      onMessageWarningDialogPress2: function (idTransaccion, mensaje) {
        var that = this;
        var dialog = new sap.m.Dialog({
          id: "dglExitoso",
          title: "Advertencia",
          type: "Message",
          state: "Warning",
          contentWidth: "320px",
          content: new sap.ui.layout.VerticalLayout({
            id: "idVertical",
            content: [
              new Text({
                text: mensaje,
                textAlign: "Center",
                id: "txtMensaje",
              }),
            ],
          }),
          beginButton: new sap.m.Button({
            text: "Cerrar",
            type: "Emphasized",
            press: function () {
              dialog.close();
            },
          }),
          afterClose: function () {
            dialog.destroy();
          },
        });
        dialog.open();
      },
      onMessageWarningDialogPress3: function (mensaje) {
        MessageBox.alert(mensaje, {
          icon: sap.m.MessageBox.Icon["WARNING"],
          title: "Advertencia",
          actions: ["Cerrar"], // Botón personalizado
          emphasizedAction: "Cerrar",
          onClose: function (sAnswer) {
            return;
          },
        });

        /*
        var that = this;
        var dialog = new sap.m.Dialog({
          id: 'dglExitoso',
          title: 'Advertencia',
          type: 'Message',
          state: 'Warning',
          contentWidth: '320px',
          content: new sap.ui.layout.VerticalLayout({
            id: 'idVertical',
            content: [
              new Text({
                text: mensaje,
                textAlign: 'Center',
                id: 'txtMensaje',
              }),
            ],
          }),
          beginButton: new sap.m.Button({
            text: 'OK',
            type: 'Emphasized',
            press: function () {
              dialog.close();
            },
          }),
          afterClose: function () {
            dialog.destroy();
          },
        });
        dialog.open(); */
      },
      onMessageSuccessDialogPress: function (idTransaccion, mensaje) {
        var that = this;
        return new Promise(function (resolve, reject) {
          var dialog = new sap.m.Dialog({
            id: "dglExitoso",
            title: "Éxito",
            type: "Message",
            state: "Success",
            contentWidth: "18rem",
            content: new sap.ui.layout.VerticalLayout({
              id: "idVertical",
              content: [
                new sap.m.Text({
                  text: mensaje,
                  textAlign: "Center",
                  //id: 'txtMensaje'
                }),
              ],
            }),

            beginButton: new sap.m.Button({
              type: "Emphasized",
              text: "Cerrar",
              press: function () {
                resolve(that.fnAprobar());
                dialog.close();
              },
            }),
            afterClose: function () {
              resolve(that.fnAprobar());
              dialog.destroy();
            },
          });
          dialog.open();
        });
      },
      copyToClipboard: function (idTransaccion) {
        var sString = idTransaccion,
          sSuccessText,
          sExceptionText;
        sSuccessText = "Código de transaccción copiado al portapapeles";
        sExceptionText = "sExceptionText";
        this._copyStringToClipboard(sString, sSuccessText, sExceptionText);
      },
      fnAprobar: function () {
        return 1;
      },
      _copyStringToClipboard: function (copyText, successText, exceptionText) {
        var $temp = $("<input>");

        try {
          $("body").append($temp);
          $temp.val(copyText).select();
          document.execCommand("copy");
          $temp.remove();
          MessageToast.show(successText, {
            duration: 5000,
            width: "20rem,",
          });
        } catch (oException) {
          MessageToast.show(exceptionText, {
            duration: 5000,
            width: "20rem,",
          });
        }
      },
      messageBox: function (mensaje, tipo, callback) {
        return new Promise(function (resolve, reject) {
          if (tipo.toUpperCase() === "C") {
            const accionSave = "Guardar";
            const accionClose = "Cerrar";
            MessageBox.show(mensaje, {
              icon: MessageBox.Icon.QUESTION,
              title: "Confirmación",
              actions: [accionSave, accionClose],
              emphasizedAction: accionSave,
              onClose: function (sAnswer) {
                return callback(sAnswer === accionSave);
              },
            });
          }
          if (tipo.toUpperCase() === "A") {
            const accionCerrar = "Cerrar";
            MessageBox.alert(mensaje, {
              icon: sap.m.MessageBox.Icon["WARNING"],
              title: "Advertencia",
              actions: [accionCerrar],
              emphasizedAction: [accionCerrar],
              onClose: function (sAnswer) {
                return callback(sAnswer === accionCerrar);
              },
            });
          }
          if (tipo.toUpperCase() === "I") {
            const accionClose = "Cerrar";
            MessageBox.information(mensaje, {
              icon: sap.m.MessageBox.Icon["INFORMATION"],
              title: "Información",
              actions: [accionClose],
              emphasizedAction: [accionClose],
              onClose: function (sAnswer) {
                return callback(sAnswer === accionClose);
              },
            });
          }
          if (tipo.toUpperCase() === "E") {
            const accionClose = "Cerrar";
            MessageBox.show(mensaje, {
              icon: MessageBox.Icon.ERROR,
              title: "Error",
              actions: [accionClose],
              onClose: function (sAnswer) {
                return callback(sAnswer === accionClose);
              },
            });
          }

          if (tipo.toUpperCase() === "S") {
            const accionClose = "Cerrar";
            MessageBox.show(mensaje, {
              icon: MessageBox.Icon.SUCCESS,
              title: "Éxito",
              actions: [accionClose],
              emphasizedAction: accionClose,
              onClose: function (sAnswer) {
                return callback(sAnswer === accionClose);
              },
            });
          }
        });
      },
      messageBoxOk: function (msg, icon, title) {
        sap.m.MessageBox.show(msg, {
          icon: sap.m.MessageBox.Icon[icon],
          title: title,
          emphasizedAction: [sap.m.MessageBox.Action.OK],
        });
      },
      messageBoxMejorado: function (mensaje, tipo) {
        return new Promise(function (resolve, reject) {
          if (tipo.toUpperCase() === "C") {
            MessageBox.show(mensaje, {
              icon: MessageBox.Icon.QUESTION,
              title: "Confirmación",
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.YES,
              onClose: function (sAnswer) {
                resolve(sAnswer === MessageBox.Action.YES);
              },
            });
          }

          if (tipo.toUpperCase() === "E") {
            MessageBox.error(mensaje, {
              onClose: function (sAnswer) {
                resolve(sAnswer === MessageBox.Action.YES);
              },
            });
          }

          if (tipo.toUpperCase() === "S") {
            MessageBox.success(mensaje, {
              onClose: function (sAnswer) {
                resolve(sAnswer === MessageBox.Action.YES);
              },
            });
          }
        });
      },
    };
  }
);
