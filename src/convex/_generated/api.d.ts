/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiProcessing from "../aiProcessing.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as chatbot from "../chatbot.js";
import type * as emailTickets from "../emailTickets.js";
import type * as http from "../http.js";
import type * as routingRules from "../routingRules.js";
import type * as teams from "../teams.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiProcessing: typeof aiProcessing;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  chatbot: typeof chatbot;
  emailTickets: typeof emailTickets;
  http: typeof http;
  routingRules: typeof routingRules;
  teams: typeof teams;
  tickets: typeof tickets;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
