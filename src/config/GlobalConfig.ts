import { Expose, Type } from "class-transformer"
import { ActionConfig } from "./ActionConfig"
import { ThreadMatchConfig } from "./ThreadMatchConfig"
import "reflect-metadata"

/**
 * The global configuration that defines matching for all threads as well as actions for all threads, messages or attachments.
 */
export class GlobalConfig {
  /**
   * The global thread matching parameters applied in addition to each thread configuration
   */
  @Expose()
  @Type(() => ThreadMatchConfig)
  match = new ThreadMatchConfig()
  /**
   * The list of global actions that are always executed for their respective handler scopes
   */
  @Expose()
  @Type(() => ActionConfig)
  actions: ActionConfig[] = []
  /**
   * The type of handler
   */
  @Expose()
  type = "global"
}
