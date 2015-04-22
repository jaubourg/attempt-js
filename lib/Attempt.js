"use strict";

var forEachAction = require( "./forEachAction" );
var later = require( "./later" );
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

function Attempt( initValue ) {
	var successCallbacks = oneShotCallbacks();
	var failureCallbacks = oneShotCallbacks();
	var progressCallbacks = repeatCallbacks();
	var self = this;
	var abort;
	forEachAction( [
		successCallbacks,
		failureCallbacks,
		progressCallbacks
	], function( handler, methodName ) {
		self[ methodName ] = handler.a;
	} );
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
	} );
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
		Attempt[ methodName ] = function() {
			var args = arguments;
			return new Attempt( function() {
				arguments[ index ].apply( null, args );
			} );
		};
	}
} );

module.exports = Attempt;
