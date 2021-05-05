import { Observable } from "rxjs";

//------------------------- Data types
//-- Error codes 
export const ERROR_CODE = {
  SUCCESS:          "0000"
 ,UNKNOWN:          "0010"
 ,NOT_INITIALIZED:  "0020"
 ,NOT_SUPPORTED:    "0030"
 ,APP_NOT_FOUND:    "0040"
 ,AGENT_NOT_FOUND:  "0050"
} as const;
export type ErrorCode = typeof ERROR_CODE[keyof typeof ERROR_CODE];

//-- Applications
export const APP = {
  EXPLORER:   "explorer"
 ,BLOG:       "blog"
 ,EXERCIZER:  "exercizer"
 // TODO compléter
} as const;
export type App = typeof APP[keyof typeof APP];   // type App = "explorer" | "blog" | "exercizer"...

//-- Resources
export const RESOURCE = {
  FOLDER:     "folder"
 ,BLOG:       "blog"
 ,EXERCISE:   "exercise"
} as const;
export type ResourceType = typeof RESOURCE[keyof typeof RESOURCE];

//-- App/Resource link
export const appNameForResource:{[R in ResourceType]: App} = {
  "folder":   APP.EXPLORER
, "blog":     APP.BLOG
, "exercise": APP.EXERCIZER
} as const;

//-- Actions (toaster)
export const ACTION = {
  INITIALIZE: "initialize"
 ,SEARCH:     "search"
 ,CREATE:     "create"
 ,OPEN:       "open"
 ,MANAGE:     "manage"      // Query properties metadata
 ,UPD_PROPS:  "properties"  // Update properties
 ,COMMENT:    "comment"
 ,DELETE:     "delete"
 ,MOVE:       "move"
 ,COPY:       "copy"
 ,EXPORT:     "export"
 ,SHARE:      "share"
 ,PUBLISH:    "publish"
 ,PRINT:      "print"
} as const;
export type ActionType = typeof ACTION[keyof typeof ACTION];

//-- Folders
export const FOLDER = {
  BIN:       "bin"
 ,DEFAULT:   "default"
} as const;
export type FolderType = typeof FOLDER[keyof typeof FOLDER];

//-- Filters
export const BOOLEAN_FILTER = {
  OWNER:      "owner"
 ,SHARED:     "shared"
 ,PUBLIC:     "public"
 ,FAVORITE:   "favorite"
} as const;
export type BooleanFilterType = typeof BOOLEAN_FILTER[keyof typeof BOOLEAN_FILTER];
export const STRING_FILTER = {
//  FOLDER:     "folder" // is instead an ID
} as const;
export type StringFilterType = typeof STRING_FILTER[keyof typeof STRING_FILTER];

//-- Sort orders
export const SORT_ORDER = {
 ASC:   "asc"
,DESC:  "desc"
} as const;
export type SortOrderType = typeof SORT_ORDER[keyof typeof SORT_ORDER];
export const SORT_BY = {
  NAME:         "name"
 ,MODIFY_DATE:  "modifiedAt"
 ,VIEWS:        "views"
 /*
//FIXME On devrait pouvoir trier sur tout champ issu d'un type de ressource (name, createdAt, authorId...) voir IResource
  createdAt: string;
  authorId: string;
  authorName: string;
  modifierId: ID;
  modifierName: string;
  modifiedAt: string;
  folderId?: ID;      // TODO à confirmer
  public?: boolean;
  shared?: boolean;
  favorite?: boolean;
  comments?: number;
*/
} as const;
export type SortByType = typeof SORT_BY[keyof typeof SORT_BY];

//-- Semantique
export type ID = string;
export type StringFilterValue = {
  value: string;  // Value of the filter (as sent to backend)
  i18n: string;   // Translation key of the filter (as displayed in frontend)
};

