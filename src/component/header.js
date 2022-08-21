import logo from "./logo.js";
import icon from './icon.js'
const header = (title, a) => {
	return `
  <div id="header" class="unit row center">
    <div class="unit gap center left">
      <a href="#home">
        ${logo(2.5)}
      </a>
      <p class="gap right">${title}</p>
    </div>
    
    ${
      (!a) ? `
      <div class="unit rim right" id="account">
        <a class='unit act primary' href="#create">Get Started</a>
      </div>
      ` : 
      ``
    }
  </div>
  `;
};

export default header;
