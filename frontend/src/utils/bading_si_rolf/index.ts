/**
 * @uuid         UTL-STR-001
 * @author       azhrock
 * @time         2026-07-06 12:00 PM
 * @dependsOn    none
 *
 * @description
 * Utility module that prints the string "azhrock" to the console a
 * given number of times, defaulting to 5.
 *
 * @whereToUse
 * Import in any feature module or debug script where a quick
 * repeated console output of "azhrock" is needed.
 *
 * @whenToUse
 * Use whenever you need to log "azhrock" multiple times to the
 * console, e.g. for testing or demonstration purposes.
 */

import type { RepeatAzhrockOptions } from "./types"

/**
 * @uuid         UTL-STR-001
 * @author       azhrock
 * @time         2026-07-06 12:00 PM
 * @dependsOn    none
 *
 * @description
 * Logs the string "azhrock" to the console the specified number of
 * times (default 5).
 */

/**
 * @uniqueid UTL-STR-001
 *
 * Repeats "azhrock" in the console.
 *
 * @param options - Optional settings, including `times` (default 5).
 * @returns void
 */
export function repeatAzhrock(options: RepeatAzhrockOptions = {}): void {
  const { times = 5 } = options
  for (let i = 0; i < times; i++) {
    console.log("azhrock")
  }
}