//-- Properties management
export const PROP_KEY = {
   TITLE:       "title"
  ,IMAGE:       "image"
  ,COLOR:       "color"
  ,DESCRIPTION: "description"
  ,URL:         "url"
//  ,GENERIC:     "generic"   //NOT USED AT THE MOMENT
} as const;
export type PropKeyType = typeof PROP_KEY[keyof typeof PROP_KEY];

export const PROP_MODE = {
  READONLY:   "RO"
 ,READWRITE:  "RW"
} as const;
export type PropModeType = typeof PROP_MODE[keyof typeof PROP_MODE];

export const PROP_TYPE = {
  TEXT:   "text"
 ,NUMBER: "number"
 ,DATE:   "date"
 ,IMAGE:  "image"
 // TODO more types ? Currencies...
} as const;
export type PropTypeType = typeof PROP_TYPE[keyof typeof PROP_TYPE];

export const PROP_FORMAT = {
  PLAIN:  "plain"   // Plain text or number value, no formatting
  // TODO more format to come ? Full dates, months only, timestamps, regexp....
} as const;
export type PropFormatType = typeof PROP_FORMAT[keyof typeof PROP_FORMAT];

//------------------------- Data models 
//-------------------------------------
export interface ISearchParameters {
//-------------------------------------
  types:ResourceType[];
  app:App;
  filters:FilterValues;
  orders?:OrderValues;
  pagination:IPagination;
  search?:String;
}
//-------------------------------------
export interface ISearchResults {
//-------------------------------------
  folders: IFolder[];
  pagination: IPagination;
  resources: IResource[];
}
//-------------------------------------
export interface IContext extends ISearchResults {
//-------------------------------------
  filters: IFilter[];
  orders: IOrder[];
  actions: IAction[];
  preferences: IPreferences;
}

//-------------------------------------
export interface IAction {
//-------------------------------------
  id: ActionType,
  available: boolean  // L'utilisateur a le droit workflow ou pas
  //FIXME comment relier les actions aux behaviours, qu'on va remplacer.
}

//-------------------------------------
export interface IFolder {
//-------------------------------------
  id: ID;
  name: string;
  type: FolderType | ID;
  childNumber: number; // à minima, 0 ou 1...
}

//-------------------------------------
export interface IFilter {
//-------------------------------------
  id: BooleanFilterType | StringFilterType;
  defaultValue?: string | string[] | boolean | boolean[];
  values?: StringFilterValue[];
}

//-------------------------------------
export interface IOrder {
//-------------------------------------
  id: SortByType;
  defaultValue?: SortOrderType;
  i18n: string;
}

//-------------------------------------
export interface IPagination { // TODO à tester
//-------------------------------------
  startIdx: number;
  maxIdx?: number;  // Si elastic search renvoie bien le nombre de hits 
  pageSize: number; // Sera égal à la valeur paramétrée côté serveur
}

//-------------------------------------
export interface IProperty {
//-------------------------------------
  key:PropKeyType;
  i18n?:string;
}

/* NOT USED AT THE MOMENT
   Additional metadata when key===PROP_KEY.GENERIC
//-------------------------------------
export interface IGenericProperty extends IProperty {
//-------------------------------------
  property:keyof IResource;
  mode:PropModeType;
  type:PropTypeType;
  format?:PropFormatType[];
}
*/

//-------------------------------------
export interface IResource {
//-------------------------------------
  id: ID;
  name: string;
  thumbnail: string;   // URL : requis; ou bien déductible d’une convention ?
  application: App;
  createdAt: string;  // FIXME: S'entendre sur un format de date
  authorId: string;
  authorName: string;
  modifierId: ID;
  modifierName: string;
  modifiedAt: string; // FIXME: S'entendre sur un format de date
  folderId?: ID;      // TODO à confirmer
  public?: boolean;
  shared?: boolean;
  favorite?: boolean;
  views?: number;
  comments?: number;
}

//-------------------------------------
export interface IPreferences {
//-------------------------------------
  view: "card"|"list";
}

