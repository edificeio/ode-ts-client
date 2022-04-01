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
 ,MALFORMED_DATA:   "0080"
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
 ,VIDEO:      "video"

 // TODO compléter/trier les apps suivantes
/*
  "competences"
  "cahier-textes"
  "poll"
  "rack"
  "rbs"
  "searchengine"
  "sharebigfiles"
  "schoolbook"
  "archive"
  "admin"
  "cahier-de-texte"
  "wiki"
  "cns"
  "conversation"
  "paths"
  "parcours"
  "notebook"
  "scrap-book"
  "scrapbook"
  "account"
  "support"
  "workspace"
  "admin-portal"
  "stats"
  "userbook"    // FIXME userbook OR directory : the choice may impact some configurations, @see IXitiTrackingParams.NOM_PAGE for example
  "directory"   // FIXME Keep in mind that ode-ts-client MUST not access the locationPath of the window !
  "mindmap"
  "timelinegenerator"
  "actualites"
  "pad"
  "collaborativeeditor"
  "settings-class"
  "library"
  "visioconf"
  "Web-conference"
  "notes"
  "attendance"
  "calendar"
  "canal-numerique"
  "collaborative-wall"
  "statistics"
  "polls"
  "community"
  "forum"
  "pages"
  "website"
  "parametrage"
  "kne"
  "sacoche"
*/
} as const;
export type App = typeof APP[keyof typeof APP];   // type App = "explorer" | "blog" | "exercizer"...

//-- User preferences keys
export const USER_PREFS = {
  APPS:       "apps"
 ,WIDGETS:    "widgets"
 ,LANGUAGE:   "language"
 ,AUTH_CONNECTOR_ACCESSED: "authenticatedConnectorsAccessed"
 ,CURSUS:     "cursus"
 ,INFOTIP:      "infotip"
 ,RGPD_COOKIES: "rgpdCookies"
 // TODO compléter
} as const;
