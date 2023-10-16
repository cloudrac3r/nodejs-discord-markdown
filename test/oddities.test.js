const markdown = require('../index');

test('Unmatched mark', () => {
	expect(markdown.toHTML('`Inline `code` with extra marker'))
		.toBe('<code>Inline</code>code` with extra marker');
});

test('* next to space', () => {
	expect(markdown.toHTML('*Hello World! *'))
		.toBe('*Hello World! *');
});

test('Triple *s', () => {
	expect(markdown.toHTML('***underlined bold***'))
		.toBe('<em><strong>underlined bold</strong></em>');
});

test('Inline code with ` inside', () => {
	expect(markdown.toHTML('``function test() { return "`" }``'))
		.toBe('<code>function test() { return "`" }</code>');
});

test('Code blocks aren\'t parsed', () => {
	expect(markdown.toHTML('some\n    text'))
		.toBe('some<br>    text');
});

test('multiple new lines', () => {
	expect(markdown.toHTML('some\n\ntext'))
		.toBe('some<br><br>text');
});

test('no undserscore italic in one word', () => {
	expect(markdown.toHTML('test_ing_stuff'))
		.toBe('test_ing_stuff');
});

test('Spoiler edge-cases', () => {
	expect(markdown.toHTML('||||'))
		.toBe('||||');
	expect(markdown.toHTML('|| ||'))
		.toBe('<span data-mx-spoiler=""> </span>');
	expect(markdown.toHTML('||||||'))
		.toBe('<span data-mx-spoiler="">|</span>|');
});

test('Nested <em>', () => {
	expect(markdown.toHTML('_hello world *foo bar* hello world_'))
		.toBe('<em>hello world foo bar hello world</em>');
	expect(markdown.toHTML('_hello world *foo __blah__ bar* hello world_'))
		.toBe('<em>hello world foo <u>blah</u> bar hello world</em>');
	expect(markdown.toHTML('_hello *world*_ not em *foo*'))
		.toBe('<em>hello world</em> not em <em>foo</em>');
});

test('Header edge-cases 1', () => {
	expect(markdown.toHTML('# Big header text#\n## Medium header text#\nMessage\n  ### Not working due to spaces\n### Small header text'))
		.toBe('<h1>Big header text</h1><h2>Medium header text</h2>Message<br>  ### Not working due to spaces<br><h3>Small header text</h3>');
});

test('Header edge-cases 2', () => {
	expect(markdown.toHTML('##Up close\n##    Far away\n## # Doubled up\n### *Nested* __nested__'))
		.toBe('##Up close<br><h2>Far away</h2>## # Doubled up<br><h3><em>Nested</em> <u>nested</u></h3>');
});

test('Header edge-cases 3', () => {
	expect(markdown.toHTML('## ## Doubled up\n## Middle ## middle\n## Double escaped end \\#\\#\n## Double escaped \\#\\# middle\n## Single escaped \\## middle'))
		.toBe('## ## Doubled up<br><h2>Middle ## middle</h2><h2>Double escaped end #\\</h2><h2>Double escaped ## middle</h2><h2>Single escaped ## middle</h2>');
});
