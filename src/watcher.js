/**
 * Watches `path` for changes & updated LRU
 *
 * @method watcher
 * @public
 * @param  {String} url      LRUItem url
 * @param  {String} path     File path
 * @param  {String} mimetype Mimetype of URL
 * @return {Object}          Instance
 */
factory.prototype.watcher = function ( url, path, mimetype ) {
	var self = this,
	    cleanup, watcher;

	/**
	 * Cleans up caches
	 *
	 * @method cleanup
	 * @private
	 * @param  {Object} watcher FileSystem Watcher
	 * @param  {String} url     Stale URL
	 * @param  {String} path    URL path
	 * @return {Undefined}      undefined
	 */
	cleanup = function ( watcher, url, path ) {
		watcher.close();
		self.stale( url );
		self.unregister( url );
		delete self.watching[path];
	};

	if ( !( this.watching[path] ) ) {
		// Tracking
		this.watching[path] = 1;

		// Watching path for changes
		watcher = fs.watch( path, function ( ev ) {
			if ( REGEX_RENAME.test( ev ) ) {
				cleanup( watcher, url, path );
			}
			else {
				fs.stat( path, function ( e, stat ) {
					var etag;

					if ( e ) {
						self.log( e );
						cleanup( watcher, url, path );
					}
					else if ( self.registry.cache[url] ) {
						etag = self.etag( url, stat.size, stat.mtime );
						self.register( url, {etag: etag, mimetype: mimetype}, true );
					}
					else {
						cleanup( watcher, url, path );
					}
				});
			}
		});
	}
};
