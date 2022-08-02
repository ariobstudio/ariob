// Styles
import "./style/style.css";
import "./style/app.css";
import "./style/meta.css";

// Scripts
import "gun/gun.js";
import "gun/sea.js";
import "./js/lib/as.js";
import "./js/lib/meta.js";
// import "./js/lib/meta.ui.js";
import "./js/navigation.js";

const logo = (size) => {
	return `
  <svg class="unit max" width="${size}em" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="17.431" fill="var(--background)"/>
      <path d="M20.3868 13.1076C20.3868 14.8555 18.9699 16.2725 17.222 16.2725C15.4741 16.2725 14.0571 14.8555 14.0571 13.1076C14.0571 11.3597 15.4741 9.9428 17.222 9.9428C18.9699 9.9428 20.3868 11.3597 20.3868 13.1076Z" fill="var(--green)"/>
      <path d="M8.29981 29.9136C7.06552 31.1479 7.06552 33.149 8.29981 34.3833C9.53409 35.6176 11.5353 35.6176 12.7695 34.3833L8.29981 29.9136ZM25.8238 21.329C27.0581 20.0947 27.0581 18.0936 25.8238 16.8593C24.5895 15.625 22.5884 15.625 21.3541 16.8593L25.8238 21.329ZM12.7695 34.3833L25.8238 21.329L21.3541 16.8593L8.29981 29.9136L12.7695 34.3833Z" fill="var(--yellow)"/>
      <path d="M34.6733 36.0574C35.9076 37.2917 37.9088 37.2917 39.1431 36.0574C40.3773 34.8231 40.3773 32.8219 39.1431 31.5876L34.6733 36.0574ZM31.0348 23.4794C29.8005 22.2451 27.7994 22.2451 26.5651 23.4794C25.3308 24.7137 25.3308 26.7148 26.5651 27.9491L31.0348 23.4794ZM39.1431 31.5876L31.0348 23.4794L26.5651 27.9491L34.6733 36.0574L39.1431 31.5876Z" fill="var(--red)"/>
    </svg>
`;
};

// HTML


// Theme
var storedTheme =
	localStorage.getItem("theme") ||
	(window.matchMedia("(prefers-color-scheme: dark)").matches
		? "night"
		: "day");
if (storedTheme)
	document.documentElement.setAttribute("theme", storedTheme);

// Events
var commands = {};

commands.home = function () {
	meta.edit({
		name: "create",
		combo: ["O", "C"],
		fake: -1,
		on: () => {
			meta.ask("create new page", function (ans) {
				c.tell(ans)
			});
			return;
		},
	});
};
commands.activity = function () {
	meta.edit({
		name: "clear",
		combo: ["O", "C"],
		fake: -1,
		on: function(){
		  as.route.render('hello', '.rand', $('#activity'), "Hello WWorld");
		  return;
		}
	});
};
commands.friends = function () {
	meta.edit({
		name: "New Friend",
		combo: ["O", "C"],
		fake: -1,
		on: function(){
		  return;
		}
	});
};
commands.settings = function () {
	meta.edit({
		name: "theme",
		combo: ["O", "C"],
		fake: -1,
		on: function () {
			var before =
				document.documentElement.getAttribute("theme");
			var now = before === "day" ? "night" : "day";
			document.documentElement.setAttribute("theme", now);
			localStorage.setItem("theme", now);
			c.tell(`${now} mode activated`)
			return;
		},
	});
};

var hash = window.location.hash.slice(1);
if (hash) {
	if (commands[hash] && commands[hash] instanceof Function) {
		commands[hash]();
	}
}
meta.edit({
	name: "home",
	combo: ["H"],
	fake: -1,
	on: () => {
		as.route("home");
		// commands.home();
	},
});
meta.edit({
	name: "settings",
	combo: ["B"],
	fake: -1,
	on: () => {
		as.route("settings");
		// commands.home();
	},
});

meta.edit({
	name: "activity",
	combo: ["A"],
	// fake: -1,
	on: () => {
		as.route("activity");
	},
});

meta.edit({
	name: "⣿",
	combo: ["O"],
	fake: -1,
	on: (e) => {
	  e.preventDefault();
		// as.route("friends");
	},
});

$(window).on("hashchange", function () {
	console.log("hashchange");
	var hash = window.location.hash.substring(1);
	if (!hash) {
		return;
	}
	if (commands[hash]) {
		commands[hash]();
	}
});
var c = {}
c.tell = function(what, n){
	var e = $('#tell').find('p');
	e.addClass('notify').text(what);
	clearTimeout(c.tell.to);
	c.tell.to = setTimeout(function(){e.removeClass('notify')}, n || 2500);
}


as.route.page('home', function(){
  document.title = "Ariob"
  c.tell("Welcome to Ariob Studio!")
});
as.route.page('activity', function(){
  document.title = "Ariob - Activity"
	//c.tell('In Activity')
});
as.route.page('settings', function(){
  document.title = "Ariob - Settings"
	//c.tell('In Settings')
});


document.querySelector("#app").innerHTML = `
  <div id="home" class="page full hold center">
    <div class="unit row center">
      <div class="unit col left">
        ${logo(2)}
        <p class="unit gap bold">ariob</p>
      </div>
    </div>
    
    <div class="center pad">
      <p>home</p>
    </div>
    
  </div>
  
  <div id="settings" class="page full center hold">
    <div class="unit row center">
      <div class="unit col left">
        ${logo(2)}
        <p class="unit gap bold">settings</p>
      </div>
    </div>
    
    <div class="center pad">
      <p>settings</p>
    </div>
    
  </div>
  <div id="activity" class="page full hold center">
    <div class="unit row center">
      <div class="unit col left">
        ${logo(2)}
        <p class="unit gap bold">activity</p>
      </div>
    </div>
   
    <div class='model'>
      <p class'rand'> { content }</p>
    </div>
    <div class="center pad">
      <p>activity</p>
    </div>
    
  </div>
  <div id="friends" class="page full hold center">
    <div class="unit row center">
      <div class="unit col left">
        ${logo(2)}
        <p class="unit gap bold">Friends</p>
      </div>
    </div>
    
    <div class="center pad">
      <p>Friends</p>
    </div>
    
  </div>
`;