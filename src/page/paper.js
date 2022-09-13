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
import { addListNodes, splitListItem } from "prosemirror-schema-list";
import { highlightPlugin } from "prosemirror-highlightjs";
import { history } from "prosemirror-history";

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
import { geezify } from "../lib/geezify";

const paper = `
<div id="paper" class="page screen" >
	<div id="paper-img" class="none row gap">
		<img class="cover sap primary" />
	</div>
	<div id="content" class="gap"></div>
	<div id="who" class="left none"></div>
	<small id="when" class="right gap"></small>
</div>
`;
const historyPlugin = history();

var user = JOY.user;
JOY.route.page("paper", async function () {
	var url = new URLSearchParams(location.hash.split("/")[1]);
	var who = location.hash.split("&")[1].slice(5);
	var hash = url.get("file");
	console.log(hash);
	var u = gun
		.get("~" + who)
		.get("test/paper/files")
		.get(hash);
	window.LOCK = false;
	var title = (await u.get("name")) || `Untitled-${hash}`;
	var last = await u.get("when");
	if (last) {
		$("#when").text("Last saved: " + JOY.since(last) + " ago");
	}
	// JOY.head(title);

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
					src: friend.avatar && JOY.avatar(friend.avatar),
				},
				link: {
					href: `#profile/?pub=~${who}`,
				},
				name: friend.name,
			}
		);
	}
	u.on(async (d) => {
		JOY.head(d.name || title);

		if (!d || !d.document) return;

		var doc = state.schema.nodeFromJSON(JSON.parse(d.document));
		if (!doc) return;
		state.doc = doc;

		if (JOY.paper?.state === state) {
			JOY.paper?.updateState(state);
		}
		if (d.cover) {
			$("#paper-img img").attr("src", d.cover);
			$("#paper-img").removeClass("none");
		}
	});
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
		toDOM() {
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
				priority: 51,
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
			historyPlugin,
			// suggestionPlugin,
			buildInputRules(opts.schema),
			keymap(buildKeymap(opts.schema, opts.keys)),
			keymap(baseKeymap),
			mathPlugin,
		],
	});

	function toggleTodoItemAction(state, pos, todoItemNode) {
		return state.tr.setNodeMarkup(pos, null, {
			done: !todoItemNode.attrs.done,
		});
	}
	// setInterval(getTime, 6 * 1000);
	if (!JOY.paper) {
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

			ignoreMutation() {
				return true;
			},
			editable() {
				return !window.LOCK;
			},
			clipboardTextSerializer: (slice) => {
				return mathSerializer.serializeSlice(slice);
			},
			async dispatchTransaction(transaction) {
				var doc = transaction.doc.toJSON();
				doc = JSON.stringify(doc);
				var w = Date.now();
				u.put({ document: doc, when: w });
				$("#when").text("Last saved: " + JOY.since(w) + " ago");
				let newState = JOY.paper.state.apply(transaction);
				JOY.paper.updateState(newState);
			},
		});
	}

	if (who == JOY?.key?.pub) {
		let t = $("#place");
		t.on("dblclick", function () {
			console.log("PREV: ");
			meta.ask("Enter the name of the file", (answer) => {
				u.get("name").put(answer);
			});
		});
		if (!JOY.paper.focused) {
			meta.edit({
				name: "Preference",
				fake: -1,
				combo: [191],
			});
			meta.edit({
				name: "Image",
				combo: [191, "I"],
				fake: -1,
				on: function () {
					meta.ask("Enter Image Source or Url", function (url) {
						u.get("cover").put(url);
						$("#paper-img img").attr("src", url);
						$("#paper-img").removeClass("none");
					});
				},
			});
		}
	}
});

export default paper;
