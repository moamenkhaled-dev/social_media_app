import type { _QueryFilterLooseId, Query } from "mongoose";

class ModelHelper {
  // query
  query(that: Query<any, any>) {
    const query = that.getFilter() as any;

    // soft delete
    if (query.paranoid === false) {
      delete query.paranoid;
    } else if (query.onlyDeleted === true) {
      delete query.onlyDeleted;
      query.deletedAt = { $ne: null };
    } else if (query.deletedAt === undefined) {
      query.deletedAt = null;
    }

    // deactivated
    if (query.includeDeactivated === true) {
      delete query.includeDeactivated;
    } else if (query.onlyDeactivated === true) {
      delete query.onlyDeactivated;
      query.deactivatedAt = { $ne: null };
    } else if (query.deactivatedAt === undefined) {
      query.deactivatedAt = null;
    }

    // verify
    if (query.includeUnverified === true) {
      delete query.includeUnverified;
    } else if (query.onlyNotVerified === true) {
      delete query.onlyNotVerified;
      query.verifiedAt = null;
    } else if (query.verifiedAt === undefined) {
      query.verifiedAt = { $ne: null };
    }

    // banned
    if (query.includeBanned === true) {
      delete query.includeBanned;
    } else if (query.onlyBanned === true) {
      delete query.onlyBanned;
      query.bannedAt = { $ne: null };
    } else if (query.bannedAt === undefined) {
      query.bannedAt = null;
    }

    return query;
  }

  // update
  update({ update, that }: { update: any; that: Query<any, any> }) {
    if (!update || typeof update !== "object") {
      return update;
    }

    const newUpdate = { ...update };

    if (newUpdate.reactivatedAt) {
      newUpdate.$unset ??= {};
      newUpdate.$unset.deactivatedAt = 1;
    }

    if (newUpdate.deactivatedAt) {
      newUpdate.$unset ??= {};
      newUpdate.$unset.reactivatedAt = 1;
    }

    if (newUpdate.deletedAt) {
      newUpdate.$unset ??= {};
      newUpdate.$unset.restoredAt = 1;
    }

    if (newUpdate.restoredAt) {
      newUpdate.$unset ??= {};
      newUpdate.$unset.deletedAt = 1;
    }

    if (newUpdate.bannedAt) {
      newUpdate.$unset ??= {};
      newUpdate.$unset.banCancelledAt = 1;
    }

    if (newUpdate.banCancelledAt) {
      newUpdate.$unset ??= {};
      newUpdate.$unset.bannedAt = 1;
    }

    that.setUpdate(newUpdate);

    return newUpdate;
  }
}

export const modelHelper = new ModelHelper();
