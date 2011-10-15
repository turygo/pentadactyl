var shortenURL = function (args) {
	let url = args.join(" ") || buffer.URL;
	if (url == "")
		dactyl.echomsg("Please specifically a uri.", commandline.FORCE_SINGLELINE);
	else
		url = encodeURIComponent(url);
	let invert = options.get("shorten-yank").value;
	if (args.bang)
		invert = !invert;
	// let pattern = /(http:\\)?((is.gd\/[a-zA-Z0-9]{5})|)/gi; // the candy
	var req = new XMLHttpRequest();
	var callback = function (data) {
		if (invert)
			dactyl.clipboardWrite(data.trim(), true);
		else
			dactyl.echomsg(data.trim(), commandline.FORCE_SINGLELINE);
	};
	let engine = options.get("shorten-engine").value;
	if (args["-e"])
		engine = args["-e"];
	switch (engine) {
		case 'b' :
			bitly(req, url, callback);
			break;
		case 'g' :
			google(req, url, callback);
			break;
		case 'i' :
			isgd(req, url, callback);
			break;
		default :
			break;
	}
};

var bitly = function (req, url, callback) {
	/**
	 * Reference
	 * http://code.google.com/p/bitly-api/
	 */
	if (!(/^https?:\/\//.test(url)))
		url = "http://" + url;
	var querystring = "login=grassofhust&apiKey=R_696fd603075a1cedeb0fd56bbaa58033&format=txt&longUrl="+url;
	req.open("GET",
		"http://api.bit.ly/v3/shorten?" + querystring,
		true
	);
	req.onreadystatechange = function (ev) {
		if (req.readyState == 4) {
			if (req.status == 200) {
				callback(req.responseText);
			} else {
				callback(req.responseText);
			}
		}
	};
	req.send(null);
};

var google = function (req, url, callback) {
	/**
	 * Reference
	 * Google URL Shortener
	 * http://goo.gl/
	 * Google APIs Console
	 * http://code.google.com/apis/console/
	 * Google URL Shortener API
	 * http://code.google.com/apis/urlshortener/index.html
	 */
	req.open("POST",
		"https://www.googleapis.com/urlshortener/v1/url",
		true
	);
	req.setRequestHeader('Content-Type', 'application/json');
	var data = {
		"longUrl" : url,
		"key" : "AIzaSyDaUYAFnNQB3X4__ZuwcPfc8nGNwhItDPk"
	};
	req.send(JSON.stringify(data));
	req.onreadystatechange = function (ev) {
		if (req.readyState == 4) {
			if (req.status == 200) {
				var result = JSON.parse(req.responseText);
				callback(result.id);
			} else {
				callback(req.status);
			}
		}
	};
};

var isgd = function (req, url, callback) {
	/**
	 * Reference
	 * API
	 * http://is.gd/apishorteningreference.php
	 */
	var querystring = "format=simple&url="+url;
	req.open("GET",
		"http://is.gd/create.php?" + querystring,
		true
	);
	req.onreadystatechange = function (ev) {
		if (req.readyState == 4) {
			if (req.status == 200) {
				callback(req.responseText);
			} else {
				callback(req.responseText);
			}
		}
	};
	req.send(null);
}

let opt = [];
[
	["-b","Bitly helps you share, track, and analyze your links."],
	["-g", "Google URL Shortener"],
	["-i", "is.gd - a URL shortener. Mmmm, tasty URLs!"]
].forEach(function(item) {
	let [a, d] = item;
	opt.push({
		names: [a],
		description: [d],
		type: CommandOption.NOARG
	});
});

opt.push({
	names: ["-e"],
	description: "URL Shorten Engine",
	type: CommandOption.STRING,
	completer: [
		["b","Bitly helps you share, track, and analyze your links."],
		["g", "Google URL Shortener"],
		["i", "is.gd - a URL shortener. Mmmm, tasty URLs!"]
	]
});

// Add custom commands
group.commands.add(["shor[ten]", "sht"],
	"Shorten current url or specific url",
	shortenURL,
	{
		argCount: "*",
		bang: true,
		options: opt
	},
	true
);

// Add custom settings
group.options.add(["shorten-engine", "shte"],
	"Custom Shorten Engine",
	"string", "i",
	{
		completer : function (context) [
			["b","Bitly helps you share, track, and analyze your links."],
			["g", "Google URL Shortener"],
			["i", "is.gd - a URL shortener. Mmmm, tasty URLs!"]
		]
	}
);

group.options.add(["shorten-yank", "shty"],
	"Copy Shorten URL to ClipBoard",
	"boolean",
	true
);

