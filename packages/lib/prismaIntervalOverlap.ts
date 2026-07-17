/**
 * Represents the Prisma `where` clause used to filter overlapping interval boundaries.
 */
export type OverlappingIntervalWhereClause =
  | { startTime: { lte: Date }; endTime: { gte: Date } }
  | { startTime: { lt: Date }; endTime: { gt: Date } };

/**
 * Generates a Prisma where clause to find records that overlap with a requested interval.
 *
 * An interval overlap mathematically occurs when a record starts strictly before the requested
 * end time, and ends strictly after the requested start time:
 *   - `record.startTime < requestedEnd`
 *   - `record.endTime > requestedStart`
 *
 * **Strict vs Inclusive:**
 * By default, boundary-touching records (e.g., one ends exactly when the other begins) do not
 * overlap in time and are intentionally excluded using strict `<` (`lt`) and `>` (`gt`) operators.
 *
 * @param start - The start time of the requested interval.
 * @param end - The end time of the requested interval.
 * @param inclusive - Set to true ONLY if backward compatibility requires boundary-touching 
 * bookings to be counted as overlaps using `<=` (`lte`) and `>=` (`gte`). Default is false.
 * @returns A strictly-typed Prisma `where` clause fragment.
 */
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";

export function getOverlappingIntervalWhereClause(
  start: Date,
  end: Date,
  inclusive = false
): OverlappingIntervalWhereClause {
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    throw new ErrorWithCode(ErrorCode.InternalServerError, "startTime must be a valid Date.");
  }

  if (!(end instanceof Date) || Number.isNaN(end.getTime())) {
    throw new ErrorWithCode(ErrorCode.InternalServerError, "endTime must be a valid Date.");
  }

  if (start.getTime() >= end.getTime()) {
    throw new ErrorWithCode(ErrorCode.InternalServerError, "startTime must be earlier than endTime.");
  }

  if (inclusive) {
    return {
      startTime: { lte: end },
      endTime: { gte: start },
    };
  }

  return {
    startTime: { lt: end },
    endTime: { gt: start },
  };
}