//------------------------- Service call parameters
//-------------------------------------
export interface IActionParameters {
//-------------------------------------
}
export type GetContextParameters = IActionParameters & ISearchParameters;
export type GetResourcesParameters = IActionParameters & ISearchParameters;
export type CreateFolderParameters = IActionParameters & {
  app:App
, type:ResourceType
, parentId: ID|"default"
, name: string
};
export type UpdateFolderParameters = IActionParameters & {
  folderId:ID
, app:App
, type:ResourceType
, parentId: ID|"default"
, name: string
};
export type CopyParameters = IActionParameters & {
  folderId:ID
, resourceIds:ID[]
, folderIds:ID[]
};
export type MoveParameters = IActionParameters & {
  folderId:ID
, resourceIds:ID[]
, folderIds:ID[]
};
export type DeleteParameters = IActionParameters & {
  resourceIds:ID[]
, folderIds:ID[]
};
export type ManagePropertiesParameters = IActionParameters & { resources:IResource[] };
export type UpdatePropertiesParameters = IActionParameters & { 
  resources:IResource[]
, props:{[key in PropKeyType]?:string}
};

/* NOT USED AT THE MOMENT (and probably never)
//-------------------------------------
export interface IGroupUserRight {
//-------------------------------------
  read: boolean;
  contribute: boolean;
  manage: boolean;
  comment: boolean;
  userId?: ID;
  groupId?: ID;
}
*/

export type FilterValues = {[B in BooleanFilterType]?: boolean} & {[S in StringFilterType]?: string} & {folder?: ID};
export type OrderValues  = {[O in SortByType]?: SortOrderType};

//------------------------- Service call results
//-------------------------------------
export interface IActionResult {
//-------------------------------------
// TODO : generic success, failure, error codes... should be placed here
}

export type GetContextResult = IActionResult & IContext;

export type GetResourcesResult = IActionResult & ISearchResults;

export type GetSubFoldersResult = IActionResult & { folders: IFolder[]; };
export type CreateFolderResult = IActionResult &  IFolder & { createdAt: string; };
export type UpdateFolderResult = CreateFolderResult & {
  updatedAt: string;
  parentId: ID|"default";
};
export type ManagePropertiesResult = IActionResult & { genericProps:IProperty[]; };
export type UpdatePropertiesResult = IActionResult & { resources:IResource[]; };


//-------------------------------------
//------------------- API (HIGH-LEVEL)
//-------------------------------------
/** Framework is a singleton. */
//-------------------------------------
export abstract class ExplorerFrameworkFactory {
//-------------------------------------
  static instance: IExplorerFramework;
}

/** Framework exploration capabilities offered to the client. */
//-------------------------------------
export interface IExplorerFramework {
//-------------------------------------
  /**
   * Create a new context to explore resources from an application.
   * @param types Types of resource to be managed in this context.
   * @param app Application which creates the new context.
   */
  createContext( types:ResourceType[], app:App ): IExplorerContext;
  
  /**
   * Retrieve the underlying communication bus.
   */
  getBus(): IBus;
}

/** Context to explore resources from an application. */
//-------------------------------------
export interface IExplorerContext {
//-------------------------------------
  /**
   * @return true, if the context is initialized.
   */
  isInitialized(): boolean;
  /**
   * @return The initialized search context, or undefined if initialize() has not been called before.
   */
  getContext(): IContext|undefined;
  /**
   * @return search parameters in the current context, modifiable before any call to getResources() or initialize().
   */
  getSearchParameters(): ISearchParameters;
  /**
   * @return a flow of objects, generated by initialize() and getResources() which should be called by your searches or pagination.
   */
  latestResources(): Observable<{input:ISearchParameters, output:ISearchResults}>;

  /**
   * Clear and reset the underlying context.
   */
  clear(): void;

  /**
   * Retrieve the first page of listed resources from the server.
   * Observers of the latestResources() will be notified.
   * Search parameters can be adjusted beforehand, @see getSearchParameters().
   * @return 
   */
  initialize(): Promise<IContext>;

