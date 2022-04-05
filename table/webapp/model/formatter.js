sap.ui.define([], function () {
	"use strict";
	return {
		statusText: function (sStatus) {
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			switch (sStatus) {
				case "1":
					return i18n.getText("state1");
				case "2":
					return i18n.getText("state2");
				case "3":
					return i18n.getText("state3");
				default:
					return sStatus;
				
			}
		}
	};
});