export * from "./globals";

//-------------------------------- EXPLORER ----------------------------------
/* These interfaces describe, from the UI point of view :
 * - Data types and contants, with a semantic meaning : applications, resources, actions on resources...
 * - High-level API : an explorer context (IExplorerContext),
 * - Low-level API : access to the communication bus, if needed (IBus, IBusAgent)
 */
export * from "./explorer/interfaces";

//---------------------------------- NOTIFY ----------------------------------
export * from "./notify/interfaces";
// We export RxJS because so that you don't need to bundle it again elsewhere : it is there for you.
// **But** while importing it directly, you will also create a dependence on its implementation (API).
// => We should create a facade for it, which would authorize us to later change the implementation with no side-effect.
export * as RxJS from "rxjs";

//------------------------------- TRANSPORT ----------------------------------
export * from "./transport/interfaces";

//---------------------------------- CONFIG ----------------------------------
export * from "./configure/interfaces";

//---------------------------------- SESSION ----------------------------------
export * from "./session/interfaces";

//---------------------------------- WIDGET ----------------------------------
export * from "./widget/interfaces";

//---------------------------------- APPS ----------------------------------
export * from "./apps/timeline/interfaces";

//---------------------------------- SERVICES ----------------------------------
export * from "./services";
