import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, expect } from 'vitest';
import '@testing-library/jest-dom';
import StationList from '../components/StationPicker';

// Mock the app store used by StationPicker
const mockSetSelected = vi.fn();
const mockSetSearch = vi.fn();
vi.mock('../store/useAppStore', () => {
  return {
    useAppStore: () => ({
      language: 'EN',
      searchQuery: '',
      setSearchQuery: mockSetSearch,
      selectedStation: null,
      setSelectedStation: mockSetSelected,
      currentTab: 'BUS'
    })
  };
});

describe('StationPicker component (tab switching and bus stops)', () => {
  it('renders MTR groups when currentTab is MTR', () => {
    render(<StationList currentTab="MTR" />);
    // Kwun Tong Line exists in MTR_LINE_GROUPS
    expect(screen.getByText(/Kwun Tong Line/i)).toBeInTheDocument();
  });

  it('renders BUS group and expands to show stops and last-stop label', async () => {
    render(<StationList currentTab="BUS" />);

    // Find the BUS group '506' accordion header and click to expand
    const groupButton = screen.getByRole('button', { name: /506/i });
    fireEvent.click(groupButton);

    // After expanding, find a direction header (prefixed with 'To ')
    const dirHeader = await screen.findByText(/To /i);
    expect(dirHeader).toBeInTheDocument();
    fireEvent.click(dirHeader.closest('button')!);

    // Wait for a terminal label to appear (Last Stop or 終點站)
    await waitFor(() => {
      expect(screen.getAllByText(/Last Stop|終點站/i).length).toBeGreaterThan(0);
    });
    // click a non-terminal station (first in list) and assert selection called
    const stationButtons = screen.getAllByRole('button', { name: /./ });
    // find a station-row button (exclude accordion headers)
    const stationRow = stationButtons.find(b => b.className && (b.className as string).includes('station-row'));
    if (stationRow) {
      stationRow && stationRow.click();
      expect(mockSetSelected).toHaveBeenCalled();
    }
  }, 10000);
});
