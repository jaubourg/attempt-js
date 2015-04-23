"use strict";

var indexes = {
	success: 0,
	failure: 1,
	progress: 2
};

function callForType( callbacks, async, type, args ) {
	if ( async ) {
		setTimeout( callForType, 2, callbacks, false, type, args );
	} else {
		callbacks[ indexes[ type ] ].apply( null, args );
	}
}

callForType.indexes = indexes;

module.exports = callForType;
