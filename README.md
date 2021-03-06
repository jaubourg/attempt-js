[![NPM][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependency Status][dependency-image]][dependency-url]
[![devDependency Status][devDependency-image]][devDependency-url]
[![gratipay][gratipay-image]][gratipay-url]

![IE 6+](https://img.shields.io/badge/IE-6+-blue.svg)
![Firefox 3.6+](https://img.shields.io/badge/Firefox-3.6+-orange.svg)
![Chrome 14+](https://img.shields.io/badge/Chrome-14+-yellow.svg)
![Safari 4+](https://img.shields.io/badge/Safari-4+-blue.svg)
![Opera 11+](https://img.shields.io/badge/Opera-11+-red.svg)
![iOS 3+](https://img.shields.io/badge/iOS-3+-lightgray.svg)
![Android 4+](https://img.shields.io/badge/Android-4+-green.svg)

# Attempt

Utility objects to represent and interact with asynchronous operations.

## Install and use in Node

1. Add the dependency: `npm install attempt-js --save`
2. Import in your code and create new objects:
   ```js
   var Attempt = require( "attempt-js" );

   var myAttempt = new Attempt( /* ... */ );

   // Note that 'new' is facultative!
   var myOtherAttempt = Attempt( /* ... */ );
   ```

## Install and use in the Browser

Use a tool like [Browserify](http://browserify.org/) or [webpack](http://webpack.github.io/).

## Quick overview through code examples
```js
Attempt( function( notifySuccess, notifyFailure, notifyProgress ) {
    firstAsync( function( error ) {
        notifyProgress( "first done" );
        if ( error ) {
            notifyFailure( error );
        } else {
            secondAsync( function( error, value ) {
                notifyProgress( "second done" );
                if ( error ) {
                    notifyFailure( error );
                } else {
                    notifySuccess( "first done" );
                }
            } );
        }
    } );
} ).progress( function( string ) {
    // the progress string as notified
} ).success( function( value ) {
    // the value from secondAsync if successful
} ).failure( function( error ) {
    // the error otherwise
} ).always( function() {
    // always called (for successes AND failures)
} );
```

### Chain

```js
var attempt = Attempt( function( notifySuccess ) {
    setTimeout( notifySuccess, 1000, 72 );
} );

attempt.success( function( value ) {
    value === 72;
} );

attempt.chain( function( value ) {
    return value * 2;
} ).success( function( value ) {
    value === 144;
} );

attempt.chain( function( value ) {
    return Attempt( function( notifySuccess ) {
        setTimeout( notifySuccess, 1000, value * 2 );
    } );
} ).success( function( value ) {
    value === 144;
} );
```

### Join

```js
var helloWorld = Attempt( function( notifySuccess ) {
    notifySuccess( "hello", "world" );
} );

var sixteen = Attempt( function( notifySuccess ) {
    notifySuccess( 16 );
} );

Attempt.join( helloWorld, sixteen, true ).success( function( a, b, c ) {
    // a is [ "hello", "world" ]
    // b is 16
    // c is true
} );

var failed = Attempt( function( _, notifyFailure ) {
    notifyFailure( "woops" );
} );

Attempt.join( helloWorld, failed ).failure( function( error ) {
    error === "woops";
} );
```

### Utilities

```js
var helloWorld = Attempt.createSuccess( "hello", "world" );

helloWorld.success( function( a, b ) {
    a === "hello";
    b === "world";
} );

var failed = Attempt.createFailure( "woops" );

failed.failure( function( arg ) {
    arg === "woops";
} );
````

### Consume Promises

```js
var promise = new Promise( function( resolve ) {
    resolve( "YEAH!" );
} );

Attempt( promise ).success( function( value ) {
    value === "YEAH!";
} );
```

### Produce Promises

```js
var attempt = Attempt( function( notifySuccess ) {
    notifySuccess( "YAWP!" );
} );

attempt.promise().then( function( value ) {
    value === "YAWP!";
} );
```

## License

Copyright (c) 2015 [Julian Aubourg](mailto:j@ubourg.net)

Licensed under the [MIT license](https://raw.githubusercontent.com/jaubourg/attempt-js/master/LICENSE-MIT).

[coveralls-image]: https://img.shields.io/coveralls/jaubourg/attempt-js.svg
[coveralls-url]: https://coveralls.io/r/jaubourg/attempt-js
[dependency-image]: https://img.shields.io/david/jaubourg/attempt-js.svg
[dependency-url]: https://david-dm.org/jaubourg/attempt-js
[devDependency-image]: https://img.shields.io/david/dev/jaubourg/attempt-js.svg
[devDependency-url]: https://david-dm.org/jaubourg/attempt-js#info=devDependencies
[gratipay-image]: https://img.shields.io/gratipay/jaubourg.svg
[gratipay-url]: https://gratipay.com/jaubourg/
[npm-image]: https://img.shields.io/npm/v/attempt-js.svg
[npm-url]: https://npmjs.org/package/attempt-js
[travis-image]: https://img.shields.io/travis/jaubourg/attempt-js.svg
[travis-url]: https://travis-ci.org/jaubourg/attempt-js
