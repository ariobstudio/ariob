import logo from './logo.js';

const header = (title) => {
  return `
  <div class="unit row center">
    <div class="unit gap center left">
      ${logo(2.5)}
      <p class="unit gap bold"></p>
    </div>
   <a href="#create" class='act secondary unit right'>Get Started</a>
  </div>
  `
}

export default header