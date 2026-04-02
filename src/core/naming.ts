export function stripControllerSuffix(tag: string): string {
  return tag.replace(/Controller$/, '');
}

export function pascalToKebab(value: string): string {
  return stripControllerSuffix(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export function makeApiPathEnumMember(method: string, url: string, operationId?: string): string {
  const base = operationId ?? `${method}${url}`;
  const member = base
    .split('/')
    .map((part) => {
      const capitalised = part.charAt(0).toUpperCase() + part.slice(1);
      return capitalised.replace(/{.*}|:.*|[^a-zA-Z\d_]+/g, '');
    })
    .join('');

  if (!member) {
    return 'Path';
  }

  if (/^[0-9]/.test(member)) {
    return `_${member}`;
  }

  return member;
}
