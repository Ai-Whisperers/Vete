import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

export const createMockSupabase = () => {
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockEq = vi.fn();
  const mockIs = vi.fn();
  const mockIlike = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();
  const mockMaybeSingle = vi.fn();
  const mockLimit = vi.fn();
  const mockRange = vi.fn();
  const mockUpload = vi.fn();
  const mockGetPublicUrl = vi.fn();
  const mockDownload = vi.fn();
  
  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
      download: mockDownload,
      list: vi.fn(),
      remove: vi.fn(),
    }),
  };

  // Auth Mocks
  const mockAuth = {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  };

  const queryBuilderMock = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    bg: mockEq, // For simpler chaining if needed
    eq: mockEq,
    neq: vi.fn(),
    gt: vi.fn(),
    lt: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    like: vi.fn(),
    ilike: mockIlike,
    is: mockIs,
    in: vi.fn(),
    contains: vi.fn(),
    containedBy: vi.fn(),
    rangeGt: vi.fn(),
    rangeLt: vi.fn(),
    rangeGte: vi.fn(),
    rangeLte: vi.fn(),
    rangeAdjacent: vi.fn(),
    overlaps: vi.fn(),
    textSearch: vi.fn(),
    match: vi.fn(),
    not: vi.fn(),
    or: vi.fn(),
    filter: vi.fn(),
    order: mockOrder,
    limit: mockLimit,
    range: mockRange,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    csv: vi.fn(),
  };

  // Chain methods properly - all query modifiers return the query builder
  Object.keys(queryBuilderMock).forEach(key => {
    // @ts-ignore
    queryBuilderMock[key].mockReturnValue(queryBuilderMock);
  });

  // Specific overrides for terminators or specific behaviors
  mockSelect.mockReturnValue(queryBuilderMock);
  mockInsert.mockReturnValue(queryBuilderMock);
  mockUpdate.mockReturnValue(queryBuilderMock);
  mockDelete.mockReturnValue(queryBuilderMock);
  
  mockOrder.mockResolvedValue({ data: [], error: null });
  mockSingle.mockResolvedValue({ data: {}, error: null });
  mockMaybeSingle.mockResolvedValue({ data: null, error: null });

  mockFrom.mockReturnValue(queryBuilderMock);

  return {
    from: mockFrom,
    rpc: mockRpc,
    storage: mockStorage,
    auth: mockAuth,
    _mocks: {
      from: mockFrom,
      rpc: mockRpc,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      is: mockIs,
      ilike: mockIlike,
      order: mockOrder,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
      limit: mockLimit,
      range: mockRange,
      storage: mockStorage,
      auth: mockAuth,
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    },
  } as unknown as SupabaseClient & { _mocks: any };
};
