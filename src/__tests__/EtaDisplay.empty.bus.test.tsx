// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock store to force BUS tab and EN language
vi.mock('../store/useAppStore', () => ({
  useAppStore: () => ({ currentTab: 'BUS', language: 'EN' })
}));

// Mock react-query useQuery to return an empty bus dataset
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [], isLoading: false, isError: false, error: null, refetch: () => {}, dataUpdatedAt: Date.now() })
}));

import EtaDisplay from '../components/EtaDisplay';

describe('EtaDisplay BUS empty response', () => {
  it('shows No bus schedule when data is empty array', async () => {
    render(<EtaDisplay stationId="506-D010" stationName="Siu Lun" line="506" />);
    const el = await screen.findByText('No bus schedule');
    expect(el).toBeTruthy();
  });
});
