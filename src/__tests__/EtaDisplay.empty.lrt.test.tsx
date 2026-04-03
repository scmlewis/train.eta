// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock store to force LRT tab and EN language
vi.mock('../store/useAppStore', () => ({
  useAppStore: () => ({ currentTab: 'LRT', language: 'EN' })
}));

// Mock react-query useQuery to return an empty LRT dataset
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [], isLoading: false, isError: false, error: null, refetch: () => {}, dataUpdatedAt: Date.now() })
}));

import EtaDisplay from '../components/EtaDisplay';

describe('EtaDisplay LRT empty response', () => {
  it('shows No upcoming trains when data is empty array', async () => {
    render(<EtaDisplay stationId="LRT-001" stationName="LRT Station" line="" />);
    const el = await screen.findByText('No upcoming trains');
    expect(el).toBeTruthy();
  });
});
