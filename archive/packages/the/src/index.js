/**
 * @ariob/the - THE Framework for LynxJS
 *
 * THE (The Hypermedia Engine) renders views on a line.
 * Everything flows, drips, and positions relative to the line.
 *
 * @example
 * // hello.js
 * export default function(the){
 *   the.view.fill = "Hello World!"
 * }
 *
 * // App.tsx
 * import { The } from '@ariob/the';
 * import hello from './hello.js';
 * <The app={hello} />
 *
 * @module @ariob/the
 */

import { useState, useEffect, useRef, runOnMainThread } from '@lynx-js/react';

var u; // undefined shorthand

/**
 * Unit mapping: ~ = em, . = px, % = %
 * @type {Object<string, string>}
 */
var unit = {'~':'em', '.':'px', '%':'%', 'cs':'em', 'ps':'px'};

/**
 * Properties that trigger re-render
 * @type {Object<string, number>}
 */
var go = {name:1, size:1, turn:1, grab:1, zoom:1, warp:1, fill:1, away:1, drip:1, flow:1, time:1, html:1, text:1};

/**
 * Map THE properties to CSS style object
 * @param {Object} p - THE view properties
 * @returns {Object} CSS style object
 */
function css(p){
  var s = {}, t;

  // time → transitionDuration
  if(u !== (t = p.time)){
    s.transitionDuration = t+'s';
    s.transitionProperty = 'all';
  }

  // fill → backgroundColor (array) or skip (string = text)
  if(u !== (t = p.fill) && Array.isArray(t)){
    var c = t.map(function(v,i){ return i<3 ? Math.round((v||0)*255) : (v||1) });
    if(c.length < 4){ c.push(1) }
    s.backgroundColor = 'rgba('+c+')';
  }

  // size → minWidth/minHeight
  if(u !== (t = p.size)){
    if(t[0]){ s.minWidth = t[0][0]+(unit[t[0][1]]||'em'); if(t[0][2]){ s.maxWidth = t[0][2]+(unit[t[0][3]]||'em') } }
    if(t[1]){ s.minHeight = t[1][0]+(unit[t[1][1]]||'em'); if(t[1][2]){ s.maxHeight = t[1][2]+(unit[t[1][3]]||'em') } }
  }

  // flow → flexDirection
  if(u !== (t = p.flow)){
    s.display = 'flex';
    var h = (t[0]&&t[0][0])||t[0], v = t[1];
    if('v' === v){ s.flexDirection = 'column' }
    else if('^' === v){ s.flexDirection = 'column-reverse' }
    if('>' === h){ s.flexDirection = s.flexDirection || 'row' }
    else if('<' === h){ s.flexDirection = 'row-reverse' }
  }

  // drip → justifyContent/alignItems
  if(u !== (t = p.drip)){
    s.display = 'flex';
    s.justifyContent = t===0?'center':t===1?'flex-start':'flex-end';
    s.alignItems = t===0?'center':t===1?'flex-start':'flex-end';
    s.textAlign = t===0?'center':t===1?'left':'right';
  }

  // away → verticalAlign
  if(u !== (t = p.away)){
    s.verticalAlign = (-t[0])+(unit[t[1]]||'em');
  }

  // Transform: grab, turn, zoom
  var tr = [];
  if(u !== (t = p.grab)){
    var x=t[0]||0, y=t[1]||0, z=t[2]||0;
    tr.push('translate3d('+(typeof x==='string'?x:x+'em')+','+(typeof y==='string'?y:y+'em')+','+(typeof z==='string'?z:z+'em')+')');
  }
  if(u !== (t = p.turn)){
    if(t[0]){ tr.push('rotateZ('+t[0]+'turn)') }
    if(t[1]){ tr.push('rotateX('+t[1]+'turn)') }
    if(t[2]){ tr.push('rotateY('+t[2]+'turn)') }
  }
  if(u !== (t = p.zoom)){
    tr.push('scale3d('+(t[0]||1)+','+(t[1]||1)+','+(t[2]||1)+')');
  }
  if(tr.length){ s.transform = tr.join(' ') }

  return s;
}

/**
 * Deep clone a node tree for safe cross-thread transfer
 * @param {Object} n - Node to clone
 * @returns {Object} Cloned node
 */
function clone(n){
  if(!n){ return null }
  var c = {};
  for(var k in n){
    if(k === 'children'){
      c.children = n.children.map(clone);
    } else if(k !== 'up' && k !== 'place'){
      c[k] = n[k];
    }
  }
  return c;
}

/**
 * Create THE runtime instance
 * Runs on background thread, sends renders to main thread
 * @param {Function} render - Main thread render callback
 * @returns {Object} the - THE global object
 */
