var UIBuilder;
(function (UIBuilder) {
    var attribMap = {
        'htmlFor': 'for',
        'className': 'class',
        'defaultValue': 'value',
        'defaultChecked': 'checked'
    };
    var eventMap = {
        // Clipboard events
        'onCopy': 'oncopy',
        'onCut': 'oncut',
        'onPaste': 'onpaste',
        // Keyboard events
        'onKeyDown': 'onkeydown',
        'onKeyPress': 'onkeypress',
        'onKeyUp': 'onkeyup',
        // Focus events
        'onFocus': 'onfocus',
        'onBlur': 'onblur',
        // Form events
        'onChange': 'onchange',
        'onInput': 'oninput',
        'onSubmit': 'onsubmit',
        // Mouse events
        'onClick': 'onclick',
        'onContextMenu': 'oncontextmenu',
        'onDoubleClick': 'ondblclick',
        'onDrag': 'ondrag',
        'onDragEnd': 'ondragend',
        'onDragEnter': 'ondragenter',
        'onDragExit': 'ondragexit',
        'onDragLeave': 'ondragleave',
        'onDragOver': 'ondragover',
        'onDragStart': 'ondragstart',
        'onDrop': 'ondrop',
        'onMouseDown': 'onmousedown',
        'onMouseEnter': 'onmouseenter',
        'onMouseLeave': 'onmouseleave',
        'onMouseMove': 'onmousemove',
        'onMouseOut': 'onmouseout',
        'onMouseOver': 'onmouseover',
        'onMouseUp': 'onmouseup',
        // Selection events
        'onSelect': 'onselect',
        // Touch events
        'onTouchCancel': 'ontouchcancel',
        'onTouchEnd': 'ontouchend',
        'onTouchMove': 'ontouchmove',
        'onTouchStart': 'ontouchstart',
        // UI events
        'onScroll': 'onscroll',
        // Wheel events
        'onWheel': 'onwheel',
        // Media events
        'onAbort': 'onabort',
        'onCanPlay': 'oncanplay',
        'onCanPlayThrough': 'oncanplaythrough',
        'onDurationChange': 'ondurationchange',
        'onEmptied': 'onemptied',
        'onEncrypted': 'onencrypted',
        'onEnded': 'onended',
        'onLoadedData': 'onloadeddata',
        'onLoadedMetadata': 'onloadedmetadata',
        'onLoadStart': 'onloadstart',
        'onPause': 'onpause',
        'onPlay': 'onplay',
        'onPlaying': 'onplaying',
        'onProgress': 'onprogress',
        'onRateChange': 'onratechange',
        'onSeeked': 'onseeked',
        'onSeeking': 'onseeking',
        'onStalled': 'onstalled',
        'onSuspend': 'onsuspend',
        'onTimeUpdate': 'ontimeupdate',
        'onVolumeChange': 'onvolumechange',
        'onWaiting': 'onwaiting',
        // Image events
        'onLoad': 'onload',
        'onError': 'onerror'
    };
    var svgElements = {
        'circle': true,
        'clipPath': true,
        'defs': true,
        'ellipse': true,
        'g': true,
        'image': true,
        'line': true,
        'linearGradient': true,
        'mask': true,
        'path': true,
        'pattern': true,
        'polygon': true,
        'polyline': true,
        'radialGradient': true,
        'rect': true,
        'stop': true,
        'svg': true,
        'text': true,
        'tspan': true
    };
    UIBuilder.Fragment = "--fragment--";
    var Component = /** @class */ (function () {
        function Component(props) {
            this.props = props;
        }
        Component.prototype.render = function () {
            return null;
        };
        return Component;
    }());
    UIBuilder.Component = Component;
    function createElement(type, props) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        props = props || {};
        var node;
        if (type === UIBuilder.Fragment) {
            return children;
        }
        else if (typeof type === 'function') {
            var _props = UIBuilder.clone(props);
            _props.children = children;
            if (type.prototype.render) {
                var component = new type(_props);
                node = component.render();
                applyComponentProps(component, props);
            }
            else {
                node = type(_props);
            }
        }
        else {
            if (svgElements[type]) {
                node = document.createElementNS("http://www.w3.org/2000/svg", type);
            }
            else {
                node = document.createElement(type);
            }
            applyElementProps(node, props);
            appendChildrenRecursively(node, children);
        }
        return node;
    }
    UIBuilder.createElement = createElement;
    function appendChildrenRecursively(node, children) {
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            if (child instanceof Node) {
                node.appendChild(child);
            }
            else if (Array.isArray(child)) {
                appendChildrenRecursively(node, child);
            }
            else if (child === false) {
                // The value false is ignored, to allow conditional display using && operator
            }
            else if (child != null) {
                node.appendChild(document.createTextNode(child));
            }
        }
    }
    function applyElementProps(node, props) {
        for (var prop in props) {
            var value = props[prop];
            if (value == null)
                continue;
            if (prop === 'ref') {
                if (typeof value === 'function') {
                    value(node);
                }
                else {
                    throw new Error("'ref' must be a function");
                }
            }
            else if (eventMap.hasOwnProperty(prop)) {
                node[eventMap[prop]] = value;
            }
            else if (typeof value === 'function') {
                node.addEventListener(prop, value);
            }
            else if (prop === 'style' && typeof value === 'object') {
                for (var styleName in value) {
                    node.style[styleName] = value[styleName];
                }
            }
            else {
                var name_1 = attribMap.hasOwnProperty(prop) ? attribMap[prop] : prop;
                if (name_1 in node && typeof value === 'object') {
                    // pass object-valued attributes to Web Components
                    node[name_1] = value; // value is set without any type conversion
                }
                else {
                    node.setAttribute(name_1, value); // value will be converted to string
                }
            }
        }
    }
    function applyComponentProps(component, props) {
        var ref = props['ref'];
        if (ref) {
            if (typeof ref === 'function') {
                ref(component);
            }
            else {
                throw new Error("'ref' must be a function");
            }
        }
    }
})(UIBuilder || (UIBuilder = {}));
var UIBuilder;
(function (UIBuilder) {
    function clone(obj) {
        var target = {};
        for (var field in obj) {
            if (obj.hasOwnProperty(field)) {
                target[field] = obj[field];
            }
        }
        return target;
    }
    UIBuilder.clone = clone;
})(UIBuilder || (UIBuilder = {}));
