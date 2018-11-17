# discord-markdown
A markdown parser with the same rules as Discord.

> This is still in development. A complete set of tests is needed.
> If you know any special cases of discord markdown let me know or submit a PR.

## Using

```bash
yarn add @brussell98/discord-markdown
```

```js
const { parser, htmlOutput, toHTML } = require('discord-markdown');

console.log(toHTML('This **is** a __test__'));
// => This <strong>is</strong> a <u>test</u>
```

Fenced codeblocks will include highlight.js tags and classes.

### Advanced usage

Discord has custom patterns for user mentions, channel mentions etc. `discord-markdown` provides a way to easily define callbacks so that you can have custom parsing behavior on those.

`discord-markdown` has multiple options to set:

```js
const { toHTML } = require('discord-markdown');
toHTML('This **is** a __test__', options);
```

`options` is here an object, the following properties exist (all are optional):

* `embed`: boolean, if it should parse embed contents (rules are slightly different)
* `discordOnly`: boolean, if it should only parse the discord-specific stuff
* `discordCallback`: object, callbacks used for discord parsing. Each receive an object with different properties, and are expected to return an HTML escaped string
 * `user`: (`id`: number)
 * `channel`: (`id`: number)
 * `role`: (`id`: number)
 * `emoji`: (`animated`: boolean, `name`: string, `id`: number)

Example:

```js
const { toHTML } = require('discord-markdown');
toHTML('This **is** a __test__ for <@1234>', {
	discordCallback: {
		user: node => {
			// optionally fetch the username of that person based on their userid (node.id)
			return '@' + node.id;
		}
	}
});
```

## Contributing

Find an inconsistency? File an issue, or submit a pull request with the fix and updated test.
