const win = window,
  doc = document,
  body = doc.body;

/**
 * Default configuration
 * @typ {Object}
 */
var defaultConfig = {
  limit: 10,
  offset: 1,
  startPage: 1,
  hideDisabled: true,
  prevNext: true,
  prevText: "Prev",
  nextText: "Next",
  // firstLast: false,
  // firstText: "&laquo;",
  // lastText: "&raquo;",		
  ellipsisText: "&hellip;",
  hashString: "#",

  classes: {
    pager: "pagination",
    item: "page-item",
    link: "page-link",
    prev: "page-prev",
    next: "page-next",
    first: "page-first",
    last: "page-last",
    active: "active",
    disabled: "disabled",
    ellipsis: "page-link",
  }
};

/**
 * Check is item is object
 * @return {Boolean}
 */
var isObject = function (val) {
  return Object.prototype.toString.call(val) === "[object Object]";
};

/**
 * Check is item is array
 * @return {Boolean}
 */
var isArray = function (val) {
  return Array.isArray(val);
};

var closest = function (el, fn) {
  return el && el !== body && (fn(el) ? el : closest(el.parentNode, fn));
};

/**
 * Merge objects (reccursive)
 * @param  {Object} r
 * @param  {Object} t
 * @return {Object}
 */
var extend = function (src, props) {
  for (var prop in props) {
    if (props.hasOwnProperty(prop)) {
      var val = props[prop];
      if (val && isObject(val)) {
        src[prop] = src[prop] || {};
        extend(src[prop], val);
      } else {
        src[prop] = val;
      }
    }
  }
  return src;
};

/**
 * Iterator helper
 * @param  {(Array|Object)}   arr     Any object, array or array-like collection.
 * @param  {Function}         fn      Callback
 * @param  {Object}           scope   Change the value of this
 * @return {Void}
 */
var each = function (arr, fn, scope) {
  var n;
  if (Number.isInteger(arr)) {
    for (n = 0; n < arr; n++) {
      fn.call(scope, n + 1, n);
    }
  } else {
    if (isObject(arr)) {
      for (n in arr) {
        if (Object.prototype.hasOwnProperty.call(arr, n)) {
          fn.call(scope, arr[n], n);
        }
      }
    } else {
      for (n = 0; n < arr.length; n++) {
        fn.call(scope, arr[n], n);
      }
    }
  }
};

/**
 * Add event listener to target
 * @param  {Object} el
 * @param  {String} e
 * @param  {Function} fn
 */
var on = function (el, e, fn) {
  el.addEventListener(e, fn, false);
};

/**
 * Create DOM element node
 * @param  {String}   a nodeName
 * @param  {Object}   b properties and attributes
 * @return {Object}
 */
var createNode = function (a, b) {
  var d = doc.createElement(a);
  if (b && "object" == typeof b) {
    var e;
    for (e in b) {
      if ("html" === e) {
        d.innerHTML = b[e];
      } else {
        d.setAttribute(e, b[e]);
      }
    }
  }
  return d;
};

var getPage = function (e) {
  return parseInt(e.getAttribute("data-page"), 10);
};


/**
 *
 * Pager must be created/updated with object:
 * config = { pages: [totalPages], startPage: [currentPage]}
 *
 */
