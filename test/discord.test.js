const markdown = require('../index');

test('user parsing', () => {
	expect(markdown.toHTML('hey <@1234>!'))
		.toBe('hey <span class="d-mention d-user">@1234</span>!');
});

test('custom user parsing', () => {
	expect(markdown.toHTML('hey <@1234>!', {
		discordCallback: { user: node => {
			return '++@' + node.id + '++';
		}}
	})).toBe('hey <span class="d-mention d-user">++@1234++</span>!');
});

test('channel parsing', () => {
	expect(markdown.toHTML('goto <#1234>, please'))
		.toBe('goto <span class="d-mention d-channel">#1234</span>, please');
});

test('custom channel parsing', () => {
	expect(markdown.toHTML('goto <#1234>, please', {
		discordCallback: { channel: node => {
			return '++#' + node.id + '++';
		}}
	})).toBe('goto <span class="d-mention d-channel">++#1234++</span>, please');
});

test('role parsing', () => {
	expect(markdown.toHTML('is any of <@&1234> here?'))
		.toBe('is any of <span class="d-mention d-role">&1234</span> here?');
});

test('custom role parsing', () => {
	expect(markdown.toHTML('is any of <@&1234> here?', {
		discordCallback: { role: node => {
			return '++&' + node.id + '++';
		}}
	})).toBe('is any of <span class="d-mention d-role">++&1234++</span> here?');
});

test('emoji parsing', () => {
	expect(markdown.toHTML('heh <:blah:1234>'))
		.toBe('heh <span class="d-emoji">:blah:</span>');
});

test('custom emoji parsing', () => {
	expect(markdown.toHTML('heh <:blah:1234>', {
		discordCallback: { emoji: node => {
			return '++:' + node.id + ':++';
		}}
	})).toBe('heh <span class="d-emoji">++:1234:++</span>');
});

test('everyone mentioning', () => {
	expect(markdown.toHTML('Hey @everyone!', {
		discordCallback: {
			everyone: () => {
				return '++everyone++';
			}
		}
	})).toBe('Hey <span class="d-mention d-user">++everyone++</span>!');
});

test('here mentioning', () => {
	expect(markdown.toHTML('Hey @here!', {
		discordCallback: {
			here: () => {
				return '++here++';
			}
		}
	})).toBe('Hey <span class="d-mention d-user">++here++</span>!');
});

test('don\'t parse stuff in code blocks', () => {
	expect(markdown.toHTML('`<@1234>`'))
		.toBe('<code>&lt;@1234&gt;</code>');
});

test('animated emojis work', () => {
	expect(markdown.toHTML('heh <a:blah:1234>', {
		discordCallback: { emoji: node => {
			return '++' + (node.animated ? 'animated' : '') + ':' + node.id + ':++';
		}}
	})).toBe('heh <span class="d-emoji d-emoji-animated">++animated:1234:++</span>');
});

test('with discord-only don\'t parse normal stuff', () => {
	expect(markdown.toHTML('*yay* <@123456>', { discordOnly: true }))
		.toBe('*yay* <span class="d-mention d-user">@123456</span>');
});

test('spoilers are handled correctly', () => {
	expect(markdown.toHTML('||spoiler||'))
		.toBe('<span class="d-spoiler" data-mx-spoiler="">spoiler</span>');
	expect(markdown.toHTML('|| spoiler ||'))
		.toBe('<span class="d-spoiler" data-mx-spoiler=""> spoiler </span>');
	expect(markdown.toHTML('|| spoiler | message ||'))
		.toBe('<span class="d-spoiler" data-mx-spoiler=""> spoiler | message </span>');
	expect(markdown.toHTML('a ||spoiler|| may have ||multiple\nlines||'))
		.toBe('a <span class="d-spoiler" data-mx-spoiler="">spoiler</span> may have <span class="d-spoiler" data-mx-spoiler="">multiple<br>lines</span>');
	expect(markdown.toHTML('||strange||markdown||'))
		.toBe('<span class="d-spoiler" data-mx-spoiler="">strange</span>markdown||');
	expect(markdown.toHTML('||<i>itallics</i>||'))
		.toBe('<span class="d-spoiler" data-mx-spoiler="">&lt;i&gt;itallics&lt;/i&gt;</span>');
	expect(markdown.toHTML('||```\ncode\nblock\n```||'))
		.toBe('<span class="d-spoiler" data-mx-spoiler=""><pre><code class="hljs">code\nblock</code></pre></span>');
});
