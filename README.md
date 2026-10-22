# Registro Pre Factura Contador — app HTML5 para SAP Build Work Zone

Requisitos: Node, `cf` CLI + plugin multiapps (`cf install-plugin multiapps`), y `mbt` (`npm i -g mbt`).

Probar local:  npm install ; npm start  -> http://localhost:8080
Compilar:      npm run build      (genera mta_archives/registroprefactura.mtar)
Desplegar:     cf login -a https://api.cf.us10-001.hana.ondemand.com --sso -o 875351e3trial -s dev
               npm run deploy

Luego en Work Zone: Channel Manager -> HTML5 Apps -> actualizar; Content Manager -> la app aparece
(ID paltarumi.portalweb.registroprefactura) -> agregarla al grupo/rol CONTADOR.
