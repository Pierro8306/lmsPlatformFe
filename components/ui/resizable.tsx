'use client';

import React from 'react';
import {
  Group,
  Panel as RawPanel,
  Separator as RawSeparator,
} from 'react-resizable-panels';

interface PanelGroupProps extends React.ComponentPropsWithoutRef<typeof Group> {
  direction?: 'horizontal' | 'vertical';
  orientation?: 'horizontal' | 'vertical';
}

export function PanelGroup({
  direction = 'horizontal',
  orientation,
  ...props
}: PanelGroupProps) {
  return <Group orientation={orientation || direction} {...props} />;
}

export const Panel = RawPanel;

export function PanelResizeHandle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RawSeparator>) {
  return <RawSeparator className={className} {...props} />;
}
