(function () {
	$(document).on("click", "a, button", function (e) {
		var tmp = $(this).attr("href") || "";
		if (0 === tmp.indexOf("http")) {
			return;
		}
		e.preventDefault();
		r(tmp);
	});
	function r(href) {
		if (!href) {
			return;
		}
		if (href[0] == "#") {
			href = href.slice(1);
		}
		var h = href.split("/")[0];
		$(".page").hide();
		$("#" + h).show();
		if (r.on === h) {
			return;
		}
		location.hash = href;
		(r.page[h] || { on: function () {} }).on();
		r.on = h;
		return r;
	}
	r.page = function (h, cb) {
		r.page[h] = r.page[h] || { on: cb };
		return r;
	};
	r.render = function (id, model, onto, data) {
		var $data = $(
			$("#" + id).get(0) ||
				$(".model")
					.find(model)
					.clone(true)
					.attr("id", id)
					.appendTo(onto)
		);
		$.each(data, function (field, val) {
			if ($.isPlainObject(val)) {
				return;
			}
			$data
				.find("[name='" + field + "']")
				.val(val)
				.text(val);
		});
		return $data;
	};
	window.onhashchange = function () {
		r(location.hash.slice(1));
	};
	$.route = r;
})();

(function () {
	// need to isolate into separate module!
	var joy = (window.JOY = function () {});
	joy.route = $.route;
	joy.auth = function (k, cb, o) {
		if (!o) {
			o = cb;
			cb = 0;
		}
		if (o === true) {
			SEA.pair().then((key) => {
				joy.auth(key);
				if (cb) {
					cb(k);
				}
			});
			return;
		}
		joy.key = k;
		joy.user.auth(k, cb, o);
	};
	joy.tell = function (what, n) {
		var e = $("#tell").find("p");
		e.addClass("notify").text(what);
		clearTimeout(joy.tell.to);
		joy.tell.to = setTimeout(function () {
			e.removeClass("notify");
		}, n || 2500);
	};

	var opt = (joy.opt = window.CONFIG || {}),
		peers;
	$("link[type=peer]").each(function () {
		(peers || (peers = [])).push($(this).attr("href"));
	});
	!window.gun &&
		(opt.peers =
			opt.peers ||
			peers ||
			(function () {
				(console.warn || console.log)(
					"Warning: No peer provided, defaulting to DEMO peer. Do not run in production, or your data will be regularly wiped, reset, or deleted. For more info, check https://github.com/eraeco/joydb#peers !"
				);
				return ["http://localhost:8765/gun"];
			})());
	window.gun = window.gun || Gun(opt);
	joy.user = gun.user();
})();
