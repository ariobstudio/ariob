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

const paper = `
<div id="paper" class="page screen hold center" >
	<div id="content" class=" sap left paper focus gap surface"></div>
	<span id="saved" class="small right gap"></span>
</div>
`;

var user = JOY.user;
JOY.route.page("paper", async function () {
	JOY.head("Paper");
	var url = new URLSearchParams(location.hash.split("/")[1]);
	var who = location.hash.split("&")[1].slice(5);
	var hash = url.get("file");
	var pub = url.get("pub");
	var u = gun
		.get("~" + who)
		.get("test/paper/files")
		.get(hash);
	var lock = false;

	if (who !== JOY?.key?.pub) {
		lock = true;
	}
	// if ()
	// gun.get("files")
	// 	.get(hash)
	// 	.get("pub")
	// 	.on(async (d) => {
	// 		if (d === JOY?.key?.pub) {
	// 			lock = false;
	// 			console.log("ME");
	// u = JOY.user.get("test/paper/files").get(hash);
	if (!(await u.get("name"))) {
		u.get("name").put(hash.slice(0, 5));
	}
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

	var paperSchema = new Schema({
		nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
		marks: schema.spec.marks,
	});

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
				return !lock;
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
	meta.edit({
		name: "Name",
		fake: -1,
		combo: ["N"],
		on: function () {
			meta.ask("Enter the name of the file", (answer) => {
				u.get("name").put(answer);
			});
		},
	});
	// console.log(state.doc.toString()); // An empty paragraph
	// console.log(state.selection.from); // 1, the start of the paragraph
});
// window.addEventListener("input", (e) => {
// 	if (window.GEEZ) {
// 		geezify(e);
// 	}
// });
export default paper;
