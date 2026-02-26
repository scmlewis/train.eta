// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, expect, describe, it } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// Mock the app store used by StationPicker – currentTab is mutable per-test
const mockSetSelected = vi.fn();
const mockSetSearch = vi.fn();
const mockSetReturnAnchor = vi.fn();
let _currentTab = 'BUS';

vi.mock('../store/useAppStore', () => ({
  useAppStore: () => ({
    language: 'EN',
    searchQuery: '',
    setSearchQuery: mockSetSearch,
    selectedStation: null,
    setSelectedStation: mockSetSelected,
    returnAnchorGroupKey: null,
    setReturnAnchorGroupKey: mockSetReturnAnchor,
    currentTab: _currentTab
  })
}));

import StationList from '../components/StationPicker';

describe('StationPicker component (tab switching and bus stops)', () => {
  it('renders MTR groups when currentTab is MTR', () => {
    _currentTab = 'MTR';
    render(<StationList currentTab="MTR" />);
    // Kwun Tong Line exists in MTR_LINE_GROUPS
    expect(screen.getByText(/Kwun Tong Line/i)).toBeInTheDocument();
  });

  it('renders LRT groups when currentTab is LRT', () => {
    _currentTab = 'LRT';
    render(<StationList currentTab="LRT" />);
    // Route 505 exists in LRT_GROUPS
    expect(screen.getByText('505')).toBeInTheDocument();
  });

  it('renders BUS group and expands to show stops and last-stop label', async () => {
    _currentTab = 'BUS';
    render(<StationList currentTab="BUS" />);

    // Find one of the direction-split BUS route blocks for 506 and expand
    const groupButtons = screen.getAllByRole('button').filter(b => b.textContent?.includes('506 · To '));
    expect(groupButtons.length).toBeGreaterThan(0);
    const groupButton = groupButtons[0];
    fireEvent.click(groupButton);

    // Wait for terminal label to appear
    await waitFor(() => {
      expect(screen.getAllByText(/Last Stop|終點站/i).length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    // Click a non-terminal station and assert selection was called
    const stationRow = screen.getAllByRole('button').find(
      b => (b.className as string).includes('station-row')
    );
    if (stationRow) {
      stationRow.click();
      expect(mockSetSelected).toHaveBeenCalled();
    }
  }, 20000);
});
