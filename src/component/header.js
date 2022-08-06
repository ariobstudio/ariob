import logo from "./logo.js";
import icon from './icon.js'
const header = (title, a) => {
	return `
  <div id="header" class="unit row gap center">
    <div class="unit center left">
      <a href="#home">
        ${logo(2.5)}
      </a>
    </div>
    
    ${
      (!a) ? `
      <div class="unit right" id="account">
        <a class='unit act primary' href="#create">Get Started</a>
      </div>
      ` : 
      ``
    }
  </div>
  `;
};

export default header;
