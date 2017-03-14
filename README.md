<img src="icon.png" align="right" />

# Tailori

Textronics Tailori is a plugin that simplifies access to textronics services functionality!

It provides following features:
* [Element Rendering](#)
* [Contrast Options](#)
* [Monogram](#)
* [Auto Specific view](#)
* [Auto Alignment Change](#)
* [Summary](#)
* [Save and load favourite look](#)

# Demo

[Click here](https://sagar-tds.github.io/Tailori-Plugin) for live demo.

# Dependency

The plugin has hard dependency on [jsrender.js](https://www.jsviews.com). You can download it from [here](https://www.jsviews.com/download/jsrender.min.js) (To download, right-click and select “Save as…” from the menu).

Plugin also required Letest jQuery. You can download it from [here](https://code.jquery.com)

# Installation

Add **jquery.tds.js** to your project. [Download](https://github.com/Sagar-TDS/Tailori-Plugin/archive/master.zip).

```html
// Add jquery.js 
<script type="text/javascript" src="jquery.min.js"></script>

// Add jsrender.js 
<script type="text/javascript" src="jsrender.min.js"></script>

<script type="text/javascript" src='jquery.tds.js'></script>
```

# Documentation

## Properties
| Props                                          | Description  | Required
| -----------------------------------------------|------------| -------:|
| ServiceUrl                                     | Url of textronics tailori api provided you| * |
| Product                                        | Product Name | * | 
| ProductTemplate                                | jsrender templare for rendering options/elements | * |
| ImageSource                                    | Image container where rendered images are placed (i.e. id, class or etc) if you want to manage rendered image by your own keep this empty |         |
| OptionsPlace                                   | Conatainer for placing the ProductOptions | * <sup><sup>1</sup></sup> |         
| OptionTemplate                                 | if you want to show Options dynamic give template id of option here (it will render html contains dynamic after click on **product** i.e. click coller or cuff or etc)             | * <sup><sup>1</sup></sup> |
| FeaturesPlace                                   | Conatainer for placing the ProductOptions Feature | * <sup><sup>2</sup></sup> |         
| FeatureTemplate                                 | if you want to show Options dynamic give template id of option here (it will render html contains dynamic after click on **product** i.e. click half sleeve or full sleeve or etc)             | * <sup><sup>2</sup></sup> |
| IsOptionVisible                                 | If *true* ProductOptions are visible on page *else* ProductOptions Features will shown   |         |
| MonogramTemplate                               | Conatainer for placing the monogram options   |         |
| AutoSpecific                                   | if *true* detailed view of specific part is automaticaly renderd *else* not   |         |
| AutoAlignment                                  | if *true* view of appreals change according to seleted feature |         |

## Data Attributes
| Data Attribute       | Description                                                    |
| ---------------------|:--------------------------------------------------------------|
| data-tds-alignment   | Possible values are "next"/"previous" and  alignment Name |
| data-tds-moption   | if value is ***text*** it used for input box for accept input text for monogram |
|			| if value is ***priview*** it used for img tag for displaying priview of monogram |


## Callbacks
| Callback             | Description                                                    
| ---------------------|:--------------------------------------------------------------|
| OnProductChange      | This callback fire when user click on Product i.e. Coller, Cuff, Sleeves, etc and this callback have one parameter i.e id of Product |
| OnOptionChange       | This callback fire when user click on ProductOption i.e. High Coller, Low Coller, etc and this callback have one parameter i.e id of ProductOption  |
| OnFeatureChange      | This callback fire when user click on ProductOptions Feature i.e. Half Sleeve, Full Sleeve etc and this callback have one parameter i.e id of ProductOptions Feaure |
| OnContrastChange     | This callback fire when user click on Contrast  |
| OnRenderImageChange       | This callback fire when rendered images are ready to display i.e. after changing he element when result is get from textronics api also this callback have one parameter which array type (*if you want to render image by yourself then use this parameter and then there no need to give <b>ImageSource</b> option in plugin initialization* ) |

Public methods in plugin
-------------------------

Public methods are usable on tailori objects

```js    
    obj = $("#div-1").tailori({
			'Product':'MEN-SHIRT',   //Product i.e men shirt,women shirt, men suit, etc
			'ProductTemplate':'#theTmpl', //Template id for Product
			'ImageSource':'#img-div', //Container Id for place inages
			'ServiceUrl':'http://172.16.1.63'
     });
      
```
------------------------------------------------
### `Product()`
If you want to change the **product** i.e from men-shirt to men-suit use 

```js
  obj.Product("men-suit");
```
------------------------------------------------
### `Texture()`
Get and Set the Texture (i.e.  fabric or color )  to apparel use 

if you want apply fabric from textronics fabric library send id of fabric
```js
  obj.Texture("fab12589");
```

if you want to apply color as texture 
```js
  obj.Texture("red"); 
  obj.Texture("#ff0000");  //hex value of color
  obj.Texture("rgb(255,0,0)");  //rgb value of color
  obj.Texture("hsl(0, 100%, 50%)");  //hsl value of color
```

if you want texture of apparel call method without passing parameter

```js
 texture = obj.Texture();
```
------------------------------------------------

### `ContrastTexture()`
Get and Set the Texture (i.e.  fabric or color )  to contrast part of apparel 

if you want apply fabric from textronics fabric library send id of fabric
```js
  obj.ContrastTexture("fab12589");
```

if you want to apply color as texture 
```js
  obj.ContrastTexture("red"); 
  obj.ContrastTexture("#ff0000");  //hex value of color
  obj.ContrastTexture("rgb(255,0,0)");  //rgb value of color
  obj.ContrastTexture("hsl(0, 100%, 50%)");  //hsl value of color
```

if you want texture of contrast of apparel call method without passing parameter

```js
 contrasttexture = obj.ContrastTexture();
```

##### *Note: ContrastTexture apply texture on last selected contrast only*
------------------------------------------------

### `SpecificRender()`
To show detailed view of specific part then send parameter ***true*** and to show normal view send ***false***

```js
obj.SpecificRender(true);
```
---------------------------------------------------------------------------

### `Summary()`
To get the summery of apparel
Method returen the object contain selected part and fabric information with cost 
```js
obj.Summary();
```
-----------------------------------------------------------

### `ResetContrast()`
To reset all contrast of apparel
```js
obj.ResetContrast();
```

### `ResetProduct()`
To load default apparel 
```js
obj.ResetProduct();
```

### `Look()`
To get and set your favourite look (*i.e. if you want save your custmized apparel for feature use*)
this will return you object which contain ***data*** and ***Image*** 
If you want load your look next time send ***data***  to method 


Get Look
```js
look = obj.Look();
// look.Data - to load save look next time
// look.Image - To show image of custmize look
```

Load Look
```js
 obj.Look(look.Data);
```

### `Options()`
Get an items of perticular product by sending it of product which you will get from OnProductChange
It will return array of object

```js
optionsObj = obj.Options("158294");
```


### `Options()`
Get an items of perticular product by sending it of product which you will get from OnProductChange
It will return array of object

```js
optionsObj = obj.Options("158294");
```


### `Features()`
Get an items of perticular product by sending it of option which you will get from OnOptionChange
It will return array of object

```js
featuresObj = obj.Features("75321598");
```

### `Contrasts()`
Get an items of perticular product by sending it of product which you will get from OnProductChange
It will return array of object

```js
contrastsObj = obj.Contrasts("158294");
```

# How to use JsRender 

JsRender is a light-weight but powerful templating engine.

You shouldn't care about jsrender object creation and other stuff, plugin will do it.
You should only care about creating template

## *Define a template*

From a template declared as markup in a script block:

```js
<script id="myTemplate" type="text/x-jsrender">Name: {{:name}}</script>
```

But now we are using for textronics tailori, so we will mostly use [{{for ...}} tag](https://www.jsviews.com/#jsr-quickstart@fortag)

Following object hierarchy provide you for creating template

```
├──── Product
│   │
│   ├──── Options 
│   │   │
│   │   └── Features
│   │
│   └──── Contrasts
│
├──── MonogramPlacement
│
├──── MonogramFont
│
└──── MonogramColor
```
Following is a object structure of **Product**, **Options**, **Features**, **Contrasts**, **MonogramPlacement**, **MonogramFont** and  **MonogramColor** which will be used for more detailing your template

```
    Product/ Options/ Features/ Contrasts/ MonogramPlacement/ MonogramFont/ MonogramColor
    │
    ├── Id 
    ├── Name
    └── ImageSource
```

## Exmaple of template for boostrap accordion

```html
<script id="theTmpl" type="text/x-jsrender">
		
<div class="panel-group" id="accordion2">
	{{for Product}}
		<div class="panel panel-default">
			<div class="panel-heading">
				<h4 class="panel-title">
					<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse{{:Id}}">
					 <img style="max-width:30px;" src="{{:ImageSource}}">{{:Name}}
					</a>
				</h4>
			</div>
			<div id="collapse{{:Id}}" class="panel-collapse collapse">
				<div class="panel-body">
					<table class="table">
						{{for Options}}
						
							{{for Features}}		
								<tr id="{{:Id}}">
									<td>
										<span class="glyphicon glyphicon-chevron-right"></span><a href="#">{{:Name}}</a>
									</td>
								</tr>
							{{/for}}							
						{{/for}}
						{{for Contrasts}}		
								<tr id="{{:Id}}">
									<td>
										<span class="glyphicon glyphicon-chevron-right"></span><a href="#">{{:Name}}</a>
									</td>
								</tr>
							{{/for}}
					</table >
				</div>
			</div>
		</div>
	{{/for}}
</div>

</script>
```

## Exmaple of template for boostrap nav panel 

```html
<script id="theTmpl1" type="text/x-jsrender">
	<div class="col-md-12">
            <div class="panel with-nav-tabs panel-default">
                <div class="panel-heading">
					<ul class="nav nav-tabs">
						{{for Product}}                            
							<li><a href="#tab{{:Id}}" data-toggle="tab"><img style="max-width:30px;" src="{{:ImageSource}}">{{:Name}}</a></li>                          
						{{/for}}   
					</ul>
                </div>
                <div class="panel-body">
                    <div class="tab-content">
					{{for Product}}					
                        <div class="tab-pane fade " id="tab{{:Id}}">
							<ul class="list-group">
							{{for Options}}
								{{for Features}}
									<li class="list-group-item" id="{{:Id}}">{{:Name}}</li>						
								{{/for}}   
							{{/for}}   
							</ul>
						</div>
					{{/for}}                           
				</div>
			</div>
		</div>
	</div>	
</script>
```

If you want to use show options and feature dynamically you can create three template
 
1. For Product
2. For Option
3. For Feature

if *IsOptionVisible=false*  or Product contain only one option then it will direct show the all feature from perticular Product

### Example for Product Template
```html
<script id="theTmpl33" type="text/x-jsrender">
	<li id="Fab">
		<a><span>Fabrics</span></a>
	</li>
	{{for Product}}
		<li>
			<a class="nav-toggle" href="#" style="background-image:url({{:ImageSource}}); background-repeat:no-repeat; ">
				<span>{{:Name}}</span>
			</a>
		</li>
	 {{/for}}
	 <li id="Monogram">
		  <a><span>Monogram</span></a>
	 </li>
 </script>
```

### Example for Option Template
```html
<script id="optionsTemplate" type="text/x-jsrender">
 {{for Options}}

      <li id='{{:Id}}'>
        <a class='nav-toggle' href='#' style='background-image:url({{:ImageSource}}); background-repeat:no-repeat;'>
          <span>{{:Name}}</span>
        </a>
      </li>

  {{/for}}

 </script>
```

### Example for Feature Template

```html
<script id="FeaturesTemplate" type="text/x-jsrender">
    {{for Features}}
      <li>
        <a href="#" style="background-image:url({{:ImagesUrl}}); background-repeat:no-repeat; background-size:100%;">
          <span>{{:Name}}</span>
        </a>
      </li>
    {{/for}}
 </script>
```

## Monogram

### Example for Monogram Template
```html
<script id="MonogramTemplate2" type="text/x-jsrender">
<div class="form-group">
 <label for="sel1">Monogram Placement:</label>
 <select class="form-control" id="sel1">
  {{for MonogramPlacement}}
  <option>{{:Name}}</option>
    {{/for}}
  </select>
 </div>
 <div class="form-group">
  <label for="sel2">Monogram Font:</label>
  <select class="form-control" id="sel2">
   {{for MonogramFont}}
   <option>{{:Name}}</option>
     {{/for}}
   </select>
  </div>
  <div class="form-group">
  <label for="usr">Monogram Text:</label>
  <input class="form-control" id="monogram-text" data-tds-moption="text" placeholder="Enter Text" type="text">
</div>
<div>
<label>Monogram Color:</label>
  <ul class="color">
    {{for MonogramColor}}
    <li style="background-color:{{:Name}};">
      <a href="#" style="background-color:{{:Name}}; background-repeat:no-repeat; background-size:100%;"> </a>
    </li>
      {{/for}}
  </ul>
</div>
</script>
```




