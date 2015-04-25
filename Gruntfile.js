"use strict";

var fs = require( "fs" );
var path = require( "path" );
var wrench = require( "wrench" );

function command( expr ) {
	expr = expr.split( " " );
	expr[ 0 ] = path.resolve( __dirname, "node_modules/.bin/" + expr[ 0 ] + ( path.sep === "/" ? "" : ".cmd" ) );
	return expr.join( " " );
}

module.exports = function( grunt ) {

	var lcov = "data.lcov";
	var lib = path.resolve( __dirname, "lib" );
	var libSave = lib + "-save";
	var lintTargets = [ "*.js", "lib/**/*.js", "test/**/*.js" ];

	grunt.initConfig( {
		jscs: {
			files: lintTargets,
			options: {
				config: ".jscs.json"
			}
		},
		jshint: {
			files: lintTargets,
			options: {
				jshintrc: ".jshint.json"
			}
		},
		shell: {
			browserify: {
				command: command( "browserify build/browser/index.js > browser/index.js" )
			},
			coveralls: {
				command: command( "coveralls < " + lcov )
			},
			jscoverage: {
				command: command( "jscoverage " + lib + " " + libSave )
			},
			test: {
				command: command( "nodeunit" )
			},
			testWithCoverage: {
				command: command( "nodeunit test --reporter=lcov > " + lcov )
			}
		}
	} );

	// load npm modules
	require( "load-grunt-tasks" )( grunt );

	// Tasks
	grunt.registerTask( "lint", [ "jscs", "jshint" ] );
	grunt.registerTask( "default", [ "lint", "shell:test" ] );

	// Coverage
	grunt.registerTask( "coverage-file-manipulation", function() {
		fs.renameSync( lib, "__coverage_tmp" );
		fs.renameSync( libSave, lib );
		fs.renameSync( "__coverage_tmp", libSave );
		process.on( "exit", function() {
			wrench.rmdirSyncRecursive( lib );
			fs.renameSync( libSave, lib );
			fs.unlinkSync( lcov );
		} );
	} );

	grunt.registerTask( "coverage", [
		"shell:jscoverage",
		"coverage-file-manipulation",
		"shell:testWithCoverage",
		"shell:coveralls"
	] );

	// Browser test generation
	grunt.registerTask( "browser-files", function() {
		var dir = path.resolve( __dirname, "browser" );
		var depDir = path.resolve( __dirname, "node_modules" );
		try {
			fs.mkdirSync( dir );
		} catch ( e ) {}
		fs.writeFileSync( dir + "/qunit.css", fs.readFileSync( depDir + "/qunitjs/qunit/qunit.css" ) );
		fs.writeFileSync( dir + "/index.html", fs.readFileSync( __dirname + "/build/browser/index.html" ) );
	} );

	grunt.registerTask( "browser", [
		"browser-files",
		"shell:browserify"
	] );

	grunt.registerTask( "browser-badges", function() {
		var data = require( "./build/browsers.json" );
		var tmp = [];
		for ( var key in data ) {
			if ( data.hasOwnProperty( key ) ) {
				tmp.push( {
					browser: key + " " + data[ key ].version,
					badge: key + "-" + data[ key ].version + "-" + data[ key ].color
				} );
			}
		}
		console.log( tmp.map( function( item ) {
			return "![" + item.browser + "](https://img.shields.io/badge/" + item.badge + ".svg)";
		} ).join( "\n" ) );
	} );
};
