import logo from "./logo.js";
import icon from './icon.js'
const nav = (menu) => {
	return `
  <nav id="nav" >
    <ul>
      <li><a class='act' href='#home'> ${icon('home')}</a></li>
      <li><a class='act' href='#activity'> ${icon('notification')}</a></li>
      <li><a class='act' href='#settings'> ${icon('settings')}</a></li>
    </ul>
  </nav>
  `;
};

export default nav;
