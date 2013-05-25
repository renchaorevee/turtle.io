/**
 * Sessions
 * 
 * @type {Object}
 */
factory.prototype.session = {
	/**
	 * Creates a session
	 * 
	 * @method create
	 * @param  {Object} res HTTP(S) response Object
	 * @param  {Object} req HTTP(S) request Object
	 * @return {Object}     Session
	 */
	create : function ( res, req ) {
		var instance = this.server,
		    parsed   = $.parse( instance.url( req ) ),
		    domain   = parsed.host.isDomain() && !parsed.host.isIP() ? parsed.host : undefined,
		    secure   = ( parsed.protocol === "https:" ),
		    salt     = req.connection.remoteAddress + "-" + instance.config.session.salt,
		    id       = $.uuid( true ),
		    sid      = instance.cipher( id, true, salt ),
		    sesh;

		// Setting cookie
		instance.cookie.set( res, instance.config.session.id, sid, this.expires, domain, secure, "/" );

		// Creating session instance
		sesh = instance.sessions[id] = new Session( id, instance );
		sesh.save();

		return sesh;
	},

	/**
	 * Destroys a session
	 * 
	 * @method destroy
	 * @param  {Object} res HTTP(S) response Object
	 * @param  {Object} req HTTP(S) request Object
	 * @return {Object}     Instance
	 */
	destroy : function ( res, req ) {
		var instance = this.server,
		    parsed   = $.parse( instance.url( req ) ),
		    domain   = parsed.host.isDomain() && !parsed.host.isIP() ? parsed.host : undefined,
		    secure   = ( parsed.protocol === "https:" ),
		    salt     = req.connection.remoteAddress + "-" + instance.config.session.salt,
		    sid      = instance.cookie.get( req, instance.config.session.id ),
		    id       = instance.cipher( sid, false, salt );

		if ( id !== undefined ) {
			// Expiring cookie
			instance.cookie.expire( res, instance.config.session.id, domain, secure, "/" );

			// Deleting sesssion
			delete instance.sessions[id];

			// Announcing deletion of session
			instance.sendMessage( MSG_DEL_SES, id, true );
		}

		return instance;
	},

	/**
	 * Gets a session
	 * 
	 * @method get
	 * @param  {Object} res HTTP(S) response Object
	 * @param  {Object} req HTTP(S) request Object
	 * @return {Mixed}      Session or undefined
	 */
	get : function ( res, req ) {
		var instance = this.server,
		    sid      = instance.cookie.get( req, instance.config.session.id ),
		    id, salt, sesh;

		if ( sid !== undefined ) {
			salt = req.connection.remoteAddress + "-" + instance.config.session.salt;
			id   = instance.cipher( sid, false, salt );
			sesh = instance.sessions[id];

			// Invalid session, expiring cookie
			if ( sesh === undefined ) {
				instance.session.destroy( res, req );
			}
			else {
				if ( moment().unix( sesh._timestamp ).diff( moment().utc().unix() ) >= this.maxDiff ) {
					instance.session.destroy( res, req );
					sesh = undefined;
				}
				else {
					sesh.save();
					return sesh;
				}
			}
		}

		return sesh;
	},

	// Transformed `config.session.valid` for $.cookie{}
	expires : "",

	// Determines if a session has expired
	maxDiff : 0,

	// Set & unset from `start()` & `stop()`
	server : null
};

/**
 * Session factory
 * 
 * @param {String} id     Session ID
 * @param {Object} server Server instance
 */
function Session ( id, server ) {
	this._id        = id;
	this._server    = server;
	this._timestamp = 0;
};

/**
 * Saves session across cluster
 *
 * @return {Undefined} undefined
 */
Session.prototype.save = function () {
	var invalid = /^\_server/,
	    body    = {};

	this._timestamp = moment().utc().unix();

	$.iterate( this, function ( v, k ) {
		if ( !invalid.test( k ) ) {
			body[k] = v;
		}
	});

	// Announcing session shape
	this._server.sendMessage( MSG_SET_SES, {id: this._id, session: $.encode( body )}, true );
};

/**
 * Expires session across cluster
 * 
 * @return {Undefined} undefined
 */
Session.prototype.expire = function () {
	delete this._server.sessions[this._id];
	this._server.sendMessage( MSG_DEL_SES, this._id, true );
};