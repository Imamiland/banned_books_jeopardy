import { describe, expect, it } from 'vitest';

import type { Board, User } from './permissions';
import {
  canCreateBoard,
  canDeleteBoard,
  canEditBoard,
  canManageUsers,
  canViewBoard
} from './permissions';

const admin: User = { id: 'admin-1', role: 'administrator' };
const creator: User = { id: 'creator-1', role: 'creator' };
const player: User = { id: 'player-1', role: 'player' };

const ownBoard: Board = { id: 1, createdBy: 'creator-1', published: true };
const otherBoard: Board = { id: 2, createdBy: 'someone-else', published: true };
const draftBoard: Board = { id: 3, createdBy: 'creator-1', published: false };
const otherDraft: Board = { id: 4, createdBy: 'someone-else', published: false };

describe('permissions', () => {
  describe('canViewBoard', () => {
    it('allows anyone to view a published board', () => {
      expect(canViewBoard(null, ownBoard)).toBe(true);
      expect(canViewBoard(player, ownBoard)).toBe(true);
      expect(canViewBoard(creator, ownBoard)).toBe(true);
      expect(canViewBoard(admin, ownBoard)).toBe(true);
    });

    it('denies viewing a draft board to non-owners', () => {
      expect(canViewBoard(null, draftBoard)).toBe(false);
      expect(canViewBoard(player, draftBoard)).toBe(false);
      expect(canViewBoard(creator, otherDraft)).toBe(false);
    });

    it('allows the owner to view their own draft', () => {
      expect(canViewBoard(creator, draftBoard)).toBe(true);
    });

    it('allows an administrator to view any board', () => {
      expect(canViewBoard(admin, draftBoard)).toBe(true);
      expect(canViewBoard(admin, otherBoard)).toBe(true);
    });
  });

  describe('canEditBoard', () => {
    it('denies editing when there is no user', () => {
      expect(canEditBoard(null, ownBoard)).toBe(false);
    });

    it('allows an administrator to edit any board', () => {
      expect(canEditBoard(admin, ownBoard)).toBe(true);
      expect(canEditBoard(admin, otherBoard)).toBe(true);
    });

    it('allows a creator to edit their own board', () => {
      expect(canEditBoard(creator, ownBoard)).toBe(true);
    });

    it('denies a creator editing another user board', () => {
      expect(canEditBoard(creator, otherBoard)).toBe(false);
    });

    it('denies a player editing any board', () => {
      expect(canEditBoard(player, ownBoard)).toBe(false);
      expect(canEditBoard(player, otherBoard)).toBe(false);
    });
  });

  describe('canDeleteBoard', () => {
    it('allows only an administrator to delete', () => {
      expect(canDeleteBoard(admin, ownBoard)).toBe(true);
    });

    it('denies deletion for non-administrators', () => {
      expect(canDeleteBoard(creator, ownBoard)).toBe(false);
      expect(canDeleteBoard(player, ownBoard)).toBe(false);
      expect(canDeleteBoard(null, ownBoard)).toBe(false);
    });
  });

  describe('canCreateBoard', () => {
    it('allows administrators and creators to create', () => {
      expect(canCreateBoard(admin)).toBe(true);
      expect(canCreateBoard(creator)).toBe(true);
    });

    it('denies creation for players and null users', () => {
      expect(canCreateBoard(player)).toBe(false);
      expect(canCreateBoard(null)).toBe(false);
    });
  });

  describe('canManageUsers', () => {
    it('allows only an administrator', () => {
      expect(canManageUsers(admin)).toBe(true);
    });

    it('denies non-administrators and null users', () => {
      expect(canManageUsers(creator)).toBe(false);
      expect(canManageUsers(player)).toBe(false);
      expect(canManageUsers(null)).toBe(false);
    });
  });
});
