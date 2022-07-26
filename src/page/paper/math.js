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

		text: {
			group: "inline",
		},
	},
});
