import "gun/lib/monotype.js";
import icon from "../component/icon";
const paper = `
<div id="paper" class="page hold center" >
    <div id="content" class=" screen">
		<h1 class='loud'>Title</h1>
    </div>
</div>
<div id="debug"></div>
`;

var user = JOY.user;
JOY.route.page("paper", async function () {
	// Check if JOY.user.is == pub of shop!!

	JOY.head("Paper");
	var page = {};
	page.render = async (obj, who) => {
		console.log({ obj, who });
		// if (who == "me") {
		// 	var mine = await gun.user().get("papers").get(obj.hash).get(obj.id);
		// 	mine?.content && $("#content").html(mine.content);
		// } else {
		// 	gun.get("~" + obj.author)
		// 		.get("papers")
		// 		.get(obj.hash)
		// 		.get(obj.id)
		// 		.on((d) => {
		// 			$("#content").html(d.content);
		// 		});
		// }
	};

	page.start = async function () {
		var url = new URLSearchParams(location.hash.split("/")[1]);
		if (url.get("p")) {
			var id = url.get("p");
			var hash = url.get("h");
			var author = await gun.get("test-paper#").get(hash);
			var key = JOY.key;
			console.log(author);
			if (author === key.pub) {
				// console.log("author, author is: ", author);
				// page.render({ id: page.id, hash: page.hash }, "me");

				// Edit
				meta.edit({
					name: `${icon("document")}`,
					combo: ["E"],
					on: function () {
						$("#content").focus();
						$("#content").attr(
							"contenteditable",
							"true" == $("#content").attr("contenteditable")
								? false
								: true
						);
					},
				});
				meta.edit({
					name: "Share",
					combo: ["S"],
					on: function () {
						navigator.clipboard.writeText(location.href);
					},
					use: function () {},
					up: function () {},
				});
			} else {
				console.log("reader, author is: ", author);
				page.render(
					{ id: page.id, hash: page.hash, author: author },
					"other"
				);
			}
		}
	};
	page.start();
	page.wait = function (cb, wait, to) {
		return function (a, b, c) {
			var me = (page.typing = this);
			clearTimeout(to);
			to = setTimeout(function () {
				cb.call(me, a, b, c);
				page.typing = me = false;
			}, wait || 75);
		};
	};
	var monotype =
		window.monotype ||
		function () {
			console.log("monotype needed");
		};
	var m = meta;
	m.text = { zws: "&#8203;" };
	$(document).on("click", function () {
		var tmp = $(".meta-on");
		if (!tmp.length) {
			return;
		}
		tmp.removeClass("meta-on");
	});

	m.text.on = function (eve) {
		var tmp;
		if ($((eve || {}).target).closest("#meta").length) {
			return;
		}

		m.text.range = null;
		if (!(m.text.copy() || "").trim()) {
			m.flip(false);
			m.list(m.text.it);
			return;
		}
		m.text.range = monotype((eve || {}).target);
	};
	m.text.copy = function (tmp) {
		return (
			((tmp = window.getSelection) && tmp().toString()) ||
			((tmp = document.selection) && tmp.createRange().text) ||
			""
		);
	};
	$(document).on(
		"select contextmenu keyup mouseup",
		"[contenteditable=true]",
		m.text.on
	);
	$(document).on(
		"keyup",
		"[contenteditable]",
		page.wait(async function (e) {
			var el = $(this);
			var data = el.html();
			data = $.normalize(data);
			console.log(data);
			// await gun
			// 	.user()
			// 	.get("papers")
			// 	.get(page.hash)
			// 	.get(page.id)
			// 	.get("content")
			// 	.put(data);
			// var when = gun
			// 	.user()
			// 	.get("papers")
			// 	.get(page.hash)
			// 	.get(page.id)
			// 	.get("last");
			// var now = new Date().toLocaleString();
			// await gun
			// 	.user()
			// 	.get("papers")
			// 	.get(page.hash)
			// 	.get(page.id)
			// 	.get("last")
			// 	.put(now);
			// console.log(when);
			// $("#last").text(now);
		}, 75)
	);
	m.text.editor = function (opt, as) {
		var tmp;
		if (!opt) {
			return;
		}
		opt =
			typeof opt == "string"
				? { edit: opt }
				: opt.tag
				? opt
				: { tag: opt };
		var r = (opt.range = opt.range || m.text.range || monotype()),
			cmd = opt.edit;
		as = opt.as = opt.as || as;
		if (cmd && document.execCommand) {
			r.restore();
			if (document.execCommand(cmd, null, as || null)) {
				if (m.text.range) {
					m.text.range = monotype();
				}
				return;
			}
		}
		if (!opt.tag) {
			return;
		}
		opt.tag = $(opt.tag);
		opt.name = opt.name || opt.tag.prop("tagName");
		if ((tmp = $(r.get()).closest(opt.name)).length) {
			if (r.s === r.e) {
				tmp.after(m.text.zws);
				r = r.select(monotype.next(tmp[0]), 1);
			} else {
				tmp.contents().unwrap(opt.name);
			}
		} else if (r.s === r.e) {
			r.insert(opt.tag);
			r = r.select(opt.tag);
		} else {
			r.wrap(opt.tag);
		}
		r.restore();
		opt.range = null;
		if (m.text.range) {
			m.text.range = monotype();
		}
	};
	meta.edit(
		(meta.text.it = {
			combo: [-1],
			on: function (e) {
				m.list(this, true);
				// console.log(m.list);
			},
			back: meta.edit,
		})
	); // -1 is key for typing.
	meta.text.it[-1] = meta.text.it;
	document.execCommand("defaultParagraphSeparator", false, "p");
	// meta.edit({
	// 	place: "paper",
	// 	place: "paper",
	// 	name: "Edit",
	// 	combo: ["E"],
	// 	on: function () {
	// 		$("#content").attr(
	// 			"contenteditable",
	// 			"true" == $("#content").attr("contenteditable") ? false : true
	// 		);
	// 		var edit = this;
	// 		$(document).on("keyup", "[contenteditable]", function (e) {
	// 			var p = $(window.getSelection().anchorNode).closest("p"),
	// 				tmp;
	// 			(tmp = page[p.index()] || (page[p.index()] = {})).last =
	// 				+new Date() + 99;
	// 			clearTimeout(tmp.to);
	// 			tmp.to = setTimeout(function () {
	// 				var DBG = { s: +new Date() };
	// 				var r = monotype(p);
	// 				DBG.m = +new Date();
	// 				var html = p.html() || "";
	// 				DBG.g = +new Date();
	// 				// if (
	// 				// 	!html &&
	// 				// 	!p.prev().length &&
	// 				// 	!p.next().length &&
	// 				// 	!$("#page").html()
	// 				// ) {

	// 				// 	console.log("Empty page");
	// 				// 	page.init();
	// 				// }
	// 				DBG.i = +new Date();
	// 				var safe = $.normalize(html);
	// 				DBG.n = +new Date();
	// 				p.html(safe);
	// 				DBG.h = +new Date();
	// 				r.restore();
	// 				DBG.r = +new Date();
	// 				edit.save(p);
	// 				DBG.p = +new Date();
	// 				console.log(
	// 					"save:",
	// 					DBG.p - DBG.r,
	// 					"rest:",
	// 					DBG.r - DBG.h,
	// 					"html:",
	// 					DBG.h - DBG.n,
	// 					"norm:",
	// 					DBG.n - DBG.i,
	// 					"init:",
	// 					DBG.i - DBG.g,
	// 					"grab:",
	// 					DBG.g - DBG.m,
	// 					"mono:",
	// 					DBG.m - DBG.s
	// 				);
	// 			}, 75);
	// 		});
	// 		// $("#content").children().last().get(0).focus();
	// 	},
	// 	save: function (p) {
	// 		p = $(p);
	// 		var i = p.index(); // = Array.prototype.indexOf.call(parent.children, child);
	// 		var data = (p.get(0) || {}).outerHTML || "";
	// 		console.log(data);
	// 		data = $.normalize(data); // GOOD TO DO SECURITY ON SENDING SIDE TOO!!!
	// 		window.LOCK = true;
	// 		gun.get("test2/gun/docs/").get("what").get(i).put(data);
	// 		window.LOCK = false;
	// 	},
	// });
	// Font size
	meta.edit({
		place: "paper",
		combo: [-1, "F"],
		//
	});
	meta.edit({
		place: "paper",
		name: "Small",
		combo: [-1, "F", "S"],

		on: function (eve) {
			meta.text.editor("fontSize", 2);
		},
		up: function () {},
	});
	meta.edit({
		place: "paper",
		name: "Normal",
		combo: [-1, "F", "N"],

		on: function (eve) {
			meta.text.editor("fontSize", 5);
		},
		up: function () {},
	});
	meta.edit({
		place: "paper",
		name: "Header",
		combo: [-1, "F", "H"],

		on: function (eve) {
			meta.text.editor("fontSize", 6);
		},
		up: function () {},
	});
	meta.edit({
		place: "paper",
		name: "Title",
		combo: [-1, "F", "T"],

		on: function (eve) {
			meta.text.editor("fontSize", 7);
		},
		up: function () {},
	});

	// Strikethrough
	meta.edit({
		place: "paper",
		name: "Strike",
		combo: [-1, "S"],

		on: function (eve) {
			// meta.text.editor("strikethrough");
			var r = meta.text.range || monotype();
			meta.text.editor({
				tag: $("<strike>" + r + "</strike>"),
			});
		},
		up: function () {},
	});

	// Bold
	meta.edit({
		place: "paper",
		name: "Bold",
		combo: [-1, "B"],

		on: function (eve) {
			meta.text.editor("bold");
		},
		up: function () {},
	});

	// Italic
	meta.edit({
		place: "paper",
		name: "Italic",
		combo: [-1, "I"],

		on: function (eve) {
			meta.text.editor("italic");
		},
		up: function () {},
	});
	// Blockquote

	// Links
	meta.edit({
		place: "paper",
		name: "linK",
		combo: [-1, "K"],

		on: function (eve) {
			var range = meta.text.range || monotype();
			meta.ask("Paste link...", function (url) {
				meta.text.editor({
					tag: $('<a href="' + url + '">link</a>'),
					edit: url ? "createLink" : "unlink",
					as: url,
					range: range,
				});
			});
		},
	});
	meta.edit({
		place: "paper",
		combo: [-1, "G"],
	});
	meta.edit({
		place: "paper",
		name: "Left",
		combo: [-1, "G", "L"],

		on: function (eve) {
			meta.text.editor("justifyLeft");
		},
		up: function () {
			this.edit.fake = -1;
		},
	});
	meta.edit({
		place: "paper",
		name: "Right",
		combo: [-1, "G", "R"],
		//
		on: function (eve) {
			meta.text.editor("justifyRight");
		},
		up: function () {
			this.edit.fake = -1;
		},
	});

	meta.edit({
		place: "paper",
		name: "Middle",
		combo: [-1, "G", "M"],
		//
		on: function (eve) {
			meta.text.editor("justifyCenter");
		},
		up: function () {
			this.edit.fake = -1;
		},
	});
	meta.edit({
		place: "paper",
		name: "Justify",
		combo: [-1, "G", "J"],
		//
		on: function (eve) {
			meta.text.editor("justifyFull");
		},
		up: function () {
			this.edit.fake = -1;
		},
	});
	// Superscript
	meta.edit({
		place: "paper",
		combo: [-1, 54],

		on: function (eve) {
			meta.text.editor("superscript");
		},
		up: function () {},
	});
	// Subscript
	meta.edit({
		place: "paper",
		combo: [-1, 53],

		on: function (eve) {
			meta.text.editor("subscript");
		},
		up: function () {},
	});
	// Indent
	meta.edit({
		place: "paper",
		name: "indent >",
		combo: [-1, 190],

		on: function (eve) {
			meta.text.editor("indent");
		},
		up: function () {},
	});
	// Outdent
	meta.edit({
		place: "paper",
		name: "outdent <",
		combo: [-1, 188],

		on: function (eve) {
			meta.text.editor("outdent");
		},
		up: function () {},
	});
	// Lists
	meta.edit({
		place: "paper",
		name: "Unorderder",
		combo: [-1, "U"],
		//
		on: function (eve) {
			console.log(eve);
			meta.text.editor("insertunorderedlist");
		},
		up: function () {
			this.edit.fake = -1;
		},
	});
	meta.edit({
		place: "paper",
		name: "Ordered",
		combo: [-1, "O"],
		on: function (eve) {
			console.log("list-ol");
			meta.text.editor("insertorderedlist");
		},
		up: function () {
			this.edit.fake = -1;
		},
	});
	meta.edit({
		place: "paper",
		name: "Media",
		combo: [-1, "M"],
	});
	// Images
	meta.edit({
		place: "paper",
		name: "Picture",
		combo: [-1, "M", "I"],

		on: function (eve) {
			var range = meta.text.range || monotype();
			meta.ask("Paste link...", function (url) {
				meta.text.editor({
					tag: $('<img class="center" src="' + url + '" /><br />'),
					range: range,
					as: url,
				});
			});
		},
	});

	meta.edit({
		place: "paper",
		name: "videO",
		combo: [-1, "M", "O"],

		on: function (eve) {
			var range = meta.text.range || monotype();
			meta.ask("Paste link...", function (url) {
				console.log(url);
				let r =
					/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
				var id = url.match(r)[1];
				console.log(id);
				meta.text.editor({
					tag: $(
						`<section class='video'>
							<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
							</iframe>
						</section>`
					),
					range: range || id,
					as: id,
				});
			});
		},
	});
});

export default paper;
