/*Update with custom reporting and output callback function*/
var HTMLCS_RUNNER = _global.HTMLCS_RUNNER = new function () {
	var prevMessages;
	var currentMessages;
    var self = this;
	this.run = function (standard, el) {

		// At the moment, it passes the whole DOM document.
		HTMLCS.process(standard, el, function () {
			var messages = HTMLCS.getMessages();
			prevMessages = currentMessages;
			currentMessages = self.formatMessages(messages);

			//TODO remove old
			//prevMessages=currentMessages;
			//currentMessages=messages;

			var length = messages.length;
			var msgCount = {};
			msgCount[HTMLCS.ERROR] = 0;
			msgCount[HTMLCS.WARNING] = 0;
			msgCount[HTMLCS.NOTICE] = 0;

			for (var i = 0; i < length; i++) {
				//self.output(messages[i]);
				msgCount[messages[i].type]++;
			}
			console.log('done');
		}, function () {
			console.log('Something in HTML_CodeSniffer failed to parse. Cannot run.');
			console.log('done');
		});
	};
    this.getNodeProps = function (node, clone) {
		var nodeProps = {
			cssSelector: "",
			outerHTML: ""
		};
		try {
			nodeProps.cssSelector += CSS_MAN.cssPath(node);
		} catch (err) {}; //Ignore if the CSS path look up fails
		//Keep the outerHTML content length short by overwriting the innerHTML of the clone
		clone.innerHTML = '...';
		nodeProps.outerHTML += clone.outerHTML;
		return nodeProps;
	};
	this.formatMessages = function (mess) {
		return _.map(mess, function (el) {
			var c = el.element.cloneNode(false);
			el.cloned = el.element.cloneNode(false);
			el.nodeProps = self.getNodeProps(el.element, c);
			return el;
		});
	};
	this.removedDiff = function () {
		return _.filter(prevMessages, function (obj) {
			return !_.find(currentMessages, function (obj2) {
				return obj.code == obj2.code && obj.data == obj2.data && obj.msg == obj2.msg && obj.type == obj2.type && obj.element == obj2.element; //obj.cloned.isEqualNode(obj2.cloned);
			})
		});
		//return _.filter(prevMessages, function(obj){ return !_.findWhere(currentMessages, obj); });
	};
	this.addedDiff = function () {
		return _.filter(currentMessages, function (obj) {
			return !_.find(prevMessages, function (obj2) {
				return obj.code == obj2.code && obj.data == obj2.data && obj.msg == obj2.msg && obj.type == obj2.type && obj.element == obj2.element;
				//return obj.code == obj2.code && obj.element.isEqualNode(obj2.element);
			})
		});
		//return _.filter(currentMessages, function(obj){ return !_.findWhere(prevMessages, obj); });
	};
	this.serializeMessageToJson = function (list) {
		return JSON.stringify(list, function (key, value) {
			if (key == "cloned" || key == "element") {
				return "";
			} else {
				return value;
			}
		})
	};
	this.output = function (msg) {
		// Simple output for now.
		var typeName = 'UNKNOWN';
		switch (msg.type) {
		case HTMLCS.ERROR:
			typeName = 'ERROR';
			break;

		case HTMLCS.WARNING:
			typeName = 'WARNING';
			break;

		case HTMLCS.NOTICE:
			typeName = 'NOTICE';
			break;
		} //end switch

		var nodeName = '';
		if (msg.element) {
			nodeName = msg.element.nodeName.toLowerCase();
		}

		var elementId = '';
		if (msg.element.id && (msg.element.id !== '')) {
			elementId = '#' + msg.element.id;
		}

		// Clone the node to get it's outerHTML (with inner replaced with ... for brevity)
		var html = '';
		if (msg.element.outerHTML) {
			var node = msg.element.cloneNode(true);
			node.innerHTML = '...';
			html = node.outerHTML;
		}

		console.log('[HTMLCS] ' + typeName + '|' + msg.code + '|' + nodeName + '|' + elementId + '|' + msg.msg + '|' + html);
		console.log('debug msg ' + JSON.stringify(msg));
	};

};
