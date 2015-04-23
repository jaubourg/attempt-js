"use strict";

var nodeunitToQUnitMethod = {
	"ok": true,
	"equal": true,
	"notEqual": true,
	"strictEqual": true,
	"notStrictEqual": true,
	"deepEqual": true,
	"notDeepEqual": true,
	"throws": true,
	"expect": true
};

function Nodeunit( qUnitObject, done ) {
	this.__qUnitObject = qUnitObject;
	this.done = done;
}

function createMethod( name ) {
	var targetMethod = nodeunitToQUnitMethod[ name ];
	if ( targetMethod === true ) {
		targetMethod = name;
	}
	Nodeunit.prototype[ name ] = function() {
		var qUnitObject = this.__qUnitObject;
		return qUnitObject[ targetMethod ].apply( qUnitObject, arguments );
	};
}

for ( var name in nodeunitToQUnitMethod ) {
	if ( nodeunitToQUnitMethod.hasOwnProperty( name ) ) {
		createMethod( name, nodeunitToQUnitMethod[ name ] );
	}
}

module.exports = function( qUnitObject, done ) {
	return new Nodeunit( qUnitObject, done );
};
