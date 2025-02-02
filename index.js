const markdown = require('simple-markdown');

var SANITIZE_TEXT_R = /[<>&]/g;
/** @type {any} */
var SANITIZE_TEXT_CODES = {
    '<': '&lt;',
	 '>': '&gt;',
    '&': '&amp;',
};
/**
 * Only safe to use for text that will be displayed inside elements, not in its attributes or other contexts!
 * Otherwise, use markdown.sanitizeText.
 * @param {SimpleMarkdown.Attr} text
 * @returns {string}
 */
var sanitizeTextNonAttribute = function(text /* : Attr */) {
    return String(text).replace(SANITIZE_TEXT_R, function(chr) {
        return SANITIZE_TEXT_CODES[chr];
    });
};

function htmlTag(tagName, content, attributes, isClosed = true, state = { }) {
	if (typeof isClosed === 'object') {
		state = isClosed;
		isClosed = true;
	}

	if (!attributes)
		attributes = { };

	let attributeString = '';
	for (let attr in attributes) {
		// Removes falsy attributes
		if (Object.prototype.hasOwnProperty.call(attributes, attr))
			attributeString += ` ${markdown.sanitizeText(attr)}="${markdown.sanitizeText(attributes[attr])}"`;
	}

	let unclosedTag = `<${tagName}${attributeString}>`;

	if (isClosed)
		return unclosedTag + content + `</${tagName}>`;
	return unclosedTag;
}
markdown.htmlTag = htmlTag;

