[ode-ts-client](../README.md) / [Exports](../modules.md) / IUserPreferences

# Interface: IUserPreferences

## Table of contents

### Properties

- [data](IUserPreferences.md#data)

### Methods

- [get](IUserPreferences.md#get)
- [load](IUserPreferences.md#load)
- [save](IUserPreferences.md#save)
- [update](IUserPreferences.md#update)

## Properties

### data

• **data**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `apps` | `any` |
| `authenticatedConnectorsAccessed` | `any` |
| `blog` | `any` |
| `cas` | `any` |
| `cursus` | `any` |
| `exercizer` | `any` |
| `explorer` | `any` |
| `infotip` | `any` |
| `language` | `any` |
| `mindmap` | `any` |
| `portal` | `any` |
| `rgpdCookies` | `any` |
| `timeline` | `any` |
| `video` | `any` |
| `widgets` | `any` |

## Methods

### get

▸ **get**(`key`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`UserPreferenceKey`](../modules.md#userpreferencekey) |

#### Returns

`any`

___

### load

▸ **load**(`key`, `defaultTo?`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`UserPreferenceKey`](../modules.md#userpreferencekey) |
| `defaultTo?` | `any` |

#### Returns

`Promise`<`any`\>

___

### save

▸ **save**(`key`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`UserPreferenceKey`](../modules.md#userpreferencekey) |

#### Returns

`Promise`<`void`\>

___

### update

▸ **update**(`key`, `data`): [`IUserPreferences`](IUserPreferences.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | [`UserPreferenceKey`](../modules.md#userpreferencekey) |
| `data` | `any` |

#### Returns

[`IUserPreferences`](IUserPreferences.md)
