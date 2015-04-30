"use strict";

var forEachAction = require( "./forEachAction" );
var oneShotCallbacks = require( "./oneShotCallbacks" );
var repeatCallbacks =  require( "./repeatCallbacks" );

function attach( notifiers, value, rawCallback ) {
	var then;
	if ( value instanceof Attempt ) {
		forEachAction( notifiers, function( notifier, methodName ) {
			value[ methodName ]( notifier );
		} );
	} else if ( value && typeof ( then = value.then ) === "function" ) {
		then.call( value, notifiers[ 0 ], notifiers[ 1 ] );
	} else {
		rawCallback( value, notifiers );
	}
}

function internal( initValue ) {
	function Constructor() {}
	var proto = Constructor.prototype = new Attempt( internal );
	var successCallbacks = oneShotCallbacks();
	var failureCallbacks = oneShotCallbacks();
	var progressCallbacks = repeatCallbacks();
	var abort;
	forEachAction( [
		successCallbacks,
		failureCallbacks,
		progressCallbacks
	], function( handler, methodName ) {
		proto[ methodName ] = handler.a;
	} );
	var self = new Constructor();
	attach( [
		function() {
			abort = false;
			failureCallbacks.l();
			progressCallbacks.l();
			successCallbacks.f.apply( null, arguments );
		},
		function() {
			abort = false;
			successCallbacks.l();
			progressCallbacks.l();
			failureCallbacks.f.apply( null, arguments );
		},
		progressCallbacks.f
	], initValue, function( initFunction, notifiers ) {
		var tmp = initFunction.apply( self, notifiers );
		if ( tmp ) {
			proto.abort = function() {
				if ( !abort ) {
					return false;
				}
				if ( typeof abort === "function" ) {
					setImmediate( abort );
				}
				successCallbacks.l();
				failureCallbacks.l();
				progressCallbacks.l();
				abort = false;
				return true;
			};
			if ( abort !== false ) {
				abort = tmp;
			}
		}
	} );
	return self;
}

function Attempt( initValue ) {
	return initValue !== internal && internal( initValue );
}

Attempt.prototype = {
	always: function( callback ) {
		return this.success( callback ).failure( callback );
	},
	chain: function() {
		var self = this;
		var callbacks = arguments;
		return new Attempt( function() {
			var notifiers = arguments;
			forEachAction( callbacks, function( callback, methodName, index ) {
				self[ methodName ]( callback ? function() {
					attach( notifiers, callback.apply( null, arguments ), function( value ) {
						notifiers[ index ]( value );
					} );
				} : notifiers[ index ] );
			} );
		} );
	},
	promise: function() {
		var self = this;
		return new Promise( function() {
			forEachAction( arguments, function( notifier, methodName ) {
				if ( notifier ) {
					self[ methodName ]( function( arg ) {
						notifier( arguments.length > 1 ? [].slice.call( arguments ) : arg );
					} );
				}
			} );
		} );
	}
};

forEachAction( function( methodName, _, index ) {
	if ( index < 2 ) {
		Attempt[ "create" + methodName.substr( 0, 1 ).toUpperCase() + methodName.substr( 1 ) ] = function() {
			var args = arguments;
			return new Attempt( function() {
				arguments[ index ].apply( null, args );
			} );
		};
	}
} );

function getValue( args ) {
	return args.length > 1 ? [].slice.apply( args ) : args[ 0 ];
}

Attempt.join = function() {
	var args = arguments;
	var length = args.length;
	return Attempt( function( success, failure, progress ) {
		var count = length + 1;
		var successArray = new Array( length );
		var progressArray = new Array( length );
		function tick() {
			if ( !( --count ) ) {
				success.apply( null, successArray );
			}
		}
		function notifiersFactory( index ) {
			return [
				function() {
					successArray[ index ] = getValue( arguments );
					tick();
				},
				function() {
					failure.apply( null, arguments );
				},
				function() {
					progressArray[ index ] = getValue( arguments );
					progress.apply( null, progressArray );
				}
			];
		}
		for ( var i = 0; i < length; i++ ) {
			attach( notifiersFactory( i ), args[ i ], function( value, notifiers ) {
				notifiers[ 0 ]( value );
			} );
		}
		tick();
	} );
};

Attempt.joinArray = function( array ) {
	return Attempt.join.apply( null, array );
};

module.exports = Attempt;