const rules = {
	blockQuote: Object.assign({ }, markdown.defaultRules.blockQuote, {
		match: function(source, state, prevSource) {
			return !/^$|\n *$/.test(prevSource) || state.inQuote ? null : /^( *>>> ([\s\S]*))|^( *> [^\n]*(\n *> [^\n]*)*\n?)/.exec(source);
		},
		parse: function(capture, parse, state) {
			const all = capture[0];
			const isBlock = Boolean(/^ *>>> ?/.exec(all));
			const removeSyntaxRegex = isBlock ? /^ *>>> ?/ : /^ *> ?/gm;
			const content = all.replace(removeSyntaxRegex, '');

			return {
				content: parse(content, Object.assign({ }, state, { inQuote: true })),
				type: 'blockQuote'
			}
		}
	}),
	codeBlock: Object.assign({ }, markdown.defaultRules.codeBlock, {
		match: markdown.inlineRegex(/^```(([a-z0-9-]+?)\n+)?\n*([^]+?)\n*```/i),
		parse: function(capture, parse, state) {
			return {
				lang: (capture[2] || '').trim(),
				content: capture[3] || '',
				inQuote: state.inQuote || false
			};
		},
		html: (node, output, state) => {
			return htmlTag('pre', htmlTag(
				'code', sanitizeTextNonAttribute(node.content), {}, state
			), null, state);
		}
	}),
	newline: markdown.defaultRules.newline,
	escape: markdown.defaultRules.escape,
	link: markdown.defaultRules.link,
	autolink: Object.assign({ }, markdown.defaultRules.autolink, {
		parse: capture => {
			return {
				content: [{
					type: 'text',
					content: capture[1]
				}],
				target: capture[1]
			};
		},
		html: (node, output, state) => {
			return htmlTag('a', output(node.content, state), { href: markdown.sanitizeUrl(node.target) }, state);
		}
	}),
	url: Object.assign({ }, markdown.defaultRules.url, {
		parse: capture => {
			return {
				content: [{
					type: 'text',
					content: capture[1]
				}],
				target: capture[1]
			}
		},
		html: (node, output, state) => {
			return htmlTag('a', output(node.content, state), { href: markdown.sanitizeUrl(node.target) }, state);
		}
	}),
	em: Object.assign({ }, markdown.defaultRules.em, {
		parse: function(capture, parse, state) {
			const parsed = markdown.defaultRules.em.parse(capture, parse, Object.assign({ }, state, { inEmphasis: true }));
			return state.inEmphasis ? parsed.content : parsed;
		},
	}),
	strong: markdown.defaultRules.strong,
	u: markdown.defaultRules.u,
	strike: Object.assign({ }, markdown.defaultRules.del, {
		match: markdown.inlineRegex(/^~~([\s\S]+?)~~(?!_)/),
	}),
	heading: {
		order: markdown.defaultRules.heading.order,
		match: (source, state) => {
			if (state.prevCapture && !state.prevCapture[0].endsWith("\n")) return null; // Make sure it's at the start of a line
			return /^(#{1,3}) +([^#\n].*?)#* *(?:\n *)*(?:\n|$)/.exec(source)
		},
		parse: markdown.defaultRules.heading.parse,
		html: markdown.defaultRules.heading.html
	},
	list: {
		order: markdown.defaultRules.list.order,
		match: (source, state) => {
			var prevCaptureStr = state.prevCapture == null ? "" : state.prevCapture[0];
			var isStartOfLineCapture = /(?:^|\n)( *)$/.exec(prevCaptureStr);

			if (isStartOfLineCapture) {
				source = isStartOfLineCapture[1] + source;
				return /^( *)((?:[*-]|\d+\.)) [\s\S]+?(?:\n{1,}(?! )(?!\1(?:[*-]|\d+\.) )\n*|\s*\n*$)/.exec(source);
			} else {
				return null;
			}
		},
		parse: markdown.defaultRules.list.parse,
		html: markdown.defaultRules.list.html
	},
	inlineCode: Object.assign({ }, markdown.defaultRules.inlineCode, {
		match: source => markdown.defaultRules.inlineCode.match.regex.exec(source),
		html: function(node, output, state) {
			return htmlTag('code', sanitizeTextNonAttribute(node.content.trim()), null, state);
		}
	}),
	text: Object.assign({ }, markdown.defaultRules.text, {
		match: source => /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff-]|\n\n|\n|\w+:\S|$)/.exec(source),
		html: function(node, output, state) {
			if (state.escapeHTML)
				return sanitizeTextNonAttribute(node.content);

			return node.content;
		}
	}),
	emoticon: {
		order: markdown.defaultRules.text.order,
		match: source => /^(¯\\_\(ツ\)_\/¯)/.exec(source),
		parse: function(capture) {
			return {
				type: 'text',
				content: capture[1]
			};
		},
		html: function(node, output, state) {
			return output(node.content, state);
		},
	},
	br: Object.assign({ }, markdown.defaultRules.br, {
		match: markdown.anyScopeRegex(/^\n/),
	}),
	spoiler: {
		order: 0,
		match: source => /^\|\|([\s\S]+?)\|\|/.exec(source),
		parse: function(capture, parse, state) {
			return {
				content: parse(capture[1], state)
			};
		},
		html: function(node, output, state) {
			return htmlTag('span', output(node.content, state), { 'data-mx-spoiler': '' }, state)
		}
	}
};

const discordCallbackDefaults = {
	user: node => '@' + sanitizeTextNonAttribute(node.id),
	channel: node => '#' + sanitizeTextNonAttribute(node.id),
	role: node => '&' + sanitizeTextNonAttribute(node.id),
	everyone: () => '@everyone',
	here: () => '@here'
};

