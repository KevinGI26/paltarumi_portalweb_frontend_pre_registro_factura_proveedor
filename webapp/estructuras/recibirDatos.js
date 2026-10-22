sap.ui.define(
  ["paltarumi/portalweb/registroprefactura/model/formatter"],
  function (formatter) {
    "use strict";
    return {
      consultarPartesEntradaProveedor2: function (data) {
        let modData = [];
        if (data) {
          data.forEach(function (item, index) {
            let obj = { ...item };

            obj.VISIBLE = obj.ID_ESTADO_REG_PRELIMINAR == 2 ? true : false;

            // obj.ID_ESTADO_REG_PRELIMINAR_STR = obj.ID_ESTADO_REG_PRELIMINAR.toString();

            if (obj.ID_ESTADO_REG_PRELIMINAR) {
              obj.ID_ESTADO_REG_PRELIMINAR_STR =
                obj.ID_ESTADO_REG_PRELIMINAR.toString();
            } else {
              obj.ID_ESTADO_REG_PRELIMINAR_STR = "";
            }

            modData.push(obj);
          });
        }
        return modData;
      },

      obtenerListaUsuarios: function (data) {
        let modData = [];
        if (data) {
          data.forEach(function (item, index) {
            //;
            let obj = {
              idUsuario: item.ID,
              nombres: item.NOMBRE,
              apellidos: item.APELLIDO,
              correo: item.CORREO,
              tipoDeEmisor: item.CODIGO_TIPO_EMISOR,
              tipoDeEmisorDesc: item.TIPO_EMISOR, //formatter.formatTextEmisor(item.TIPO_EMISOR),
              listaCodRolesDescripcion: item.LISTA_ROLES,
              listaRolesDescripcion: item.LISTA_ROLES_DESCRIPCION,
              razonSocial: item.RAZON_SOCIAL,
              usuario: item.USUARIO,
              ruc: item.USUARIO,
              fechaDeCreacion: item.CREATED_AT,
              estado: item.ID_ESTADO,
              estadoDesc: formatter.formatTextEstado(item.ID_ESTADO),

              //idUsuario: index + 1,
            };
            modData.push(obj);
          });
        }

        return modData;
      },
      consultarDatosProveedor: function (data) {
        let modData = {
          nombreproveedor: "",
          ruc: "",
          direccion: "",
        };
        if (data) {
          (modData.nombreproveedor = data.NOMBRE),
            (modData.direccion = data.DIRECCION);
        }
        return modData;
      },

      obtenerDatosMaestrosSelect: function (data) {
        let modData = [];
        if (data) {
          if (data.length > 0) {
            modData.push({ key: "0", text: "--Seleccione--" });
          }
          data.forEach(function (item, index) {
            //;
            let obj = {
              key: item.CODIGO_MAESTRO_DETALLE,
              text: item.CAMPO,
              //idUsuario: index + 1,
            };
            modData.push(obj);
          });
        }
        return modData;
      },
      obtenerDatosMaestrosMultiple: function (data) {
        let modData = [];
        if (data) {
          data.forEach(function (item, index) {
            //;
            let obj = {
              key: item.CODIGO_MAESTRO_DETALLE,
              text: item.CAMPO,
              //idUsuario: index + 1,
            };
            modData.push(obj);
          });
        }
        return modData;
      },

      obtenerDatosMaestrosEstadoRegistroMultiple: function (data) {
        let modData = [];
        if (data) {
          data.forEach(function (item, index) {
            //;
            
            let obj = {
              // key: item.CODIGO_MAESTRO_DETALLE,
              // text: item.CAMPO,
              key: item.VALOR,
              text: item.CAMPO,
            };
            modData.push(obj);
          });
        }
        return modData;
      },

      obtenerDatosMaestrosSimpleSeleccion: function (data) {
        let modData = [];
        if (data) {
          modData.push({ key: "0", text: "---Seleccione---" });
          data.forEach(function (item, index) {
            //;
            let obj = {
              key: item.CODIGO_MAESTRO_DETALLE,
              text: item.CAMPO,
              //idUsuario: index + 1,
            };
            modData.push(obj);
          });
        }
        return modData;
      },

      obtenerDatosDetraccion: function (data) {
        let modData = [];
        if (data) {
          // modData.push({ key: '0', text: '---Seleccione---' });
          data.forEach(function (item) {
            //;
            let obj = {
              key: item.WT_WITHCD,
              text: item.WT_WITHCD + " - " + item.TEXT40,
            };
            modData.push(obj);
          });
        }
        return modData;
      },

      obtenerDatosImpuesto: function (data) {
        let modData = [];
        if (data) {
          // modData.push({ key: '0', text: '---Seleccione---' });
          data.forEach(function (item) {
            //;
            let obj = {
              key: item.MWSKZ,
              text: item.TEXT1,
            };
            modData.push(obj);
          });
        }
        return modData;
      },

      obtenerRolesXUsuario: function (data) {
        let modData = [];
        if (data) {
          data.forEach(function (item) {
            let obj = {
              codigo: item.CODIGO_MAESTRO_DETALLE,
              rol: item.NOMBRE_ROL,
            };
            modData.push(obj);
          });
        }
        return modData;
      },
      obtenerKeysRolesXUsuario: function (data) {
        let modData = [];
        if (data) {
          data.forEach(function (item) {
            modData.push(item.CODIGO_MAESTRO_DETALLE);
          });
        }
        return modData;
      },
      obtenerDatosMaestrosSociedad: function (data) {
        let modData = [];

        if (data) {
          data.listaSociedadesMaestra.forEach(function (item, index) {
            //;

            let obj = {
              CODIGO_MAESTRO_DETALLE: item.CODIGO_MAESTRO_DETALLE,
              DESCRIPCION: item.DESCRIPCION,
              VALOR: item.VALOR,
              SOCIEDAD_ACTUAL: "",
              CAMPO: item.CAMPO,
            };

            const concat_cod_father_cod_hijo =
              item.CODIGO_MAESTRO_CABECERA + "-" + item.CODIGO_MAESTRO_DETALLE;
            const aEncontrado = data.listSociedadPais.filter(function (
              item2,
              index2
            ) {
              return (item2.concat_cod_father_cod_hijo =
                concat_cod_father_cod_hijo);
            });
            if (aEncontrado.length > 0) {
              obj.SOCIEDAD_ACTUAL = aEncontrado[0].VALOR;
            }
            modData.push(obj);
          });
        }
        return modData;
      },
      obtenerDatosMaestrosSAP: function (data) {
        let modData = [];
        if (data) {
          data.forEach(function (item, index) {
            //;
            let obj = {
              key: item.EMPRESA,
              text: item.EMPRESA + " - " + item.DESCRIPCION,
              descripcion: item.DESCRIPCION,
            };
            modData.push(obj);
          });
        }
        return modData;
      },

      obtenerDatosMaestrosTipoDocumento: function (data) {
        
        let modData = [];
        if (data) {
          data.forEach(function (item, index) {
            //;
            let obj = {
              key: item.CODIGO_MAESTRO_DETALLE,
              text: item.CAMPO,
              //idUsuario: index + 1,
            };
            modData.push(obj);
          });
        }
        return modData;
      },

      obtenerListaCorreos: function (data) {
        
        let modData = [];
        if (data) {
          data.forEach(function (item, index) {
            //;
            let obj = {
              message_id: item.message_id,
              subject: item.subject ,
              date: item.date,
              user_email: item.user_email,
              status_id: item.status_id ,
              number_attachments: item.number_attachments
              
            };
            modData.push(obj);
          });
        }
        return modData;
      },
      obtenerListaAdjuntos: function (data) {
        
        let modData = [];
        if (data) {
          data.forEach(function (item, index) {
            //;
            let obj = {
              id: item.id,
              file_name: item.file_name ,
              status_id: item.status_id,
              user_email_id: item.user_email_id ,
              content: item.content             
            };
            modData.push(obj);
          });
        }
        return modData;
      }
    };
  }
);
