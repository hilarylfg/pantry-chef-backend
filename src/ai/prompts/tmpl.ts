export function tmpl(
	strings: TemplateStringsArray,
	...values: unknown[]
): string {
	let out = ''

	for (let i = 0; i < strings.length; i++) {
		out += strings[i]
		if (i < values.length) {
			const v = values[i]
			if (v == null) continue
			out += Array.isArray(v) ? v.join('\n') : String(v)
		}
	}

	return out.replace(/^\n+/, '').replace(/\n+$/, '')
}
