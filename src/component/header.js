import logo from "./logo.js";
import icon from './icon.js'
const header = (title, a) => {
	return `
    <div id="header" class="unit row center">
      <div class="unit gap  left">
        <a href="#home">
          ${logo(2.5)}
        <p id="place" class="unit right gap"></p>
        </a>
      </div>
      
      ${
        (!a) ? `
        <span class="unit gap right" id="account">
          <a class='unit act primary' href="#create">Start</a>
        </span>
        ` : 
        ``
      }
      <div class="gap">
        <a class="unit gap right" href='#search'>${icon('search')}</a>
      </div>
    </div>
  `;
};

export default header;
