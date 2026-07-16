// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
import EtaSkeleton from '../components/Skeleton';

describe('EtaSkeleton', () => {
  it('renders a glass-card container', () => {
    const { container } = render(<EtaSkeleton />);
    const card = container.querySelector('.glass-card');
    expect(card).toBeTruthy();
  });

  it('renders shimmer placeholder bars', () => {
    const { container } = render(<EtaSkeleton />);
    const shimmerBars = container.querySelectorAll('.shimmer');
    // 2 in header + 3 rows × 3 cols = 11 total
    expect(shimmerBars.length).toBe(11);
  });

  it('renders with a title', () => {
    const { container } = render(<EtaSkeleton title="Central" />);
    const card = container.querySelector('.glass-card');
    expect(card).toBeTruthy();
    const shimmerBars = container.querySelectorAll('.shimmer');
    expect(shimmerBars.length).toBe(11);
  });
});