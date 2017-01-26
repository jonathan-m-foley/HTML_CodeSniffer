/*Provides methods to run scans and diff against previous results*/
var HTMLCS_RUNNER = _global.HTMLCS_RUNNER = new function () {
	//The results of the previous scan
	var prevMessages;
	//The results of the most recent scan
	var currentMessages;
	var self = this;
	/* Runs the scan against the specifed element (e.g. document) using the specified standard (e.g. 'WCAG2AA') */
	this.run = function (standard, el) {
		HTMLCS.process(standard, el, function () { //callback after scan completes
			//retrieve the results of the scan
			var messages = HTMLCS.getMessages();
			//cache the results of the last scan
			prevMessages = currentMessages;
			//transform and cache the results of the latest scan
			currentMessages = self.formatMessages(messages);
			//TODO - incorporate summary information? I don't think we'll use this but commenting out for now.
			/*var length = messages.length;
			var msgCount = {};
			msgCount[HTMLCS.ERROR] = 0;
			msgCount[HTMLCS.WARNING] = 0;
			msgCount[HTMLCS.NOTICE] = 0;

			for (var i = 0; i < length; i++) {
			//self.output(messages[i]);
			msgCount[messages[i].type]++;
			}*/
			console.log('done');
		}, function () {
			console.log('Something in HTML_CodeSniffer failed to parse. Cannot run.');
			console.log('done');
		});
	};
	/* Take a node and a clone of said node and creates a properties object containing a cssSelector (for the node) and the outerHTML (for the clone with innerHTML removed)*/
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
	/* Takes a collection of messages (i.e.issues reported by the scan) and stores a clone of the element and a node properties object for and in each message */
	this.formatMessages = function (mess) {
		return _.map(mess, function (el) {
			var c = el.element.cloneNode(false);
			el.cloned = c;
			el.nodeProps = self.getNodeProps(el.element, c);
			return el;
		});
	};
	/* Computes and returns those messages that were present in the cached, previous results of the scan that are not present in the latest scan results (i.e issues that are no longer present)*/
	this.removedDiff = function () {
		return _.filter(prevMessages, function (obj) {
			return !_.find(currentMessages, function (obj2) {
				return obj.code == obj2.code && obj.data == obj2.data && obj.msg == obj2.msg && obj.type == obj2.type && obj.element == obj2.element;
			})
		});
	};
	/* Computes and returns those messages that are present in the latest scan results that were not present in the cached, previous results of the scan (i.e. new issues)*/
	this.addedDiff = function () {
		return _.filter(currentMessages, function (obj) {
			return !_.find(prevMessages, function (obj2) {
				return obj.code == obj2.code && obj.data == obj2.data && obj.msg == obj2.msg && obj.type == obj2.type && obj.element == obj2.element;
			})
		});
	};
	/* Returns a JSON representation of a list of messages. This does not attempt to serialize dom nodes (JSON.Stringify can't do that) but the node properties stored in each message are serialized, providing a css selector for the element and the outerHTML of said element.*/
	this.serializeMessageToJson = function (list) {
		return JSON.stringify(list, function (key, value) {
			if (key == "cloned" || key == "element") {
				return "";
			} else {
				return value;
			}
		})
	};
	//Hold over from code in the upstream repository -- currently unused
	//TODO consider for removal
	/*
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
	 */
};
