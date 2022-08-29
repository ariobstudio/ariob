import logo from "./logo.js";
import icon from "./icon.js";
const header = `
    <div id="header" class="unit row center">
      <div class="unit rim left">
        <a href="#home">
          ${logo(2.5)}
        <p id="place" class="unit right gap"></p>
        </a>
      </div>
      <div>
      <div class="rim right" id="account">
        <a class='unit act primary right' href="#create">Join</a>
      </div>
      <div class="rim right">
        <a class=" unit act gap right" href='#search'>${icon("search")}</a>
      </div>
    </div>
  `;
export default header;
