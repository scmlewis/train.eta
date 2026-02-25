import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock store to force BUS tab and EN language
vi.mock('../store/useAppStore', () => ({
  useAppStore: () => ({ currentTab: 'BUS', language: 'EN' })
}));

// Mock react-query useQuery to return a small bus dataset
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [{ stopId: '506-D010', destination: 'X', id: 'a', time: '12:00', tti: '1 min' }], isLoading: false, isError: false, error: null, refetch: () => {}, dataUpdatedAt: Date.now() })
}));

// Stub out EtaTable to expose the title prop for assertions
vi.mock('../components/EtaTable', () => ({
  default: (props: any) => <div data-testid="eta-table">{props.title}</div>
}));

import EtaDisplay from '../components/EtaDisplay';

describe('EtaDisplay bus direction label', () => {
  it('renders direction header prefix To + endpoint derived from BUS_STOP_NAMES', async () => {
    render(<EtaDisplay stationId="506-D010" stationName="Siu Lun" line="506" />);
    const table = await screen.findByTestId('eta-table');
    expect(table.textContent).toContain('To ');
    // should include the endpoint name for 506-D (Tuen Mun Ferry Pier)
    expect(table.textContent).toContain('Tuen Mun Ferry Pier');
  });
});
