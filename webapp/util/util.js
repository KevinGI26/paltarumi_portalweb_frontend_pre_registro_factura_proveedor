sap.ui.define(
  ['./utilUI', './utilController', './utilHttp', './utilResponse', './utilPopUps'],
  function (utilUI, utilController, utilHttp, utilResponse, utilPopUps) {
    'use strict';
    return {
      utilUI: utilUI,
      utilController: utilController,
      utilHttp: utilHttp,
      utilResponse: utilResponse,
      utilPopUps: utilPopUps,
    };
  }
);
