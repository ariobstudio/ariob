import logo from "./logo.js";

const header = (title) => {
	return `
  <div id="header" class="unit row gap center">
    <div class="unit  center left">
      ${logo(2.5)}
    </div>
    <div id="me">
        <a class='unit right act primary' href="#create">Get Started</a>
      </div>
  </div>
  `;
};

export default header;
