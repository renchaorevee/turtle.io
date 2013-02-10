/**
 * Determines which verbs are allowed against a URL
 * 
 * @method allows
 * @param  {String} url  URL to query
 * @param  {String} host Hostname
 * @return {String}      Allowed methods
 */
var allows = function (url, host) {
	var result = "",
	    verbs  = ["DELETE", "GET", "POST", "PUT"];

	verbs.each(function (i) {
		if (allowed(i, url, host)) result += (result.length > 0 ? ", " : "") + i;
	});

	return result.replace("GET", "GET, HEAD, OPTIONS");
};
