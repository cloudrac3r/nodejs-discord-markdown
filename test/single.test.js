const markdown = require('../index');

test('Converts **text** to <strong>text</strong>', () => {
	expect(markdown.toHTML('This is a **test** with **some bold** text in it'))
		.toBe('This is a <strong>test</strong> with <strong>some bold</strong> text in it');
});

test('Converts _text_ to <em>text</em>', () => {
	expect(markdown.toHTML('This is a _test_ with _some italicized_ text in it'))
		.toBe('This is a <em>test</em> with <em>some italicized</em> text in it');
});

test('Converts _ text_ to <em> text </em>', () => {
	expect(markdown.toHTML('This is a _ test_ with _ italic _ text in it'))
		.toBe('This is a <em> test</em> with <em> italic </em> text in it');
});

test('Converts __text__ to <u>text</u>', () => {
	expect(markdown.toHTML('This is a __test__ with __some underlined__ text in it'))
		.toBe('This is a <u>test</u> with <u>some underlined</u> text in it');
});

test('Converts *text* to <em>text</em>', () => {
	expect(markdown.toHTML('This is a *test* with *some italicized* text in it'))
		.toBe('This is a <em>test</em> with <em>some italicized</em> text in it');
});

test('Converts `text` to <code>text</code>', () => {
	expect(markdown.toHTML('Code: `1 + 1 = 2`'))
		.toBe('Code: <code>1 + 1 = 2</code>');
});

test('Converts ~~text~~ to <del>text</del>', () => {
	expect(markdown.toHTML('~~this~~that'))
		.toBe('<del>this</del>that');
});

test('Converts ~~ text ~~ to <del>', () => {
	expect(markdown.toHTML('~~ text ~~ stuffs'))
		.toBe('<del> text </del> stuffs');
});

test('Converts links to <a> links', () => {
	expect(markdown.toHTML('https://brussell.me'))
		.toBe('<a href="https://brussell.me">https://brussell.me</a>');

	expect(markdown.toHTML('<https://brussell.me>'))
		.toBe('<a href="https://brussell.me">https://brussell.me</a>');
});

test('Fence normal code blocks', () => {
	expect(markdown.toHTML('text\n```\ncode\nblock\n```\nmore text'))
		.toBe('text<br><pre><code>code\nblock</code></pre><br>more text');
});

test('Fenced code blocks on one line', () => {
	expect(markdown.toHTML('`test`\n\n```test```'))
		.toBe('<code>test</code><br><br><pre><code>test</code></pre>');
});

test('Escaped marks', () => {
	expect(markdown.toHTML('Code: \\`1 + 1` = 2`'))
		.toBe('Code: `1 + 1<code>= 2</code>');
});

test('Multiline', () => {
	expect(markdown.toHTML('multi\nline'))
		.toBe('multi<br>line');
	expect(markdown.toHTML('some *awesome* text\nthat **spreads** lines'))
		.toBe('some <em>awesome</em> text<br>that <strong>spreads</strong> lines');
});

test('Block quotes', () => {
	expect(markdown.toHTML('> text > here'))
		.toBe('<blockquote>text &gt; here</blockquote>');
	expect(markdown.toHTML('> text\nhere'))
		.toBe('<blockquote>text<br></blockquote>here');
	expect(markdown.toHTML('>text'))
		.toBe('&gt;text');
	expect(markdown.toHTML('outside\n>>> inside\ntext\n> here\ndoes not end'))
		.toBe('outside<br><blockquote>inside<br>text<br>&gt; here<br>does not end</blockquote>');
	expect(markdown.toHTML('>>> test\n```js\ncode```'))
		.toBe('<blockquote>test<br><pre><code>code</code></pre></blockquote>');
	expect(markdown.toHTML('> text\n> \n> here'))
		.toBe('<blockquote>text<br><br>here</blockquote>');
	expect(markdown.toHTML('text\n\n> Lorem ipsum\n>> Lorem ipsum\n> Lorem ipsum\n> > Lorem ipsum\n> Lorem ipsum\n\nLorem ipsum\n\n> Lorem ipsum\n\nLorem ipsum\n\n>>> text\ntext\ntext\n'))
		.toBe('text<br><br><blockquote>Lorem ipsum<br></blockquote>&gt;&gt; Lorem ipsum<br><blockquote>Lorem ipsum<br>&gt; Lorem ipsum<br>Lorem ipsum<br></blockquote><br>Lorem ipsum<br><br><blockquote>Lorem ipsum<br></blockquote><br>Lorem ipsum<br><br><blockquote>text<br>text<br>text<br></blockquote>');
});

test('don\'t drop arms', () => {
	expect(markdown.toHTML('¯\\_(ツ)_/¯'))
		.toBe('¯\\_(ツ)_/¯');
	expect(markdown.toHTML('¯\\_(ツ)_/¯ *test* ¯\\_(ツ)_/¯'))
		.toBe('¯\\_(ツ)_/¯ <em>test</em> ¯\\_(ツ)_/¯');
});

test('embeds and messages have [label](link)', () => {
	expect(markdown.toHTML('[label](http://example.com)'))
		.toBe('<a href="http://example.com">label</a>');
	expect(markdown.toHTML('[label](http://example.com)', { embed: true }))
		.toBe('<a href="http://example.com">label</a>');
});

test('escape html', () => {
	expect(markdown.toHTML('<b>test</b>'))
		.toBe('&lt;b&gt;test&lt;/b&gt;');
	expect(markdown.toHTML('```\n\n<b>test</b>\n```'))
		.toBe('<pre><code>&lt;b&gt;test&lt;/b&gt;</code></pre>');
});


test('don\'t escape too many characters', () => {
	expect(markdown.toHTML('& then he said, **"you & her can\'t do that!"**'))
		.toBe('&amp; then he said, <strong>"you &amp; her can\'t do that!"</strong>');
});

test('don\'t escape html if set', () => {
	expect(markdown.toHTML('<b>test</b>', { escapeHTML: false }))
		.toBe('<b>test</b>');
});

test('Supports headings', () => {
	expect(markdown.toHTML('# This is a h1 text!#  \n## This is a h2 text!#  \nMessage'))
		.toBe('<h1>This is a h1 text!</h1><h2>This is a h2 text!</h2>Message');
})

test('Supports ordered list', () => {
	expect(markdown.toHTML('Message\n1. List dash\n 2. List point\n 3. Another list point\nMessage'))
		.toBe('Message<br><ol start="1"><li>List dash<br><ol start="2"><li>List point</li><li>Another list point</li></ol></li></ol>Message');
})

test('Supports unordered list', () => {
	expect(markdown.toHTML('Message\n- List dash\n - List point\nMessage'))
		.toBe('Message<br><ul><li>List dash<br><ul><li>List point</li></ul></li></ul>Message');
})
