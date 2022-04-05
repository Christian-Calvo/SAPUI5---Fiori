sap.ui.define([
    "table/controller/BaseController",
    "sap/m/MessageToast",
    "table/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, MessageToast, formatter) {
        "use strict";

        //Variables globales
		var oTreeTable;

        return BaseController.extend("table.controller.App", {
            Formatter: formatter,

            //Función que se ejecuta al entrar en la pantalla
            onInit: function () {
                var oModel = this.getDataModel();
				var oView = this.getView();
				oView.setModel(oModel);
				this._aClipboardData = [];
            },

            //Función que se ejecuta al cargar la pantalla
			onAfterRendering: function() {
				oTreeTable = this.byId("treeTable");
			},
			
			//Función encargada de colapsar toda la tabla
			onCollapseAll: function(){
				oTreeTable.collapseAll();
			},

			//Función encargada de expandir toda la tabla
			onExpandAll: function(){
				oTreeTable.expandToLevel(100);
			},

            //Función que se ejecuta al seleccionar una o varias filas
			selectedRow: function(){
				//Comprobar si hay elementos seleccionados
				var oTreeTable = this.byId("treeTable");
				var aSelectedIndices = oTreeTable.getSelectedIndices();
	
				if (aSelectedIndices.length > 0) {
					this.byId("cutButton").setEnabled(true);
				}
				else{
					this.byId("cutButton").setEnabled(false);
				}
			},

            /**
			 * 
			 * Funciones encargadas de arrastrar las filas
			 */
			onDragStart: function(oEvent) {
				var oTreeTable = this.byId("treeTable");
				var oDragSession = oEvent.getParameter("dragSession");
				var oDraggedRow = oEvent.getParameter("target");
				var iDraggedRowIndex = oDraggedRow.getIndex();
				var aSelectedIndices = oTreeTable.getSelectedIndices();
				var aDraggedRowContexts = [];
	
				if (aSelectedIndices.length > 0) {
					// If rows are selected, do not allow to start dragging from a row which is not selected.
					if (aSelectedIndices.indexOf(iDraggedRowIndex) === -1) {
						oEvent.preventDefault();
					} else {
						for (var i = 0; i < aSelectedIndices.length; i++) {
							aDraggedRowContexts.push(oTreeTable.getContextByIndex(aSelectedIndices[i]));
						}
					}
				} else {
					aDraggedRowContexts.push(oTreeTable.getContextByIndex(iDraggedRowIndex));
				}
	
				oDragSession.setComplexData("hierarchymaintenance", {
					draggedRowContexts: aDraggedRowContexts
				});
			},

			onDrop: function(oEvent) {
				var oTreeTable = this.byId("treeTable");
				var oDragSession = oEvent.getParameter("dragSession");
				var oDroppedRow = oEvent.getParameter("droppedControl");
				var aDraggedRowContexts = oDragSession.getComplexData("hierarchymaintenance").draggedRowContexts;
				var oNewParentContext = oTreeTable.getContextByIndex(oDroppedRow.getIndex());
	
				if (aDraggedRowContexts.length === 0 || !oNewParentContext) {
					return;
				}
	
				var oModel = oTreeTable.getBinding().getModel();
				var oNewParent = oNewParentContext.getProperty();
	
				// In the JSON data of this example the children of a node are inside an array with the name "categories".
				if (!oNewParent.categories) {
					oNewParent.categories = []; // Initialize the children array.
				}
	
				for (var i = 0; i < aDraggedRowContexts.length; i++) {
					if (oNewParentContext.getPath().indexOf(aDraggedRowContexts[i].getPath()) === 0) {
						// Avoid moving a node into one of its child nodes.
						continue;
					}
	
					// Copy the data to the new parent.
					oNewParent.categories.push(aDraggedRowContexts[i].getProperty());
	
					// Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
					oModel.setProperty(aDraggedRowContexts[i].getPath(), undefined, aDraggedRowContexts[i], true);
				}
			},

			//Función encargada de cortar la/s fila/s seleccionada/s
			onCut: function(oEvent) {
				var oTreeTable = this.byId("treeTable");
				var aSelectedIndices = oTreeTable.getSelectedIndices();
				var oModel = oTreeTable.getBinding().getModel();
	
				if (aSelectedIndices.length === 0) {
					MessageToast.show(this.getResourceBundle("selectRow"));
					return;
				}
	
				// Cut the data.
				for (var i = 0; i < aSelectedIndices.length; i++) {
					var oContext = oTreeTable.getContextByIndex(aSelectedIndices[i]);
					var oData = oContext.getProperty();
	
					if (oData) {
						this._aClipboardData.push(oContext.getProperty());
	
						// The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
						oModel.setProperty(oContext.getPath(), undefined, oContext, true);
					}
				}
	
				if (this._aClipboardData.length > 0) {
					this.byId("pasteButton").setEnabled(true);
					this.byId("undoCutButton").setEnabled(true);
				}
			},
			
			//Función encargada de deshacer el cortar
			undoCutButton: function(oEvent){
				this._aClipboardData = [];
				this.byId("pasteButton").setEnabled(false);
				this.byId("undoCutButton").setEnabled(false);
				this.byId("cutButton").setEnabled(false);
				var oModel = this.getDataModel();
				var oView = this.getView();
				oView.setModel(oModel);
			},

			//Función encargada de pegar la/s fila/s seleccionada/s
			onPaste: function(oEvent) {
				var oTreeTable = this.byId("treeTable");
				var aSelectedIndices = oTreeTable.getSelectedIndices();
				var oModel = oTreeTable.getBinding().getModel();
	
				if (aSelectedIndices.length !== 1) {
					MessageToast.show(this.getResourceBundle("selectRow"));
					return;
				}
	
				var oNewParentContext = oTreeTable.getContextByIndex(aSelectedIndices[0]);
				var oNewParent = oNewParentContext.getProperty();
	
				// In the JSON data of this example the children of a node are inside an array with the name "categories".
				if (!oNewParent.categories) {
					oNewParent.categories = []; // Initialize the children array.
				}
	
				// Paste the data to the new parent.
				oNewParent.categories = oNewParent.categories.concat(this._aClipboardData);
	
				this._aClipboardData = [];
				this.byId("pasteButton").setEnabled(false);
				this.byId("undoCutButton").setEnabled(false);
				oModel.refresh();
			},

			//Función que se ejecuta al aplicar la búsqueda en el diálogo de búsqueda
			searchDialog : function(oEvent) {
				this.byId("dialogSearch").close();
				var text = this.byId("searchField").getValue();
				
				if(text != null && text != ""){
					var sQuery = oEvent.getParameter("query");
					var oFilter = [];
					oFilter.push(new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery));
					//oFilter.push(new sap.ui.model.Filter("amount", sap.ui.model.FilterOperator.Contains, sQuery));
					
					var cFilter = new sap.ui.model.Filter({filters: oFilter, and:true});
					oFilter = [cFilter];
					
					var oView = this.getView();
					var oTreeTable = oView.byId("treeTable");
					var aTreeTableRows = oTreeTable.getBinding("rows");
					aTreeTableRows.filter([oFilter]);

					oTreeTable.expandToLevel(100);
				}
				else{
					var oModel = this.getDataModel();
					var oView = this.getView();
					oView.setModel(oModel);
				}
			},

			//Función encargada de abrir la ventana de dialogo de búsqueda
			search: function(oEvent){
				this.byId("dialogSearch").setVisible(true);
				this.byId("dialogSearch").open();
			},

			//Función encargada de cerrar el dialogo
			onCloseDialog: function(oEvent){
				this.byId("dialogSearch").close();
			},

			//Función encargada de borrar la fila seleccionada
			delRow: function(oEvent){
				var oTreeTable = this.byId("treeTable");
				var oModel = oTreeTable.getBinding().getModel();
				var row = oEvent.getParameter("row");
				var indice = row.getIndex();
				var oContext = oTreeTable.getContextByIndex(indice);
				var oData = oContext.getProperty();
				//En el caso que existan datos en la fila, se elimina la fila
				if(oData){
					oModel.setProperty(oContext.getPath(), undefined, oContext, true);
				}
			}
        });
    });
