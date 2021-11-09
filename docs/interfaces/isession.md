[ode-ts-client](../README.md) / [Exports](../modules.md) / ISession

# Interface: ISession

## Table of contents

### Properties

- [avatarUrl](isession.md#avatarurl)
- [currentApp](isession.md#currentapp)
- [currentLanguage](isession.md#currentlanguage)
- [description](isession.md#description)
- [notLoggedIn](isession.md#notloggedin)
- [user](isession.md#user)

### Methods

- [hasRight](isession.md#hasright)
- [hasWorkflow](isession.md#hasworkflow)

## Properties

### avatarUrl

• `Readonly` **avatarUrl**: *string*

Get the connected user's avatar URL, or a default one.
Append a query parameter to this URL for it to get resized, for example "?thumbnail=48x48"

___

### currentApp

• `Readonly` **currentApp**: *null* \| [*App*](../modules.md#app)

Retrieve the current main app, @see ConfigureFramework.Platform.apps

___

### currentLanguage

• `Readonly` **currentLanguage**: *string*

___

### description

• `Readonly` **description**: [*IUserDescription*](iuserdescription.md)

___

### notLoggedIn

• `Readonly` **notLoggedIn**: *boolean*

___

### user

• `Readonly` **user**: [*IUserInfo*](iuserinfo.md)

## Methods

### hasRight

▸ **hasRight**(`resource`: *any*, `right`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`resource` | *any* |
`right` | *any* |

**Returns:** *boolean*

___

### hasWorkflow

▸ **hasWorkflow**(`workflowName`: *string*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`workflowName` | *string* |

**Returns:** *boolean*