/**
 * Sets a route for all verbs
 *
 * @method all
 * @public
 * @param  {RegExp}   route Route
 * @param  {Function} fn    Handler
 * @param  {String}   host  [Optional] Hostname this route is for (default is all)
 * @return {Object}         Instance
 */
factory.prototype.all = function ( route, fn, host ) {
	var self  = this,
	    timer = new Date();

	$.route.set( route, function ( req, res ) {
		handler.call( self, req, res, fn );
	}, "all", host );

	dtp.fire( "route-set", function () {
		return [host || "*", route, "ALL", diff( timer )];
	});

	return this;
};

/**
 * Sets a DELETE route
 *
 * @method delete
 * @public
 * @param  {RegExp}   route Route
 * @param  {Function} fn    Handler
 * @param  {String}   host  [Optional] Hostname this route is for (default is all)
 * @return {Object}         Instance
 */
factory.prototype["delete"] = function ( route, fn, host ) {
	var self  = this,
	    timer = new Date();

	$.route.set( route, function ( req, res ) {
		handler.call( self, req, res, fn );
	}, "delete", host );

	dtp.fire( "route-set", function () {
		return [host || "*", route, "DELETE", diff( timer )];
	});

	return this;
};

/**
 * Sets a GET route
 *
 * @method get
 * @public
 * @param  {RegExp}   route Route
 * @param  {Function} fn    Handler
 * @param  {String}   host  [Optional] Hostname this route is for (default is all)
 * @return {Object}         Instance
 */
factory.prototype.get = function ( route, fn, host ) {
	var self  = this,
	    timer = new Date();

	$.route.set( route, function ( req, res ) {
		handler.call( self, req, res, fn );
	}, "get", host );

	dtp.fire( "route-set", function () {
		return [host || "*", route, "GET", diff( timer )];
	});

	return this;
};

/**
 * Sets a PATCH route
 *
 * @method patch
 * @public
 * @param  {RegExp}   route Route
 * @param  {Function} fn    Handler
 * @param  {String}   host  [Optional] Hostname this route is for (default is all)
 * @return {Object}         Instance
 */
factory.prototype.patch = function ( route, fn, host ) {
	var self  = this,
	    timer = new Date();

	$.route.set( route, function ( req, res ) {
		handler.call( self, req, res, fn );
	}, "patch", host );

	dtp.fire( "route-set", function () {
		return [host || "*", route, "PATCH", diff( timer )];
	});

	return this;
};

/**
 * Sets a POST route
 *
 * @method post
 * @public
 * @param  {RegExp}   route Route
 * @param  {Function} fn    Handler
 * @param  {String}   host  [Optional] Hostname this route is for (default is all)
 * @return {Object}         Instance
 */
factory.prototype.post = function ( route, fn, host ) {
	var self  = this,
	    timer = new Date();

	$.route.set( route, function ( req, res ) {
		handler.call( self, req, res, fn );
	}, "post", host );

	dtp.fire( "route-set", function () {
		return [host || "*", route, "POST", diff( timer )];
	});

	return this;
};

/**
 * Sets a DELETE route
 *
 * @method put
 * @public
 * @param  {RegExp}   route Route
 * @param  {Function} fn    Handler
 * @param  {String}   host  [Optional] Hostname this route is for (default is all)
 * @return {Object}         Instance
 */
factory.prototype.put = function ( route, fn, host ) {
	var self  = this,
	    timer = new Date();

	$.route.set( route, function ( req, res ) {
		handler.call( self, req, res, fn );
	}, "put", host );

	dtp.fire( "route-set", function () {
		return [host || "*", route, "PUT", diff( timer )];
	});

	return this;
};