function createThe(render){
  'background only';

  var map = new Map, up = [];
  var pid = Math.random().toString(32).slice(-4), pi = 0;

  // Root view
  var root = {name:'root', children:[]};
  map.set('root', root);

  // Pending flush state
  var pending = false;

  /**
   * Queue a flush to main thread
   */
  function queue(){
    if(pending){ return }
    pending = true;
    setTimeout(flush, 0);
  }

  /**
   * Flush changes to main thread
   */
  function flush(){
    pending = false;
    if(up.length){ up.splice(0) }
    runOnMainThread(render)(clone(root));
  }

  /**
   * Ensure object is a tracked view node with Proxy
   * @param {*} what - View spec or string
   * @returns {Proxy} Proxied view node
   */
  function node(what){
    if(map.has(what)){ return map.get(what) }

    var text = ('string' == typeof what);
    var a = text ? {fill: what} : (what || {});
    if(!a.name){ a.name = pid+(++pi) }
    a.children = a.children || [];

    var proxy = new Proxy(a, {
      get: function(at, has){
        if(has === 'place'){ return place }
        return at[has];
      },
      set: function(at, has, put){
        if(put === at[has]){ return true }
        if(put instanceof Promise){ return true }
        if(put && put.then){ at[has] = u; return true }
        at[has] = put;
        if(go[has]){ up.push({name: at.name, [has]: put}); queue() }
        return true;
      }
    });

    map.set(what, proxy);
    map.set(proxy, proxy);
    map.set(a.name, proxy);
    return proxy;
  }

  /**
   * place() - Position views on the line
   * Chainable API: place(what).into(parent)
   */
  var was = {};
  function place(what, how, where){
    if(!how){ was.what = what; return place }

    var b = map.get(where) || where || root;

    if(what instanceof Array){
      var i = 0, tmp;
      while(tmp = what[i++]){ place(tmp, how, where) }
      return;
    }

    var a = node(what);

    // Add to parent children
    a.up = where;
    if(!b.children){ b.children = [] }
    if(!b.children.includes(a)){
      if(how < 0){ b.children.unshift(a) }
      else { b.children.push(a) }
    }

    up.push({name: a.name});
    queue();
    return a;
  }

  place.place = place;
  place.into = function(on){ return place(was.what, 0.1, on || root) }
  place.begin = function(on){ return place(was.what, -0.1, on || root) }
  place.after = function(on){ return place(was.what, 1, on) }
  place.before = function(on){ return place(was.what, -1, on) }

  /**
   * view() - Create or access views
   * @param {*} what - View spec
   * @returns {Proxy} View node
   */
  function view(what){
    if(what === u){ return root }
    var v = node(what);
    return v;
  }

  /**
   * breathe() - 60fps sync loop
   * Flushes pending changes to main thread
   * @returns {Promise} Resolves after frame
   */
  async function breathe(){
    'background only';
    if(up.length){
      up.splice(0);
      runOnMainThread(render)(clone(root));
    }
    return new Promise(function(res){ setTimeout(res, 0) });
  }

  /**
   * the.view proxy - handles the.view.fill = "text" and the.view({...})
   */
  var theView = new Proxy(view, {
    apply: function(t, x, args){ return view(args[0]) },
    get: function(t, p){
      if(p === 'place'){ return place }
      return root[p];
    },
    set: function(t, p, v){
      if(p === 'place'){ return true }
      root[p] = v;
      if(go[p]){ up.push({name:'root', [p]: v}); queue() }
      return true;
    }
  });

  return {
    view: theView,
    breathe: breathe,
    key: {},
    aim: {x:0, y:0, z:0, at:''},
    on: {},
    player: {},
    unit: {cs:5, ps:1}
  };
}

/**
 * Render node recursively
 * Runs on main thread
 * @param {Object} props
 * @param {Object} props.n - Node to render
 */
function Node({ n }){
  'main thread';
  if(!n){ return null }

  var s = css(n);
  var text = (typeof n.fill === 'string');

  // Text node
  if(text && (!n.children || !n.children.length)){
    return <text style={s}>{n.fill}</text>;
  }

  // Container with children
  return (
    <view style={s}>
      {text && <text>{n.fill}</text>}
      {(n.children||[]).map(function(c){
        return <Node key={c.name} n={c} />;
      })}
    </view>
  );
}

/**
 * The - Main component
 * @param {Object} props
 * @param {Function} props.app - THE app function (receives `the`)
 */
export function The({ app }){
  'main thread';
  var [root, setRoot] = useState(null);
  var theRef = useRef(null);
  var initialized = useRef(false);

  useEffect(function(){
    'background only';

    if(initialized.current){ return }
    initialized.current = true;

    // Create THE instance with render callback
    theRef.current = createThe(setRoot);

    // Run app
    if(app){ app(theRef.current) }
  }, [app]);

  if(!root){ return <view><text>Loading...</text></view> }
  return <Node n={root} />;
}
