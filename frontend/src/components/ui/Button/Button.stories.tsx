import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Plus, Trash2, Download, Eye } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state with spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default button
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// All variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants with different visual styles.',
      },
    },
  },
};

// All sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes for various use cases.',
      },
    },
  },
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button icon={<Plus className="h-4 w-4" />} iconPosition="left">
        Add Item
      </Button>
      <Button icon={<Download className="h-4 w-4" />} iconPosition="right">
        Download
      </Button>
      <Button variant="outline" icon={<Eye className="h-4 w-4" />}>
        View
      </Button>
      <Button variant="destructive" icon={<Trash2 className="h-4 w-4" />}>
        Delete
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons on the left or right side.',
      },
    },
  },
};

// Loading state
export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button loading>Loading</Button>
      <Button variant="outline" loading>
        Loading
      </Button>
      <Button size="sm" loading>
        Loading
      </Button>
      <Button size="lg" loading>
        Loading
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons in loading state with spinner animation.',
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
      <Button variant="ghost" disabled>
        Disabled
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled buttons that cannot be interacted with.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    children: 'Click me',
    variant: 'default',
    size: 'default',
    loading: false,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different button configurations.',
      },
    },
  },
};

// Real-world examples
export const Examples: Story = {
  render: () => (
    <div className="space-y-6">
      {/* Form actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Form Actions</h3>
        <div className="flex gap-3">
          <Button>Save Changes</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>

      {/* Navigation */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Navigation</h3>
        <div className="flex gap-3">
          <Button variant="ghost">Previous</Button>
          <Button>Next</Button>
          <Button variant="outline">Skip</Button>
        </div>
      </div>

      {/* Actions with icons */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Actions</h3>
        <div className="flex gap-3">
          <Button icon={<Plus className="h-4 w-4" />}>New</Button>
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Export
          </Button>
          <Button variant="ghost" icon={<Eye className="h-4 w-4" />}>
            Preview
          </Button>
        </div>
      </div>

      {/* Icon buttons */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Icon Buttons</h3>
        <div className="flex gap-3">
          <Button size="icon">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world usage examples of the Button component.',
      },
    },
  },
};
