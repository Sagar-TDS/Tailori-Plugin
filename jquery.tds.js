/*
 * jQuery tds.tailori plugin
 * Original Author:  @ Sagar Narayane
 * Further Changes, comments:
 * Licensed under the Textronics Design System pvt.ltd.
 */
;
(function ($, window, document, undefined) {

	"use strict";
	var tdsTailoriPlugin = 'tailori';

	function Plugin(element, options) {
		this.element = element;
		this.$element = $(element);
		this.options = options;
		this.metadata = this.$element.data(tdsTailoriPlugin.toLowerCase() + "-options");
		this._name = tdsTailoriPlugin;
		this.init();

	}

	Plugin.prototype = {
		_Url: "",
		_Links: new Object(),
		_ReverseLinks: new Object(),
		_DoubleLinks: new Object(),
		_BlockedFeatures: new Object(),
		_BlockedDetails: new Object(),
		_CurrentBlockedFeatures: Array(),
		_CurrentBlockedDetails: Array(),
		_RenderObject: new Object(),
		_Alignments: new Array(),
		_CurrentAlignmentIndex: 0,
		_Swatch: "",
		_Color: "",
		_CurrentDetail: "",
		_CurrentContrastNo: "",
		_MonogramPlacement: "",
		_MonogramColor: "",
		_MonogramFont: "",
		_MonogramText: "",
		_SpecificDisplay: new Object(),
		_SpecificLink: new Object(),
		_SpecificDetails: new Array(),
		_SpecificViewOf: "",
		_IsSpecific: false,
		_ProductData: [],
		_LibConfig: new Object,
		_IsAlignmentClick: false,
		_SelectedAlignment: "face",

		defaults: {
			Product: "Men-Shirt",
			ImageSource: "",
			ProductTemplate: "",
			OptionTemplate: "",
			OptionsPlace: "",
			IsOptionVisible: false,
			FeatureTemplate: "",
			FeaturesPlace: "",
			MonogramTemplate: "",
			Swatch: "",
			ServiceUrl: "http://localhost:57401",
			AutoSpecific: true,
			AutoAlignment: true,
			ImageSize: "",
			OnProductChange: "",
			OnProductDetailChange: "",
			OnOptionChange: "",
			OnFeatureChange: "",
			OnContrastChange: "",
			OnRenderImageChange: "",

		},

		init: function () {
			this.config = $.extend({}, this.defaults, this.options, this.metadata);
			this._Swatch = this.Option("Swatch");
			this._setCofiguration(this.Option("Product"));
			return this;
		},

		_setCofiguration: function (type) {
			var templateId = this.Option("ProductTemplate");
			if (templateId == "")
				return;
			$.getJSON({
				url: this.Option("ServiceUrl") + "/api/products/" + type,
				context: this,
				success: function (data) {
					var that = this;
					that._Alignments = data.Alignments;
					that._SpecificDisplay = data.SpecificDisplay;
					that._SpecificLink = data.SpecificLink;
					that._SpecificDetails = data.SpecificDetails;
					that._ProductData = data.Product;
					that._LibConfig = data.LibraryConfig;

					var template = $.templates(templateId);
					var htmlOutput = template.render({
							"Product": that._ProductData
						});
					this.$element.html(htmlOutput);

					for (var key in this._Alignments) {
						if (this._Alignments[key].toLowerCase() == "face")
							this._CurrentAlignmentIndex = key;
					}

					for (var dataIndex = 0; dataIndex < this._ProductData.length; dataIndex++) {
						if (this._ProductData[dataIndex].IsBlock == "True") {
							$("[data-tds-key='" + this._ProductData[dataIndex].Id + "']").remove();
							$("[data-tds-product='" + this._ProductData[dataIndex].Id + "']").remove();
						}
					}

					var monogram = that.Option("MonogramTemplate");

					if (monogram !== undefined && monogram !== "") {
						var template = $.templates(that.Option('MonogramTemplate'));
						var htmlOutput = template.render(data);
						$(that.Option('MonogramPlace')).html(htmlOutput);

						that._MonogramPlacement = $('[data-tds-mplace]:eq(0)').attr("data-tds-mplace");
						that._MonogramFont = $('[data-tds-mfont]:eq(0)').attr("data-tds-mfont");
						that._MonogramColor = $('[data-tds-mcolor]:eq(0)').attr("data-tds-mcolor");

						$("body").on("click", "[data-tds-mplace]", function () {
							that._MonogramPlacement = $(this).data("tds-mplace");
							if (that._MonogramPlacement !== "" && that._MonogramFont !== "" && that._MonogramColor !== "" && that._MonogramText !== "")
								that._createUrl();
						});

						$("body").on("click", "[data-tds-mfont]", function () {

							that._MonogramFont = $(this).data("tds-mfont");
							if (that._MonogramPlacement !== "" && that._MonogramFont !== "" && that._MonogramColor !== "" && that._MonogramText !== "")
								that._createUrl();
						});

						$("body").on("click", "[data-tds-mcolor]", function () {

							that._MonogramColor = $(this).data("tds-mcolor");
							if (that._MonogramPlacement !== "" && that._MonogramFont !== "" && that._MonogramColor !== "" && that._MonogramText !== "")
								that._createUrl();
						});

						$("body").on("change", '[data-tds-moption="text"]', function () {
							that._MonogramText = $(this).val();
							if (that._MonogramPlacement !== "" && that._MonogramFont !== "" && that._MonogramColor !== "" && that._MonogramText !== "")
								that._createUrl();

						});
					}

					$("body").on("click", "[data-tds-element]", function () {

						if ($(this).hasClass("block") || that._CurrentBlockedFeatures.indexOf($(this).attr("data-tds-element")) > -1 || that._CurrentBlockedDetails.indexOf($(this).attr("data-tds-key")) > -1) {
							console.log("feature is block");
						} else {
							that._SpecificViewOf = $(this).attr("data-tds-key");
							that._createRenderObject(that._SpecificViewOf, $(this).attr("data-tds-element"));
						}

						var callback = that.Option("OnFeatureChange");
						if (typeof callback == 'function')
							callback.call(this, $(this).data("tds-element"));
					});

					$("body").on("click", "[data-tds-option]", function () {
						var productId = $(this).data("tds-key");
						var optionId = $(this).data("tds-option");
						var featureTmpl = that.Option("FeatureTemplate");
						var featureUiId = that.Option("FeaturesPlace");
						if (featureTmpl != "" && featureUiId != "" && productId !== undefined && productId !== "" && optionId !== undefined && optionId !== "") {
							var features = null;

							for (var dataIndex = 0; dataIndex < that._ProductData.length; dataIndex++)
								if (that._ProductData[dataIndex].Id == productId) {
									if (optionId == "contrast") {
										features = that._ProductData[dataIndex].Contrasts;
										break;
									} else {
										for (var dataIndex1 = 0; dataIndex1 < that._ProductData[dataIndex].Options.length; dataIndex1++)
											if (that._ProductData[dataIndex].Options[dataIndex1].Id == optionId) {
												features = that._ProductData[dataIndex].Options[dataIndex1].Features;
												break;
											}
									}
								}
							if (features != null) {
								var template1 = $.templates(featureTmpl);
								var htmlOutput1 = template1.render({
										"Features": features
									});
								$(featureUiId).html(htmlOutput1);
							}
						}

						var callback = that.Option("OnOptionChange");
						if (typeof callback == 'function')
							callback.call(this, $(this).data("tds-option"));
					});

					$("body").on("click", "[data-tds-product]", function () {
						if (that.Option("IsOptionVisible")) {
							var productId = $(this).data("tds-product");
							var optionTmpl = that.Option("OptionTemplate");
							var optionUiId = that.Option("OptionsPlace");
							if (optionTmpl != "" && optionUiId != "" && productId !== undefined && productId !== "") {
								var options = [];
								for (var dataIndex = 0; dataIndex < that._ProductData.length; dataIndex++)
									if (that._ProductData[dataIndex].Id == productId) {
										options = $.merge([], that._ProductData[dataIndex].Options);
										if (that._ProductData[dataIndex].Contrasts.length > 0)
											options.push({
												Id: "tds-contrast",
												Name: "Contrast",
												DataAttr: " data-tds-option='contrast' data-tds-key='" + productId + "'"
											});
										break;
									}
								if (options != null) {
									if (options.length > 1) {
										var template1 = $.templates(optionTmpl);
										var htmlOutput1 = template1.render({
												"Options": options
											});
										$(optionUiId).html(htmlOutput1);
									} else {
										var features = options[0].Features;

										if (features != null) {
											var featureTmpl = that.Option("FeatureTemplate");
											var featureUiId = that.Option("FeaturesPlace");
											var template1 = $.templates(featureTmpl);
											var htmlOutput1 = template1.render({
													"Features": features
												});
											$(featureUiId).html(htmlOutput1);
										}
									}
								}
							}
						} else {
							var productId = $(this).data("tds-product");
							var featureTmpl = that.Option("FeatureTemplate");
							var featureUiId = that.Option("FeaturesPlace");
							if (featureTmpl != "" && featureUiId != "" && productId !== undefined && productId !== "") {
								var features = [];

								for (var dataIndex = 0; dataIndex < that._ProductData.length; dataIndex++)
									if (that._ProductData[dataIndex].Id == productId)
										for (var dataIndex1 = 0; dataIndex1 < that._ProductData[dataIndex].Options.length; dataIndex1++) {
											features = features.concat(that._ProductData[dataIndex].Options[dataIndex1].Features);
											break;
										}
								if (features != null) {
									var template1 = $.templates(featureTmpl);
									var htmlOutput1 = template1.render({
											"Features": features
										});
									$(featureUiId).html(htmlOutput1);
								}
							}
						}

						var callback = that.Option("OnProductDetailChange");
						if (typeof callback == 'function')
							callback.call(this, $(this).data("tds-product"));
					});

					$("body").on("click", "[data-tds-contrast]", function () {

						that._setContrast($(this).attr("data-tds-key"), $(this).attr("data-tds-contrast"));
						var callback = that.Option("OnContrastChange");
						if (typeof callback == 'function')
							callback.call(this);
					});

					$("body").on("click", "[data-tds-alignment]", function () {
						that._changeAlignment($(this));
					});

					that._linkingBlocking();
					var callback = that.Option("OnProductChange");
					if (typeof callback == 'function')
						callback.call(this, type);
				},
				fail: function () {}
			});
		},

		_createRenderObject: function (key, value) {

			if (key === undefined) {

				for (var dataIndex = 0; dataIndex < this._ProductData.length; dataIndex++) {
					this._RenderObject[this._ProductData[dataIndex].Id] = {
						Id: this._ProductData[dataIndex].Options[0].Features[0].Id,
						Swatch: "",
						Color: "",
						Contrast: []
					};
				}

			} else if (key !== "") {

				var oldValue = this._RenderObject[key].Id;
				if (this._BlockedFeatures.hasOwnProperty(this._RenderObject[oldValue])) {
					for (var blockedFeature in this._BlockedFeatures[this._RenderObject[oldValue].Id]) {
						var feature = this._CurrentBlockedFeatures[this._RenderObject[key].Id][blockedFeature];
						this._CurrentBlockedFeatures.pop(feature);
						$("[data-tds-element='" + feature + "']").removeClass("block");
					}
				}

				if (this._BlockedDetails.hasOwnProperty(oldValue)) {
					for (var blockedDetail in this._BlockedDetails[oldValue]) {
						var detail = this._BlockedDetails[oldValue][blockedDetail];
						this._CurrentBlockedDetails.pop(detail);
						$("[data-tds-key='" + detail + "']").removeClass("block");
					}
				}

				var selectedDetailName = "";
				var selectedFeatureName = "";
				for (var i = 0; i < this._ProductData.length; i++) {
					if (this._ProductData[i].Id == key) {
						selectedDetailName = this._ProductData[i].Name;
						for (var j = 0; j < this._ProductData[i].Options.length; j++) {
							for (var k = 0; k < this._ProductData[i].Options[j].Features.length; k++) {
								if (this._ProductData[i].Options[j].Features[k].Id == value) {
									this._SelectedAlignment = this._ProductData[i].Options[j].Features[k].Alignment;
									selectedFeatureName = this._ProductData[i].Options[j].Features[k].Name;
								}
							}
						}
					}
				}

				if (selectedDetailName.toLowerCase().indexOf("button") > -1) {
					for (var i = 0; i < this._ProductData.length; i++) {
						var dName = this._ProductData[i].Name.toLowerCase();
						if (dName.indexOf("hole") > -1 || dName.indexOf("thread") > -1) {

							for (var j = 0; j < this._ProductData[i].Options.length; j++) {
								for (var k = 0; k < this._ProductData[i].Options[j].Features.length; k++) {
									if (this._ProductData[i].Options[j].Features[k].Name.toLowerCase() == selectedFeatureName.toLowerCase()) {
										this._RenderObject[this._ProductData[i].Id].Id = this._ProductData[i].Options[j].Features[k].Id;
									}
								}
							}
						}
					}
				}

				this._RenderObject[key].Id = value;

				if (this._BlockedFeatures.hasOwnProperty(value)) {
					for (var blockedFeature in this._BlockedFeatures[value]) {
						var feature = this._BlockedFeatures[value][blockedFeature];
						this._CurrentBlockedFeatures.push(feature);
						$("[data-tds-element='" + feature + "']").addClass("block");
					}
				}

				if (this._BlockedDetails.hasOwnProperty(value)) {
					for (var blockedDetail in this._BlockedDetails[value]) {
						var detail = this._BlockedDetails[value][blockedDetail];
						this._CurrentBlockedDetails.push(detail);
						$("[data-tds-key='" + detail + "']").addClass("block");
					}
				}

			}
			this._createUrl();
		},

		_setContrast: function (key, value) {
			this._CurrentContrastNo = value;
			this._CurrentDetail = key;
		},

		_createUrl: function () {

			this._Url = "";

			for (var key in this._RenderObject) {
				if (this._CurrentBlockedDetails.indexOf(key) !== -1)
					continue;
				if (this._CurrentBlockedFeatures.indexOf(this._RenderObject[key].Id) !== -1)
					continue;

				if (this._IsSpecific)
					if (key !== this._SpecificViewOf && key !== this._SpecificDisplay[this._SpecificViewOf] && this._SpecificDisplay[key] !== this._SpecificViewOf)
						continue;
					else if (this._SpecificLink.hasOwnProperty(this._SpecificViewOf)) {
						if (key !== this._SpecificViewOf && this._SpecificLink[this._SpecificViewOf].indexOf(key) === -1)
							continue;
					}

				var swatch = "";
				if (this._RenderObject[key].Swatch !== "") {
					swatch = "&swatch=" + this._RenderObject[key].Swatch;
				} else if (this._RenderObject[key].Color !== "") {
					swatch = "&color=" + this._RenderObject[key].Color;
				}

				if (this._DoubleLinks.hasOwnProperty(key)) {

					for (var fLink in this._DoubleLinks[key]) {

						for (var dLink in this._DoubleLinks[key][fLink]) {
							if (swatch !== "")
								this._Url += "part=" + this._RenderObject[key].Id + "&pair=" + this._RenderObject[fLink].Id + "&pairpair=" + this._RenderObject[this._DoubleLinks[key][fLink][dLink]].Id + swatch + "/";
							else
								this._Url += "part=" + this._RenderObject[key].Id + "&pair=" + this._RenderObject[fLink].Id + "&pairpair=" + this._RenderObject[this._DoubleLinks[key][fLink][dLink]].Id + "/";
						}
					}

				}

				if (swatch !== "")
					this._Url += "part=" + this._RenderObject[key].Id + swatch + "/";
				else
					this._Url += "part=" + this._RenderObject[key].Id + "/";
				if (this._RenderObject[key].Contrast.length > 0) {
					for (var contrastKey in this._RenderObject[key].Contrast) {
						if (this._RenderObject[key].Contrast[contrastKey] === null)
							continue;
						var cSwatch = this._RenderObject[key].Contrast[contrastKey].Swatch;
						var cColor = this._RenderObject[key].Contrast[contrastKey].Color;
						if (cSwatch !== "" || cColor !== "") {
							this._Url += "part=" + this._RenderObject[key].Id;
							this._Url += cSwatch != "" ? "&swatch=" + this._RenderObject[key].Contrast[contrastKey].Swatch : "&swatch=" + this._RenderObject[key].Contrast[contrastKey].Color;
							this._Url += "&grouporderno=" + contrastKey + "/";
						}
					}
				}
				if (this._ReverseLinks[key] !== undefined) {
					for (var index in this._ReverseLinks[key]) {
						this._Url += "part=" + this._RenderObject[this._ReverseLinks[key][index]].Id + "&pair=" + this._RenderObject[key].Id;
						if (this._RenderObject[this._ReverseLinks[key][index]].Swatch != "")
							this._Url += "&swatch=" + this._RenderObject[this._ReverseLinks[key][index]].Swatch;
						this._Url += "/";
					}
				}

			}
			if (this._Url === "" && !this._IsSpecific)
				return;
			else if (this._Url === "" && this._IsSpecific) {
				this._IsSpecific = false;
				this._createUrl();
				return;
			}

			//this._Url += "Color=" + this._Color + "/";
			var monoUrl = "";
			if (this._MonogramText !== "" && !this._IsSpecific) {
				monoUrl = "mp=" + this._MonogramPlacement + "&mf=" + this._MonogramFont + "&mc=" + this._MonogramColor + "&mt=" + this._MonogramText + "/"
			}

			if (this._IsAlignmentClick) {
				if (this._Alignments[this._CurrentAlignmentIndex].toLowerCase() == "face")
					this._Url += monoUrl;
				this._Url += "view=" + this._Alignments[this._CurrentAlignmentIndex];

				if (!this._IsSpecific)
					this._IsAlignmentClick = false;
			} else {
				if (this._SelectedAlignment.toLowerCase() == "face")
					this._Url += monoUrl;
				this._Url += "view=" + this._SelectedAlignment;

				for (var index in this._Alignments)
					if (this._Alignments[index] == this._SelectedAlignment)
						this._CurrentAlignmentIndex = index;

			}
			if (this._IsSpecific)
				this._Url += "/type=3"

				if (this.Option("AutoSpecific"))
					this._IsSpecific = true;

			console.log(this._Url);
			if (this._Url.indexOf("part") === -1) {
				this._IsSpecific = false;
				this._createUrl();
			} else
				$.getJSON({
					url: this.Option("ServiceUrl") + "/v1/imgs?" + this._Url,
					context: this,
					success: function (data) {

						$(this.Option("ImageSource")).empty();
						var isAny = false;
						var className = Date.now();
						var imagesArray = [];
						var imgSrc = this.Option("ImageSource");

						if (data.length === 2 && data[0] === "" && data[1].indexOf("Monogram") > 1) {
							isAny = false;
						} else
							for (var url in data) {
								if (data[url] != "") {
									if (imgSrc !== undefined) {

										var h = $(imgSrc).css("height");
										h = h.replace("px", "");

										if (this.ImageSize == "")
											h = this.Option('ImageSize');

										$(imgSrc).append("<img src='" + data[url] + "?h=" + h + "&scale=both'>");
									}
									imagesArray.push(data[url]);
									isAny = true;
								}
							}
						if (!isAny) {
							this._IsSpecific = false;
							this._createUrl();
						} else {

							var callback = this.Option("OnRenderImageChange");
							if (typeof callback == 'function')
								callback.call(this, imagesArray);
						}
					},
					fail: function () {}
				});

		},

		_linkingBlocking: function () {
			$.getJSON({
				url: this.Option("ServiceUrl") + "/api/products/" + this.Option("Product") + "/link",
				context: this,
				success: function (data) {
					this._Links = data.Link;
					this._ReverseLinks = data.ReverseLink;
					this._DoubleLinks = data.DoubleLinking;
					this._BlockedFeatures = data.Block;
					this._BlockedDetails = data.BlockDetail;
					this._createRenderObject();
				},
				fail: function () {}
			});
		},

		_changeAlignment: function ($alignEle) {
			this._IsAlignmentClick = true;
			var align = $alignEle.data("tds-alignment").toLowerCase();

			if (align == "next") {
				if (this._Alignments.length - 1 == this._CurrentAlignmentIndex)
					this._CurrentAlignmentIndex = 0;
				else
					this._CurrentAlignmentIndex++;
			} else if (align == "previous") {
				if (this._CurrentAlignmentIndex == 0)
					this._CurrentAlignmentIndex = this._Alignments.length - 1;
				else
					this._CurrentAlignmentIndex--;
			} else
				for (var key in this._Alignments) {
					if (this._Alignments[key].toLowerCase() == align)
						this._CurrentAlignmentIndex = key;
				}
			this._createUrl();
		},

		publicMethod: function (foo) {
			alert(foo);
		},

		Option: function (key, val) {
			if (val) {
				this.config[key] = val;
			} else if (key) {
				return this.config[key];
			}
		},

		destroy: function () {

			this.$el.removeData();
		},
		_unregisterEvents: function () {
			$("body").off('click', "[data-tds-mplace]");
			$("body").off('click', "[data-tds-mfont]");
			$("body").off('click', "[data-tds-mcolor]");
			$("body").off('change', '[data-tds-moption="text"]');
			$("body").off('click', "[data-tds-element]");
			$("body").off('click', "[data-tds-option]");
			$("body").off('click', "[data-tds-product]");
			$("body").off('click', "[data-tds-contrast]");
			$("body").off('click', "[data-tds-alignment]");
		},
		Product: function (product) {

			this._Url = "";
			this._Links = new Object();
			this._ReverseLinks = new Object();
			this._DoubleLinks = new Object();
			this._BlockedFeatures = new Object();
			this._BlockedDetails = new Object();
			this._CurrentBlockedFeatures = Array();
			this._CurrentBlockedDetails = Array();
			this._RenderObject = new Object();
			this._Alignments = new Array();
			this._CurrentAlignmentIndex = 0;
			this._Swatch = "";
			this._Color = "";
			this._CurrentDetail = "";
			this._CurrentContrastNo = "";
			this._MonogramPlacement = "";
			this._MonogramColor = "";
			this._MonogramFont = "";
			this._MonogramText = "";
			this._SpecificDisplay = new Object();
			this._SpecificLink = new Object();
			this._SpecificViewOf = "";
			this._unregisterEvents();
			this.Option("Product", product);
			this._setCofiguration(product, this.Option("ProductTemplate"));
		},

		Texture: function (id) {
			if (id === undefined) {
				if (this._Swatch === "")
					return this._Color;
				else
					return this._Swatch;
			}

			var falseArray = new Array();
			var isFound = false;
			for (var key in this._LibConfig) {
				var indexOf = this._LibConfig[key].Options.indexOf(this._SpecificViewOf);
				if (indexOf > -1) {
					for (var key1 in this._LibConfig[key].Options) {
						this._RenderObject[this._LibConfig[key].Options[key1]].Swatch = id
					}
					isFound = true;
					this._LibConfig[key].Swatch = id;
				} else {
					if (this._LibConfig[key].Name.toLowerCase().indexOf("waist") == -1)
						for (var key1 in this._LibConfig[key].Options) {
							falseArray.push(this._LibConfig[key].Options[key1]);
						}
				}
			}

			if (!isFound)
				for (var key in this._RenderObject) {
					if (falseArray.indexOf(key) === -1) {
						this._RenderObject[key].Swatch = id
					}
				}
			this._createUrl();

			if (!isFound) {
				var color = parseColor(id);
				if (color === undefined)
					this._Swatch = id;
				else
					this._Color = color;
			}
			this._createUrl();
			//alert( id);
		},

		ContrastTexture: function (id) {
			if (id === undefined)
				return;
			var color = parseColor(id);
			if (color === undefined)
				color = "";
			else
				id = "";

			if (this._RenderObject[this._CurrentDetail].Contrast.hasOwnProperty(this._CurrentContrastNo)) {
				this._RenderObject[this._CurrentDetail].Contrast[this._CurrentContrastNo].Swatch = id;
				this._RenderObject[this._CurrentDetail].Contrast[this._CurrentContrastNo].Color = color;
			} else {
				this._RenderObject[this._CurrentDetail].Contrast[this._CurrentContrastNo] = {
					Swatch: id,
					Color: color
				};
			}
			this._createUrl();

		},

		Summary: function () {
			var selectedElements = new Array();

			var selectedContrast = new Array();

			var selectedTextures = new Array();

			selectedTextures.push({
				'Detail': 'All',
				'ContrastNo': '0',
				'FabricId': this._Swatch,
				'Color': this._Color
			});

			for (var key in this._RenderObject) {
				selectedElements.push(this._RenderObject[key].Id);
				for (var contrastKey in this._RenderObject[key].Contrast) {
					selectedContrast.push({
						'Detail': key,
						'ContrastNo': contrastKey,
						'FabricId': this._RenderObject[key].Contrast[contrastKey].Swatch,
						'Color': this._RenderObject[key].Contrast[contrastKey].Color
					});

				}

			}
			var a = {
				"Product": selectedElements,
				"Contrast": selectedContrast,
				"Swatch": selectedTextures
			};
			var returnData = null;

			$.ajax({
				type: 'POST',
				url: this.Option("ServiceUrl") + "/api/products",
				data: a,
				async: false,
				success: function (data1) {
					returnData = data1;
				},
				fail: function () {}
			});
			return returnData;

		},

		Look: function (rawRenderData) {
			if (rawRenderData === undefined) {
				var lookData = {
					'RO': this._RenderObject,
					'BF': this._CurrentBlockedFeatures,
					'BD': this._CurrentBlockedDetails,
					'S': this._Swatch,
					'C': this._Color,
					'MP': this._MonogramPlacement,
					'MC': this._MonogramColor,
					'MF': this._MonogramFont,
					'MT': this._MonogramText,
					'AI': this._CurrentAlignmentIndex
				};
				var image = null;
				$.ajax({
					url: this.Option("ServiceUrl") + "/v1/img?" + this._Url,
					type: "GET",

					processData: false,
					async: false,
					success: function (result) {
						image = result;
					}
				});
				return {
					'Data': btoa(JSON.stringify(lookData)),
					Image: image
				};
			} else {
				var lookData = JSON.parse(atob(rawRenderData));

				this._RenderObject = lookData.RO;
				this._CurrentBlockedFeatures = lookData.BF;
				this._CurrentBlockedDetails = lookData.BD;
				this._Swatch = lookData.S;
				this._Color = lookData.C;
				this._MonogramPlacement = lookData.MP;
				this._MonogramColor = lookData.MC;
				this._MonogramFont = lookData.MF;
				this._MonogramText = lookData.MT;
				this._CurrentAlignmentIndex = lookData.AI;
				this._createRenderObject("");
			}
		},

		_dataURItoBlob: function (dataURI) {
			var binary = atob(dataURI.split(',')[1]);
			var array = [];
			for (var i = 0; i < binary.length; i++) {
				array.push(binary.charCodeAt(i));
			}
			return new Blob([new Uint8Array(array)], {
				type: 'image/png'
			});
		},

		SpecificDetails: function () {
			return this._SpecificDetails;
		},

		SpecificRender: function (specific) {
			if (specific === undefined)
				return;
			if (typeof specific == 'boolean') {
				this._IsSpecific = specific;
				this._createUrl();
			} else if (typeof specific == 'string') {
				for (var i = 0; i < this._ProductData.length; i++) {
					if (this._ProductData[i].Id == specific)
						this._SelectedAlignment = this._ProductData[i].Options[0].Features[0].Alignment;
				}
				this._SpecificViewOf = specific;
				this._IsSpecific = true;
				this._createUrl();
			}

		},

		ResetContrast: function () {
			for (var key in this._RenderObject) {
				for (var contrastKey in this._RenderObject[key].Contrast) {
					this._RenderObject[key].Contrast[contrastKey].Swatch = "";
					this._RenderObject[key].Contrast[contrastKey].Color = "";
				}
			}
		},

		ResetProduct: function () {
			this._CurrentBlockedFeatures = Array();
			this._CurrentBlockedDetails = Array();
			this._createRenderObject();
		},

		Features: function (productId, optionId) {
			if (productId !== undefined && productId !== "" && optionId !== undefined && optionId !== "")
				for (var dataIndex = 0; dataIndex < this._ProductData.length; dataIndex++)
					if (this._ProductData[dataIndex].Id == productId)
						for (var dataIndex1 = 0; dataIndex1 < this._ProductData[dataIndex].Options.length; dataIndex1++)
							if (this._ProductData[dataIndex].Options[dataIndex1].Id == optionId)
								return this._ProductData[dataIndex].Options[dataIndex1].Features;

			return null;
		},

		Options: function (productId) {
			if (productId !== undefined && productId !== "")
				for (var dataIndex = 0; dataIndex < this._ProductData.length; dataIndex++)
					if (this._ProductData[dataIndex].Id == productId) {
						var options = $.merge([], this._ProductData[dataIndex].Options);
						return options;
					}

			return null;
		},

		Contrasts: function (productId) {
			if (productId !== undefined && productId !== "")
				for (var dataIndex = 0; dataIndex < this._ProductData.length; dataIndex++)
					if (this._ProductData[dataIndex].Id == productId) {
						var contrast = this._ProductData[dataIndex].Contrasts;
						return contrast;
					}

			return null;
		},

	};

	function parseColor(color) {
		color = color.trim().toLowerCase();
		color = _colorsByName[color] || color;
		var hex3 = color.match(/^#([0-9a-f]{3})$/i);
		if (hex3) {
			return color.replace("#", "");
		}
		var hex6 = color.match(/^#([0-9a-f]{6})$/i);
		if (hex6) {
			return color.replace("#", "");
		}
		var rgba = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+.*\d*)\s*\)$/i) || color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
		if (rgba) {
			return hex(rgba[1]) + hex(rgba[2]) + hex(rgba[3]);
		}
		var rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
		if (rgb) {
			return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		}
		if (color.indexOf('hsl') == 0)
			return parseColor(_hslToRgb(color));
	}

	function hex(x) {
		return ("0" + parseInt(x).toString(16)).slice(-2);
	}

	function _hslToRgb(hsl) {
		if (typeof hsl == 'string') {
			hsl = hsl.match(/(\d+(\.\d+)?)/g);
		}
		var sub,
		h = hsl[0] / 360,
		s = hsl[1] / 100,
		l = hsl[2] / 100,
		a = hsl[3] === undefined ? 1 : hsl[3],
		t1,
		t2,
		t3,
		rgb,
		val;
		if (s == 0) {
			val = Math.round(l * 255);
			rgb = [val, val, val, a];
		} else {
			if (l < 0.5)
				t2 = l * (1 + s);
			else
				t2 = l + s - l * s;
			t1 = 2 * l - t2;
			rgb = [0, 0, 0];
			for (var i = 0; i < 3; i++) {
				t3 = h + 1 / 3 *  - (i - 1);
				t3 < 0 && t3++;
				t3 > 1 && t3--;
				if (6 * t3 < 1)
					val = t1 + (t2 - t1) * 6 * t3;
				else if (2 * t3 < 1)
					val = t2;
				else if (3 * t3 < 2)
					val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
				else
					val = t1;
				rgb[i] = Math.round(val * 255);
			}
		}
		rgb.push(a);
		return rgb;
	}

	var _colorsByName = {
		aliceblue: "#f0f8ff",
		antiquewhite: "#faebd7",
		aqua: "#00ffff",
		aquamarine: "#7fffd4",
		azure: "#f0ffff",
		beige: "#f5f5dc",
		bisque: "#ffe4c4",
		black: "#000000",
		blanchedalmond: "#ffebcd",
		blue: "#0000ff",
		blueviolet: "#8a2be2",
		brown: "#a52a2a",
		burlywood: "#deb887",
		cadetblue: "#5f9ea0",
		chartreuse: "#7fff00",
		chocolate: "#d2691e",
		coral: "#ff7f50",
		cornflowerblue: "#6495ed",
		cornsilk: "#fff8dc",
		crimson: "#dc143c",
		cyan: "#00ffff",
		darkblue: "#00008b",
		darkcyan: "#008b8b",
		darkgoldenrod: "#b8860b",
		darkgray: "#a9a9a9",
		darkgreen: "#006400",
		darkkhaki: "#bdb76b",
		darkmagenta: "#8b008b",
		darkolivegreen: "#556b2f",
		darkorange: "#ff8c00",
		darkorchid: "#9932cc",
		darkred: "#8b0000",
		darksalmon: "#e9967a",
		darkseagreen: "#8fbc8f",
		darkslateblue: "#483d8b",
		darkslategray: "#2f4f4f",
		darkturquoise: "#00ced1",
		darkviolet: "#9400d3",
		deeppink: "#ff1493",
		deepskyblue: "#00bfff",
		dimgray: "#696969",
		dodgerblue: "#1e90ff",
		firebrick: "#b22222",
		floralwhite: "#fffaf0",
		forestgreen: "#228b22",
		fuchsia: "#ff00ff",
		gainsboro: "#dcdcdc",
		ghostwhite: "#f8f8ff",
		gold: "#ffd700",
		goldenrod: "#daa520",
		gray: "#808080",
		green: "#008000",
		greenyellow: "#adff2f",
		honeydew: "#f0fff0",
		hotpink: "#ff69b4",
		indianred: "#cd5c5c",
		indigo: "#4b0082",
		ivory: "#fffff0",
		khaki: "#f0e68c",
		lavender: "#e6e6fa",
		lavenderblush: "#fff0f5",
		lawngreen: "#7cfc00",
		lemonchiffon: "#fffacd",
		lightblue: "#add8e6",
		lightcoral: "#f08080",
		lightcyan: "#e0ffff",
		lightgoldenrodyellow: "#fafad2",
		lightgray: "#d3d3d3",
		lightgreen: "#90ee90",
		lightpink: "#ffb6c1",
		lightsalmon: "#ffa07a",
		lightseagreen: "#20b2aa",
		lightskyblue: "#87cefa",
		lightslategray: "#778899",
		lightsteelblue: "#b0c4de",
		lightyellow: "#ffffe0",
		lime: "#00ff00",
		limegreen: "#32cd32",
		linen: "#faf0e6",
		magenta: "#ff00ff",
		maroon: "#800000",
		mediumaquamarine: "#66cdaa",
		mediumblue: "#0000cd",
		mediumorchid: "#ba55d3",
		mediumpurple: "#9370db",
		mediumseagreen: "#3cb371",
		mediumslateblue: "#7b68ee",
		mediumspringgreen: "#00fa9a",
		mediumturquoise: "#48d1cc",
		mediumvioletred: "#c71585",
		midnightblue: "#191970",
		mintcream: "#f5fffa",
		mistyrose: "#ffe4e1",
		moccasin: "#ffe4b5",
		navajowhite: "#ffdead",
		navy: "#000080",
		oldlace: "#fdf5e6",
		olive: "#808000",
		olivedrab: "#6b8e23",
		orange: "#ffa500",
		orangered: "#ff4500",
		orchid: "#da70d6",
		palegoldenrod: "#eee8aa",
		palegreen: "#98fb98",
		paleturquoise: "#afeeee",
		palevioletred: "#db7093",
		papayawhip: "#ffefd5",
		peachpuff: "#ffdab9",
		peru: "#cd853f",
		pink: "#ffc0cb",
		plum: "#dda0dd",
		powderblue: "#b0e0e6",
		purple: "#800080",
		red: "#ff0000",
		rosybrown: "#bc8f8f",
		royalblue: "#4169e1",
		saddlebrown: "#8b4513",
		salmon: "#fa8072",
		sandybrown: "#f4a460",
		seagreen: "#2e8b57",
		seashell: "#fff5ee",
		sienna: "#a0522d",
		silver: "#c0c0c0",
		skyblue: "#87ceeb",
		slateblue: "#6a5acd",
		slategray: "#708090",
		snow: "#fffafa",
		springgreen: "#00ff7f",
		steelblue: "#4682b4",
		tan: "#d2b48c",
		teal: "#008080",
		thistle: "#d8bfd8",
		tomato: "#ff6347",
		turquoise: "#40e0d0",
		violet: "#ee82ee",
		wheat: "#f5deb3",
		white: "#ffffff",
		whitesmoke: "#f5f5f5",
		yellow: "#ffff00",
		yellowgreen: "#9acd32"
	};

	Plugin.defaults = Plugin.prototype.defaults;

	$.fn[tdsTailoriPlugin] = function (options) {
		var args = arguments;
		if (options === undefined || typeof options === "object") {
			return this.each(function () {
				if (!$.data(this, 'plugin_' + tdsTailoriPlugin)) {
					$.data(this, 'plugin_' + tdsTailoriPlugin,
						new Plugin(this, options));
				}
			}).data('plugin_' + tdsTailoriPlugin);
		} else if (typeof options === "string" && options[0] !== "_" && options !== "init") {
			var returns;
			this.each(function () {
				var instance = $.data(this, "plugin_" + tdsTailoriPlugin);
				if (instance instanceof Plugin && typeof instance[options] === "function") {
					//alert(6);
					returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
				}
			});
			return returns !== undefined ? returns.data('plugin_' + tdsTailoriPlugin) : this.data('plugin_' + tdsTailoriPlugin);
		}
	}
})(window.jQuery, window, document);
