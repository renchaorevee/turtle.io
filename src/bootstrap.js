/**
 * Bootstraps instance
 *
 * @method bootstrap
 * @public
 * @param  {Function} fn [Optional] Route error handler
 * @return {Object}      Instance
 */
factory.prototype.bootstrap = function ( fn ) {
	var self    = this,
	    params  = {},
	    expires = {interval: 0, sampling: ""};

	if ( this.bootstrapped === false ) {
		// Preparing parameters
		params.port           = this.config.port;
		params.maxConnections = this.config.maxConnections;

		if ( this.config.csr !== undefined ) {
			params.csr = this.config.csr;
		}

		if ( this.config.key !== undefined ) {
			params.csr = this.config.key;
		}

		// Registering dtrace probes
		if (this.config.probes) {
			probes();
		}

		// Creating REGEX_REWRITE
		REGEX_REWRITE = new RegExp( "^(" + this.config.proxy.rewrite.join( "|" ) + ")$" );

		// Setting error route
		$.route.set( "error", function ( req, res, timer ) {
			fn( req, res, timer );
		});

		// Setting optional queue status route
		if ( this.config.queue.status ) {
			this.get( "/queue", function ( req, res, timer ) {
				this.respond( req, res, {next: "/queue/:item", items: $.array.cast( this.requestQueue.registry, true )}, 200, {"Cache-Control": "no-cache"}, timer, false );
			});

			this.get( "/queue/.*", function ( req, res, timer ) {
				var uuid = req.url.replace(/.*\/queue\/?/, "");

				if ( uuid.indexOf( "/" ) > -1 ) {
					self.error( req, res, timer );
				}
				else {
					self.queueStatus( req, res, uuid, timer );
				}
			});
		}

		// Setting default response route
		if ( !this.routes().get.contains( "/.*" ) ) {
			this.get( "/.*", this.request );
		}

		// Creating a server
		this.active = true;
		this.server = $.route.server( params, function ( e ) {
			self.log( e, true );
		});

		// Setting acceptable lag
		toobusy.maxLag( this.config.lag );

		// Socket probe
		this.server.on( "connection", function () {
			dtp.fire( "connection", function () {
				return [self.server.connections];
			});
		});

		// Flushing logs to disk on a timer
		fs.appendFile( "/var/log/" + this.config.logs.file, "", function ( e ) {
			if ( e ) {
				fs.exists( __dirname + "/../log/" + self.config.logs.file, function ( exists ) {
					var file = __dirname + "/../log/" + self.config.logs.file;

					if ( !exists ) {
						fs.writeFileSync( file, "" );
					}

					$.repeat( function () {
						self.flush( file );
					}, self.config.logs.flush, "logs");
				});
			}
			else {
				$.repeat( function () {
					self.flush( "/var/log/" + self.config.logs.file );
				}, self.config.logs.flush, "logs");
			}
		});

		// Setting internal reference
		this.session.server = this;

		// Setting session cookie expiration representation
		this.session.expires = this.config.session.valid.split( /\s/ ).map( function ( i, idx ) {
			return idx === 0 ? i : i.charAt( 0 );
		}).join( "" );

		// Calculating how long sessions are valid for
		this.config.session.valid.split( /\s/ ).map( function ( i, idx ) {
			if ( idx === 0 ) {
				expires.interval = parseInt( i, 10 );
			}
			else {
				expires.sampling = i;
			}
		});

		this.session.maxDiff = moment().utc().unix().diff( moment().utc().subtract( expires.sampling, expires.interval ).unix() );

		// Purging expired sessions
		$.repeat(function () {
			var now = moment().utc().unix();

			$.array.cast( self.sessions ).each( function ( i ) {
				if ( now.diff( i._timestamp ) >= self.session.maxDiff ) {
					i.expire();
				}
			});
		}, self.config.session.gc, "expiredSessions" );

		// Dropping process
		if ( this.config.uid !== null ) {
			process.setuid( this.config.uid );
		}
	}

	return this;
};
