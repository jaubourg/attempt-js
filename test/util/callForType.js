"use strict";

var indexes = {
	success: 0,
	failure: 1,
	progress: 2
};

function callForType( args, async, type, value ) {
	if ( async ) {
		setTimeout( callForType, 2, args, false, type, value );
	} else {
		args[ indexes[ type ] ]( value );
	}
}

callForType.indexes = indexes;

module.exports = callForType;
