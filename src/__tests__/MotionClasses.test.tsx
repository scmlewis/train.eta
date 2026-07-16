// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { vi, expect, describe, it } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// Mock the app store
const mockSetSelected = vi.fn();
const mockSetSearch = vi.fn();
let _currentTab = 'MTR';
let _selectedStation: null | Record<string, unknown> = null;

vi.mock('../store/useAppStore', () => ({
  useAppStore: () => ({
    language: 'EN',
    searchQuery: '',
    setSearchQuery: mockSetSearch,
    selectedStation: _selectedStation,
    setSelectedStation: mockSetSelected,
    returnAnchorGroupKey: null,
    setReturnAnchorGroupKey: vi.fn(),
    favoriteStations: [],
    toggleFavorite: vi.fn(),
    currentTab: _currentTab
  })
}));

vi.mock('../hooks/useMTRLineStatus', () => ({
  useMTRLineStatus: () => ({ statusMap: new Map(), isLoading: false }),
}));

import Header from '../components/Header';
import StationList from '../components/StationPicker';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithQuery = (ui: React.ReactElement) =>
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);

describe('Motion & micro-interaction CSS classes', () => {
  it('Header shows live-dot when no station is selected', () => {
    _selectedStation = null;
    _currentTab = 'MTR';
    render(<Header />);
    const liveDot = document.querySelector('.live-dot');
    expect(liveDot).toBeTruthy();
    expect(liveDot?.tagName).toBe('SPAN');
    expect(liveDot).toHaveAttribute('aria-label');
  });

  it('StationPicker list container has tab-in class', () => {
    _currentTab = 'MTR';
    _selectedStation = null;
    renderWithQuery(<StationList currentTab="MTR" />);
    const listContainer = document.querySelector('.tab-in');
    expect(listContainer).toBeTruthy();
    expect(listContainer).toHaveClass('tab-in');
    expect(listContainer).toHaveAttribute('role', 'listbox');
  });

  it('StationPicker accordion cards have stagger-item class', () => {
    _currentTab = 'MTR';
    _selectedStation = null;
    renderWithQuery(<StationList currentTab="MTR" />);
    const staggerItems = document.querySelectorAll('.stagger-item');
    expect(staggerItems.length).toBeGreaterThan(0);
    staggerItems.forEach(item => {
      expect(item).toHaveClass('stagger-item');
    });
  });
});