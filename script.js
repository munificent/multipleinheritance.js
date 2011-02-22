// Builds a widget and tests that all of the inherited classes work.
function main() {
  var widget = new MyWidget('Abe');

  // from Widget
  log(widget.getName());

  // from Hideable
  widget.hide();
  widget.show();

  // from Container
  widget.addChild(new MyWidget('Ben'));
  widget.addChild(new MyWidget('Cid'));
  widget.addChild(new MyWidget('Dan'));
  widget.listChildren();
}

// Base class for a named widget.
function Widget(name) {
  this.name = name;
}

Widget.prototype.getName = function() {
  return this.name;
}

// Base class for a widget that can be hidden.
function Hideable() {}

Hideable.prototype.hide = function() {
  log('hide ' + this.getName());
}

Hideable.prototype.show = function() {
  log('show ' + this.getName());
}

// Base class for a widget that can contain child widgets.
function Container() {
  this.children = [];
}

Container.prototype.addChild = function(widget) {
  log('addChild ' + widget.getName() + ' to ' + this.getName());
  this.children.push(widget);
}

Container.prototype.listChildren = function() {
  log('children for ' + this.getName());
  for (var i = 0; i < this.children.length; i++) {
    log('- ' + this.children[i].getName());
  }
}

// Using those, define a composite widget that has all of that functionality.
var MyWidget = magic(function(name) {
  this.widget_p    = new Widget(name);
  this.hider_p     = new Hideable();
  this.container_p = new Container();
})

// Wraps a constructor in a function that creates proxy objects that support
// multiple inheritance.
function magic(ctor) {
  var callTrap = function(args) {}
  var constructTrap = function(args) {
    return Proxy.create(createSelfHandler(new ctor(args)), Object.prototype);
  };
  return Proxy.createFunction(ctor, callTrap, constructTrap);
}

function createSelfHandler(obj) {
  return {
    get: function(receiver, name) {
      // Look in the main object.
      var value = obj[name];
      if (value !== undefined) return value;

      // Look in the parents.
      // BUG: Should look in field alphabetical order.
      for (var field in obj) {
        if (field.endsWith('_p')) {
          value = obj[field][name];
          if (value !== undefined) return value;
        }
      }

      // Not found.
      return undefined;
    }
  };
}

// Returns true if the string ends with the given text.
String.prototype.endsWith = function(text) {
  if (this.length < text.length) return false;

  return this.substr(this.length - text.length, text.length) == text;
}

// Some basic stuff to kick things off.
$(document).ready(main);

function log(message) {
  $('#log').append(message + '\n');
}
