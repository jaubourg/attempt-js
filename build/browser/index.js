"use strict";

require( "setimmediate" );

var qunit = require( "../qunit" );

qunit.module( "later", require( "../../test/01 - later" ) );
qunit.module( "oneShotCallbacks", require( "../../test/02 - oneShotCallbacks" ) );
qunit.module( "repeatCallbacks", require( "../../test/03 - repeatCallbacks" ) );
qunit.module( "forEachAction", require( "../../test/04 - forEachAction" ) );
qunit.module( "Attempt", require( "../../test/05 - Attempt" ) );
qunit.module( "Attempt chain", require( "../../test/06 - Attempt.chain.js" ) );
qunit.module( "Attempt abort", require( "../../test/07 - Attempt.abort.js" ) );
qunit.module( "Attempt promise", require( "../../test/08 - Attempt.promise.js" ) );
qunit.module( "Attempt join", require( "../../test/09 - Attempt.join.js" ) );
