import "gun/lib/monotype.js";

import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node, Schema } from "prosemirror-model";
// import { schema } from "prosemirror-schema-basic";
import { schema } from "./paper/schema";
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
import { linkPlugin } from "./paper/plugins";
import { suggestionPlugin } from "./paper/suggest";

const paper = `
<div id="paper" class="page screen" >
	<div id="content" class="rim gap focus"></div>
	<div id="who" class="right none"></div>
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
	// JOY.head(title);
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
	var todoItemSpec = {
		attrs: {
			done: { default: false },
		},
		content: "paragraph block*",
		toDOM(node) {
			const { done } = node.attrs;

			return [
				"li",
				{
					"data-type": "todo_item",
					"data-done": done.toString(),
				},
				[
					"span",
					{
						class: "todo-checkbox todo-checkbox-unchecked",
						contenteditable: "false",
					},
				],
				[
					"span",
					{
						class: "todo-checkbox todo-checkbox-checked",
						contenteditable: "false",
					},
				],
				["div", { class: "todo-content" }, 0],
			];
		},
		parseDOM: [
			{
				tag: '[data-type="todo_item"]',
				getAttrs(dom) {
					return {
						done: dom.getAttribute("data-done") === "true",
					};
				},
			},
		],
	};
	var todoListSpec = {
		group: "block",
		content: "todo_item+ | list_item+",
		toDOM(node) {
			return [
				"ul",
				{
					"data-type": "todo_list",
				},
				0,
			];
		},
		parseDOM: [
			{
				priority: 51, // Needs higher priority than other nodes that use a "ul" tag
				tag: '[data-type="todo_list"]',
			},
		],
	};
	var pSchema = new Schema({
		nodes: addListNodes(
			schema.spec.nodes,
			"paragraph* block+",
			"block"
		).append({
			todo_item: todoItemSpec,
			todo_list: todoListSpec,
		}),
		marks: schema.spec.marks,
	});

	// console.log(baseSchema);
	var opts = {
		schema: pSchema,
		keys: null,
	};

	var state = EditorState.create({
		schema: opts.schema,
		plugins: [
			// suggestionPlugin,
			buildInputRules(opts.schema),
			keymap(buildKeymap(opts.schema, opts.keys)),
			keymap(baseKeymap),
			mathPlugin,
		],
	});

	const getTime = async () => {
		var time = await u.get("when");
		if (!time) return;
		var when = JOY.since(new Date());
		// $("#saved").text("Last edited " + when + " ago");
	};
	u.on((d) => {
		JOY.head(d.name || title);
		if (!d.document) return;
		var doc = state.schema.nodeFromJSON(JSON.parse(d.document));
		state.doc = doc;
		if (JOY.paper?.state === state) {
			JOY.paper?.updateState(state);
		}
		getTime();
	});
	function toggleTodoItemAction(state, pos, todoItemNode) {
		return state.tr.setNodeMarkup(pos, null, {
			done: !todoItemNode.attrs.done,
		});
	}
	// setInterval(getTime, 6 * 1000);
	if (!$("div .ProseMirror").get(0)) {
		JOY.paper = new EditorView($("#content").get(0), {
			state,
			handleClickOn(view, pos, node, nodePos, event) {
				if (event.target.classList.contains("todo-checkbox")) {
					view.dispatch(
						toggleTodoItemAction(view.state, nodePos, node)
					);
					return true;
				}
			},
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
			meta.ask("Enter the name of the file", (answer) => {
				u.get("name").put(answer);
			});
		});
		// if (!JOY.paper.focused) {
		// 	meta.edit({
		// 		name: "Edit",
		// 		combo: ["E"],
		// 		on: function () {
		// 			window.LOCK = !window.LOCK;
		// 		},
		// 	});
		// }
		// if (!JOY.paper.focused) {
		// 	meta.edit({
		// 		name: "Delete",
		// 		combo: ["D"],
		// 		on: async function () {
		// 			// console.log(await u);
		// 			u.put(null);
		// 			JOY.route("home");
		// 		},
		// 	});
		// }
	}
});

export default paper;
