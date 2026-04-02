# Discriminator Object

Source:
- https://spec.openapis.org/oas/v3.1.1.html#discriminator-object

## Purpose

The discriminator helps clients choose a schema variant from a shared property
value, usually in combination with `oneOf`, `anyOf`, or `allOf`.

## Fixed field

- `propertyName`: the payload property that carries the discriminator value.

## Mapping

Mapping lets the spec associate explicit discriminator values with schema refs.
Without an explicit mapping, tooling may infer values from schema names.

## Practical conditions

- The discriminator is mainly useful for object schemas.
- The discriminator property is usually required on the target variants.
- Consumers should keep the mapping and schema references consistent.

## Generator implications

- Child schemas can often be rendered as `Omit<Base, "kind"> & { kind: "Child" }`.
- Mapping-aware generators should prefer explicit mappings over inferred names.
- When the schema graph is ambiguous, a conservative fallback is safer than
  inventing a wrong variant tag.
