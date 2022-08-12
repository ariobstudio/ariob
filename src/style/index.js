JOY.css({
	"#meta": {
		display: "block",
		position: "fixed",
		bottom: "1em",
		"font-size": "16pt",
		background: "var(--surface)",
		/*border: 0.1em solid var(--text),*/
		color: "var(--text)",
		"text-align": "center",
		"z-index": 999999,
		"-webkit-tap-highlight-color": "transparent",
		right: "1em",
		margin: 0,
		"border-radius": "var(--radius)",
		width: "2.4em",
		outline: "none",
		cursor: "pointer",
		overflow: "none",
	},
	"#meta *": {
		outline: "none",
	},
	"#meta .meta-none": {
		display: "none",
	},
	"#meta span": {
		"line-height": "2em",
	},
	"#meta .meta-menu": {
		background: "var(--surface)",
		// background: "rgba(var(--background), 0.5)",
		// border: "0.1em solid var(--text)",
		// "backdrop-filter": "blur(5px)",
		// "-webkit-backdrop-filter": "blur(5px)",
		"border-radius": "var(--radius)",
		"animation-name": "animateOut",
		"animation-duration": "210ms",
		right: 0,
		bottom: "2.5em",
		overflow: "none",
		position: "absolute",
		"text-align": "right",
	},
	"#meta .meta-menu ul": {
		"list-style-type": "none",
		display: "flex",
		"flex-direction": "column",
	},
	"#meta .meta-menu ul li": {
		color: "var(--text)",
		display: "inline-block",
		float: "right",
		padding: "0.5em 1em",
		"font-size": "14pt",
		"border-radius": "0.75em",
		"text-align": "center",
		"animation-name": "animateIn",
		"animation-duration": "210ms",
		"animation-delay": "calc(var(--meta-key) * 70ms)",
		"animation-fill-mode": "both",
		"animation-timing-function": "ease-in-out",
		cursor: "pointer",
	},
	"#meta .meta-menu ul li:focus": {
		background: "var(--primary)",
	},
	"#meta a": {
		color: "var(--text)",
	},
	"#meta:hover": {
		opacity: 1,
	},
	"#meta:hover .meta-menu": {
		display: "block",
	},
	"#meta .meta-menu ul:before": {
		content: " ",
		display: "block",
	},
	"#meta .meta-start": {
		cursor: "pointer",
	},
});

// Moobile menu
JOY.css(
	{
		"#meta": {
			display: "block",
			position: "fixed",
			bottom: "0em",
			"font-size": "16pt",
			/*background: "var(--surface)",*/
      left:0,
      right:0,
      
			color: "var(--text)",
			"text-align": "right",
			"z-index": 999999,
			"-webkit-tap-highlight-color": "transparent",
			
			margin: "1em auto",

			width: "80%",
			outline: "none",
			cursor: "pointer",
			overflow: "none",
		},
		"#meta .meta-menu": {
			"border-radius": "var(--radius)",
			//"box-shadow": "0 0.25em 0.5em var(--secondary)",
			background: "var(--surface)",
			//background: "rgba(var(--primary), 0.8)",
			/*
		"border-radius": "var(--radius)",
		"backdrop-filter: "blur(5px)",
		"-webkit-backdrop-filter": "blur(5px),*/
		width: "100%",
		height: "auto",
			bottom: 0,
			
			right: 0,
			left: 0,
			//animation: "none",
			//"animation-delay": "0ms"
			position: "absolute",
			padding: "0.25em",
		},
		"#meta .meta-none": {
		   display: "block",
		},

		"#meta .meta-menu ul": {
			padding: 0,
			margin: 0,
			"white-space": "nowrap",
			display: "flex",
      "flex-wrap": "wrap",
			"flex-direction": "row",
			//"overflow-yrow-revese"
			//"overflow-x": "auto",
		},
		"#meta .meta-menu ul li": {
			"-webkit-user-select": "none",
			"-moz-user-select": "none",
			"-ms-user-select": "none",
			"user-select": "none",
			display: "inline",
			padding: "0.25em 0.5em",
			margin: "0.25em",
			"font-size": "14pt",
			"border-radius": "var(--radius)",
			"text-align": "right",
			cursor: "pointer",
		},
		"#meta a": {
			color: "var(--text)",
		},
		"#meta:hover": {
			opacity: 1,
		},

		"#meta:hover .meta-menu": {
			display: "block",
		},
		"#meta .meta-menu ul:before": {
			content: " ",
			display: "block",
		},
		"#meta .meta-start": {
		  display: "none",
			cursor: "pointer",
		},
	},
	"only screen and (max-width: 600px)"
);