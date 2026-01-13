import FrontKit from '..';
import MarkdownShortcuts from '../src/plugins/markdown-shortcuts/markdown-shortcuts.js';
import Bubble from '../src/plugins/ui-bubble-vue/bubble.js';
import Mindful from '../src/plugins/mindful/mindful.js';
import Dots from '../src/plugins/ui-dots/dots.js';
import InlineMenu from '../src/plugins/ui-inline-menu/inline-menu.js';
import Checkbox from '../src/plugins/checkbox/checkbox.js';
import Notifications from '../src/plugins/notifications/notifications.js';

let editor = new FrontKit(document.querySelector('article.fk-editable'), {
    plugins: [
        new MarkdownShortcuts(),
        new Notifications(),
        new Bubble(),
        new Dots(),
        new InlineMenu(),
        new Checkbox(),
        new Mindful(),
    ]
});

window._editor = editor;
