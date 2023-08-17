const markdown = require('../index');

test('user parsing', () => {
	expect(markdown.toHTML('hey <@1234>!'))
		.toBe('hey @1234!');
});

test('custom user parsing', () => {
	expect(markdown.toHTML('hey <@1234>!', {
		discordCallback: { user: node => {
			return '++@' + node.id + '++';
		}}
	})).toBe('hey ++@1234++!');
});

test('channel parsing', () => {
	expect(markdown.toHTML('goto <#1234>, please'))
		.toBe('goto #1234, please');
});

test('custom channel parsing', () => {
	expect(markdown.toHTML('goto <#1234>, please', {
		discordCallback: { channel: node => {
			return '++#' + node.id + '++';
		}}
	})).toBe('goto ++#1234++, please');
});

test('role parsing', () => {
	expect(markdown.toHTML('is any of <@&1234> here?'))
		.toBe('is any of &1234 here?');
});

test('custom role parsing', () => {
	expect(markdown.toHTML('is any of <@&1234> here?', {
		discordCallback: { role: node => {
			return '++&' + node.id + '++';
		}}
	})).toBe('is any of ++&1234++ here?');
});

test('emoji parsing', () => {
	expect(markdown.toHTML('heh <:blah:1234>'))
		.toBe('heh <img class="d-emoji" src="https://cdn.discordapp.com/emojis/1234.png" alt=":blah:">');
});

test('everyone mentioning', () => {
	expect(markdown.toHTML('Hey @everyone!', {
		discordCallback: {
			everyone: () => {
				return '++everyone++';
			}
		}
	})).toBe('Hey ++everyone++!');
});

test('here mentioning', () => {
	expect(markdown.toHTML('Hey @here!', {
		discordCallback: {
			here: () => {
				return '++here++';
			}
		}
	})).toBe('Hey ++here++!');
});

test('don\'t parse stuff in code blocks', () => {
	expect(markdown.toHTML('`<@1234>`'))
		.toBe('<code>&lt;@1234&gt;</code>');
});

test('animated emojis work', () => {
	expect(markdown.toHTML('heh <a:blah:1234>', ))
		.toBe('heh <img class="d-emoji d-emoji-animated" src="https://cdn.discordapp.com/emojis/1234.gif" alt=":blah:">');
});

test('with discord-only don\'t parse normal stuff', () => {
	expect(markdown.toHTML('*yay* <@123456>', { discordOnly: true }))
		.toBe('*yay* @123456');
});

test('spoilers are handled correctly', () => {
	expect(markdown.toHTML('||spoiler||'))
		.toBe('<span data-mx-spoiler="">spoiler</span>');
	expect(markdown.toHTML('|| spoiler ||'))
		.toBe('<span data-mx-spoiler=""> spoiler </span>');
	expect(markdown.toHTML('|| spoiler | message ||'))
		.toBe('<span data-mx-spoiler=""> spoiler | message </span>');
	expect(markdown.toHTML('a ||spoiler|| may have ||multiple\nlines||'))
		.toBe('a <span data-mx-spoiler="">spoiler</span> may have <span data-mx-spoiler="">multiple<br>lines</span>');
	expect(markdown.toHTML('||strange||markdown||'))
		.toBe('<span data-mx-spoiler="">strange</span>markdown||');
	expect(markdown.toHTML('||<i>itallics</i>||'))
		.toBe('<span data-mx-spoiler="">&lt;i&gt;itallics&lt;/i&gt;</span>');
	expect(markdown.toHTML('||```\ncode\nblock\n```||'))
		.toBe('<span data-mx-spoiler=""><pre><code>code\nblock</code></pre></span>');
});
