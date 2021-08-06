//-------------------------------------
//------------------ Global definitions
//-------------------------------------

//------------------------- Data types
//-- Error codes 
export const ERROR_CODE = {
  SUCCESS:          "0000"
 ,UNKNOWN:          "0010"
 ,NOT_INITIALIZED:  "0020"
 ,NOT_SUPPORTED:    "0030"
 ,APP_NOT_FOUND:    "0040"
 ,AGENT_NOT_FOUND:  "0050"
 ,TRANSPORT_ERROR:  "0060"
 ,TIME_OUT:         "0070"
} as const;
export type ErrorCode = typeof ERROR_CODE[keyof typeof ERROR_CODE];

//-- Applications
export const APP = {
  EXPLORER:   "explorer"
 ,PORTAL:     "portal"
 ,BLOG:       "blog"
 ,EXERCIZER:  "exercizer"
 ,TIMELINE:   "timeline"
 ,CAS:        "cas"
 // TODO compléter
} as const;
export type App = typeof APP[keyof typeof APP];   // type App = "explorer" | "blog" | "exercizer"...

//-- User preferences keys
export const USER_PREFS = {
  APPS:       "apps"
 ,WIDGETS:    "widgets"
 ,LANGUAGE:   "language"
 ,AUTH_CONNECTOR_ACCESSED: "authenticatedConnectorsAccessed"
 ,CURSUS:     "cursus"
 // TODO compléter
} as const;
