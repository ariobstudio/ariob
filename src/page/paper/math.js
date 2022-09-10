import { Schema } from "prosemirror-model";

export const math = new Schema({
	nodes: {
		doc: {
			content: "block+",
		},
		paragraph: {
			content: "inline*",
			group: "block",
			parseDOM: [{ tag: "p" }],
			toDOM() {
				return ["p", 0];
			},
		},
		math_inline: {
			// important!
			group: "inline math",
			content: "text*", // important!
			inline: true, // important!
			atom: true, // important!
			toDOM: () => ["math-inline", { class: "math-node" }, 0],
			parseDOM: [
				{
					tag: "math-inline", // important!
				},
			],
		},
		math_display: {
			// important!
			group: "block math",
			content: "text*", // important!
			atom: true, // important!
			code: true, // important!
			toDOM: () => ["math-display", { class: "math-node" }, 0],
			parseDOM: [
				{
					tag: "math-display", // important!
				},
			],
		},
		text: {
			group: "inline",
		},
	},
});