  /**
   * Retrieve a page of listed resources from the server.
   * Observers of the latestResources() will be notified.
   * Search parameters can be adjusted beforehand, @see getSearchParameters().
   */
  getResources(): Promise<GetResourcesResult>;

  /**
   * Retrieve subfolders of a parent folder, from the server.
   * @param parentId ID of the parent folder.
   */
  getSubFolders( parentId:ID ): Promise<GetSubFoldersResult>;

  /**
   * Create a new [sub]folder.
   * @param resourceType Type of resources the created folder will contain.
   * @param parentId ID of the parent folder, or "default" for the root folder.
   * @param name Name of the created folder.
   */
  createFolder( resourceType:ResourceType, parentId:ID|"default", name:string ): Promise<CreateFolderResult>;

  /**
   * Modify the properties of a folder.
   * @param folderId ID of the folder to modify.
   * @param resourceType Type of resources the modified folder will contain.
   * @param parentId ID of the parent folder.
   * @param name Name of the folder.
   */
  updateFolder( folderId:ID, resourceType:ResourceType, parentId:ID|"default", name:string ): Promise<UpdateFolderResult>;

  /**
   * Copy resources and folders into a folder.
   * @param targetId ID of the destination folder.
   * @param resourceIds Array of resources ID to copy.
   * @param folderIds Array of folders ID to copy.
   */
  copy( targetId:ID, resourceIds:ID[], folderIds:ID[] ): Promise<void>;

  /**
   * Move resources and folders into a folder.
   * @param targetId ID of the destination folder.
   * @param resourceIds Array of resources ID to move.
   * @param folderIds Array of folders ID to move.
   */
  move( targetId:ID, resourceIds:ID[], folderIds:ID[] ): Promise<void>;

  /**
   * Delete resources and folders.
   * @param resourceIds Array of resources ID to delete.
   * @param folderIds Array of folders ID to delete.
   */
  delete( resourceIds:ID[], folderIds:ID[] ): Promise<void>; //FIXME 1 seul tableau en paramètres ?

  /** Retrieves which properties of the resource(s) are manageable. */
  manageProperties( resourceType:ResourceType, resources:IResource[] ): Promise<ManagePropertiesResult>;
  /** Update managed properties. */
  updateProperties( resourceType:ResourceType, resources:IResource[], props:{[key in PropKeyType]?:string} ): Promise<UpdatePropertiesResult>;

  /* Share resources */
  //share( resourceIds:ID[] /*, rights:IGroupUserRight[]*/ ): Promise<void>;


/*//TODO ajouter des méthodes pour les autres actions du toaster ?
  CREATE:     "create"
 ,OPEN:       "open"
 ,COMMENT:    "comment"
 ,EXPORT:     "export"
 ,PUBLISH:    "publish"
 ,PRINT:      "print"
*/
}

//-------------------------------------
//-------------------- API (LOW-LEVEL)
//-------------------------------------
export interface IBus {
//-------------------------------------
  /** Allows registering an agent as being able to resolve 1 or more action on a type of resource. */
  consumer( res:ResourceType, action:ActionType, agent:IBusAgent ): void;

  /** Allows delegating an action on a type of resource, to a registered agent on the bus. */
  send( res:ResourceType, action:ActionType, parameters:IActionParameters ): Promise<IActionResult>;

  /** Utility function for retrieving an agent. */
  getAgentFor( res:ResourceType, action:ActionType ): IBusAgent|null;
}

//-------------------------------------
export interface IBusAgent {
//-------------------------------------
  /** Ask this agent to resolve an action. */
  activate( res:ResourceType, action:ActionType, parameters:IActionParameters ): Observable<IActionResult>;

// Ou bien, s'il y a besoin de dissocier agents et actions pour permettre plus d'interactions :
/*
  queryActivator( app:App, action:ActionType ): IActivator;
}
export interface IActivator {
  activate( parameters:IActionParameters ): Observable<IActionResult>;
}
*/
}
