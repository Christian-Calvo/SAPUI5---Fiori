sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
], function (Controller, JSONModel) {
	"use strict";
	
	return Controller.extend("table.controller.BaseController", {
		
		//Funcion encargada de devolver el fichero de literales
		getResourceBundle: function(sValue) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sValue);
        },
        
        //Funcion encargada de obtener el BusyDialog o crearlo en el caso que no exista
        _getBusyDialog: function() {
            if (!this._oBusyDialog) {
                this._oBusyDialog = new sap.m.BusyDialog();
            }
            return this._oBusyDialog;
        },
        
        //Funcion encargada de abrir el BusyDialog
        openBusyDialog: function() {
            this._getBusyDialog().open();
        },
        
        //Funcion encargada de cerrar el BusyDialog
        closeBusyDialog: function() {
            this._getBusyDialog().close();
        },
        
		//Funcion encargada de devolver el modelo de datos
		getDataModel: function(){
			return new JSONModel(sap.ui.require.toUrl("table/model/oData.json"));
		},
		
		//Funcion encargada de obtener el modelo de datos
		getModel: function(sName) {
            return this.getOwnerComponent().getModel(sName);
        },
        
		//Funcion encargada de insertar el modelo en la vista
		setModel: function(oModel, sName) {
            return this.getOwnerComponent().setModel(oModel, sName);
        },
	});
});