export class Pager {
  constructor(config) {
    this.config = extend(defaultConfig, config);
    this.container = document.querySelector(this.config.container)
    if(this.config.pages) {
      this.totalPages = this.config.pages
    }
    this.offset = this.config.offset
    this.bindEvents()
		if ( this.config.startPage ) {
			this.goTo(this.config.startPage);
		}		

		var that = this;
		setTimeout(function() {
			that.emit("init", that.currentPage);
		}, 10);
  }
  bindEvents() {
    this.events = {
			click: this.click.bind(this)
		};
    on(this.container, "click", this.events.click);
  }
  click(e) {
		var that = this, target = e.target, o = that.config;
		
		var item = closest(target, function(node) {
			return node.item;
		});
		
		if ( item ) {
			e.preventDefault();
			if (item.ellipsis) {
				return;
			}
			that.goTo(parseInt(item.dataset.page, 10))
		}
  }
  render(pages) {
    var that = this, o = that.config, node = document.createDocumentFragment()
    if(pages) {
      that.items = [];
      that.totalPages = pages;
      if(that.currentPage > that.totalPages) {
        that.currentPage = that.totalPages
      }
    }
		if ( that.pager ) {
			that.pager.className = o.classes.pager;
		} else {
			that.pager = createNode("ul", {
				class: o.classes.pager
			});
		}
    var items = that.truncate()	
    // render prev button 
    if ( o.prevNext ) {
      that.prev = that.renderButton({
        class: o.classes.prev,
        content: o.prevText,
        page: that.currentPage > 1 ? that.currentPage - 1 : 1,
        nav: true,
        prev: true
      });
      node.appendChild(that.prev);
    }
    // render middle buttons 
    each(items, function(item, i) {
      node.appendChild(item);
    })
    // render next button 
    if ( o.prevNext ) {
      that.next = that.renderButton({
        class: o.classes.next,
        content: o.nextText,
        page: that.currentPage < that.totalPages ? that.currentPage + 1 : that.totalPages,
        nav: true,
        next: true
      });
      node.appendChild(that.next);
    }
    that.pager.innerHTML = "";
		that.pager.appendChild(node);
		that.container.appendChild(that.pager);
		that.emit("render");
  }
  renderButton(obj) {
    var that = this, o = that.config;
    var item = createNode("li", {
      class: o.classes.item
    })

    item.dataset.page = obj.page
    if(obj.page === that.currentPage && !obj.ellipsis && !obj.nav) {
      item.classList.add(o.classes.active)
    }

		var link = createNode("a", {
			class: o.classes.link,
			html: obj.content
		});

    if ( obj.class ) {
			item.classList.add(obj.class);
		}
		if ( obj.nav ) {
			item.nav = true;
		}
		if ( obj.ellipsis ) {
			item.ellipsis = true;
		} else {
			item.item = true;
			link.href = o.hashString.replace("{page}", obj.page).replace("{pages}", that.totalPages);
		}
		if ( (obj.prev || obj.first) && that.currentPage === 1 ||
			 	 (obj.next || obj.last) && that.currentPage === that.totalPages )	{
			item.disabled = true;
			item.classList.add(o.classes.disabled);
		
			link.tabIndex = -1;
		} else {
			item.disabled = false;
		}
		item.appendChild(link);
		return item;
  }
  goTo(page) {
    var that = this, o = that.config
    /// skipped ajax code
    that.currentPage = page;
    that.render();
    that.emit("change", page);
  }
  add() {
		this.render(this.totalPages + 1);
		this.emit("add");
	};
	remove(num) {
		if (this.totalPages > 1) {
			this.render(this.totalPages - 1);	
			this.emit("remove");
		}
	};	
	on(event, fct) {
		this.events[event] = this.events[event] || [];
		this.events[event].push(fct);
	};
	
	off(event, fct) {
		if (event in this.events === false) return;
		this.events[event].splice(this.events[event].indexOf(fct), 1);
	};
  emit(event) {
    if (event in this.events === false) return;
		for (var i = 0; i < this.events[event].length; i++) {
			this.events[event][i].apply(
				this,
				Array.prototype.slice.call(arguments, 1)
			);
		}
  }
  set(prop, value) {
		this[prop] = value;
	};	
	
	set limit (limit) {
		this.limit = parseInt(limit, 10);
	};
	
	set offset (offset) {
		this.offset = parseInt(offset, 10);
	};
	
	get limit () {
		return this.limit;
	};
	
	get offset () {
		return this.offset;
	};	
}