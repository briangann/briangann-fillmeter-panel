import React from 'react';
import { render } from '@testing-library/react';
import { BubbleLayer } from './BubbleLayer';

describe('BubbleLayer', () => {
  it('renders nothing when inactive', () => {
    const { container } = render(<svg><BubbleLayer active={false} /></svg>);
    expect(container.querySelectorAll('circle')).toHaveLength(0);
  });

  it('renders 4 bubbles when active', () => {
    const { container } = render(<svg><BubbleLayer active={true} /></svg>);
    expect(container.querySelectorAll('circle')).toHaveLength(4);
  });
});