const rulesDiscord = {
	discordUser: {
		order: markdown.defaultRules.strong.order,
		match: source => /^<@!?([0-9]*)>/.exec(source),
		parse: function(capture) {
			return {
				id: capture[1]
			};
		},
		html: function(node, output, state) {
			return state.discordCallback.user(node)
		}
	},
	discordChannel: {
		order: markdown.defaultRules.strong.order,
		match: source => /^<#?([0-9]*)>/.exec(source),
		parse: function(capture) {
			return {
				id: capture[1]
			};
		},
		html: function(node, output, state) {
			return state.discordCallback.channel(node)
		}
	},
	discordRole: {
		order: markdown.defaultRules.strong.order,
		match: source => /^<@&([0-9]*)>/.exec(source),
		parse: function(capture) {
			return {
				id: capture[1]
			};
		},
		html: function(node, output, state) {
			return state.discordCallback.role(node)
		}
	},
	discordEmoji: {
		order: markdown.defaultRules.strong.order,
		match: source => /^<(a?):(\w+):(\d+)>/.exec(source),
		parse: function(capture) {
			return {
				animated: capture[1] === "a",
				name: capture[2],
				id: capture[3],
			};
		},
		html: function(node, output, state) {
			if (state.discordCallback && state.discordCallback.emoji) {
				// allow matrix to deal with this further
				return state.discordCallback.emoji(node)
			} else {
				// standard image rendering
				return htmlTag('img', '', {
					class: `d-emoji${node.animated ? ' d-emoji-animated' : ''}`,
					src: `https://cdn.discordapp.com/emojis/${node.id}.${node.animated ? 'gif' : 'png'}`,
					alt: `:${node.name}:`
				}, false, state);
			}
		}
	},
	discordEveryone: {
		order: markdown.defaultRules.strong.order,
		match: source => /^@everyone/.exec(source),
		parse: function() {
			return { };
		},
		html: function(node, output, state) {
			return state.discordCallback.everyone(node)
		}
	},
	discordHere: {
		order: markdown.defaultRules.strong.order,
		match: source => /^@here/.exec(source),
		parse: function() {
			return { };
		},
		html: function(node, output, state) {
			return state.discordCallback.here(node)
		}
	}
};

Object.assign(rules, rulesDiscord);

const rulesDiscordOnly = Object.assign({ }, rulesDiscord, {
	text: Object.assign({ }, markdown.defaultRules.text, {
		match: source => /^[\s\S]+?(?=[^0-9A-Za-z\s\u00c0-\uffff-]|\n\n|\n|\w+:\S|$)/.exec(source),
		html: function(node, output, state) {
			if (state.escapeHTML)
				return sanitizeTextNonAttribute(node.content);

			return node.content;
		}
	})
});

const parser = markdown.parserFor(rules);
const htmlOutput = markdown.htmlFor(markdown.ruleOutput(rules, 'html'));
const parserDiscord = markdown.parserFor(rulesDiscordOnly);
const htmlOutputDiscord = markdown.htmlFor(markdown.ruleOutput(rulesDiscordOnly, 'html'));

/**
 * Parse markdown and return the HTML output
 * @param {String} source Source markdown content
 * @param {Object} [options] Options for the parser
 * @param {Boolean} [options.escapeHTML=true] Escape HTML in the output
 * @param {Boolean} [options.discordOnly=false] Only parse Discord-specific stuff (such as mentions)
 * @param {Object} [options.discordCallback] Provide custom handling for mentions and emojis
 * @returns {string}
 */
function toHTML(source, options, customParser, customHtmlOutput) {
	if ((customParser || customHtmlOutput) && (!customParser || !customHtmlOutput))
		throw new Error('You must pass both a custom parser and custom htmlOutput function, not just one');

	options = Object.assign({
		escapeHTML: true,
		discordOnly: false,
		discordCallback: { }
	}, options || { });

	let _parser = parser;
	let _htmlOutput = htmlOutput;
	if (customParser) {
		_parser = customParser;
		_htmlOutput = customHtmlOutput;
	} else if (options.discordOnly) {
		_parser = parserDiscord;
		_htmlOutput = htmlOutputDiscord;
	}

	const state = {
		inline: true,
		inQuote: false,
		inEmphasis: false,
		escapeHTML: options.escapeHTML,
		discordCallback: Object.assign({ }, discordCallbackDefaults, options.discordCallback)
	};

	return _htmlOutput(_parser(source, state), state);
}

module.exports = {
	parser: source => parser(source, { inline: true }),
	htmlOutput,
	toHTML,
	rules,
	rulesDiscordOnly,
	markdownEngine: markdown,
	htmlTag
};
