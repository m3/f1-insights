import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import BriefCard from '../components/BriefCard';

describe('BriefCard Component', () => {
  it('renders pre-race and post-race tabs correctly', () => {
    const mockPreBrief = {
      title: 'Hungarian Grand Prix Preview',
      summary: 'High downforce circuit requires aggressive tire strategy.'
    };
    const mockPostBrief = {
      title: 'Hungarian Grand Prix Debrief',
      summary: 'Norris secured victory after strong second stint.'
    };

    render(<BriefCard preBrief={mockPreBrief} postBrief={mockPostBrief} />);

    expect(screen.getAllByText(/PRE-RACE PREVIEW/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/POST-RACE DEBRIEF/i).length).toBeGreaterThan(0);
  });
});
