"use strict";

var forEachAction = require( "./forEachAction" );
var later = require( "./later" );
var oneShotCallbacks = require( "./oneShotCallbacks" );
var repeatCallbacks =  require( "./repeatCallbacks" );

function Attempt( init ) {
	var successCallbacks = oneShotCallbacks();
	var failureCallbacks = oneShotCallbacks();
	var progressCallbacks = repeatCallbacks();
	var self = this;
	var then;
	var abort;
	var tmp;
	forEachAction( [
		successCallbacks,
		failureCallbacks,
		progressCallbacks
	], function( handler, methodName ) {
		self[ methodName ] = handler.a;
	} );
	function successFire() {
		abort = false;
		failureCallbacks.l();
		progressCallbacks.l();
		successCallbacks.f.apply( null, arguments );
	}
	function failureFire() {
		abort = false;
		successCallbacks.l();
		progressCallbacks.l();
		failureCallbacks.f.apply( null, arguments );
	}
	if ( typeof ( then = init.then ) === "function" ) {
		then.call( init, successFire, failureFire );
	} else {
		tmp = init.call( this, successFire, failureFire, progressCallbacks.f );
		if ( tmp ) {
			self.abort = function() {
				if ( !abort ) {
					return false;
				}
				if ( typeof abort === "function" ) {
					later( abort );
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
	}
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
					var returned = callback.apply( null, arguments );
					var then;
					if ( returned instanceof Attempt ) {
						forEachAction( notifiers, function( notifier, methodName ) {
							returned[ methodName ]( notifier );
						} );
					} else if ( typeof ( then = returned.then ) === "function" ) {
						then.call( returned, notifiers[ 0 ], notifiers[ 1 ] );
					} else {
						notifiers[ index ]( returned );
					}
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
		Attempt[ methodName ] = function() {
			var args = arguments;
			return new Attempt( function() {
				arguments[ index ].apply( null, args );
			} );
		};
	}
} );

module.exports = Attempt;
