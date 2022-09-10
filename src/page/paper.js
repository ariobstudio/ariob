import "gun/lib/monotype.js";

import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node, Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { buildInputRules } from "./paper/inputrules";
import { baseKeymap, chainCommands } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { buildKeymap } from "./paper/keymap";
import { addListNodes } from "prosemirror-schema-list";
import { highlightPlugin } from "prosemirror-highlightjs";
import hljs from "highlight.js";
import {
	createMathSchema,
	mathPlugin,
	mathSchemaSpec,
	mathSerializer,
} from "@benrbray/prosemirror-math";
import { math } from "./paper/math";

const paper = `
<div id="paper" class="page screen center" >
	<div id="who" class=" none"></div>
	<div id="content" class="rim left gap focus"></div>
</div>
`;

var user = JOY.user;
JOY.route.page("paper", async function () {
	var url = new URLSearchParams(location.hash.split("/")[1]);
	var who = location.hash.split("&")[1].slice(5);
	var hash = url.get("file");
	var u = gun
		.get("~" + who)
		.get("test/paper/files")
		.get(hash);
	window.LOCK = false;
	var title = (await u.get("name")) || `Untitled-${hash}`;
	if (who !== JOY?.key?.pub) {
		window.LOCK = true;
		// console.log(who);
		$("#who").removeClass("none");
		var friend = await gun.get("~" + who).get("profile");
		console.log(friend);
		JOY.route.render(
			who.substring(1, 8),
			".persona-mini-detail",
			$("#who"),
			{
				title: title,
				avatar: {
					src: JOY.avatar(friend.avatar),
				},
				link: {
					href: `#profile/?pub=~${who}`,
				},
				name: friend.name,
			}
		);
	}

	JOY.head(title);

	// 		} else {
	// 			u = gun
	// 				.get("~" + d)
	// 				.get("test/paper/files")
	// 				.get(hash);
	// 		}
	// 	});
	// who.on((d) => {
	// 	console.log(d);
	// });
	// var mathSchema = createMathSchema();

	// var baseSchema = new Schema({
	// 	nodes: schema.spec.nodes.append(mathSchemaSpec.nodes),
	// 	mark: schema.spec.marks,
	// })
	var paperSchema = new Schema({
		nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
		marks: schema.spec.marks,
	});

	// var baseSchema = new Schema({
	// 	nodes: math.spec.nodes.append(paperSchema.spec.nodes),
	// 	marks: schema.spec.marks,
	// });
	// console.log(baseSchema);
	var opts = {
		schema: paperSchema,
		keys: null,
	};

	var state = EditorState.create({
		schema: opts.schema,
		plugins: [
			buildInputRules(opts.schema),
			keymap(buildKeymap(opts.schema, opts.keys)),
			keymap(baseKeymap),
			mathPlugin,
		],
	});
	// u.get("when").on((d) => {
	// 	var when = JOY.since(new Date(d));
	// 	$("#saved").text("Last edited " + when + " ago");
	// });
	// if (!u) return;
	const getTime = async () => {
		var time = await u.get("when");
		if (!time) return;
		var when = JOY.since(new Date());
		// $("#saved").text("Last edited " + when + " ago");
	};
	console.log("GET TIME:", u);
	u.on((d) => {
		if (!d.document) return;

		var doc = state.schema.nodeFromJSON(JSON.parse(d.document));
		state.doc = doc;
		if (JOY.paper?.state === state) {
			JOY.paper?.updateState(state);
		}
		getTime();
	});

	setInterval(getTime, 6 * 1000);
	if (!$("div .ProseMirror").get(0)) {
		JOY.paper = new EditorView($("#content").get(0), {
			state,
			handleDOMEvents: {
				input(view, event) {
					console.log(event.currentTarget.value);
					// geezify(event);
				},
			},
			editable() {
				return !window.LOCK;
			},
			clipboardTextSerializer: (slice) => {
				return mathSerializer.serializeSlice(slice);
			},
			dispatchTransaction(transaction) {
				// var doc = JSON.string
				var doc = transaction.doc.toJSON();
				doc = JSON.stringify(doc);
				// console.log(doc);
				var w = +new Date();
				u.put({ document: doc, when: w });
				console.log(transaction);
				let newState = JOY.paper.state.apply(transaction);
				JOY.paper.updateState(newState);
			},
		});
	}
	if (who === JOY?.key?.pub) {
		let t = $("#place");
		t.on("dblclick", function () {
			t.attr("contenteditable", true).on("keydown", (e) => {
				u.get("name").put(t.text());
				if (e.which === 13) {
					t.attr("contenteditable", false);
					return;
				}
			});

			// meta.ask("Enter the name of the file", (answer) => {
			// 	u.get("name").put(answer);
			// });
		});

		// meta.edit({
		// 	name: "Name",
		// 	fake: -1,
		// 	combo: [16, "N"],
		// 	on: function () {

		// 	},
		// });
		// meta.edit({
		// 	name: "Edit",
		// 	fake: -1,
		// 	combo: ["E"],
		// 	on: function () {
		// 		if (who === JOY?.key?.pub) {
		// 			window.LOCK = !window.LOCK;
		// 			console.log(JOY.paper);
		// 			// JOY.paper.editable = lock;
		// 			// JOY.paper.updateState(JOY.paper.state);
		// 		}
		// 	},
		// });
	}
	// console.log(state.doc.toString()); // An empty paragraph
	// console.log(state.selection.from); // 1, the start of the paragraph
});
// window.addEventListener("input", (e) => {
// 	if (window.GEEZ) {
// 		geezify(e);
// 	}
// });
export default paper;
