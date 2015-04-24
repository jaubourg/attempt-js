"use strict";

var indexes = {
	success: 0,
	failure: 1,
	progress: 2
};

function callForType( callbacks, async, type, args ) {
	if ( async ) {
		setTimeout( function() {
			callForType( callbacks, false, type, args );
		}, 2 );
	} else {
		callbacks[ indexes[ type ] ].apply( null, args );
	}
}

callForType.indexes = indexes;

module.exports = callForType;
