import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { Plus } from 'lucide-react';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    let button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Cancel</Button>);
    button = screen.getByRole('button', { name: 'Cancel' });
    expect(button).toHaveClass('border', 'border-input');

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: 'Ghost' });
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: 'Small' });
    expect(button).toHaveClass('h-9');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: 'Large' });
    expect(button).toHaveClass('h-11');

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button', { name: 'Icon' });
    expect(button).toHaveClass('h-10', 'w-10');
  });

  it('renders with left icon', () => {
    render(
      <Button icon={<Plus data-testid="plus-icon" />}>
        Add Item
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Add Item' });
    const icon = screen.getByTestId('plus-icon');
    
    expect(button).toContainElement(icon);
    expect(icon).toHaveClass('mr-2');
  });

  it('renders with right icon', () => {
    render(
      <Button icon={<Plus data-testid="plus-icon" />} iconPosition="right">
        Add Item
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Add Item' });
    const icon = screen.getByTestId('plus-icon');
    
    expect(button).toContainElement(icon);
    expect(icon).toHaveClass('ml-2');
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button', { name: 'Loading' });
    const spinner = button.querySelector('svg');
    
    expect(button).toBeDisabled();
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('hides icon when loading', () => {
    render(
      <Button loading icon={<Plus data-testid="plus-icon" />}>
        Loading
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Loading' });
    const icon = screen.queryByTestId('plus-icon');
    
    expect(icon).not.toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not handle click when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled' });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not handle click when loading', () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Loading</Button>);
    
    const button = screen.getByRole('button', { name: 'Loading' });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveTextContent('Ref Button');
  });

  it('renders as icon button with only icon', () => {
    render(
      <Button size="icon" aria-label="Add">
        <Plus data-testid="plus-icon" />
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Add' });
    const icon = screen.getByTestId('plus-icon');
    
    expect(button).toHaveClass('h-10', 'w-10');
    expect(button).toContainElement(icon);
  });

  it('has proper accessibility attributes', () => {
    render(<Button disabled loading>Accessible</Button>);
    
    const button = screen.getByRole('button', { name: 'Accessible' });
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('supports form submission', () => {
    render(
      <form>
        <Button type="submit">Submit</Button>
      </form>
    );
    
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('supports form reset', () => {
    render(
      <form>
        <Button type="reset">Reset</Button>
      </form>
    );
    
    const button = screen.getByRole('button', { name: 'Reset' });
    expect(button).toHaveAttribute('type', 'reset');
  });

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn();
    render(<Button onKeyDown={handleKeyDown}>Keyboard</Button>);
    
    const button = screen.getByRole('button', { name: 'Keyboard' });
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(handleKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Enter' })
    );
  });

  it('has focus styles', () => {
    render(<Button>Focus</Button>);
    
    const button = screen.getByRole('button', { name: 'Focus' });
    expect(button).toHaveClass('focus-visible:outline-none');
  });

  it('combines variants and sizes correctly', () => {
    render(
      <Button variant="outline" size="lg">
        Combined
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Combined' });
    expect(button).toHaveClass('border', 'border-input', 'h-11');
  });
});
